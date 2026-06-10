import { useMemo } from 'react';
import * as THREE from 'three';
import type { ElementType } from '../types';

interface Props {
  elementType: ElementType | string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  dn?: string;            // 公称通径，用于调整细节比例
  opacity?: number;
  wireframe?: boolean;
  highlighted?: boolean;
}

/**
 * 根据元素类型生成程序化 3D 几何体
 *
 * 支持的 type：
 *   pipe    — 圆柱体（管道），默认沿 Y，配合 rotation=[0,0,PI/2] 变为水平
 *   elbow   — 90° 弧形弯管 (Torus arc)
 *   tee     — T 形三通（水平 + 垂直圆柱）
 *   valve   — 阀门（带手轮的圆柱）
 *   flange  — 法兰（圆环 + 螺栓孔）
 *   pump    — 泵（电机 + 蜗壳）
 *   其他    — 通用方块
 */
export default function ProceduralModel({
  elementType,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  dn,
  opacity = 1,
  wireframe = false,
  highlighted = false,
}: Props) {
  const parts = useMemo(() => {
    switch (elementType) {
      case 'pipe':    return pipeParts();
      case 'elbow':   return elbowParts();
      case 'tee':     return teeParts();
      case 'valve':   return valveParts();
      case 'flange':  return flangeParts();
      case 'pump':    return pumpParts();
      default:        return [boxPart()];
    }
  }, [elementType]);

  const color = useMemo(() => elementColor(elementType), [elementType]);
  const emitColor = highlighted ? '#ffdd44' : undefined;
  const emitIntensity = highlighted ? 0.6 : 0;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {parts.map((part, i) => (
        <mesh key={i} geometry={part.geometry}>
          <meshStandardMaterial
            color={color}
            metalness={0.35}
            roughness={0.4}
            transparent={opacity < 1}
            opacity={opacity}
            wireframe={wireframe}
            emissive={emitColor}
            emissiveIntensity={emitIntensity}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// 颜色映射
// ============================================================
function elementColor(type: string): string {
  switch (type) {
    case 'pipe':    return '#8899aa';  // 灰蓝 - 管道
    case 'elbow':   return '#8899aa';  // 同管道
    case 'tee':     return '#8899aa';  // 同管道
    case 'valve':   return '#4a90d9';  // 蓝色 - 阀门
    case 'flange':  return '#c9a84c';  // 金色 - 法兰
    case 'pump':    return '#4caf50';  // 绿色 - 泵
    default:        return '#888888';
  }
}

// ============================================================
// 几何体部件定义
// ============================================================
interface Part { geometry: THREE.BufferGeometry }

function boxPart(): Part {
  return { geometry: new THREE.BoxGeometry(0.4, 0.4, 0.4) };
}

// ---- 管道：单位长度圆柱体 (半径=1, 高=1)，由 scale 控制实际尺寸 ----
function pipeParts(): Part[] {
  return [{ geometry: new THREE.CylinderGeometry(1, 1, 1, 32) }];
}

// ---- 弯头：90° Torus 弧形 ----
function elbowParts(): Part[] {
  // 大半径 0.4, 管道半径 0.12, 16段, 32段圆周, 90°弧
  return [{ geometry: new THREE.TorusGeometry(0.4, 0.12, 16, 32, Math.PI / 2) }];
}

// ---- 三通：T 形 ----
function teeParts(): Part[] {
  // 水平主管（沿 X 轴），旋转 PI/2 绕 Z
  const run = new THREE.CylinderGeometry(0.55, 0.55, 1.4, 32);
  run.rotateZ(Math.PI / 2);
  // 垂直分支（沿 Y 轴，从中心向上）
  const branch = new THREE.CylinderGeometry(0.45, 0.45, 0.7, 32);
  branch.translate(0, 0.35, 0);
  // 中心球体
  const hub = new THREE.SphereGeometry(0.5, 32, 16);
  return [
    { geometry: run },
    { geometry: branch },
    { geometry: hub },
  ];
}

// ---- 阀门：蓝灰色圆柱体 + 顶部手轮 ----
function valveParts(): Part[] {
  return [
    { geometry: new THREE.CylinderGeometry(0.25, 0.25, 0.5, 32) },          // 阀体
    { geometry: new THREE.CylinderGeometry(0.22, 0.28, 0.06, 32) },         // 上法兰
    { geometry: new THREE.TorusGeometry(0.2, 0.04, 8, 16) },                 // 手轮
    { geometry: new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8) },           // 阀杆
  ];
}

// ---- 法兰：圆环 + 螺栓孔 ----
function flangeParts(): Part[] {
  const parts: Part[] = [
    { geometry: new THREE.TorusGeometry(0.3, 0.08, 16, 32) },               // 外圈
    { geometry: new THREE.CylinderGeometry(0.2, 0.2, 0.08, 32) },           // 内圈
  ];
  // 4 个螺栓孔
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    // 小圆环在螺栓位置
    const boltGeo = new THREE.TorusGeometry(0.04, 0.015, 6, 8);
    boltGeo.translate(Math.cos(angle) * 0.24, Math.sin(angle) * 0.24, 0);
    parts.push({ geometry: boltGeo });
  }
  return parts;
}

// ---- 泵：电机（短圆柱）+ 蜗壳（较宽圆柱）+ 底座（方块） ----
function pumpParts(): Part[] {
  return [
    { geometry: new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32) },            // 电机
    { geometry: new THREE.CylinderGeometry(0.22, 0.22, 0.2, 16) },          // 联轴器
    { geometry: new THREE.CylinderGeometry(0.35, 0.25, 0.3, 32) },          // 蜗壳
    { geometry: new THREE.BoxGeometry(0.5, 0.08, 0.4) },                     // 底座
  ];
}
