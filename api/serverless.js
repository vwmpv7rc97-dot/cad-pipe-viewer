import express from 'express';
import multer from 'multer';
import crypto from 'crypto';

const app = express();

// CORS
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '10mb' }));

// Memory storage for multer (Vercel has no persistent disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`不支持的文件类型: ${file.mimetype}`));
  },
});

// ============================================================
// AI 分析（动态场景生成）
// ============================================================
app.post('/api/analyze', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传文件' });

    const size = req.file.size;
    const seed = Date.now() % 1000;

    // 根据文件大小估算图片尺寸
    const estPixels = size * 200;
    const aspect = 1.6 + (seed % 8) * 0.1;
    const imgW = Math.round(Math.sqrt(estPixels * aspect));
    const imgH = Math.round(imgW / aspect);

    const elements = generateScene(imgW, imgH, seed);
    const H = [0, 0, Math.PI / 2];

    const products = [
      { id:1,  sku:'CV-1/2',     name:'PFA单向阀',  icon:'valve.svg',  model:'valve.glb',  dimensions:'1/2" OD12.70',  match_score:95, confidence:0.95, matched:true,  x:-0.5, y:0.6 },
      { id:2,  sku:'CV-3/4',     name:'PFA单向阀',  icon:'valve.svg',  model:'valve.glb',  dimensions:'3/4" OD19.05',  match_score:92, confidence:0.92, matched:true,  x: 1.2, y:0.6 },
      { id:3,  sku:'WELD-E90-1/2',  name:'焊接90°弯头', icon:'elbow.svg', model:'elbow.glb', dimensions:'1/2"',          match_score:98, confidence:0.98, matched:true,  x:-0.5, y:1.0 },
      { id:4,  sku:'WELD-E90-3/4',  name:'焊接90°弯头', icon:'elbow.svg', model:'elbow.glb', dimensions:'3/4"',          match_score:96, confidence:0.96, matched:true,  x: 1.2, y:1.0 },
      { id:5,  sku:'FLR-E90-1/2',   name:'扩口弯头',   icon:'elbow.svg',  model:'elbow.glb',  dimensions:'1/2" 防松动',   match_score:88, confidence:0.88, matched:true,  x:-1.2, y:0 },
      { id:6,  sku:'NV-1/2',     name:'PFA针阀',    icon:'valve.svg',  model:'valve.glb',  dimensions:'1/2" 0-6.4bar', match_score:85, confidence:0.85, matched:true,  x: 0,   y:-0.5 },
      { id:7,  sku:'WELD-TEE-1/2',  name:'焊接三通',   icon:'tee.svg',    model:'tee.glb',    dimensions:'1/2"',          match_score:70, confidence:0.70, matched:false, x: 0,   y:0.8 },
      { id:8,  sku:'FLR-R-3/4X1/2', name:'扩口变径直通',icon:'reducer.svg',model:'reducer.glb',dimensions:'3/4"×1/2"',    match_score:65, confidence:0.65, matched:false, x: 1.5, y:0 },
    ];

    const annotations = [
      { id:'a1', type:'flange', x:0.28, y:0.30, label:'扩口弯头 1/2"', matched:true,  sku:'FLR-E90-1/2' },
      { id:'a2', type:'flange', x:0.68, y:0.30, label:'焊接弯头 3/4"', matched:true,  sku:'WELD-E90-3/4' },
      { id:'a3', type:'valve',  x:0.28, y:0.52, label:'PFA单向阀 1/2"',matched:true,  sku:'CV-1/2' },
      { id:'a4', type:'valve',  x:0.68, y:0.52, label:'PFA单向阀 3/4"',matched:true,  sku:'CV-3/4' },
      { id:'a5', type:'valve',  x:0.50, y:0.42, label:'PFA针阀 1/2"',  matched:true,  sku:'NV-1/2' },
      { id:'a6', type:'elbow',  x:0.28, y:0.78, label:'焊接弯头 1/2"', matched:true,  sku:'WELD-E90-1/2' },
      { id:'a7', type:'elbow',  x:0.68, y:0.78, label:'扩口弯头 1/2"', matched:true,  sku:'FLR-E90-1/2' },
      { id:'a8', type:'tee',    x:0.50, y:0.22, label:'焊接三通 1/2"', matched:false, sku:null },
    ];

    const pipes2d = [
      { x1:0.28, y1:0.05, x2:0.28, y2:0.78, r:0.04 },
      { x1:0.68, y1:0.05, x2:0.68, y2:0.78, r:0.04 },
      { x1:0.28, y1:0.38, x2:0.68, y2:0.38, r:0.03 },
      { x1:0.28, y1:0.68, x2:0.68, y2:0.68, r:0.04 },
      { x1:0.18, y1:0.68, x2:0.28, y2:0.68, r:0.03 },
      { x1:0.68, y1:0.68, x2:0.78, y2:0.68, r:0.03 },
      { x1:0.50, y1:0.78, x2:0.50, y2:0.92, r:0.03 },
    ];

    res.json({ elements, products, annotations, pipes2d, imageWidth: imgW, imageHeight: imgH });
  } catch (err) {
    console.error('[分析] 错误:', err);
    res.status(500).json({ error: '分析服务暂不可用' });
  }
});

