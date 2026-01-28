import { motion } from "framer-motion"
import { GraduationCap, Sparkles, FileText, Network, Copy, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface WelcomeScreenProps {
  onUploadClick: () => void
}

const features = [
  {
    icon: FileText,
    title: "AI Notes",
    desc: "Detailed, easy explanations",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: Network,
    title: "Mindmaps",
    desc: "Visual connection of ideas",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    icon: Copy,
    title: "Flashcards",
    desc: "Active recall for retention",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    icon: HelpCircle,
    title: "MCQ Quiz",
    desc: "Test your understanding",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950",
  },
]

export function WelcomeScreen({ onUploadClick }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12 px-4"
    >
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <GraduationCap className="h-12 w-12 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
      >
        Welcome to Padho Abhi!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-lg mx-auto mb-10 text-lg leading-relaxed"
      >
        Upload your syllabus and let AI generate personalized study materials including notes,
        mindmaps, flashcards, and quizzes automatically.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="gradient"
          size="lg"
          onClick={onUploadClick}
          className="text-lg px-8 py-6"
        >
          <Sparkles className="h-5 w-5" />
          Start Learning Now
        </Button>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="text-left hover:shadow-lg transition-shadow border group">
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
