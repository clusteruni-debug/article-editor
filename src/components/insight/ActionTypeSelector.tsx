'use client';

import { ActionType, ACTION_TYPE_LABELS } from '@/types/insight';

const ACTION_TYPES: ActionType[] = ['execute', 'idea', 'observe', 'reference'];

interface ActionTypeSelectorProps {
  value: ActionType;
  onChange: (value: ActionType) => void;
}

export function ActionTypeSelector({ value, onChange }: ActionTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        액션 타입
      </label>
      <div className="flex flex-wrap gap-2">
        {ACTION_TYPES.map((type) => {
          const { emoji, label } = ACTION_TYPE_LABELS[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                value === type
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
