import React from 'react';

interface ExchangeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const ExchangeLogo: React.FC<ExchangeLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Bybit Iconic Geometric Logo */}
      <svg
        viewBox="0 0 100 100"
        className={`${iconSizes[size]} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="22" fill="#121214" />
        <path
          d="M26 30L44 30L56 70L38 70L26 30Z"
          fill="#F7A600"
        />
        <path
          d="M52 30L70 30L62 56L44 56L52 30Z"
          fill="#FFFFFF"
        />
        <circle cx="68" cy="65" r="5" fill="#F7A600" />
      </svg>

      {showText && (
        <div className="flex items-center">
          <span className={`${textSizes[size]} font-black text-[#121214] tracking-tight uppercase font-sans`}>
            BYBIT
          </span>
          <span className="ml-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#F7A600]/15 text-[#D48800] border border-[#F7A600]/30 tracking-wider">
            PRO
          </span>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility export
export const BinanceLogo = ExchangeLogo;
