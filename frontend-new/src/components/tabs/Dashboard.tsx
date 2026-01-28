import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, CheckCircle2, Percent, Target, AlertTriangle, Star, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loading } from "@/components/Loading"
import { api } from "@/lib/api"
import type { DashboardData } from "@/lib/api"

interface DashboardProps {
  subjectId?: number
}

function StatCard({
  icon: Icon,
  iconColor,
  bgColor,
  label,
  value,
  subtext,
  delay,
}: {
  icon: React.ElementType
  iconColor: string
  bgColor: string
  label: string
  value: string | number
  subtext?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${bgColor} rounded-full flex items-center justify-center shadow-inner`}>
              <Icon className={`h-7 w-7 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <p className="text-3xl font-extrabold mt-1">{value}</p>
              {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Dashboard({ subjectId }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [subjectId])

  async function loadDashboard() {
    setLoading(true)
    try {
      const endpoint = subjectId
        ? "/progress/dashboard/?subject_id=" + subjectId
        : "/progress/dashboard/"
      const result = await api.get<DashboardData>(endpoint)
      setData(result)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading) return <Loading message="Loading dashboard..." />
  if (!data) return null

  const completionPct = data.completion_percentage || 0
  const mcqAccuracy = data.overall_mcq_accuracy || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" /> Your Progress Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-100 dark:bg-indigo-950"
          label="Total Topics"
          value={data.total_topics}
          delay={0}
        />
        <StatCard
          icon={CheckCircle2}
          iconColor="text-green-600"
          bgColor="bg-green-100 dark:bg-green-950"
          label="Completed"
          value={data.completed_topics}
          delay={0.1}
        />
        <StatCard
          icon={Percent}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-100 dark:bg-yellow-950"
          label="Completion"
          value={completionPct.toFixed(1) + "%"}
          delay={0.2}
        />
        <StatCard
          icon={Target}
          iconColor="text-purple-600"
          bgColor="bg-purple-100 dark:bg-purple-950"
          label="Accuracy"
          value={mcqAccuracy.toFixed(1) + "%"}
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                    Course Status
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary">
                    {completionPct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={completionPct} className="h-4" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.weak_topics && data.weak_topics.length > 0 ? (
                <ul className="space-y-3">
                  {data.weak_topics.map((t, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-3 bg-red-500/5 p-3 rounded-lg border border-red-500/10"
                    >
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      {t}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-10 w-10 mx-auto mb-2 text-yellow-500 opacity-50" />
                  <p>No weak topics detected yet!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-green-500 flex items-center gap-2">
                <Star className="h-5 w-5" /> Strong Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.strong_topics && data.strong_topics.length > 0 ? (
                <ul className="space-y-3">
                  {data.strong_topics.map((t, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-3 bg-green-500/5 p-3 rounded-lg border border-green-500/10"
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      {t}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Complete more quizzes to identify strengths</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
