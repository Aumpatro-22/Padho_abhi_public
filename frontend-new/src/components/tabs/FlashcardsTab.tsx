import { useState, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import type { PanInfo } from "framer-motion"
import { RefreshCcw, Copy, ArrowLeft, ArrowRight, HelpCircle, X, Check, Meh, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loading } from "@/components/Loading"
import { api } from "@/lib/api"
import type { Flashcard } from "@/lib/api"

interface FlashcardsTabProps {
  topicId: number
  flashcards: Flashcard[]
  setFlashcards: (flashcards: Flashcard[]) => void
}

function FlashcardCard({
  flashcard,
  onReview,
  onSwipeLeft,
  onSwipeRight,
}: {
  flashcard: Flashcard
  onReview: (id: number, quality: number) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])
  
  // Visual indicators for swipe direction
  const leftIndicatorOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0])
  const rightIndicatorOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x < -threshold) {
      onSwipeLeft?.()
      if (navigator.vibrate) navigator.vibrate(50)
    } else if (info.offset.x > threshold) {
      onSwipeRight?.()
      if (navigator.vibrate) navigator.vibrate(50)
    }
  }

  return (
    <div className="relative">
      {/* Swipe indicators */}
      <motion.div
        style={{ opacity: leftIndicatorOpacity }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-red-500 text-white p-3 rounded-full"
      >
        <X className="h-6 w-6" />
      </motion.div>
      <motion.div
        style={{ opacity: rightIndicatorOpacity }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-emerald-500 text-white p-3 rounded-full"
      >
        <Check className="h-6 w-6" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity }}
        className="perspective-1000 w-full h-72 md:h-80 cursor-grab active:cursor-grabbing touch-pan-y"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-white shadow-2xl">
            <HelpCircle className="h-10 w-10 md:h-12 md:w-12 mb-4 md:mb-6 opacity-40" />
            <p className="text-xl md:text-2xl font-bold text-center leading-tight px-2">{flashcard.front_text}</p>
            <div className="mt-6 md:mt-8 flex flex-col items-center gap-1">
              <p className="text-xs md:text-sm opacity-70 font-medium tracking-wide">TAP TO REVEAL</p>
              <p className="text-[10px] opacity-50 md:hidden">or swipe ← → to rate</p>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-white shadow-2xl">
            <div className="flex-1 flex items-center justify-center text-center px-2">
              <p className="text-lg md:text-xl font-medium leading-relaxed">{flashcard.back_text}</p>
            </div>
            <div
              className="flex gap-2 md:gap-3 mt-4 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="secondary"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 h-11 md:h-10 text-xs md:text-sm active:scale-95 transition-transform"
                onClick={() => onReview(flashcard.id, 1)}
              >
                <X className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Forgot</span>
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 h-11 md:h-10 text-xs md:text-sm active:scale-95 transition-transform"
                onClick={() => onReview(flashcard.id, 3)}
              >
                <Meh className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Unsure</span>
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 h-11 md:h-10 text-xs md:text-sm active:scale-95 transition-transform"
                onClick={() => onReview(flashcard.id, 5)}
              >
                <Check className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Got It</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export function FlashcardsTab({ topicId, flashcards, setFlashcards }: FlashcardsTabProps) {
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (topicId) {
      loadFlashcards()
    }
  }, [topicId])

  async function loadFlashcards(refresh = false) {
    setLoading(true)
    try {
      const endpoint = "/flashcards/by_topic/?topic_id=" + topicId + (refresh ? "&refresh=true" : "")
      const data = await api.get<Flashcard[] | { error: string }>(endpoint)
      if ("error" in data) {
        alert(data.error)
        setFlashcards([])
      } else {
        setFlashcards(Array.isArray(data) ? data : [])
      }
      setCurrentIndex(0)
    } catch {
      setFlashcards([])
    }
    setLoading(false)
  }

  async function handleReview(flashcardId: number, quality: number) {
    await api.post("/flashcards/" + flashcardId + "/review/", { quality })
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (loading) return <Loading message="Generating flashcards with AI..." />

  if (!flashcards || flashcards.length === 0)
    return (
      <div className="text-center py-16">
        <Copy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h3 className="text-xl text-muted-foreground">No flashcards yet</h3>
      </div>
    )

  const progress = ((currentIndex + 1) / flashcards.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentIndex(0)}
          disabled={currentIndex === 0}
          className="active:scale-95 transition-transform"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Restart
        </Button>
        <Button variant="ghost" size="sm" onClick={() => loadFlashcards(true)} className="active:scale-95 transition-transform">
          <RefreshCcw className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Regenerate</span>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto px-2">
        <div className="flex justify-between items-center mb-2 text-xs md:text-sm font-medium text-muted-foreground">
          <span>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2 md:h-3 mb-6 md:mb-8 progress-animate" />

        {/* Swipe hint for mobile */}
        <p className="text-center text-xs text-muted-foreground mb-4 md:hidden">
          Swipe left/right or tap to flip
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={flashcards[currentIndex].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="mb-6 md:mb-8"
          >
            <FlashcardCard
              flashcard={flashcards[currentIndex]}
              onReview={handleReview}
              onSwipeLeft={() => handleReview(flashcards[currentIndex].id, 1)}
              onSwipeRight={() => handleReview(flashcards[currentIndex].id, 5)}
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-3 md:gap-4">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="h-11 md:h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Previous</span>
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1))}
              disabled={currentIndex === flashcards.length - 1}
              className="h-11 md:h-10"
            >
              <span className="hidden sm:inline">Next</span> <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
