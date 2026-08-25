import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return <Loader2 className={`${sizes[size]} animate-spin text-primary-500 ${className}`} />;
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <LoadingSpinner size="lg" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
