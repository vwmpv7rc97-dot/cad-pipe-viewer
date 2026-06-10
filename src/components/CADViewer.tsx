import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import type { AIResult, SceneElement, PlacedProduct, AnalysisResponse, Annotation2D, PipeSegment2D, WorkflowStep } from '../types';
import StepNav from './StepNav';
import ProceduralModel from './ProceduralModel';
import { partsDB, getPart, CATEGORIES } from '../data/partsDatabase';

// ============================================================
// API（带离线演示 fallback）
// ============================================================
async function analyzeCAD(file: File): Promise<AnalysisResponse> {
  try {
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/analyze', { method: 'POST', body: fd });
    if (r.ok) return r.json();
  } catch (_) { /* 离线模式 */ }
  // fallback: 本地生成演示数据
  return generateDemoData();
}

function generateDemoData(): AnalysisResponse {
  const H: [number,number,number] = [0, 0, Math.PI / 2];
  const V: [number,number,number] = [0, 0, 0];
  const seed = Date.now() % 1000;
  const mainLen = 3 + (seed % 3);
  const branchCount = 2 + (seed % 3);
  const r = 0.06; const br = 0.035;
  const halfLen = mainLen / 2;
  let id = 0;
  const nid = (p: string) => `${p}-${++id}`;

  const elements: SceneElement[] = [];
  elements.push(
    { id:nid('pipe'), type:'pipe', name:'水平主管道·左段', position:[-halfLen+halfLen/2, 0, 0], rotation:H, scale:[r, halfLen, r], dimension:'DN100', partId:'PIPE-1', connections:[] },
    { id:nid('pipe'), type:'pipe', name:'水平主管道·右段', position:[halfLen-halfLen/2, 0, 0], rotation:H, scale:[r, halfLen, r], dimension:'DN100', partId:'PIPE-1', connections:[] },
  );

  for (let b = 0; b < branchCount; b++) {
    const bx = -halfLen + (halfLen * 2 * (b + 1)) / (branchCount + 1);
    if (b === 0 || b === branchCount - 1) {
      elements.push({ id:nid('elbow'), type:'elbow', name:'90°弯头', position:[bx, 0, 0], rotation:V, scale:[1,1,1], dimension:'DN50', partId:'WELD-E90-1/2', connections:[] });
    } else {
      elements.push({ id:nid('tee'), type:'tee', name:'等径三通', position:[bx, 0, 0], rotation:V, scale:[1,1,1], dimension:'DN50', partId:'WELD-TEE-1/2', connections:[] });
    }
    const rh = 0.4 + (b % 3) * 0.2;
    elements.push({ id:nid('pipe'), type:'pipe', name:'支管·上升段', position:[bx, rh, 0], rotation:V, scale:[br, rh*2-0.1, br], dimension:'DN50', partId:'PFA-T-1/2', connections:[] });
    elements.push({ id:nid('flange'), type:'flange', name:'扩口法兰', position:[bx, rh*2-0.05, 0], rotation:V, scale:[1,1,1], dimension:'DN50', partId:'FLR-NUT-1/2', connections:[] });
    elements.push({ id:nid('valve'), type:'valve', name:'PFA单向阀', position:[bx, rh*2+0.3, 0], rotation:V, scale:[1,1,1], dimension:'1/2"', partId:'CV-1/2', connections:[] });
    elements.push({ id:nid('flange'), type:'flange', name:'扩口法兰', position:[bx, rh*2+0.55, 0], rotation:V, scale:[1,1,1], dimension:'DN50', partId:'FLR-NUT-1/2', connections:[] });
  }

  const allIds = elements.map(e => e.id);
  for (let i = 0; i < elements.length - 1; i++) { elements[i].connections.push(elements[i+1].id); elements[i+1].connections.push(elements[i].id); }

  return {
    elements,
    products: [
      { id:1, sku:'CV-1/2', name:'PFA单向阀', icon:'valve.svg', model:'valve.glb', dimensions:'1/2"', match_score:95, confidence:0.95, matched:true, x:-0.5, y:0.6 },
      { id:2, sku:'CV-3/4', name:'PFA单向阀', icon:'valve.svg', model:'valve.glb', dimensions:'3/4"', match_score:92, confidence:0.92, matched:true, x:1.2, y:0.6 },
      { id:3, sku:'WELD-E90-1/2', name:'焊接90°弯头', icon:'elbow.svg', model:'elbow.glb', dimensions:'1/2"', match_score:98, confidence:0.98, matched:true, x:-0.5, y:1.0 },
      { id:4, sku:'WELD-E90-3/4', name:'焊接90°弯头', icon:'elbow.svg', model:'elbow.glb', dimensions:'3/4"', match_score:96, confidence:0.96, matched:true, x:1.2, y:1.0 },
      { id:5, sku:'FLR-E90-1/2', name:'扩口弯头', icon:'elbow.svg', model:'elbow.glb', dimensions:'1/2"', match_score:88, confidence:0.88, matched:true, x:-1.2, y:0 },
      { id:6, sku:'NV-1/2', name:'PFA针阀', icon:'valve.svg', model:'valve.glb', dimensions:'1/2"', match_score:85, confidence:0.85, matched:true, x:0, y:-0.5 },
      { id:7, sku:'WELD-TEE-1/2', name:'焊接三通', icon:'tee.svg', model:'tee.glb', dimensions:'1/2"', match_score:70, confidence:0.70, matched:false, x:0, y:0.8 },
      { id:8, sku:'FLR-R-3/4X1/2', name:'扩口变径直通', icon:'reducer.svg', model:'reducer.glb', dimensions:'3/4"×1/2"', match_score:65, confidence:0.65, matched:false, x:1.5, y:0 },
    ],
    annotations: [
      { id:'a1', type:'flange', x:0.28, y:0.30, label:'扩口弯头 1/2"', matched:true, sku:'FLR-E90-1/2' },
      { id:'a2', type:'flange', x:0.68, y:0.30, label:'焊接弯头 3/4"', matched:true, sku:'WELD-E90-3/4' },
      { id:'a3', type:'valve',  x:0.28, y:0.52, label:'PFA单向阀 1/2"', matched:true, sku:'CV-1/2' },
      { id:'a4', type:'valve',  x:0.68, y:0.52, label:'PFA单向阀 3/4"', matched:true, sku:'CV-3/4' },
      { id:'a5', type:'valve',  x:0.50, y:0.42, label:'PFA针阀 1/2"', matched:true, sku:'NV-1/2' },
      { id:'a6', type:'elbow',  x:0.28, y:0.78, label:'焊接弯头 1/2"', matched:true, sku:'WELD-E90-1/2' },
      { id:'a7', type:'elbow',  x:0.68, y:0.78, label:'扩口弯头 1/2"', matched:true, sku:'FLR-E90-1/2' },
      { id:'a8', type:'tee',    x:0.50, y:0.22, label:'焊接三通 1/2"', matched:false, sku:undefined },
    ],
    pipes2d: [
      { x1:0.28, y1:0.05, x2:0.28, y2:0.78, r:0.04 },
      { x1:0.68, y1:0.05, x2:0.68, y2:0.78, r:0.04 },
      { x1:0.28, y1:0.38, x2:0.68, y2:0.38, r:0.03 },
      { x1:0.28, y1:0.68, x2:0.68, y2:0.68, r:0.04 },
      { x1:0.18, y1:0.68, x2:0.28, y2:0.68, r:0.03 },
      { x1:0.68, y1:0.68, x2:0.78, y2:0.68, r:0.03 },
      { x1:0.50, y1:0.78, x2:0.50, y2:0.92, r:0.03 },
    ],
    imageWidth: 800, imageHeight: 500,
  };
}

