import type { ElementType } from '../types';

export interface PartSpec {
  id: string;
  category: string;
  name: string;
  type: ElementType;
  dn: string;
  pn: string;
  material: string;
  standard: string;
  dimensions: string;
  icon: string;
  model3d?: string;
}

// ============================================================
// 类别列表
// ============================================================
export const CATEGORIES = [
  { key: 'tube',      label: 'PFA超纯管/PIPE厚管', icon: '🟦' },
  { key: 'bottle',    label: 'PFA瓶',              icon: '🧴' },
  { key: 'weld',      label: '焊接接头',            icon: '🔗' },
  { key: 'flare',     label: '扩口接头-防松动',     icon: '🔧' },
  { key: 'flare-pipe',label: 'PIPE厚管+扩口',       icon: '🔩' },
  { key: 'npt-flare', label: 'NPT牙+扩口',          icon: '📐' },
  { key: 'bead',      label: '入珠接头',            icon: '💎' },
  { key: 'weld-flare',label: '焊接+扩口',           icon: '🪢' },
  { key: 'space',     label: '省空间+扩口',         icon: '📏' },
  { key: 'valve',     label: 'PFA阀门',             icon: '🔵' },
  { key: 'tbox',      label: 'T-BOX',               icon: '📦' },
  { key: 'tool',      label: '扩口治具',            icon: '🔨' },
];

