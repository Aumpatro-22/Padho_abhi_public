import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import type { User } from "@/lib/api"

interface AuthPageProps {
  onLogin: (user: User) => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [neonToken, setNeonToken] = useState("")
  const [neonError, setNeonError] = useState("")
  const [neonLoading, setNeonLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const endpoint = isLogin ? "/auth/login/" : "/auth/register/"
      const payload = isLogin ? { username, password } : { username, email, password }
      const res = await fetch("/api" + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.token) {
        localStorage.removeItem("neon_access_token")
        localStorage.setItem("auth_provider", "django")
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        onLogin(data.user)
      } else {
        setError(data.error || data.detail || "Authentication failed")
      }
    } catch {
      setError("Connection error. Please try again.")
    }
    setLoading(false)
  }

  async function handleNeonTokenLogin(e: React.FormEvent) {
    e.preventDefault()
    setNeonError("")
    if (!neonToken.trim()) {
      setNeonError("Please paste a Neon Auth access token")
      return
    }
    setNeonLoading(true)
    try {
      localStorage.setItem("neon_access_token", neonToken.trim())
      localStorage.setItem("auth_provider", "neon")
      localStorage.removeItem("token")
      const profile = await api.get<User>("/auth/profile/")
      if (profile && profile.id) {
        localStorage.setItem("user", JSON.stringify(profile))
        onLogin(profile)
      } else {
        throw new Error("Invalid Neon Auth token")
      }
    } catch (err) {
      localStorage.removeItem("neon_access_token")
      localStorage.removeItem("auth_provider")
      setNeonError(err instanceof Error ? err.message : "Neon Auth token invalid")
    }
    setNeonLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-primary to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <GraduationCap className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Padho Abhi
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-Powered Smart Study Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={isLogin ? "default" : "ghost"}
                className={`flex-1 ${isLogin ? "" : "text-muted-foreground"}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                className={`flex-1 ${!isLogin ? "" : "text-muted-foreground"}`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loading}
                variant="gradient"
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or use Neon Auth</span>
              </div>
            </div>

            <form onSubmit={handleNeonTokenLogin} className="space-y-3">
              <Input
                type="password"
                value={neonToken}
                onChange={(e) => setNeonToken(e.target.value)}
                placeholder="Paste Neon Auth token"
              />
              <AnimatePresence>
                {neonError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20"
                  >
                    {neonError}
                  </motion.div>
                )}
              </AnimatePresence>
              <Button type="submit" variant="outline" disabled={neonLoading} className="w-full">
                {neonLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Use Neon Auth Token"
                )}
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
