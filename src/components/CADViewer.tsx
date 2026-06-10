import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneElement } from '../types';
import ProceduralModel from './ProceduralModel';

function PipeBetween({ start, end, radius }: { start: [number,number,number]; end: [number,number,number]; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    const s = new THREE.Vector3(...start), e = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    ref.current.position.copy(s).addScaledVector(dir.normalize(), len/2);
    ref.current.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
    ref.current.scale.set(1, len, 1);
  }, [start, end]);
  return <mesh ref={ref}><cylinderGeometry args={[radius, radius, 1, 16]} /><meshStandardMaterial color="#4A7FA5" roughness={0.4} metalness={0.6} /></mesh>;
}

function Element3D({ el, selected }: { el: SceneElement; selected: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => { ref.current?.traverse(c => { if (c instanceof THREE.Mesh) c.userData.elementId = el.id; }); }, [el.id]);
  return <group ref={ref}><ProceduralModel elementType={el.type} position={el.position} rotation={el.rotation} scale={el.scale} highlighted={selected} /></group>;
}

function ClickSelector({ onSelect }: { onSelect: (id: string|null) => void }) {
  const { camera, gl, scene } = useThree();
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const rect = gl.domElement.getBoundingClientRect();
      const m = new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1, -((e.clientY-rect.top)/rect.height)*2+1);
      const rc = new THREE.Raycaster(); rc.setFromCamera(m, camera);
      const ts: THREE.Object3D[] = []; scene.traverse(o => { if (o instanceof THREE.Mesh && o.userData.elementId) ts.push(o); });
      const hits = rc.intersectObjects(ts, false);
      onSelect(hits.length ? (hits[0].object as THREE.Mesh).userData.elementId : null);
    };
    gl.domElement.addEventListener('click', h);
    return () => gl.domElement.removeEventListener('click', h);
  }, [camera, gl, scene, onSelect]);
  return null;
}

const TYPES: Record<string,string> = { pipe:'管道',valve:'阀门',flange:'法兰',elbow:'弯头',tee:'三通',pump:'泵' };
const COLORS: Record<string,string> = { pipe:'#8899aa',valve:'#4a90d9',flange:'#c9a84c',elbow:'#8899aa',tee:'#8899aa',pump:'#4caf50' };

