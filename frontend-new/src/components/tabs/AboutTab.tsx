import { motion } from "framer-motion"
import { Brain, Heart, User, Copy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AboutTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <Card className="border-t-4 border-primary">
        <CardHeader>
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-md"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Brain className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl">About Padho Abhi</CardTitle>
              <p className="text-primary font-medium">Revolutionizing Education with AI</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <span className="font-semibold text-lg">Why Padho Abhi?</span>
            <br />
            In a world overflowing with information, students often struggle to find structured,
            personalized, and easy-to-understand study materials.{" "}
            <strong>Padho Abhi</strong> was born out of the need to bridge this gap. We believe that
            quality education should be accessible, engaging, and tailored to each student's pace.
          </p>
          <p>
            Our mission is to empower learners by transforming complex syllabi into bite-sized,
            interactive content—notes, mindmaps, flashcards, and quizzes—all generated instantly by
            advanced AI.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" /> The Creator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                This platform is passionately crafted by <strong>Aum Patro</strong>.
              </p>
              <p className="text-sm text-muted-foreground italic">
                "Building tools that help people learn faster and better."
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
        >
          <Card className="h-full bg-gradient-to-br from-primary to-blue-600 text-white hover:shadow-lg transition-shadow overflow-hidden relative">
            <motion.div
              className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="h-5 w-5 text-pink-300 animate-pulse" /> Support Us
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-blue-100 mb-4 text-sm">
                If this project has helped you in your studies, consider supporting its development.
              </p>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg flex items-center justify-between border border-white/30">
                <span className="font-mono text-sm opacity-90">padhoabhidonation@axl</span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-blue-50"
                  onClick={() => {
                    navigator.clipboard.writeText("padhoabhidonation@axl")
                    alert("UPI ID copied!")
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" /> COPY
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
