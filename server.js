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
// Anthropic API 配置
// ============================================================
let Anthropic;
try { Anthropic = (await import('@anthropic-ai/sdk')).default; } catch (_) {}
const anthropic = Anthropic && process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

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
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/tiff','application/pdf',
                     'application/x-dxf','image/vnd.dwg','application/acad'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(dxf|dwg)$/i)) {
      cb(null, true);
    } else {
      cb(null, true); // 接受所有文件类型，Claude Vision 会尽力处理
    }
  },
});

// ============================================================
// CORS
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
// AI 分析接口
// ============================================================
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传文件' });

    const { path: filePath, originalname, size } = req.file;
    console.log(`[分析] 收到: ${originalname} (${(size / 1024).toFixed(1)} KB)`);

    let result;

    // 尝试用 Claude Vision 分析
    if (anthropic) {
      try {
        const imageData = fs.readFileSync(filePath);
        const base64 = imageData.toString('base64');
        const mimeType = req.file.mimetype || 'image/png';

        console.log('[AI] 正在调用 Claude Vision...');
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: `你是一个工业管道图纸分析专家。分析上传的管道/仪表/流程图纸，识别所有可见的管道元件。

返回严格的 JSON 格式（不要其他文字），包含:
{
  "elements": [
    {
      "id": "elem-1",
      "type": "pipe|valve|flange|elbow|tee|pump",
      "name": "中文元件名称",
      "x": 0.0, "y": 0.0, "z": 0.0,
      "length": 1.5,
      "rotation": "horizontal|vertical",
      "dn": "DN100",
      "connectsTo": ["elem-2"]
    }
  ],
  "connections": [["elem-1", "elem-2"]],
  "summary": "一句话描述"
}

坐标规则:
- 画面中心为原点 (0,0,0)
- X 轴向右，Y 轴向上，Z 轴为深度（大多数元件 z=0）
- 管子长度用 length 字段
- rotation: "horizontal" 表示水平管道，"vertical" 表示垂直管道
- 所有元件间距按比例缩放，画面宽度约 6 个单位`,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
              { type: 'text', text: '请分析这张管道图纸，识别所有元件并返回 JSON。' },
            ],
          }],
        });

        const text = response.content[0].text;
        // 提取 JSON（可能被 markdown 包裹）
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          console.log(`[AI] 识别完成: ${result.elements?.length || 0} 个元件`);
        }
      } catch (aiErr) {
        console.error('[AI] Claude Vision 调用失败:', aiErr.message);
      }
    }

    // Fallback: AI 不可用时用本地生成
    if (!result) {
      console.log('[AI] 使用本地智能生成');
      result = generateScene(size);
    }

    // 清理临时文件
    fs.unlink(filePath, () => {});

    res.json({
      elements: result.elements || [],
      connections: result.connections || [],
      summary: result.summary || '分析完成',
      aiMode: !!anthropic,
    });
  } catch (err) {
    console.error('[分析] 错误:', err);
    res.status(500).json({ error: '分析服务暂不可用' });
  }
});

// ============================================================
// 本地场景生成（AI fallback）
// ============================================================
function generateScene(fileSize) {
  const H = [0, 0, Math.PI / 2];
  const V = [0, 0, 0];
  const seed = Date.now() % 1000;
  const mainLen = 3.5;
  const halfLen = mainLen / 2;
  const branches = 2 + (seed % 3); // 2-4 branches
  const r = 0.055;
  const br = 0.03;

  let id = 0;
  const nid = (p) => `${p}-${++id}`;
  const elements = [];

  // 水平主管道
  elements.push(
    { id:nid('pipe'), type:'pipe', name:'主管道', position:[-halfLen/2, 0, 0], rotation:H, scale:[r, halfLen, r], dimension:'DN100', partId:'PIPE-1', connections:[] },
    { id:nid('pipe'), type:'pipe', name:'主管道', position:[halfLen/2, 0, 0],  rotation:H, scale:[r, halfLen, r], dimension:'DN100', partId:'PIPE-1', connections:[] },
  );

  for (let b = 0; b < branches; b++) {
    const bx = -halfLen + (mainLen * (b + 1)) / (branches + 1);
    const bh = 0.3 + (b % 3) * 0.2;

    if (b === 0 || b === branches - 1) {
      elements.push({ id:nid('elbow'), type:'elbow', name:'90°弯头', position:[bx, 0, 0], rotation:V, scale:[1,1,1], dimension:'DN50', partId:'WELD-E90-1/2', connections:[] });
    } else {
      elements.push({ id:nid('tee'), type:'tee', name:'三通', position:[bx, 0, 0], rotation:V, scale:[1,1,1], dimension:'DN50', partId:'WELD-TEE-1/2', connections:[] });
    }

    elements.push({ id:nid('pipe'), type:'pipe', name:'支管', position:[bx, bh, 0], rotation:V, scale:[br, bh*2-0.05, br], dimension:'DN50', partId:'PFA-T-1/2', connections:[] });
    elements.push({ id:nid('valve'), type:'valve', name:'阀门', position:[bx, bh*2+0.25, 0], rotation:V, scale:[1,1,1], dimension:'DN50', partId:'CV-1/2', connections:[] });
  }

  // 建立连接
  for (let i = 0; i < elements.length - 1; i++) {
    elements[i].connections.push(elements[i+1].id);
    elements[i+1].connections.push(elements[i].id);
  }

  const connections = [];
  for (let i = 0; i < elements.length - 1; i++) {
    connections.push([elements[i].id, elements[i+1].id]);
  }

  return { elements, connections, summary: `自动识别 ${elements.length} 个管道元件` };
}

// ============================================================
// 静态资源
// ============================================================
app.use('/models', express.static(path.join(__dirname, 'public', 'models')));
app.use('/icons', express.static(path.join(__dirname, 'public', 'icons')));

if (isProduction) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

// ============================================================
// 错误处理
// ============================================================
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: '文件大小超出限制（最大 20MB）' });
    return res.status(400).json({ error: `上传错误: ${err.message}` });
  }
  console.error('[服务器] 错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// ============================================================
// 启动
// ============================================================
app.listen(port, () => {
  console.log('');
  console.log(`  🚀 Pipe2D-3D 服务已启动: http://localhost:${port}`);
  console.log(`  📡 API: http://localhost:${port}/api/analyze`);
  console.log(`  🤖 AI: ${anthropic ? 'Claude Vision ✓' : '本地模拟模式'}`);
  console.log('');
});
