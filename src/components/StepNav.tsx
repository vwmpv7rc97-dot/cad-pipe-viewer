import type { WorkflowStep } from '../types';

const STEPS = [
  { step: 1 as WorkflowStep, label: '上传图纸' },
  { step: 2 as WorkflowStep, label: 'AI 识别' },
  { step: 3 as WorkflowStep, label: '校对确认' },
  { step: 4 as WorkflowStep, label: '三维方案' },
];

interface Props {
  current: WorkflowStep;
  onGo: (step: WorkflowStep) => void;
}

export default function StepNav({ current, onGo }: Props) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {STEPS.map(({ step, label }) => (
        <button
          key={step}
          className={`step-btn${step === current ? ' active' : ''}`}
          onClick={() => onGo(step)}
          disabled={step > current + 1}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
