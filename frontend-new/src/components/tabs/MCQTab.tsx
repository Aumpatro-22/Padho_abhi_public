import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCcw, HelpCircle, Send, CheckCircle2, XCircle, ArrowRight, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loading } from "@/components/Loading"
import { api } from "@/lib/api"
import type { MCQ, MCQResult } from "@/lib/api"
import { cn } from "@/lib/utils"

interface MCQTabProps {
  topicId: number
  mcqs: MCQ[]
  setMcqs: (mcqs: MCQ[]) => void
}

export function MCQTab({ topicId, mcqs, setMcqs }: MCQTabProps) {
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<MCQResult | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    if (topicId) {
      loadMCQs()
    }
  }, [topicId])

  async function loadMCQs(refresh = false) {
    setLoading(true)
    try {
      const endpoint = "/mcqs/by_topic/?topic_id=" + topicId + (refresh ? "&refresh=true" : "")
      const data = await api.get<MCQ[] | { error: string }>(endpoint)
      if ("error" in data) {
        alert(data.error)
        setMcqs([])
      } else {
        setMcqs(Array.isArray(data) ? data : [])
      }
      setCurrentIndex(0)
      setScore({ correct: 0, total: 0 })
      setSelectedOption(null)
      setShowResult(false)
    } catch {
      setMcqs([])
    }
    setLoading(false)
  }

  async function handleSubmit() {
    if (!selectedOption) return
    const res = await api.post<MCQResult>("/mcqs/" + mcqs[currentIndex].id + "/submit_answer/", {
      selected_option: selectedOption,
    })
    setResult(res)
    setShowResult(true)
    setScore((prev) => ({
      correct: prev.correct + (res.is_correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  function handleNext() {
    setSelectedOption(null)
    setShowResult(false)
    setResult(null)
    if (currentIndex < mcqs.length - 1) setCurrentIndex(currentIndex + 1)
  }

  if (loading) return <Loading message="Generating MCQs with AI..." />

  if (!mcqs || mcqs.length === 0)
    return (
      <div className="text-center py-16">
        <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h3 className="text-xl text-muted-foreground">No MCQs yet</h3>
      </div>
    )

  const currentMCQ = mcqs[currentIndex]
  const options: Array<"a" | "b" | "c" | "d"> = ["a", "b", "c", "d"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => loadMCQs(true)}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Regenerate MCQs
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <span className="text-muted-foreground">
              Question {currentIndex + 1} of {mcqs.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-500 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> {score.correct} correct
            </span>
            <span className="text-muted-foreground">/ {score.total} attempted</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-4 mb-8">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-bold shadow-sm whitespace-nowrap">
              Q {currentIndex + 1}
            </span>
            <p className="text-xl font-medium flex-1 leading-relaxed">{currentMCQ.question_text}</p>
          </div>

          <div className="space-y-4">
            {options.map((opt) => {
              const optionKey = `option_${opt}` as keyof MCQ
              const optionText = currentMCQ[optionKey] as string

              let optionClass =
                "border-2 border-border bg-card hover:border-primary/50 hover:bg-accent"
              let icon: React.ReactNode = null

              if (showResult && result) {
                if (opt === result.correct_option) {
                  optionClass = "border-2 border-green-500 bg-green-500/10"
                  icon = <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
                } else if (opt === selectedOption && !result.is_correct) {
                  optionClass = "border-2 border-red-500 bg-red-500/10"
                  icon = <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                } else {
                  optionClass = "border-2 border-border opacity-50"
                }
              } else if (selectedOption === opt) {
                optionClass = "border-2 border-primary bg-primary/5 ring-1 ring-primary"
              }

              return (
                <motion.button
                  key={opt}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  onClick={() => !showResult && setSelectedOption(opt)}
                  disabled={showResult}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center",
                    optionClass
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold border",
                      selectedOption === opt
                        ? "bg-primary text-white border-primary"
                        : "bg-muted border-border"
                    )}
                  >
                    {opt.toUpperCase()}
                  </div>
                  <span className={cn("font-medium", selectedOption === opt ? "text-primary" : "")}>
                    {optionText}
                  </span>
                  {icon}
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {showResult && result?.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "mt-8 p-6 rounded-xl border",
                  result.is_correct
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-yellow-500/5 border-yellow-500/20"
                )}
              >
                <h4
                  className={cn(
                    "font-bold mb-2 flex items-center gap-2",
                    result.is_correct ? "text-green-500" : "text-yellow-500"
                  )}
                >
                  {result.is_correct ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Correct Answer!
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-5 w-5" /> Explanation
                    </>
                  )}
                </h4>
                <p className="leading-relaxed">{result.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t flex gap-4">
            {!showResult ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption}
                variant="gradient"
                size="lg"
                className="w-full"
              >
                <Send className="h-5 w-5" /> Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} variant="gradient" size="lg" className="w-full">
                {currentIndex < mcqs.length - 1 ? (
                  <>
                    Next Question <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    <Flag className="h-5 w-5" /> Finish Quiz
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