// ============================================================
// 3D 管道连接（CylinderGeometry 两点之间）
// ============================================================
function PipeBetween({ start, end, radius, color = '#4A7FA5' }: { start: [number,number,number]; end: [number,number,number]; radius: number; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!meshRef.current) return;
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    meshRef.current.position.copy(s).addScaledVector(dir.normalize(), len / 2);
    meshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    meshRef.current.scale.set(1, len, 1);
  }, [start, end]);

  return (
    <mesh ref={meshRef} userData={{ elementId: 'pipe' }}>
      <cylinderGeometry args={[radius, radius, 1, 16]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
    </mesh>
  );
}

// ============================================================
// 3D 点击选择器
// ============================================================
function ClickSelector({ onSelect }: { onSelect: (id: string | null) => void }) {
  const { camera, gl, scene } = useThree();
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const rc = new THREE.Raycaster(); rc.setFromCamera(mouse, camera);
      const targets: THREE.Object3D[] = [];
      scene.traverse(obj => { if (obj instanceof THREE.Mesh && obj.userData.productId) targets.push(obj); });
      const hits = rc.intersectObjects(targets, false);
      if (hits.length > 0) {
        const id = (hits[0].object as THREE.Mesh).userData.productId as string;
        onSelect(id);
      }
    };
    gl.domElement.addEventListener('click', handler);
    return () => gl.domElement.removeEventListener('click', handler);
  }, [camera, gl, scene, onSelect]);
  return null;
}

