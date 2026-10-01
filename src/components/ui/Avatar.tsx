import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isOnline?: boolean;
  showPresence?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
};

const DOT_SIZE_MAP = {
  xs: 'w-1.5 h-1.5 border-[1px]',
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-2',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User',
  size = 'md',
  isOnline = false,
  showPresence = false,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const initials = alt
    ? alt
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${SIZE_MAP[size]} rounded-full overflow-hidden bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center font-semibold text-slate-700 dark:text-zinc-200 select-none ring-1 ring-black/5 dark:ring-white/10`}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showPresence && (
        <span
          className={`absolute bottom-0 right-0 ${DOT_SIZE_MAP[size]} rounded-full border-white dark:border-black transition-colors ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-zinc-600'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
