import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCcw, ChevronDown, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loading } from "@/components/Loading"
import { api } from "@/lib/api"
import type { Mindmap } from "@/lib/api"

interface MindmapTabProps {
  topicId: number
  mindmap: Mindmap | null
  setMindmap: (mindmap: Mindmap | null) => void
}

interface MindmapBranchProps {
  branch: { title: string; subpoints: string[] }
  color: string
  onPointClick: (point: string) => void
}

const colors = [
  "from-indigo-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-teal-500",
  "from-yellow-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-purple-500",
]

function MindmapBranch({ branch, color, onPointClick }: MindmapBranchProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-6 py-3 rounded-xl shadow-lg text-white bg-gradient-to-br ${color} flex items-center gap-2 font-bold`}
      >
        {branch.title}
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && branch.subpoints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap justify-center gap-2 mt-4 max-w-md"
          >
            {branch.subpoints.map((point, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onPointClick(point)
                }}
                className="bg-card border p-3 rounded-lg shadow-sm text-sm hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
              >
                {point}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function MindmapTab({ topicId, mindmap, setMindmap }: MindmapTabProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null)
  const [explanation, setExplanation] = useState("")
  const [explaining, setExplaining] = useState(false)

  useEffect(() => {
    if (topicId && !mindmap) {
      loadMindmap()
    }
  }, [topicId])

  async function loadMindmap(refresh = false) {
    setLoading(true)
    try {
      const endpoint = "/mindmaps/by_topic/?topic_id=" + topicId + (refresh ? "&refresh=true" : "")
      const data = await api.get<{ json_data?: Mindmap } | Mindmap>(endpoint)
      if ("json_data" in data && data.json_data) {
        setMindmap(data.json_data)
      } else {
        setMindmap(data as Mindmap)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function handlePointClick(point: string) {
    setSelectedPoint(point)
    setExplanation("")
    setExplaining(true)
    try {
      const res = await api.post<{ ai_response?: string; error?: string }>("/chat/", {
        topic_id: topicId,
        message: `Explain the concept "${point}" briefly in the context of this mindmap.`,
      })
      if (res.error) {
        setExplanation("Error: " + res.error)
      } else if (res.ai_response) {
        setExplanation(res.ai_response)
      } else {
        setExplanation("No explanation received.")
      }
    } catch {
      setExplanation("Sorry, I couldn't generate an explanation at this moment.")
    }
    setExplaining(false)
  }

  if (loading) return <Loading message="Generating mindmap..." />

  if (!mindmap)
    return (
      <div className="text-center py-16">
        <Network className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h3 className="text-xl text-muted-foreground">No mindmap available</h3>
      </div>
    )

  if (mindmap.error) {
    return <div className="p-4 bg-destructive/10 text-destructive rounded-lg">{mindmap.error}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => loadMindmap(true)}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Regenerate Mindmap
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <CardContent className="p-8 min-h-[600px]">
          <div className="flex flex-col items-center">
            {/* Central Idea */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold text-xl shadow-lg border-4 border-gray-100 dark:border-gray-800 mb-8"
            >
              {mindmap.central_idea}
            </motion.div>

            {/* Branches */}
            <div className="flex flex-wrap justify-center gap-8">
              {mindmap.branches?.map((branch, index) => (
                <MindmapBranch
                  key={index}
                  branch={branch}
                  color={colors[index % colors.length]}
                  onPointClick={handlePointClick}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedPoint} onOpenChange={() => setSelectedPoint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPoint}</DialogTitle>
          </DialogHeader>
          {explaining ? (
            <div className="flex flex-col items-center py-8">
              <Loading message="AI is explaining this concept..." />
            </div>
          ) : (
            <div className="prose dark:prose-invert leading-relaxed">{explanation}</div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
