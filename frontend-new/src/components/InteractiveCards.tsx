import { useState, useRef } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import type { PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  className?: string
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className,
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const constraintsRef = useRef(null)
  const x = useMotionValue(0)
  
  const leftOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0])
  const rightOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1])
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95])
  const rotate = useTransform(x, [-200, 0, 200], [-5, 0, 5])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 100

    if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft()
      if (navigator.vibrate) navigator.vibrate(50)
    } else if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight()
      if (navigator.vibrate) navigator.vibrate(50)
    }
  }

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        <motion.div
          style={{ opacity: leftOpacity }}
          className="flex-1 flex items-center justify-start pl-4 bg-gradient-to-r from-red-500 to-red-400"
        >
          {leftAction}
        </motion.div>
        <motion.div
          style={{ opacity: rightOpacity }}
          className="flex-1 flex items-center justify-end pr-4 bg-gradient-to-l from-emerald-500 to-emerald-400"
        >
          {rightAction}
        </motion.div>
      </div>

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, scale, rotate }}
        className={cn(
          "relative bg-card rounded-xl cursor-grab active:cursor-grabbing",
          isDragging && "shadow-2xl z-10",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Tilt card for 3D hover effect
interface TiltCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export function TiltCard({ children, className, intensity = 10 }: TiltCardProps) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setRotateX(((y - centerY) / centerY) * -intensity)
    setRotateY(((x - centerX) / centerX) * intensity)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  )
}

// Pull to refresh component
interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  className?: string
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, Math.min(100, (currentY - startY.current) * 0.5))
    setPullDistance(distance)
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      if (navigator.vibrate) navigator.vibrate(50)
      await onRefresh()
      setIsRefreshing(false)
    }
    setIsPulling(false)
    setPullDistance(0)
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn("overflow-y-auto", className)}
    >
      <motion.div
        animate={{ y: pullDistance }}
        className="relative"
      >
        {/* Pull indicator */}
        <motion.div
          animate={{
            opacity: pullDistance > 0 ? 1 : 0,
            scale: pullDistance / 100,
            rotate: (pullDistance / 100) * 360,
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full py-4"
        >
          <div className={cn(
            "w-8 h-8 rounded-full border-2 border-primary border-t-transparent",
            isRefreshing && "animate-spin"
          )} />
        </motion.div>
        {children}
      </motion.div>
    </div>
  )
}
