import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const PULL_THRESHOLD = 75;
const MAX_PULL = 110;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0 || document.documentElement.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      } else {
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const dy = currentY - touchStartY.current;

      if (dy > 0 && (window.scrollY === 0 || document.documentElement.scrollTop === 0)) {
        const dist = Math.min(MAX_PULL, dy * 0.45);
        setPullDistance(dist);
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(55);

        try {
          if (onRefresh) {
            await onRefresh();
          } else {
            window.location.reload();
          }
        } catch (err) {
          console.error('Error during refresh:', err);
          window.location.reload();
        }

        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 800);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  const isReadyToRelease = pullDistance >= PULL_THRESHOLD;

  return (
    <div className="relative">
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-2 inset-x-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-150"
          style={{
            transform: `translateY(${Math.min(pullDistance, 65)}px)`,
            opacity: Math.min(1, pullDistance / 35),
          }}
        >
          <div className="bg-fc-dark text-white border border-fc-lime/40 px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-[12px] font-bold">
            <span
              className={`transition-transform duration-200 ${
                isRefreshing ? 'animate-spin' : isReadyToRelease ? 'rotate-180 text-fc-lime' : 'text-white/80'
              }`}
            >
              <Icon name="refresh" size={15} />
            </span>
            <span>
              {isRefreshing ? 'Atualizando...' : isReadyToRelease ? 'Solte para atualizar' : 'Puxe para atualizar'}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