// ============================================================
// 全部产品数据库（源自常州氟曜产品手册）
// ============================================================
export const partsDB: PartSpec[] = [

  // ==================== PFA 超纯管 (12) ====================
  { id:'PFA-T-1/4',    category:'tube', name:'PFA超纯管 1/4"',     type:'pipe', dn:'6.35mm',  pn:'0.9MPa', material:'PFA', standard:'SEMI F57', dimensions:'OD6.35×ID3.97×50M', icon:'tube' },
  { id:'PFA-T-3/8',    category:'tube', name:'PFA超纯管 3/8"',     type:'pipe', dn:'9.53mm',  pn:'0.9MPa', material:'PFA', standard:'SEMI F57', dimensions:'OD9.53×ID6.39×50M', icon:'tube' },
  { id:'PFA-T-1/2',    category:'tube', name:'PFA超纯管 1/2"',     type:'pipe', dn:'12.70mm', pn:'0.9MPa', material:'PFA', standard:'SEMI F57', dimensions:'OD12.70×ID9.56×50M', icon:'tube' },
  { id:'PFA-T-3/4',    category:'tube', name:'PFA超纯管 3/4"',     type:'pipe', dn:'19.05mm', pn:'0.9MPa', material:'PFA', standard:'SEMI F57', dimensions:'OD19.05×ID15.91×50M', icon:'tube' },
  { id:'PFA-T-1',      category:'tube', name:'PFA超纯管 1"',       type:'pipe', dn:'25.40mm', pn:'0.9MPa', material:'PFA', standard:'SEMI F57', dimensions:'OD25.40×ID22.26×50M', icon:'tube' },
  { id:'PFA-T-1-1/4',  category:'tube', name:'PFA超纯管 1-1/4"',   type:'pipe', dn:'31.80mm', pn:'0.7MPa', material:'PFA', standard:'SEMI F57', dimensions:'OD31.80×ID28.00×50M', icon:'tube' },
  { id:'PFA-T-1-1/2',  category:'tube', name:'PFA超纯管 1-1/2"',   type:'pipe', dn:'38.10mm', pn:'0.7MPa', material:'PFA', standard:'SEMI F57', dimensions:'OD38.10×ID33.74×50M', icon:'tube' },
  { id:'PFA-T-2',      category:'tube', name:'PFA超纯管 2"',       type:'pipe', dn:'50.80mm', pn:'0.5MPa', material:'PFA', standard:'SEMI F57', dimensions:'OD50.80×ID46.00×50M', icon:'tube' },

  // ==================== PIPE 厚管 (5) ====================
  { id:'PIPE-1/2',     category:'tube', name:'PIPE厚管 1/2"',      type:'pipe', dn:'21.34mm', pn:'1.2MPa', material:'PFA', standard:'JIS', dimensions:'OD21.34×ID15.80×3M', icon:'tube' },
  { id:'PIPE-3/4',     category:'tube', name:'PIPE厚管 3/4"',      type:'pipe', dn:'26.67mm', pn:'1.2MPa', material:'PFA', standard:'JIS', dimensions:'OD26.67×ID20.93×3M', icon:'tube' },
  { id:'PIPE-1',       category:'tube', name:'PIPE厚管 1"',        type:'pipe', dn:'33.40mm', pn:'1.2MPa', material:'PFA', standard:'JIS', dimensions:'OD33.40×ID26.64×3M', icon:'tube' },
  { id:'PIPE-1-1/2',   category:'tube', name:'PIPE厚管 1-1/2"',    type:'pipe', dn:'48.26mm', pn:'1.2MPa', material:'PFA', standard:'JIS', dimensions:'OD48.26×ID40.86×3M', icon:'tube' },
  { id:'PIPE-2',       category:'tube', name:'PIPE厚管 2"',        type:'pipe', dn:'60.33mm', pn:'1.2MPa', material:'PFA', standard:'JIS', dimensions:'OD60.33×ID52.51×3M', icon:'tube' },

  // ==================== PFA 瓶 (7) ====================
  { id:'BTL-15ML',   category:'bottle', name:'PFA瓶 15ml',    type:'pump', dn:'15ml',   pn:'—', material:'PFA', standard:'—', dimensions:'OD25×H56 中口/大口', icon:'bottle' },
  { id:'BTL-30ML',   category:'bottle', name:'PFA瓶 30ml',    type:'pump', dn:'30ml',   pn:'—', material:'PFA', standard:'—', dimensions:'OD34×H59 中口/大口', icon:'bottle' },
  { id:'BTL-60ML',   category:'bottle', name:'PFA瓶 60ml',    type:'pump', dn:'60ml',   pn:'—', material:'PFA', standard:'—', dimensions:'OD39×H82 中口/大口', icon:'bottle' },
  { id:'BTL-100ML',  category:'bottle', name:'PFA瓶 100ml',   type:'pump', dn:'100ml',  pn:'—', material:'PFA', standard:'—', dimensions:'OD45×H110 中口/大口', icon:'bottle' },
  { id:'BTL-250ML',  category:'bottle', name:'PFA瓶 250ml',   type:'pump', dn:'250ml',  pn:'—', material:'PFA', standard:'—', dimensions:'OD61×H129 中口/大口', icon:'bottle' },
  { id:'BTL-500ML',  category:'bottle', name:'PFA瓶 500ml',   type:'pump', dn:'500ml',  pn:'—', material:'PFA', standard:'—', dimensions:'OD72×H166 中口/大口', icon:'bottle' },
  { id:'BTL-1000ML', category:'bottle', name:'PFA瓶 1000ml',  type:'pump', dn:'1000ml', pn:'—', material:'PFA', standard:'—', dimensions:'OD92×H210 中口/大口', icon:'bottle' },

  // ==================== 焊接接头 (30) ====================
  // 二通管
  { id:'WELD-2W-1/4',   category:'weld', name:'焊接二通管 1/4"',        type:'pipe', dn:'6.35mm',   pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-2W-3/8',   category:'weld', name:'焊接二通管 3/8"',        type:'pipe', dn:'9.53mm',   pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-2W-1/2',   category:'weld', name:'焊接二通管 1/2"',        type:'pipe', dn:'12.70mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-2W-3/4',   category:'weld', name:'焊接二通管 3/4"',        type:'pipe', dn:'19.05mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-2W-1',     category:'weld', name:'焊接二通管 1"',          type:'pipe', dn:'25.40mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-2W-1-1/4', category:'weld', name:'焊接二通管 1-1/4"',      type:'pipe', dn:'31.75mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-2W-1-1/2', category:'weld', name:'焊接二通管 1-1/2"',      type:'pipe', dn:'38.10mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  // 等径弯头
  { id:'WELD-E90-1/4',  category:'weld', name:'焊接90°等径弯头 1/4"',   type:'elbow', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-E90-3/8',  category:'weld', name:'焊接90°等径弯头 3/8"',   type:'elbow', dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-E90-1/2',  category:'weld', name:'焊接90°等径弯头 1/2"',   type:'elbow', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-E90-3/4',  category:'weld', name:'焊接90°等径弯头 3/4"',   type:'elbow', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-E90-1',    category:'weld', name:'焊接90°等径弯头 1"',     type:'elbow', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-E90-1-1/4',category:'weld', name:'焊接90°等径弯头 1-1/4"', type:'elbow', dn:'31.75mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-E90-1-1/2',category:'weld', name:'焊接90°等径弯头 1-1/2"', type:'elbow', dn:'38.10mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  // 变径弯头
  { id:'WELD-ER-3/4X1/2',category:'weld', name:'焊接变径弯头 3/4"×1/2"', type:'elbow', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'19.05×12.70', icon:'weld' },
  { id:'WELD-ER-1X1/2',  category:'weld', name:'焊接变径弯头 1"×1/2"',   type:'elbow', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'25.40×12.70', icon:'weld' },
  { id:'WELD-ER-1X3/4',  category:'weld', name:'焊接变径弯头 1"×3/4"',   type:'elbow', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'25.40×19.05', icon:'weld' },
  { id:'WELD-ER-1-1/2X1',category:'weld', name:'焊接变径弯头 1-1/2"×1"', type:'elbow', dn:'38.10mm', pn:'—', material:'PFA', standard:'—', dimensions:'38.10×25.40', icon:'weld' },
  // 等径三通
  { id:'WELD-TEE-1/4',  category:'weld', name:'焊接等径三通 1/4"',    type:'tee', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-TEE-3/8',  category:'weld', name:'焊接等径三通 3/8"',    type:'tee', dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-TEE-1/2',  category:'weld', name:'焊接等径三通 1/2"',    type:'tee', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-TEE-3/4',  category:'weld', name:'焊接等径三通 3/4"',    type:'tee', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-TEE-1',    category:'weld', name:'焊接等径三通 1"',      type:'tee', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-TEE-1-1/4',category:'weld', name:'焊接等径三通 1-1/4"',  type:'tee', dn:'31.75mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  { id:'WELD-TEE-1-1/2',category:'weld', name:'焊接等径三通 1-1/2"',  type:'tee', dn:'38.10mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'weld' },
  // 变径三通
  { id:'WELD-TR-3/4X1/2',category:'weld', name:'焊接变径三通 3/4"×1/2"×3/4"', type:'tee', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'19.05×12.70', icon:'weld' },
  { id:'WELD-TR-1X1/2',  category:'weld', name:'焊接变径三通 1"×1/2"×1"',     type:'tee', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'25.40×12.70', icon:'weld' },
  { id:'WELD-TR-1X3/4',  category:'weld', name:'焊接变径三通 1"×3/4"×1"',     type:'tee', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'25.40×19.05', icon:'weld' },
  // 45°弯头
  { id:'WELD-E45-1/2',category:'weld', name:'焊接45°弯头 1/2"', type:'elbow', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'45°', icon:'weld' },
  { id:'WELD-E45-1',  category:'weld', name:'焊接45°弯头 1"',   type:'elbow', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'45°', icon:'weld' },

  // ==================== 扩口接头-防松动 (28) ====================
  // 等径直通
  { id:'FLR-S-1/4',    category:'flare', name:'扩口等径直通 1/4"',        type:'pipe', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-S-3/8',    category:'flare', name:'扩口等径直通 3/8"',        type:'pipe', dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-S-1/2',    category:'flare', name:'扩口等径直通 1/2"',        type:'pipe', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-S-3/4',    category:'flare', name:'扩口等径直通 3/4"',        type:'pipe', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-S-1',      category:'flare', name:'扩口等径直通 1"',          type:'pipe', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  // 变径直通
  { id:'FLR-R-3/8X1/4', category:'flare', name:'扩口变径直通 3/8"×1/4"', type:'pipe', dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'9.53×6.35', icon:'flare' },
  { id:'FLR-R-1/2X1/4', category:'flare', name:'扩口变径直通 1/2"×1/4"', type:'pipe', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'12.70×6.35', icon:'flare' },
  { id:'FLR-R-1/2X3/8', category:'flare', name:'扩口变径直通 1/2"×3/8"', type:'pipe', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'12.70×9.53', icon:'flare' },
  { id:'FLR-R-3/4X1/2', category:'flare', name:'扩口变径直通 3/4"×1/2"', type:'pipe', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'19.05×12.70', icon:'flare' },
  { id:'FLR-R-1X1/2',   category:'flare', name:'扩口变径直通 1"×1/2"',   type:'pipe', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'25.40×12.70', icon:'flare' },
  { id:'FLR-R-1X3/4',   category:'flare', name:'扩口变径直通 1"×3/4"',   type:'pipe', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'25.40×19.05', icon:'flare' },
  // 等径弯头
  { id:'FLR-E90-1/4', category:'flare', name:'扩口等径弯头 1/4"',  type:'elbow', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'90°', icon:'flare' },
  { id:'FLR-E90-3/8', category:'flare', name:'扩口等径弯头 3/8"',  type:'elbow', dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'90°', icon:'flare' },
  { id:'FLR-E90-1/2', category:'flare', name:'扩口等径弯头 1/2"',  type:'elbow', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'90°', icon:'flare' },
  { id:'FLR-E90-3/4', category:'flare', name:'扩口等径弯头 3/4"',  type:'elbow', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'90°', icon:'flare' },
  { id:'FLR-E90-1',   category:'flare', name:'扩口等径弯头 1"',    type:'elbow', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'90°', icon:'flare' },
  // 等径三通
  { id:'FLR-TEE-1/4', category:'flare', name:'扩口等径三通 1/4"',  type:'tee', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-TEE-3/8', category:'flare', name:'扩口等径三通 3/8"',  type:'tee', dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-TEE-1/2', category:'flare', name:'扩口等径三通 1/2"',  type:'tee', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-TEE-3/4', category:'flare', name:'扩口等径三通 3/4"',  type:'tee', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-TEE-1',   category:'flare', name:'扩口等径三通 1"',    type:'tee', dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  // 穿板接头
  { id:'FLR-BH-1/4',  category:'flare', name:'扩口穿板接头 1/4"',  type:'pipe', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'穿板式', icon:'flare' },
  { id:'FLR-BH-3/8',  category:'flare', name:'扩口穿板接头 3/8"',  type:'pipe', dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'穿板式', icon:'flare' },
  { id:'FLR-BH-1/2',  category:'flare', name:'扩口穿板接头 1/2"',  type:'pipe', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'穿板式', icon:'flare' },
  // 螺母+堵头
  { id:'FLR-NUT-1/4',  category:'flare', name:'扩口螺母 1/4"',      type:'flange', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-NUT-1/2',  category:'flare', name:'扩口螺母 1/2"',      type:'flange', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-PLUG-1/4', category:'flare', name:'酒杯堵头 1/4"',      type:'flange', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },
  { id:'FLR-PLUG-1/2', category:'flare', name:'酒杯堵头 1/2"',      type:'flange', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'—', icon:'flare' },

  // ==================== PIPE厚管+扩口 (8) ====================
  { id:'FP-S-1/2',  category:'flare-pipe', name:'PIPE厚管扩口直通 1/2"',  type:'pipe',  dn:'21.34mm', pn:'—', material:'PFA', standard:'—', dimensions:'PIPE+扩口', icon:'flare' },
  { id:'FP-S-3/4',  category:'flare-pipe', name:'PIPE厚管扩口直通 3/4"',  type:'pipe',  dn:'26.67mm', pn:'—', material:'PFA', standard:'—', dimensions:'PIPE+扩口', icon:'flare' },
  { id:'FP-S-1',    category:'flare-pipe', name:'PIPE厚管扩口直通 1"',    type:'pipe',  dn:'33.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'PIPE+扩口', icon:'flare' },
  { id:'FP-E-1/2',  category:'flare-pipe', name:'PIPE厚管扩口弯头 1/2"',  type:'elbow', dn:'21.34mm', pn:'—', material:'PFA', standard:'—', dimensions:'PIPE+扩口 90°', icon:'flare' },
  { id:'FP-E-3/4',  category:'flare-pipe', name:'PIPE厚管扩口弯头 3/4"',  type:'elbow', dn:'26.67mm', pn:'—', material:'PFA', standard:'—', dimensions:'PIPE+扩口 90°', icon:'flare' },
  { id:'FP-E-1',    category:'flare-pipe', name:'PIPE厚管扩口弯头 1"',    type:'elbow', dn:'33.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'PIPE+扩口 90°', icon:'flare' },
  { id:'FP-TEE-1/2',category:'flare-pipe', name:'PIPE厚管扩口三通 1/2"',  type:'tee',   dn:'21.34mm', pn:'—', material:'PFA', standard:'—', dimensions:'PIPE+扩口', icon:'flare' },
  { id:'FP-FLG-1/2',category:'flare-pipe', name:'PIPE厚管法兰+扩口 1/2"', type:'flange',dn:'21.34mm', pn:'—', material:'PFA', standard:'—', dimensions:'法兰+扩口', icon:'flare' },

  // ==================== NPT牙+扩口 (8) ====================
  { id:'NPT-S-1/4',    category:'npt-flare', name:'NPT等径直通 1/4"',      type:'pipe', dn:'6.35mm',  pn:'—', material:'PFA', standard:'NPT', dimensions:'NPT 1/4"', icon:'npt' },
  { id:'NPT-S-3/8',    category:'npt-flare', name:'NPT等径直通 3/8"',      type:'pipe', dn:'9.53mm',  pn:'—', material:'PFA', standard:'NPT', dimensions:'NPT 3/8"', icon:'npt' },
  { id:'NPT-S-1/2',    category:'npt-flare', name:'NPT等径直通 1/2"',      type:'pipe', dn:'12.70mm', pn:'—', material:'PFA', standard:'NPT', dimensions:'NPT 1/2"', icon:'npt' },
  { id:'NPT-E-1/4',    category:'npt-flare', name:'NPT等径弯头 1/4"',      type:'elbow', dn:'6.35mm', pn:'—', material:'PFA', standard:'NPT', dimensions:'NPT 1/4" 90°', icon:'npt' },
  { id:'NPT-E-3/8',    category:'npt-flare', name:'NPT等径弯头 3/8"',      type:'elbow', dn:'9.53mm', pn:'—', material:'PFA', standard:'NPT', dimensions:'NPT 3/8" 90°', icon:'npt' },
  { id:'NPT-E-1/2',    category:'npt-flare', name:'NPT等径弯头 1/2"',      type:'elbow', dn:'12.70mm',pn:'—', material:'PFA', standard:'NPT', dimensions:'NPT 1/2" 90°', icon:'npt' },
  { id:'NPT-TEE-1/4',  category:'npt-flare', name:'NPT等径三通 1/4"',      type:'tee', dn:'6.35mm',  pn:'—', material:'PFA', standard:'NPT', dimensions:'NPT 1/4"', icon:'npt' },
  { id:'NPT-TEE-1/2',  category:'npt-flare', name:'NPT等径三通 1/2"',      type:'tee', dn:'12.70mm', pn:'—', material:'PFA', standard:'NPT', dimensions:'NPT 1/2"', icon:'npt' },

  // ==================== 入珠接头 (5) ====================
  { id:'BEAD-S-1/4',  category:'bead', name:'入珠接头 1/4"',     type:'pipe',  dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'入珠式', icon:'bead' },
  { id:'BEAD-S-3/8',  category:'bead', name:'入珠接头 3/8"',     type:'pipe',  dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'入珠式', icon:'bead' },
  { id:'BEAD-S-1/2',  category:'bead', name:'入珠接头 1/2"',     type:'pipe',  dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'入珠式', icon:'bead' },
  { id:'BEAD-S-3/4',  category:'bead', name:'入珠接头 3/4"',     type:'pipe',  dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'入珠式', icon:'bead' },
  { id:'BEAD-S-1',    category:'bead', name:'入珠接头 1"',       type:'pipe',  dn:'25.40mm', pn:'—', material:'PFA', standard:'—', dimensions:'入珠式', icon:'bead' },

  // ==================== 焊接+扩口 (4) ====================
  { id:'WF-S-1/2',  category:'weld-flare', name:'焊接+扩口直通 1/2"', type:'pipe', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'焊接+扩口', icon:'weld' },
  { id:'WF-S-3/4',  category:'weld-flare', name:'焊接+扩口直通 3/4"', type:'pipe', dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'焊接+扩口', icon:'weld' },
  { id:'WF-E-1/2',  category:'weld-flare', name:'焊接+扩口弯头 1/2"', type:'elbow', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'焊接+扩口 90°', icon:'weld' },
  { id:'WF-TEE-1/2',category:'weld-flare', name:'焊接+扩口三通 1/2"', type:'tee', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'焊接+扩口', icon:'weld' },

  // ==================== 省空间+扩口 (4) ====================
  { id:'SP-S-1/2',  category:'space', name:'省空间扩口直通 1/2"',  type:'pipe',  dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'省空间', icon:'space' },
  { id:'SP-S-3/4',  category:'space', name:'省空间扩口直通 3/4"',  type:'pipe',  dn:'19.05mm', pn:'—', material:'PFA', standard:'—', dimensions:'省空间', icon:'space' },
  { id:'SP-E-1/2',  category:'space', name:'省空间扩口弯头 1/2"',  type:'elbow', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'省空间 90°', icon:'space' },
  { id:'SP-TEE-1/2',category:'space', name:'省空间扩口三通 1/2"',  type:'tee',   dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'省空间', icon:'space' },

  // ==================== PFA 阀门 (17) ====================
  // 单向阀
  { id:'CV-1/4',     category:'valve', name:'PFA单向阀 1/4"',        type:'valve', dn:'6.35mm',  pn:'1.6MPa', material:'PFA', standard:'—', dimensions:'OD6.35 开启0.017bar', icon:'valve' },
  { id:'CV-3/8',     category:'valve', name:'PFA单向阀 3/8"',        type:'valve', dn:'9.53mm',  pn:'1.6MPa', material:'PFA', standard:'—', dimensions:'OD9.53 开启0.017bar', icon:'valve' },
  { id:'CV-1/2',     category:'valve', name:'PFA单向阀 1/2"',        type:'valve', dn:'12.70mm', pn:'1.6MPa', material:'PFA', standard:'—', dimensions:'OD12.70 开启0.05bar', icon:'valve' },
  { id:'CV-3/4',     category:'valve', name:'PFA单向阀 3/4"',        type:'valve', dn:'19.05mm', pn:'1.6MPa', material:'PFA', standard:'—', dimensions:'OD19.05 开启0.05bar', icon:'valve' },
  { id:'CV-1',       category:'valve', name:'PFA单向阀 1"',          type:'valve', dn:'25.40mm', pn:'1.6MPa', material:'PFA', standard:'—', dimensions:'OD25.40 开启0.357bar', icon:'valve' },
  { id:'CV-1-1/4',   category:'valve', name:'PFA单向阀 1-1/4"',      type:'valve', dn:'31.75mm', pn:'1.6MPa', material:'PFA', standard:'—', dimensions:'OD31.75', icon:'valve' },
  { id:'CV-1-1/2',   category:'valve', name:'PFA单向阀 1-1/2"',      type:'valve', dn:'38.10mm', pn:'1.6MPa', material:'PFA', standard:'—', dimensions:'OD38.10', icon:'valve' },
  // 针阀
  { id:'NV-1/4',     category:'valve', name:'PFA针阀 1/4"',          type:'valve', dn:'6.35mm',  pn:'0.64MPa',material:'PFA', standard:'—', dimensions:'0-6.4bar 5~120°C', icon:'valve' },
  { id:'NV-3/8',     category:'valve', name:'PFA针阀 3/8"',          type:'valve', dn:'9.53mm',  pn:'0.64MPa',material:'PFA', standard:'—', dimensions:'0-6.4bar 5~120°C', icon:'valve' },
  { id:'NV-1/2',     category:'valve', name:'PFA针阀 1/2"',          type:'valve', dn:'12.70mm', pn:'0.64MPa',material:'PFA', standard:'—', dimensions:'0-6.4bar 5~120°C', icon:'valve' },
  // 旋阀
  { id:'RV-1/4',     category:'valve', name:'PFA旋阀 1/4"',          type:'valve', dn:'6.35mm',  pn:'—', material:'PFA', standard:'—', dimensions:'100L/min', icon:'valve' },
  { id:'RV-3/8',     category:'valve', name:'PFA旋阀 3/8"',          type:'valve', dn:'9.53mm',  pn:'—', material:'PFA', standard:'—', dimensions:'120L/min', icon:'valve' },
  { id:'RV-1/2',     category:'valve', name:'PFA旋阀 1/2"',          type:'valve', dn:'12.70mm', pn:'—', material:'PFA', standard:'—', dimensions:'140L/min', icon:'valve' },
  // 手动阀
  { id:'MV-1/4',     category:'valve', name:'PFA手动阀 1/4"',        type:'valve', dn:'6.35mm',  pn:'0.7MPa', material:'PFA', standard:'—', dimensions:'0-7kgf/cm² 5~120°C', icon:'valve' },
  { id:'MV-1/2',     category:'valve', name:'PFA手动阀 1/2"',        type:'valve', dn:'12.70mm', pn:'0.7MPa', material:'PFA', standard:'—', dimensions:'0-7kgf/cm² 5~120°C', icon:'valve' },
  { id:'MV-1',       category:'valve', name:'PFA手动阀 1"',          type:'valve', dn:'25.40mm', pn:'0.7MPa', material:'PFA', standard:'—', dimensions:'0-7kgf/cm² 5~120°C', icon:'valve' },
  // 气动阀
  { id:'AV-1/2',     category:'valve', name:'PFA气动阀 1/2"',        type:'valve', dn:'12.70mm', pn:'0.7MPa', material:'PFA', standard:'—', dimensions:'0-7kgf/cm² 气动', icon:'valve' },

  // ==================== T-BOX (3) ====================
  { id:'TBOX-40A', category:'tbox', name:'T-BOX 40A',    type:'pump', dn:'48.3mm', pn:'—', material:'PP+PFA', standard:'—', dimensions:'X48.3×Y48.3×Z48.3', icon:'tbox' },
  { id:'TBOX-50A', category:'tbox', name:'T-BOX 50A',    type:'pump', dn:'60.3mm', pn:'—', material:'PP+PFA', standard:'—', dimensions:'X60.3×Y60.3×Z60.3', icon:'tbox' },
  { id:'TBOX-65A', category:'tbox', name:'T-BOX 65A',    type:'pump', dn:'73.7mm', pn:'—', material:'PP+PFA', standard:'—', dimensions:'X73.7×Y73.7×Z73.7', icon:'tbox' },

  // ==================== 扩口治具 (4) ====================
  { id:'TOOL-HF-1/2',   category:'tool', name:'手持入珠枪 1/2"',     type:'pump', dn:'12.70mm', pn:'—', material:'—', standard:'—', dimensions:'手持式 1/2"', icon:'tool' },
  { id:'TOOL-HF-1',     category:'tool', name:'手持入珠枪 1"',       type:'pump', dn:'25.40mm', pn:'—', material:'—', standard:'—', dimensions:'手持式 1"', icon:'tool' },
  { id:'TOOL-TF-1/2',   category:'tool', name:'台式扩口治具 1/2"',   type:'pump', dn:'12.70mm', pn:'—', material:'—', standard:'—', dimensions:'台式 1/2"', icon:'tool' },
  { id:'TOOL-TF-1',     category:'tool', name:'台式扩口治具 1"',     type:'pump', dn:'25.40mm', pn:'—', material:'—', standard:'—', dimensions:'台式 1"', icon:'tool' },
];

// ============================================================
// 查询辅助函数
// ============================================================
export function partsByCategory(cat: string): PartSpec[] {
  return partsDB.filter(p => p.category === cat);
}
export function searchParts(query: string): PartSpec[] {
  const q = query.toLowerCase();
  return partsDB.filter(p =>
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    p.dn.toLowerCase().includes(q) ||
    p.material.toLowerCase().includes(q) ||
    p.category.includes(q)
  );
}
export function getPart(id: string): PartSpec | undefined {
  return partsDB.find(p => p.id === id);
}
