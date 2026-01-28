import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCcw, Copy, ArrowLeft, ArrowRight, HelpCircle, X, Check, Meh } from "lucide-react"
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
}: {
  flashcard: Flashcard
  onReview: (id: number, quality: number) => void
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="perspective-1000 w-full h-80 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 flex flex-col items-center justify-center text-white shadow-2xl">
          <HelpCircle className="h-12 w-12 mb-6 opacity-40" />
          <p className="text-2xl font-bold text-center leading-tight">{flashcard.front_text}</p>
          <p className="text-sm opacity-70 mt-8 font-medium tracking-wide">CLICK TO REVEAL</p>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 flex flex-col items-center justify-center text-white shadow-2xl">
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-xl font-medium leading-relaxed">{flashcard.back_text}</p>
          </div>
          <div
            className="flex gap-3 mt-4 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="secondary"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => onReview(flashcard.id, 1)}
            >
              <X className="h-4 w-4 mr-1" /> Forgot
            </Button>
            <Button
              variant="secondary"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => onReview(flashcard.id, 3)}
            >
              <Meh className="h-4 w-4 mr-1" /> Unsure
            </Button>
            <Button
              variant="secondary"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              onClick={() => onReview(flashcard.id, 5)}
            >
              <Check className="h-4 w-4 mr-1" /> Got It
            </Button>
          </div>
        </div>
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
      className="space-y-8"
    >
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => loadFlashcards(true)}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Regenerate Flashcards
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-2 text-sm font-medium text-muted-foreground">
          <span>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-3 mb-8" />

        <AnimatePresence mode="wait">
          <motion.div
            key={flashcards[currentIndex].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="mb-8"
          >
            <FlashcardCard
              flashcard={flashcards[currentIndex]}
              onReview={handleReview}
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <Button
            onClick={() => setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1))}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
