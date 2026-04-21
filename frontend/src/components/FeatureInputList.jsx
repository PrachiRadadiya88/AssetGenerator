import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function FeatureInputList({ features, setFeatures, minRequired = 2 }) {
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newValue.trim() && features.length < 8) {
      setFeatures([...features, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemove = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const remaining = 8 - features.length;

  return (
    <div className="space-y-3">
      {/* Input Row */}
      <div className="flex gap-2">
        <input
          type="text"
          className="input-field flex-1 text-sm"
          placeholder={
            features.length === 0
              ? 'e.g. Browse trending wallpapers'
              : features.length === 1
              ? 'e.g. Set custom ringtones'
              : 'Add another feature...'
          }
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          disabled={features.length >= 8}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newValue.trim() || features.length >= 8}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-textSecondary">
          {features.length} feature{features.length !== 1 ? 's' : ''} added
          {features.length < minRequired && <span className="text-accentTerracotta ml-1">(min {minRequired} required)</span>}
        </span>
        {features.length > 0 && features.length < 8 && (
          <span className="text-[11px] text-textSecondary">{remaining} more available</span>
        )}
      </div>

      {/* Feature List */}
      {features.length > 0 && (
        <ul className="space-y-1.5">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-backgroundSoft rounded-lg border border-primary/8 group hover:border-primary/20 transition-colors"
            >
              <span className="text-sm text-textPrimary leading-snug break-words pr-4 pl-0.5">
                <span className="text-primary/50 font-bold mr-2 text-xs">{i + 1}</span>
                {feature}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="p-1 text-textSecondary/40 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {features.length === 0 && (
        <div className="text-center py-4 border border-dashed border-primary/15 rounded-xl">
          <p className="text-xs text-textSecondary">No features added yet. Start by typing one above.</p>
        </div>
      )}
    </div>
  );
}
