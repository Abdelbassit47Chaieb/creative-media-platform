import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', style, ...props }: BadgeProps) {
  const variants: Record<string, React.CSSProperties> = {
    default:     { background: 'rgba(91,63,249,0.12)',  color: '#5B3FF9' },
    secondary:   { background: 'rgba(107,107,116,0.12)', color: '#6B6B74' },
    destructive: { background: 'rgba(208,74,59,0.12)',   color: '#D04A3B' },
    outline:     { background: 'transparent', border: '1px solid #DEDAD0', color: '#6B6B74' },
  }
  return (
    <div
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors', className)}
      style={{ fontFamily: 'var(--font-geist-mono)', ...variants[variant], ...style }}
      {...props}
    />
  )
}

export { Badge }
