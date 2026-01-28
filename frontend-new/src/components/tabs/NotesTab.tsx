import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { RefreshCcw, Bookmark, FileText, Lightbulb, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/Loading"
import { api } from "@/lib/api"
import type { Note } from "@/lib/api"

interface NotesTabProps {
  topicId: number
  notes: Note | null
  setNotes: (notes: Note | null) => void
}

export function NotesTab({ topicId, notes, setNotes }: NotesTabProps) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (topicId && !notes) {
      loadNotes()
    }
  }, [topicId])

  async function loadNotes(refresh = false) {
    setLoading(true)
    try {
      const endpoint = "/notes/by_topic/?topic_id=" + topicId + (refresh ? "&refresh=true" : "")
      const data = await api.get<Note | { error: string }>(endpoint)
      if ("error" in data) {
        alert(data.error)
        setNotes(null)
      } else {
        setNotes(data)
      }
    } catch {
      setNotes(null)
    }
    setLoading(false)
  }

  if (loading) return <Loading message="Generating notes with AI..." />

  if (!notes)
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <h3 className="text-xl text-muted-foreground">No notes available</h3>
      </div>
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => loadNotes(true)}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Regenerate Notes
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Bookmark className="h-5 w-5" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{notes.summary}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="h-5 w-5" /> Detailed Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap leading-relaxed">{notes.detailed_content}</div>
          </CardContent>
        </Card>
      </motion.div>

      {notes.analogies && notes.analogies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" /> Easy Analogies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {notes.analogies.map((a, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-orange-500">💡</span>
                    {a}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {notes.diagram_description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Image className="h-5 w-5" /> Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{notes.diagram_description}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