// ============================================================
// 3D 元件模型（带 userData 标记用于点击）
// ============================================================
function Element3D({ el, isSelected }: { el: SceneElement; isSelected: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    ref.current?.traverse(c => { if (c instanceof THREE.Mesh) c.userData.productId = el.id; });
  }, [el.id]);
  return (
    <group ref={ref}>
      <ProceduralModel elementType={el.type} position={el.position} rotation={el.rotation} scale={el.scale} highlighted={isSelected} />
    </group>
  );
}

// ============================================================
// 主组件
// ============================================================
export default function CADViewer() {
  // 步骤
  const [step, setStep] = useState<WorkflowStep>(1);

  // 数据
  const [cadImage, setCadImage] = useState<string | null>(null);
  const [products, setProducts] = useState<AIResult[]>([]);
  const [sceneElements, setSceneElements] = useState<SceneElement[]>([]);
  const [annotations, setAnnotations] = useState<Annotation2D[]>([]);
  const [pipes2d, setPipes2d] = useState<PipeSegment2D[]>([]);
  const [imgDims, setImgDims] = useState({ w: 800, h: 500 });

  // UI 状态
  const [error, setError] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'match' | 'library'>('match');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [analyzeStep, setAnalyzeStep] = useState(0); // 0~5 for step 2 animation

  // Refs
  const c2dRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  // ============================================================
  // Step 1 → 2: 开始分析
  // ============================================================
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setError(null);
    // 预览
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader(); r.onload = ev => ev.target?.result ? res(ev.target.result as string) : rej(new Error('读取失败'));
      r.onerror = () => rej(new Error('读取失败')); r.readAsDataURL(file);
    });
    setCadImage(dataUrl);
    setStep(2);
    setAnalyzeStep(0);
  };

  // ============================================================
  // Step 2 动画
  // ============================================================
  useEffect(() => {
    if (step !== 2) return;
    const labels = ['转换为高清图像', '识别管道走向', '定位阀门与接头', '提取管径标注', '匹配产品库'];
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setAnalyzeStep(i);
      if (i >= labels.length) {
        clearInterval(timer);
        // 实际请求
        if (cadImage) {
          fetch(cadImage).then(r => r.blob()).then(blob => {
            const file = new File([blob], 'design.png', { type: 'image/png' });
            return analyzeCAD(file);
          }).then(data => {
            setSceneElements(data.elements);
            setProducts(data.products);
            setAnnotations(data.annotations);
            setPipes2d(data.pipes2d);
            setImgDims({ w: data.imageWidth, h: data.imageHeight });
            setStep(3);
          }).catch(err => setError(err.message));
        }
      }
    }, 600);
    return () => clearInterval(timer);
  }, [step, cadImage]);

  // ============================================================
  // Step 3: 2D 确认画布
  // ============================================================
  useEffect(() => {
    if (step !== 3 || !c2dRef.current) return;
    const canvas = c2dRef.current;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width = canvas.parentElement!.clientWidth;
    const H = canvas.height = canvas.parentElement!.clientHeight;

    ctx.fillStyle = '#0F1923'; ctx.fillRect(0, 0, W, H);

    // 背景图
    if (cadImage) {
      const img = new Image();
      img.onload = () => { ctx.globalAlpha = 0.3; ctx.drawImage(img, 0, 0, W, H); ctx.globalAlpha = 1; drawAnnotations(); };
      img.src = cadImage;
    } else { drawAnnotations(); }

    function drawAnnotations() {
      // 管道线
      pipes2d.forEach(p => {
        ctx.strokeStyle = 'rgba(74,127,165,0.5)'; ctx.lineWidth = p.r * Math.min(W, H) * 0.5;
        ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(p.x1 * W, p.y1 * H); ctx.lineTo(p.x2 * W, p.y2 * H); ctx.stroke();
      });

      // 元件标注
      annotations.forEach(a => {
        const cx = a.x * W, cy = a.y * H, r = Math.min(W, H) * 0.035;
        ctx.strokeStyle = a.matched ? '#1D9E75' : '#EF9F27'; ctx.lineWidth = 1.5;
        ctx.fillStyle = a.matched ? 'rgba(29,158,117,0.15)' : 'rgba(239,159,39,0.15)';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.fillStyle = a.matched ? '#5DCAA5' : '#FAC775'; ctx.font = `${Math.max(10, r * 0.7)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(a.label, cx, cy + r + 3);
        ctx.fillStyle = a.matched ? '#1D9E75' : '#FAC775'; ctx.font = `bold ${Math.max(10, r * 0.7)}px sans-serif`;
        ctx.textBaseline = 'middle'; ctx.fillText(a.matched ? '✓' : '?', cx, cy);
      });

      // AI 识别区域框
      ctx.fillStyle = 'rgba(29,158,117,0.08)'; ctx.strokeStyle = 'rgba(29,158,117,0.2)';
      ctx.lineWidth = 0.5; ctx.setLineDash([4, 4]);
      ctx.strokeRect(W * 0.18, H * 0.08, W * 0.6, H * 0.8); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(29,158,117,0.5)'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('AI 识别区域', W * 0.19, H * 0.06);
    }
  }, [step, cadImage, pipes2d, annotations]);

  // ============================================================
  // 3D 场景数据
  // ============================================================
  const pipeDefs = useMemo(() => {
    if (step !== 4) return [];
    const pr = 0.06;
    return [
      { start:[-1, -1.5, 0] as [number,number,number], end:[-1, 1.5, 0] as [number,number,number], r: pr },
      { start:[1, -1.5, 0] as [number,number,number],  end:[1, 1.5, 0] as [number,number,number],  r: pr },
      { start:[-1, -0.5, 0] as [number,number,number], end:[1, -0.5, 0] as [number,number,number],  r: 0.04 },
      { start:[-1, 1, 0] as [number,number,number],    end:[1, 1, 0] as [number,number,number],     r: pr },
      { start:[-1.8, 1, 0] as [number,number,number],   end:[-1, 1, 0] as [number,number,number],    r: 0.04 },
      { start:[1, 1, 0] as [number,number,number],      end:[1.8, 1, 0] as [number,number,number],   r: 0.04 },
      { start:[0, 1.5, 0] as [number,number,number],     end:[0, 2.2, 0] as [number,number,number],   r: 0.04 },
    ];
  }, [step]);

  // ============================================================
  // 产品库数据
  // ============================================================
  const allProducts = useMemo(() => partsDB.map(p => ({
    ...p,
    matched: products.some(pp => pp.sku === p.id),
    confidence: products.find(pp => pp.sku === p.id)?.confidence ?? 0,
  })), [products]);

  const matchedProducts = useMemo(() => products.filter(p => p.matched), [products]);
  const unmatchedProducts = useMemo(() => products.filter(p => !p.matched), [products]);

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d1117', color: '#c9d1d9' }}>
      {/* ======== 顶部导航 ======== */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom:'0.5px solid #21262d', background:'#0d1117', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:14, fontWeight:500, color:'#e6edf3', letterSpacing:'-0.2px' }}>🔧 PipeMatch</span>
          <StepNav current={step} onGo={s => setStep(s)} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {products.length > 0 && (
            <span className="tag green" style={{ fontSize:11, padding:'3px 8px', borderRadius:6 }}>
              ✓ 已匹配 {matchedProducts.length} 个产品
            </span>
          )}
          {step === 3 && (
            <button className="confirm-btn" onClick={() => setStep(4)}>确认，生成三维图 →</button>
          )}
          {step === 4 && (
            <button className="confirm-btn" onClick={() => setStep(3)}>← 返回校对</button>
          )}
        </div>
      </div>

      {/* ======== 主体 ======== */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 画布区 */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: step <= 3 ? '#0F1923' : 'transparent' }}>
          {/* Step 1: 上传 */}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16 }}>
              <label className="upload-box">
                <div style={{ fontSize:36, color:'rgba(255,255,255,0.2)', marginBottom:12 }}>📁</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.8)', fontWeight:500, marginBottom:4 }}>上传客户图纸</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>点击或拖入文件</div>
                <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'center' }}>
                  {['PDF','DXF','DWG','PNG/JPG'].map(f => <span key={f} className="fmt-tag" style={{ fontSize:11, padding:'3px 8px', borderRadius:4, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)' }}>{f}</span>)}
                </div>
                <input type="file" accept="image/*,.pdf" onChange={handleUpload} style={{ display:'none' }} id="file-upload" />
              </label>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>或 <span style={{ color:'#5DCAA5', cursor:'pointer' }} onClick={() => {
                // 模拟演示：跳过上传直接进入分析
                const mockFile = new File([], 'demo.png', { type: 'image/png' });
                setCadImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
                setStep(2); setAnalyzeStep(0);
              }}>加载演示案例 →</span></div>
            </div>
          )}

          {/* Step 2: 分析动画 */}
          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12 }}>
              <div style={{ width:36, height:36, border:'2px solid rgba(29,158,117,0.2)', borderTopColor:'#1D9E75', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.8)' }}>AI 正在识别图纸...</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                {['转换为高清图像','识别管道走向','定位阀门与接头','提取管径标注','匹配产品库'].map((label, i) => (
                  <div key={i} className={`analyze-step${analyzeStep > i ? ' done' : ''}${analyzeStep === i+1 ? ' active' : ''}`}>
                    <span>{analyzeStep > i ? '✓' : analyzeStep === i+1 ? '◌' : '○'}</span> {label}
                  </div>
                ))}
              </div>
              {error && <div style={{ marginTop:12, padding:'6px 12px', background:'rgba(248,81,73,0.15)', color:'#f85149', borderRadius:6, fontSize:12 }}>{error}</div>}
            </div>
          )}

          {/* Step 3: 2D 确认 */}
          {step === 3 && (
            <>
              <canvas ref={c2dRef} style={{ width:'100%', height:'100%', display:'block' }} />
              <div className="confirm-banner" style={{ position:'absolute', top:0, left:0, right:0 }}>
                <span style={{ fontSize:12, color:'#5DCAA5' }}>👁 AI 识别完成 — 请检查高亮标注，确认无误后生成三维方案</span>
              </div>
              <div style={{ position:'absolute', bottom:12, left:12, fontSize:11, color:'rgba(255,255,255,0.3)', pointerEvents:'none' }}>
                绿色 = 已匹配产品库 · 橙色 = 需人工确认
              </div>
            </>
          )}

          {/* Step 4: 3D 视图 */}
          {step === 4 && (
            <Canvas camera={{ position:[0,2,6], fov:45 }} gl={{ antialias:true }} style={{ background:'#0F1923' }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5,10,5]} intensity={0.8} />
              <directionalLight position={[-5,-2,-5]} intensity={0.3} color="#4488aa" />
              <Environment preset="studio" />
              <Grid position={[0,-2.5,0]} args={[12,12]} cellSize={0.5} cellThickness={0.5} cellColor="#1a2a3a" sectionSize={2} sectionThickness={1} sectionColor="#1a2a3a" fadeDistance={15} />

              {/* 管道 */}
              {pipeDefs.map((p, i) => <PipeBetween key={i} start={p.start} end={p.end} radius={p.r} />)}

              {/* 阀门/法兰/弯头 */}
              {sceneElements.filter(e => e.type !== 'pipe').map(el => (
                <Element3D key={el.id} el={el} isSelected={el.id === selectedProductId} />
              ))}

              <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={16} />
              <ClickSelector onSelect={id => setSelectedProductId(id)} />
            </Canvas>
          )}
        </div>

        {/* ======== 侧栏 ======== */}
        <div style={{ width:260, borderLeft:'0.5px solid #21262d', display:'flex', flexDirection:'column', background:'#0d1117', flexShrink:0 }}>
          <div style={{ display:'flex', borderBottom:'0.5px solid #21262d', flexShrink:0 }}>
            <div className={`panel-tab${sidebarTab === 'match' ? ' active' : ''}`} onClick={() => setSidebarTab('match')}>匹配产品</div>
            <div className={`panel-tab${sidebarTab === 'library' ? ' active' : ''}`} onClick={() => setSidebarTab('library')}>产品库</div>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:12 }}>
            {sidebarTab === 'match' && (
              <>
                {products.length === 0 && (
                  <div style={{ textAlign:'center', padding:'40px 0', color:'#8b949e', fontSize:13 }}>
                    <div style={{ fontSize:28, marginBottom:8, opacity:0.3 }}>📤</div>上传图纸后自动匹配
                  </div>
                )}

                {matchedProducts.length > 0 && (
                  <>
                    <div style={{ fontSize:11, color:'#8b949e', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>已匹配 ({matchedProducts.length})</div>
                    {matchedProducts.map(p => (
                      <div key={p.id} className={`product-card${selectedProductId === String(p.id) ? ' selected' : ''}`} onClick={() => setSelectedProductId(String(p.id))}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <div style={{ width:28, height:28, borderRadius:6, background:'rgba(29,158,117,0.15)', color:'#0F6E56', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>✓</div>
                          <div>
                            <div style={{ fontSize:12, fontWeight:500, color:'#e6edf3', lineHeight:1.3 }}>{p.name} {p.dimensions}</div>
                            <div style={{ fontSize:11, color:'#8b949e', marginTop:1 }}>{p.sku}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                          <span className="tag green">{p.dimensions}</span>
                          <span className="tag green">{Math.round(p.confidence * 100)}% 置信度</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {unmatchedProducts.length > 0 && (
                  <>
                    <div style={{ fontSize:11, color:'#8b949e', marginBottom:6, marginTop:12, textTransform:'uppercase', letterSpacing:0.5 }}>未匹配 ({unmatchedProducts.length})</div>
                    {unmatchedProducts.map(p => (
                      <div key={p.id} className="product-card unmatched">
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <div style={{ width:28, height:28, borderRadius:6, background:'rgba(239,159,39,0.15)', color:'#854F0B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>⚠</div>
                          <div>
                            <div style={{ fontSize:12, fontWeight:500, color:'#e6edf3', lineHeight:1.3 }}>{p.name} {p.dimensions}</div>
                            <div style={{ fontSize:11, color:'#8b949e', marginTop:1 }}>{p.sku}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                          <span className="tag amber">需人工确认</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {sidebarTab === 'library' && (
              <>
                {CATEGORIES.map(cat => {
                  const catParts = partsDB.filter(p => p.category === cat.key);
                  if (!catParts.length) return null;
                  return (
                    <div key={cat.key} style={{ marginBottom:12 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:'#484f58', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>
                        {cat.icon} {cat.label} ({catParts.length})
                      </div>
                      {catParts.map(p => {
                        const prod = products.find(pp => pp.sku === p.id);
                        return (
                          <div key={p.id} className={`product-card${prod?.matched === false ? ' unmatched' : ''}`} style={{ padding:'6px 8px', marginBottom:2 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <span style={{ fontSize:11, fontWeight:500, color:'#e6edf3', fontFamily:'monospace' }}>{p.id}</span>
                              <span style={{ fontSize:10, color:'#8b949e' }}>{p.dn}</span>
                            </div>
                            <div style={{ fontSize:11, color:'#8b949e', marginTop:1 }}>{p.name}</div>
                            <div style={{ display:'flex', gap:4, marginTop:2 }}>
                              <span className="tag">{p.material}</span>
                              <span className="tag">{p.standard}</span>
                              {prod?.matched && <span className="tag green">已匹配</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
