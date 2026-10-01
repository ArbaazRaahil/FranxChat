import React, { useState, useRef, useEffect } from 'react';
import { usePosts } from '../../context/PostContext';
import { SpotlightCard } from './SpotlightCard';
import { Film, ChevronUp, ChevronDown } from 'lucide-react';

export const SpotlightFeed: React.FC = () => {
  const { spotlights, openUploadWizard } = usePosts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Setup IntersectionObserver to detect the active video snap item
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.snap-start');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: [0.6],
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, [spotlights.length]);

  // Keyboard navigation (Arrow Up / Arrow Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, spotlights.length]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const targetIndex = Math.max(0, Math.min(spotlights.length - 1, index));
    const targetElement = container.querySelector(`[data-index="${targetIndex}"]`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      setActiveIndex(targetIndex);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-20px)] flex items-center justify-center bg-zinc-950 overflow-hidden">
      {spotlights.length === 0 ? (
        <div className="text-center text-zinc-400 p-8">
          <Film className="w-12 h-12 mx-auto text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-white">No Spotlights Yet</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-4">
            Be the first creator to publish an immersive vertical reel!
          </p>
          <button
            onClick={() => openUploadWizard('spotlight_reel')}
            className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
          >
            Create Spotlight
          </button>
        </div>
      ) : (
        <>
          {/* Scroll Snapping Feed Container */}
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar flex flex-col items-center py-2"
          >
            {spotlights.map((post, idx) => (
              <div
                key={post.id}
                data-index={idx}
                className="w-full h-full snap-start snap-always flex items-center justify-center shrink-0"
              >
                <SpotlightCard
                  post={post}
                  isActive={activeIndex === idx}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                />
              </div>
            ))}
          </div>

          {/* Desktop Next/Prev Quick Arrow Controls */}
          <div className="hidden lg:flex flex-col gap-2 absolute right-6 top-1/2 -translate-y-1/2 z-30">
            <button
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 transition-all"
              aria-label="Previous Spotlight"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === spotlights.length - 1}
              className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 transition-all"
              aria-label="Next Spotlight"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
