import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  screenPos: { x: number; y: number } | null;
  onWorldPos: (pos: THREE.Vector3) => void;
}

/**
 * 将屏幕坐标转换为 3D 世界坐标（z=0 平面交点）
 * 自身不渲染任何可见内容
 */
export default function ScreenToWorld({ screenPos, onWorldPos }: Props) {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (!screenPos) return;

    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((screenPos.x - rect.left) / rect.width) * 2 - 1,
      -((screenPos.y - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, intersection)) {
      onWorldPos(intersection);
    }
  }, [screenPos, camera, gl, onWorldPos]);

  return null;
}
