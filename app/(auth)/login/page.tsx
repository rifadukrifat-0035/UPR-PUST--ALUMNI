"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Mail, Lock, User, CalendarDays, AlertCircle, CheckCircle2 } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [fullName, setFullName] = useState("")
  const [batchYear, setBatchYear] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("login")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields")
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      setSuccess("Login successful! Redirecting...")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!fullName || !batchYear || !email || !password) {
        throw new Error("Please fill in all fields")
      }

      const parsedBatchYear = parseInt(batchYear)
      if (isNaN(parsedBatchYear)) {
        throw new Error("Batch Year must be a valid number")
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            batch_year: parsedBatchYear,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      setSuccess("Account created. Please check your email for confirmation.")
      setFullName("")
      setBatchYear("")
      setEmail("")
      setPassword("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-200">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-zinc-100">Welcome Back</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-600/50 bg-red-950/50 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-emerald-600/50 bg-emerald-950/50 text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium text-zinc-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium text-zinc-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 font-semibold text-zinc-950 hover:bg-emerald-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium text-zinc-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute top-3 left-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-batch" className="text-sm font-medium text-zinc-300">
                    Batch Year
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute top-3 left-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="signup-batch"
                      type="number"
                      placeholder="2024"
                      value={batchYear}
                      onChange={(e) => setBatchYear(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                      min="2000"
                      max="2100"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium text-zinc-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium text-zinc-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 font-semibold text-zinc-950 hover:bg-emerald-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