export default function CADViewer() {
  const [img, setImg] = useState<string|null>(null);
  const [elements, setEls] = useState<SceneElement[]>([]);
  const [connections, setCons] = useState<[string,string][]>([]);
  const [summary, setSum] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [sel, setSel] = useState<string|null>(null);
  const [explode, setEx] = useState(false);
  const [exF, setExF] = useState(0);
  const [panel, setPanel] = useState(false);

  useEffect(() => { if(!explode){setExF(0);return;} let t=0; const tick=()=>{t=Math.min(t+0.05,1.5);setExF(t);if(t<1.5)requestAnimationFrame(tick);}; requestAnimationFrame(tick); }, [explode]);

  const center = useMemo(() => {
    if(!elements.length) return [0,0,0] as [number,number,number];
    let cx=0,cy=0,cz=0; elements.forEach(e=>{cx+=e.position[0];cy+=e.position[1];cz+=e.position[2];});
    return [cx/elements.length,cy/elements.length,cz/elements.length] as [number,number,number];
  }, [elements]);

  const expPos = useCallback((p:[number,number,number]):[number,number,number] => {
    if(!explode||exF<=0) return p;
    return [center[0]+(p[0]-center[0])*(1+exF), center[1]+(p[1]-center[1])*(1+exF), center[2]+(p[2]-center[2])*(1+exF)];
  }, [explode, exF, center]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    setErr(null); setLoading(true);
    const url = await new Promise<string>((res,rej)=>{const r=new FileReader();r.onload=ev=>ev.target?.result?res(ev.target.result as string):rej(new Error('x'));r.onerror=()=>rej(new Error('x'));r.readAsDataURL(f);});
    setImg(url);
    try {
      const fd = new FormData(); fd.append('file', f);
      const resp = await fetch('/api/analyze', { method:'POST', body:fd });
      if(!resp.ok) throw new Error('API');
      const d = await resp.json();
      setEls(d.elements||[]); setCons(d.connections||[]); setSum(d.summary||'');
    } catch(_) {
      const demo = genDemo(); setEls(demo.elements); setCons(demo.connections); setSum(demo.summary);
    }
    setLoading(false); setSel(null);
  };

  const pipeDefs = useMemo(() => {
    const m = new Map(elements.map(e=>[e.id,e]));
    return connections.map(([a,b])=>{const ea=m.get(a),eb=m.get(b);if(!ea||!eb)return null;if(ea.type==='pipe'&&eb.type==='pipe')return{start:ea.position,end:eb.position,r:ea.scale[0]||0.04};return null;}).filter(Boolean) as {start:[number,number,number];end:[number,number,number];r:number}[];
  }, [elements, connections]);

  const selEl = useMemo(() => elements.find(e=>e.id===sel)||null, [elements, sel]);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#0d1117',color:'#c9d1d9'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px',borderBottom:'0.5px solid #21262d',background:'#0d1117',flexShrink:0,flexWrap:'wrap',gap:6}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:16,fontWeight:600,color:'#e6edf3'}}>🔧 2D→3D 管道分析</span>
          {summary && <span style={{fontSize:11,color:'#5DCAA5'}}>{summary}</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {elements.length>0 && <>
            <button onClick={()=>setEx(!explode)} style={{fontSize:12,padding:'4px 12px',borderRadius:6,background:explode?'#d97706':'#21262d',color:explode?'#fff':'#8b949e',border:'0.5px solid #30363d',cursor:'pointer'}}>{explode?'🔧 合并':'💥 分解'}</button>
            <button onClick={()=>setSel(null)} style={{fontSize:12,padding:'4px 12px',borderRadius:6,background:'#21262d',color:'#8b949e',border:'0.5px solid #30363d',cursor:'pointer'}}>取消选中</button>
            <button onClick={()=>setPanel(!panel)} style={{fontSize:12,padding:'4px 12px',borderRadius:6,background:'#21262d',color:'#8b949e',border:'0.5px solid #30363d',cursor:'pointer'}}>☰ 元件 ({elements.length})</button>
          </>}
        </div>
      </div>
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        <div style={{flex:1,position:'relative',background:elements.length?'transparent':'#0F1923'}}>
          {!img && <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:16}}>
            <label style={{border:'1.5px dashed rgba(255,255,255,0.15)',borderRadius:12,padding:'40px 32px',textAlign:'center',cursor:'pointer',maxWidth:360,width:'90%'}}
              onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){const dt=new DataTransfer();dt.items.add(f);const inp=document.getElementById('fu') as HTMLInputElement;inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));}}}>
              <div style={{fontSize:36,opacity:0.2,marginBottom:12}}>📁</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,0.8)',fontWeight:500,marginBottom:4}}>上传二维管道图纸</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>拖入文件或点击选择</div>
              <div style={{display:'flex',gap:8,marginTop:12,justifyContent:'center',flexWrap:'wrap'}}>{['PNG','JPG','PDF','DXF','DWG','WebP'].map(t=><span key={t} style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.35)'}}>{t}</span>)}</div>
              <input id="fu" type="file" accept="image/*,.pdf,.dxf,.dwg" onChange={handleUpload} style={{display:'none'}} />
            </label>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.2)',cursor:'pointer'}} onClick={()=>{const d=genDemo();setEls(d.elements);setCons(d.connections);setSum(d.summary);setImg('data:image/png;base64,i');}}>或 加载演示案例 →</span>
          </div>}
          {loading && <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(15,25,35,0.9)',zIndex:20}}>
            <div style={{width:36,height:36,border:'2px solid rgba(29,158,117,0.2)',borderTopColor:'#1D9E75',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.8)',marginTop:12}}>AI 分析中...</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:4}}>识别管道、阀门、弯头、法兰...</div>
          </div>}
          {elements.length>0 && <Canvas camera={{position:[0,2,6],fov:45}} gl={{antialias:true}} style={{background:'#0F1923'}}>
            <ambientLight intensity={0.5}/><directionalLight position={[5,10,5]} intensity={0.8}/><directionalLight position={[-5,-2,-5]} intensity={0.3} color="#4488aa"/>
            <Environment preset="studio"/>
            <Grid position={[0,-2.5,0]} args={[12,12]} cellSize={0.5} cellThickness={0.5} cellColor="#1a2a3a" sectionSize={2} sectionThickness={1} sectionColor="#1a2a3a" fadeDistance={15}/>
            {pipeDefs.map((p,i)=><PipeBetween key={`p${i}`} start={p.start} end={p.end} radius={p.r}/>)}
            {elements.filter(e=>e.type!=='pipe').map(el=><Element3D key={el.id} el={{...el,position:expPos(el.position)}} selected={sel===el.id}/>)}
            <OrbitControls enableDamping dampingFactor={0.08} minDistance={2} maxDistance={16}/>
            <ClickSelector onSelect={setSel}/>
          </Canvas>}
          {elements.length>0 && <div style={{position:'absolute',bottom:8,left:8,fontSize:10,color:'rgba(255,255,255,0.25)',pointerEvents:'none',display:'flex',gap:10,flexWrap:'wrap'}}>
            {Object.entries(COLORS).map(([t,c])=><span key={t} style={{display:'flex',alignItems:'center',gap:3}}><span style={{width:8,height:8,borderRadius:2,background:c,display:'inline-block'}}/>{TYPES[t]}</span>)}
          </div>}
        </div>
        {elements.length>0 && <div style={{width:Math.min(260,typeof window!=='undefined'?window.innerWidth*0.4:260),borderLeft:'0.5px solid #21262d',display:'flex',flexDirection:'column',background:'#0d1117',flexShrink:0}}
          className={panel?'':'collapsed'}>
          <div style={{padding:'8px 12px',borderBottom:'0.5px solid #21262d',fontSize:11,color:'#8b949e',flexShrink:0}}>📋 元件列表 ({elements.length})</div>
          <div style={{flex:1,overflowY:'auto',padding:4}}>
            {elements.map(el=><div key={el.id} onClick={()=>setSel(el.id===sel?null:el.id)}
              style={{padding:'6px 10px',margin:2,borderRadius:6,cursor:'pointer',border:sel===el.id?'1px solid #1D9E75':'1px solid transparent',background:sel===el.id?'rgba(29,158,117,0.08)':'transparent'}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:8,height:8,borderRadius:2,background:COLORS[el.type]||'#888',display:'inline-block',flexShrink:0}}/>
                <span style={{fontSize:12,fontWeight:500}}>{el.name}</span>
                <span style={{fontSize:10,color:'#8b949e',marginLeft:'auto'}}>{TYPES[el.type]}</span>
              </div>
              {el.dimension && <div style={{fontSize:10,color:'#8b949e',marginTop:2}}>{el.dimension}</div>}
            </div>)}
          </div>
          {selEl && <div style={{padding:'8px 12px',borderTop:'0.5px solid #21262d',background:'rgba(29,158,117,0.05)',fontSize:11}}>
            <div style={{fontWeight:500,color:'#5DCAA5',marginBottom:2}}>{selEl.name}</div>
            <div style={{color:'#8b949e'}}>{TYPES[selEl.type]} ｜ {selEl.dimension||selEl.partId||''}</div>
          </div>}
        </div>}
      </div>
    </div>
  );
}