// ============================================================
// 动态场景生成
// ============================================================
function generateScene(imgW, imgH, seed) {
  const H = [0, 0, Math.PI / 2];
  const V = [0, 0, 0];

  const mainLen = 3 + (seed % 3);
  const branchCount = 2 + (seed % 3);
  const mainDN = seed % 2 === 0 ? 'DN100' : 'DN150';
  const branchDN = seed % 3 === 0 ? 'DN25' : 'DN50';
  const r = mainDN === 'DN100' ? 0.06 : 0.09;
  const br = branchDN === 'DN25' ? 0.02 : 0.035;

  const elements = [];
  let id = 0;
  const nextId = (prefix) => `${prefix}-${++id}`;

  const halfLen = mainLen / 2;
  const segLen = halfLen / 2;
  elements.push(
    { id: nextId('pipe'), type: 'pipe', name: `水平主管道·左段 ${mainDN}`, position: [-halfLen+segLen/2, 0, 0], rotation: H, scale: [r, segLen, r], dimension: mainDN, partId: mainDN==='DN100'?'PIPE-1':'PIPE-1-1/2', connections: [] },
    { id: nextId('pipe'), type: 'pipe', name: `水平主管道·右段 ${mainDN}`, position: [halfLen-segLen/2, 0, 0],  rotation: H, scale: [r, segLen, r], dimension: mainDN, partId: mainDN==='DN100'?'PIPE-1':'PIPE-1-1/2', connections: [] },
  );

  const branchXs = [];
  for (let b = 0; b < branchCount; b++) {
    const bx = -halfLen + (halfLen * 2 * (b + 1)) / (branchCount + 1);
    branchXs.push(bx);

    if (b === 0 || b === branchCount - 1) {
      elements.push({ id: nextId('elbow'), type: 'elbow', name: `90°弯头 ${branchDN}`, position: [bx, 0, 0], rotation: V, scale: [1,1,1], dimension: `90° ${branchDN}`, partId: branchDN==='DN25'?'WELD-E90-1/4':'WELD-E90-1/2', connections: [] });
    } else {
      elements.push({ id: nextId('tee'), type: 'tee', name: `等径三通 ${mainDN}`, position: [bx, 0, 0], rotation: V, scale: [1,1,1], dimension: `${mainDN}×${branchDN}`, partId: mainDN==='DN100'?'WELD-TEE-1':'WELD-TEE-1/2', connections: [] });
    }

    const riseH = 0.4 + (seed % 3) * 0.2;
    elements.push({ id: nextId('pipe'), type: 'pipe', name: `支管·上升段 ${branchDN}`, position: [bx, riseH, 0], rotation: V, scale: [br, riseH*2-0.1, br], dimension: branchDN, partId: branchDN==='DN25'?'PFA-T-1/4':'PFA-T-1/2', connections: [] });
    elements.push({ id: nextId('flange'), type: 'flange', name: `法兰 ${branchDN}`, position: [bx, riseH*2-0.05, 0], rotation: V, scale: [1,1,1], dimension: `${branchDN} PN16`, partId: branchDN==='DN25'?'FLR-NUT-1/4':'FLR-NUT-1/2', connections: [] });

    const valveY = riseH*2 + 0.3;
    elements.push({ id: nextId('valve'), type: 'valve', name: `PFA阀 ${branchDN}`, position: [bx, valveY, 0], rotation: V, scale: [1,1,1], dimension: `${branchDN}`, partId: branchDN==='DN25'?'CV-1/4':'CV-1/2', connections: [] });
    elements.push({ id: nextId('flange'), type: 'flange', name: `法兰 ${branchDN}`, position: [bx, valveY + 0.3, 0], rotation: V, scale: [1,1,1], dimension: `${branchDN} PN16`, partId: branchDN==='DN25'?'FLR-NUT-1/4':'FLR-NUT-1/2', connections: [] });
  }

  const allIds = elements.map(e => e.id);
  for (let i = 0; i < elements.length - 1; i++) {
    elements[i].connections.push(elements[i+1].id);
    elements[i+1].connections.push(elements[i].id);
  }

  return elements;
}

// Multer error handler
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: '文件大小超出限制（最大 50MB）' });
    return res.status(400).json({ error: `上传错误: ${err.message}` });
  }
  if (err.message?.startsWith('不支持的文件类型')) return res.status(400).json({ error: err.message });
  console.error('[服务器] 错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

export default app;
