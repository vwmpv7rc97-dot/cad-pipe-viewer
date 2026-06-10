// 工作流步骤
export type WorkflowStep = 1 | 2 | 3 | 4;

// 场景元素类型
export type ElementType = 'pipe' | 'valve' | 'flange' | 'elbow' | 'tee' | 'pump';

// AI 分析返回的产品结果
export interface AIResult {
  id: string;
  sku: string;
  name: string;
  model: string;
  icon: string;
  match_score: number;
  confidence: number;
  matched: boolean;
  dimensions: string;
  x: number;
  y: number;
}

// 场景中检测到的单个元件
export interface SceneElement {
  id: string;
  type: ElementType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  dimension: string;
  connections: string[];
  partId?: string;
  matchedProduct?: AIResult;
}

// 2D 标注（用于 Step 3 确认视图）
export interface Annotation2D {
  id: string;
  type: ElementType;
  x: number;       // 归一化坐标 (0~1)
  y: number;
  label: string;
  matched: boolean;
  sku?: string;
}

// 2D 管道段
export interface PipeSegment2D {
  x1: number; y1: number;
  x2: number; y2: number;
  r: number;       // 管径
}

// API 完整返回
export interface AnalysisResponse {
  elements: SceneElement[];
  products: AIResult[];
  annotations: Annotation2D[];
  pipes2d: PipeSegment2D[];
  imageWidth: number;
  imageHeight: number;
}

// 已放置的产品实例
export interface PlacedProduct {
  instanceId: string;
  product: AIResult;
  position: [number, number, number];
}
