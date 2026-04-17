/**
 * Loader.jsx — Skeleton loading placeholder for asset cards.
 * 
 * Displays animated shimmer placeholders while assets are being generated.
 */

export default function Loader({ count = 2, orientation = 'portrait' }) {
  const isPortrait = orientation === 'portrait';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card-base overflow-hidden animate-fade-in"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          {/* Image skeleton */}
          <div
            className="skeleton w-full"
            style={{ aspectRatio: isPortrait ? '9/16' : '16/9' }}
          />
        </div>
      ))}
    </div>
  );
}
