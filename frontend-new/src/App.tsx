import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  Sun,
  Moon,
  BarChart3,
  BookOpen,
  Network,
  Copy,
  HelpCircle,
  Bot,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loading } from "@/components/Loading"
import { AuthPage } from "@/components/AuthPage"
import { Sidebar } from "@/components/Sidebar"
import { SyllabusUploadModal } from "@/components/SyllabusUploadModal"
import { WelcomeScreen } from "@/components/WelcomeScreen"
import { NotesTab } from "@/components/tabs/NotesTab"
import { MindmapTab } from "@/components/tabs/MindmapTab"
import { FlashcardsTab } from "@/components/tabs/FlashcardsTab"
import { MCQTab } from "@/components/tabs/MCQTab"
import { ChatTab } from "@/components/tabs/ChatTab"
import { Dashboard } from "@/components/tabs/Dashboard"
import { SettingsTab } from "@/components/tabs/SettingsTab"
import { AboutTab } from "@/components/tabs/AboutTab"
import { api } from "@/lib/api"
import type { User, Subject, Unit, Topic, Note, Mindmap, Flashcard, MCQ, UserProfile } from "@/lib/api"
import { cn } from "@/lib/utils"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [notes, setNotes] = useState<Note | null>(null)
  const [mindmap, setMindmap] = useState<Mindmap | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [mcqs, setMcqs] = useState<MCQ[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  // Check auth on mount
  useEffect(() => {
    const init = async () => {
      const neonToken = localStorage.getItem("neon_access_token")
      const token = localStorage.getItem("token")
      const savedUser = localStorage.getItem("user")

      if (neonToken) {
        try {
          const profile = await api.get<User>("/auth/profile/")
          if (profile && profile.id) {
            localStorage.setItem("user", JSON.stringify(profile))
            setUser(profile)
          }
        } catch {
          localStorage.removeItem("neon_access_token")
          localStorage.removeItem("auth_provider")
        }
      } else if (token && savedUser) {
        setUser(JSON.parse(savedUser))
      }

      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
      if (savedTheme) setTheme(savedTheme)
      setAuthChecked(true)
    }

    init()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  useEffect(() => {
    if (user) {
      api.get<UserProfile>("/auth/profile/").then(setUserProfile).catch(console.error)
    }
  }, [user])

  useEffect(() => {
    if (user) loadSubjects()
  }, [user])

  useEffect(() => {
    if (selectedSubject) {
      loadUnits()
    } else {
      setUnits([])
      setSelectedTopic(null)
    }
  }, [selectedSubject])

  useEffect(() => {
    if (selectedTopic) {
      setNotes(null)
      setMindmap(null)
      setFlashcards([])
      setMcqs([])
    }
  }, [selectedTopic?.id])

  // Timer logic for study time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (selectedTopic) {
      interval = setInterval(() => {
        api
          .post("/progress/update_activity/", {
            topic_id: selectedTopic.id,
            activity_type: "time",
            duration: 60,
          })
          .catch(console.error)
      }, 60000)
    }
    return () => clearInterval(interval)
  }, [selectedTopic])

  async function loadSubjects() {
    const data = await api.get<Subject[]>("/subjects/")
    setSubjects(Array.isArray(data) ? data : [])
  }

  async function loadUnits() {
    if (!selectedSubject) return
    const data = await api.get<Subject>("/subjects/" + selectedSubject.id + "/")
    setUnits(data.units || [])
  }

  function handleSelectTopic(topic: Topic) {
    setSelectedTopic(topic)
    setActiveTab("notes")
  }

  function handleUploadSuccess(result: { subject?: Subject }) {
    loadSubjects()
    if (result.subject) setSelectedSubject(result.subject)
    api.get<UserProfile>("/auth/profile/").then(setUserProfile).catch(console.error)
  }

  async function handleDeleteSubject(subjectId: number) {
    if (!confirm("Delete this subject and all its content?")) return
    await api.delete("/subjects/" + subjectId + "/delete_with_content/")
    setSelectedSubject(null)
    setSelectedTopic(null)
    setUnits([])
    loadSubjects()
  }

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("neon_access_token")
    localStorage.removeItem("auth_provider")
    localStorage.removeItem("user")
    setUser(null)
    setSubjects([])
    setSelectedSubject(null)
    setSelectedTopic(null)
  }

  async function handleCompleteTopic(force = false) {
    if (!selectedTopic) return
    try {
      const res = await api.post<{
        status?: string
        warnings?: string[]
        message?: string
      }>("/progress/mark_complete/", {
        topic_id: selectedTopic.id,
        confirm: force,
      })
      if (res.status === "warning") {
        if (confirm((res.warnings?.join("\n") || "") + "\n\n" + res.message)) {
          handleCompleteTopic(true)
        }
      } else {
        alert("Topic marked as complete!")
      }
    } catch {
      alert("Failed to mark complete")
    }
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "notes", label: "Notes", icon: BookOpen },
    { id: "mindmap", label: "Mindmap", icon: Network },
    { id: "flashcards", label: "Flashcards", icon: Copy },
    { id: "mcqs", label: "MCQs", icon: HelpCircle },
    { id: "chat", label: "Ask Doubt", icon: Bot },
  ]

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Loading..." />
      </div>
    )
  }

  if (!user) {
    return <AuthPage onLogin={setUser} />
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Sidebar
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        units={units}
        selectedTopic={selectedTopic}
        onSelectTopic={handleSelectTopic}
        onUploadClick={() => setShowUploadModal(true)}
        onDeleteSubject={handleDeleteSubject}
        user={user}
        onLogout={handleLogout}
        onSettingsClick={() => {
          setActiveTab("settings")
          setSelectedTopic(null)
          if (window.innerWidth < 1024) setIsSidebarOpen(false)
        }}
        onAboutClick={() => {
          setActiveTab("about")
          setSelectedTopic(null)
          if (window.innerWidth < 1024) setIsSidebarOpen(false)
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <SyllabusUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      <div className="lg:ml-72 min-h-screen p-4 md:p-8 transition-all duration-300">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8 bg-card p-4 rounded-2xl shadow-sm border"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold line-clamp-1">
                {selectedTopic ? selectedTopic.name : selectedSubject ? selectedSubject.name : "Welcome"}
              </h1>
              {selectedTopic && (
                <p className="text-muted-foreground text-xs md:text-sm mt-0.5 line-clamp-1">
                  {selectedSubject?.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            {selectedTopic && (
              <Button
                variant="success"
                onClick={() => handleCompleteTopic(false)}
                className="hidden md:flex"
              >
                <CheckCircle2 className="h-4 w-4" /> Complete
              </Button>
            )}
          </div>
        </motion.div>

        {/* Usage Warning */}
        <AnimatePresence>
          {userProfile && !userProfile.has_api_key && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="bg-yellow-500/10 border-l-4 border-yellow-500 mb-6">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm">
                    <strong>Note:</strong> You are using the shared system quota (
                    {userProfile.daily_usage}/3 topics today).
                    <button
                      onClick={() => {
                        setActiveTab("settings")
                        setSelectedTopic(null)
                      }}
                      className="font-semibold underline hover:text-yellow-600 ml-1"
                    >
                      Add your own Gemini API Key for unlimited access
                    </button>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {activeTab === "settings" ? (
          <SettingsTab />
        ) : activeTab === "about" ? (
          <AboutTab />
        ) : subjects.length === 0 ? (
          <WelcomeScreen onUploadClick={() => setShowUploadModal(true)} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {selectedTopic && (
              <div className="mb-6 bg-card p-2 rounded-xl shadow-sm border overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "gap-2",
                        activeTab === tab.id && "shadow-md"
                      )}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="min-h-[500px]">
              {activeTab === "dashboard" && <Dashboard subjectId={selectedSubject?.id} />}
              {activeTab === "notes" && selectedTopic && (
                <NotesTab topicId={selectedTopic.id} notes={notes} setNotes={setNotes} />
              )}
              {activeTab === "mindmap" && selectedTopic && (
                <MindmapTab topicId={selectedTopic.id} mindmap={mindmap} setMindmap={setMindmap} />
              )}
              {activeTab === "flashcards" && selectedTopic && (
                <FlashcardsTab
                  topicId={selectedTopic.id}
                  flashcards={flashcards}
                  setFlashcards={setFlashcards}
                />
              )}
              {activeTab === "mcqs" && selectedTopic && (
                <MCQTab topicId={selectedTopic.id} mcqs={mcqs} setMcqs={setMcqs} />
              )}
              {activeTab === "chat" && selectedTopic && (
                <ChatTab topicId={selectedTopic.id} topicName={selectedTopic.name} />
              )}

              {!selectedTopic && activeTab !== "dashboard" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 flex flex-col items-center"
                >
                  <motion.div
                    className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4"
                    animate={{ x: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Select a topic to start learning</h3>
                  <p className="text-muted-foreground mt-2">Choose from the sidebar on the left</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App
