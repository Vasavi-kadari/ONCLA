import { ShieldPlus } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-7 w-7', text: 'text-lg', rounding: 'rounded-lg' },
    md: { icon: 'h-9 w-9', text: 'text-xl', rounding: 'rounded-xl' },
    lg: { icon: 'h-12 w-12', text: 'text-2xl', rounding: 'rounded-2xl' },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${s.icon} ${s.rounding} bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-soft`}>
        <ShieldPlus className="h-1/2 w-1/2 text-white" />
      </div>
      {showText && (
        <span className={`${s.text} font-display font-bold tracking-tight text-slate-900`}>
          ONCLA
        </span>
      )}
    </div>
  );
}
