/**
 * AddAssetButton.jsx — Button to generate additional unique assets.
 * 
 * Shows loading state while generating.
 */

import { Plus } from 'lucide-react';

export default function AddAssetButton({ onClick, isLoading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="btn-secondary w-full sm:w-auto text-sm py-3 px-6"
      id="add-asset-button"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Generating New Asset...
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          Add Another Asset
        </>
      )}
    </button>
  );
}
