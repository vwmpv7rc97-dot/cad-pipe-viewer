import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import ProceduralModel from './ProceduralModel';

// 模块级缓存：同一 GLTF 文件只加载一次，clone 给每个实例
const modelCache = new Map<string, THREE.Group>();

// 产品 ID → 元素类型映射
function productIdToType(id: string): string {
  if (id.startsWith('V-')) return 'valve';
  if (id.startsWith('FL-')) return 'flange';
  if (id.startsWith('P-')) return 'pump';
  return 'box';
}

interface Props {
  modelPath: string;
  productId: string;
  position: [number, number, number];
  productName: string;
}

/**
 * 在指定位置渲染一个 3D 模型
 * GLB 加载成功 → 显示模型
 * GLB 加载失败 → 自动降级为程序化几何体
 */
export default function PlacedModel({ modelPath, productId, position, productName }: Props) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'fallback'>('loading');

  useEffect(() => {
    const cached = modelCache.get(modelPath);
    if (cached) {
      setModel(cached.clone());
      setLoadState('loaded');
      return;
    }

    let cancelled = false;
    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf: GLTF) => {
        if (cancelled) return;
        modelCache.set(modelPath, gltf.scene);
        setModel(gltf.scene.clone());
        setLoadState('loaded');
      },
      undefined,
      () => {
        if (cancelled) return;
        console.warn(`模型加载失败 [${productName}]，使用程序化占位模型`);
        setLoadState('fallback');
      },
    );

    return () => {
      cancelled = true;
    };
  }, [modelPath, productName]);

  // 卸载时清理 clone
  useEffect(() => {
    return () => {
      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, [model]);

  const elemType = productIdToType(productId);

  // 程序化降级
  if (loadState === 'fallback') {
    return <ProceduralModel elementType={elemType} position={position} />;
  }

  // 加载中：显示半透明占位
  if (loadState === 'loading') {
    return <ProceduralModel elementType={elemType} position={position} opacity={0.3} wireframe />;
  }

  if (model === null) return null;

  return <primitive object={model} position={position} />;
}
