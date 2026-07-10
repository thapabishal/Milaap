interface LoadingSkeletonProps {
  className?: string
}

/**
 * Animated shimmer skeleton for loading states.
 * Size is controlled entirely via className (e.g. "h-4 w-32 rounded-md").
 * Never use a spinner — always use skeletons.
 */
export default function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div
      className={['animate-shimmer rounded-md', className].join(' ')}
      aria-hidden="true"
      role="presentation"
    />
  )
}