function genDemo(): { elements: SceneElement[]; connections: [string,string][]; summary: string } {
  const H:[number,number,number]=[0,0,Math.PI/2]; const V:[number,number,number]=[0,0,0];
  const seed=Date.now()%1000; const mL=3.5; const hL=mL/2; const brs=2+(seed%3); const r=0.055; const br=0.03;
  let id=0; const nid=(p:string)=>`${p}-${++id}`;
  const els:SceneElement[]=[];
  els.push({id:nid('pipe'),type:'pipe',name:'主管道左段',position:[-hL/2,0,0],rotation:H,scale:[r,hL,r],dimension:'DN100',connections:[],partId:'PIPE-1'},
           {id:nid('pipe'),type:'pipe',name:'主管道右段',position:[hL/2,0,0],rotation:H,scale:[r,hL,r],dimension:'DN100',connections:[],partId:'PIPE-1'});
  for(let b=0;b<brs;b++){const bx=-hL+(mL*(b+1))/(brs+1);const bh=0.3+(b%3)*0.2;
    if(b===0||b===brs-1)els.push({id:nid('elbow'),type:'elbow',name:'90°弯头',position:[bx,0,0],rotation:V,scale:[1,1,1],dimension:'DN50',connections:[],partId:'WELD-E90-1/2'});
    else els.push({id:nid('tee'),type:'tee',name:'三通',position:[bx,0,0],rotation:V,scale:[1,1,1],dimension:'DN50',connections:[],partId:'WELD-TEE-1/2'});
    els.push({id:nid('pipe'),type:'pipe',name:'支管',position:[bx,bh,0],rotation:V,scale:[br,bh*2-0.05,br],dimension:'DN50',connections:[],partId:'PFA-T-1/2'});
    els.push({id:nid('valve'),type:'valve',name:'阀门',position:[bx,bh*2+0.25,0],rotation:V,scale:[1,1,1],dimension:'DN50',connections:[],partId:'CV-1/2'});
  }
  for(let i=0;i<els.length-1;i++){els[i].connections.push(els[i+1].id);els[i+1].connections.push(els[i].id);}
  const cons:[string,string][]=[]; for(let i=0;i<els.length-1;i++)cons.push([els[i].id,els[i+1].id]);
  return{elements:els,connections:cons,summary:`演示 · ${els.length} 个元件`};
}
