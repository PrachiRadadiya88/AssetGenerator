/**
 * AssetGrid.jsx — Responsive grid layout for asset cards.
 * 
 * Displays generated assets in a responsive grid with
 * proper spacing and layout.
 */

import AssetCard from './AssetCard';

export default function AssetGrid({ assets, orientation, onRemove, onRegenerate, isRegeneratingId }) {
  if (!assets || assets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset, index) => {
        const isLandscape = asset.orientation === 'landscape' || asset.orientation === 'banner';
        return (
          <div key={asset.id} className={isLandscape ? 'sm:col-span-2' : ''}>
            <AssetCard
              asset={asset}
              index={index}
              onRemove={() => onRemove(asset.id)}
              onRegenerate={() => onRegenerate(asset, index)}
              isRegenerating={isRegeneratingId === asset.id}
            />
          </div>
        );
      })}
    </div>
  );
}
