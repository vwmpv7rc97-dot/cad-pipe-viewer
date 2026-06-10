import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================
// 文件上传配置
// ============================================================
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}。仅支持图片和 PDF。`));
    }
  },
});

// ============================================================
// CORS 中间件
// ============================================================
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '10mb' }));

// ============================================================
// AI 分析接口 —— 返回完整管道场景
// ============================================================
app.post('/api/analyze', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const { filename, originalname, size } = req.file;
    console.log(`[分析] 收到: ${originalname} (${(size / 1024).toFixed(1)} KB)`);

    // 根据文件大小估算图片尺寸（实际项目应解析图片获取真实尺寸）
    const estimatedPixels = size * 200; // ~200 pixels per KB for typical JPEG
    const aspectRatio = 1.6 + Math.random() * 0.8; // 1.6~2.4 宽高比
    const imgW = Math.round(Math.sqrt(estimatedPixels * aspectRatio));
    const imgH = Math.round(imgW / aspectRatio);

    const elements = generateScene(imgW, imgH);

    // 产品匹配结果（常州氟曜 PFA 产品）
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

    // 2D 标注
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

    // 2D 管道段
    const pipes2d = [
      { x1:0.28, y1:0.05, x2:0.28, y2:0.78, r:0.04 },
      { x1:0.68, y1:0.05, x2:0.68, y2:0.78, r:0.04 },
      { x1:0.28, y1:0.38, x2:0.68, y2:0.38, r:0.03 },
      { x1:0.28, y1:0.68, x2:0.68, y2:0.68, r:0.04 },
      { x1:0.18, y1:0.68, x2:0.28, y2:0.68, r:0.03 },
      { x1:0.68, y1:0.68, x2:0.78, y2:0.68, r:0.03 },
      { x1:0.50, y1:0.78, x2:0.50, y2:0.92, r:0.03 },
    ];

    setTimeout(() => {
      res.json({ elements, products, annotations, pipes2d, imageWidth: imgW, imageHeight: imgH });

      const filePath = path.join(__dirname, 'uploads', filename);
      fs.unlink(filePath, (err) => {
        if (err) console.warn(`[清理] 失败: ${filename}`);
        else console.log(`[清理] 已删除: ${filename}`);
      });
    }, 1500);
  } catch (err) {
    console.error('[分析] 错误:', err);
    res.status(500).json({ error: '分析服务暂不可用' });
  }
});

// ============================================================
// 零件数据库端点
// ============================================================
app.get('/api/parts', (_req, res) => {
  // 返回零件数据库的简化版（前端已有完整数据，这里返回摘要供参考）
  res.json({ total: 82, categories: ['pipe','valve','flange','elbow','tee','reducer','instrument','equipment','cap','bolt'] });
});

// ============================================================
// 动态场景生成（根据图片尺寸）
// ============================================================
function generateScene(imgW, imgH) {
  const H = [0, 0, Math.PI / 2]; // 水平管道旋转 (Y→X)
  const V = [0, 0, 0];            // 垂直

  // 根据图片宽度计算场景比例（更宽的图 → 更长的管道）
  const scale = Math.max(0.5, Math.min(2.5, imgW / 1500));
  // 随机种子（每次上传生成不同布局）
  const seed = Date.now() % 1000;

  // 主管道总长度和分支数
  const mainLen = 3 + (seed % 3);        // 3~5 米等比例
  const branchCount = 2 + (seed % 3);    // 2~4 个分支
  const mainDN = seed % 2 === 0 ? 'DN100' : 'DN150';
  const branchDN = seed % 3 === 0 ? 'DN25' : 'DN50';
  const r = mainDN === 'DN100' ? 0.06 : 0.09;  // 主管半径
  const br = branchDN === 'DN25' ? 0.02 : 0.035; // 支管半径

  const elements = [];
  let id = 0;
  const nextId = (prefix) => `${prefix}-${++id}`;

  // === 水平主管道 ===
  const halfLen = mainLen / 2;
  const segLen = halfLen / 2;
  elements.push(
    { id: nextId('pipe'), type: 'pipe', name: `水平主管道·左段 ${mainDN}`, position: [-halfLen+segLen/2, 0, 0], rotation: H, scale: [r, segLen, r], dimension: mainDN, partId: mainDN==='DN100'?'PIPE-DN100-SCH40':'PIPE-DN150-SCH40', connections: [] },
    { id: nextId('pipe'), type: 'pipe', name: `水平主管道·右段 ${mainDN}`, position: [halfLen-segLen/2, 0, 0],  rotation: H, scale: [r, segLen, r], dimension: mainDN, partId: mainDN==='DN100'?'PIPE-DN100-SCH40':'PIPE-DN150-SCH40', connections: [] },
  );

  // === 分支 ===
  const branchXs = [];
  for (let b = 0; b < branchCount; b++) {
    // 分支分布在主管道上
    const bx = -halfLen + (halfLen * 2 * (b + 1)) / (branchCount + 1);
    branchXs.push(bx);

    const elbowId = nextId('elbow');

    // 三通 或 弯头（第一个和最后一个用弯头连接）
    if (b === 0 || b === branchCount - 1) {
      elements.push({ id: elbowId, type: 'elbow', name: `90°弯头 ${branchDN}`, position: [bx, 0, 0], rotation: V, scale: [1,1,1], dimension: `90° ${branchDN}`, partId: branchDN==='DN25'?'E90-DN25-LR':'E90-DN50-LR', connections: [] });
    } else {
      elements.push({ id: nextId('tee'), type: 'tee', name: `等径三通 ${mainDN}`, position: [bx, 0, 0], rotation: V, scale: [1,1,1], dimension: `${mainDN}×${branchDN}`, partId: mainDN==='DN100'?'TEE-DN100':'TEE-DN50', connections: [] });
    }

    // 上升管道
    const riseH = 0.4 + (seed % 3) * 0.2;
    elements.push({ id: nextId('pipe'), type: 'pipe', name: `支管·上升段 ${branchDN}`, position: [bx, riseH, 0], rotation: V, scale: [br, riseH*2-0.1, br], dimension: branchDN, partId: branchDN==='DN25'?'PIPE-DN25-SCH40':'PIPE-DN50-SCH40', connections: [] });

    // 法兰
    elements.push({ id: nextId('flange'), type: 'flange', name: `法兰 ${branchDN}`, position: [bx, riseH*2-0.05, 0], rotation: V, scale: [1,1,1], dimension: `${branchDN} PN16`, partId: branchDN==='DN25'?'WN-DN25-PN16':'WN-DN50-PN16', connections: [] });

    // 阀门
    const valveDN = branchDN;
    const valveY = riseH*2 + 0.3;
    const valvePartId = seed % 3 === 0 ? (valveDN==='DN25'?'GV-DN25-PN16':'GV-DN50-PN16') : (valveDN==='DN25'?'BV-DN25-PN16':'BV-DN50-PN16');
    const valveName = seed % 3 === 0 ? '闸阀' : '球阀';
    elements.push({ id: nextId('valve'), type: 'valve', name: `${valveName} ${valveDN}`, position: [bx, valveY, 0], rotation: V, scale: [1,1,1], dimension: `${valveDN} PN16`, partId: valvePartId, connections: [] });

    // 上法兰
    elements.push({ id: nextId('flange'), type: 'flange', name: `法兰 ${branchDN}`, position: [bx, valveY + 0.3, 0], rotation: V, scale: [1,1,1], dimension: `${branchDN} PN16`, partId: branchDN==='DN25'?'WN-DN25-PN16':'WN-DN50-PN16', connections: [] });
  }

  // === 建立连接关系 ===
  const allIds = elements.map(e => e.id);
  for (let i = 0; i < elements.length - 1; i++) {
    elements[i].connections.push(elements[i+1].id);
    elements[i+1].connections.push(elements[i].id);
  }

  return elements;
}

// ============================================================
// 静态资源
// ============================================================
app.use('/models', express.static(path.join(__dirname, 'public', 'models')));
app.use('/icons', express.static(path.join(__dirname, 'public', 'icons')));

if (isProduction) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// ============================================================
// 错误处理
// ============================================================
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: '文件大小超出限制（最大 50MB）' });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: '一次只能上传一个文件' });
    return res.status(400).json({ error: `上传错误: ${err.message}` });
  }
  if (err.message?.startsWith('不支持的文件类型')) {
    return res.status(400).json({ error: err.message });
  }
  console.error('[服务器] 未捕获错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// ============================================================
// 启动
// ============================================================
app.listen(port, () => {
  console.log('');
  console.log('  ██████╗  █████╗ ██████╗     ██╗   ██╗██╗███████╗██╗    ██╗███████╗██████╗ ');
  console.log(' ██╔════╝ ██╔══██╗██╔══██╗    ██║   ██║██║██╔════╝██║    ██║██╔════╝██╔══██╗');
  console.log(' ██║      ███████║██║  ██║    ██║   ██║██║█████╗  ██║ █╗ ██║█████╗  ██████╔╝');
  console.log(' ██║      ██╔══██║██║  ██║    ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║██╔══╝  ██╔══██╗');
  console.log(' ╚██████╗ ██║  ██║██████╔╝     ╚████╔╝ ██║███████╗╚███╔███╔╝███████╗██║  ██║');
  console.log('  ╚═════╝ ╚═╝  ╚═╝╚═════╝       ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝');
  console.log('');
  console.log(`  🚀 服务已启动: http://localhost:${port}`);
  console.log(`  📡 API:   http://localhost:${port}/api/analyze`);
  console.log(`  🖼️  静态:  http://localhost:${port}/`);
  if (!isProduction) {
    console.log(`  💡 前端开发模式请运行: npm run dev`);
  }
  console.log('');
});
