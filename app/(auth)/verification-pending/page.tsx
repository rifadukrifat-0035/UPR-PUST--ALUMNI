"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, UploadCloud, ShieldAlert, FileCheck2 } from "lucide-react"

export default function VerificationPendingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [session, setSession] = useState<Session | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessionAndStatus = async () => {
      setLoadingSession(true)
      setError(null)

      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        setSession(currentSession ?? null)

        if (!currentSession?.user?.id) {
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", currentSession.user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        if (profile?.status === "approved") {
          router.replace("/dashboard")
          return
        }
      } catch (err: any) {
        setError(err.message || "Failed to check verification status")
      } finally {
        setLoadingSession(false)
      }
    }

    fetchSessionAndStatus()
  }, [router, supabase])

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedFile) {
      setError("Please select a file first.")
      return
    }

    setUploading(true)

    try {
      if (!session?.user?.id) {
        throw new Error("User session not found. Please sign in again.")
      }

      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      const filePath = `${session.user.id}/${Date.now()}-${safeName}`

      const { data, error: uploadError } = await supabase.storage
        .from("verifications")
        .upload(filePath, selectedFile, { upsert: true })

      if (uploadError) {
        console.log("[verification upload error]", uploadError)
        throw uploadError
      }

      if (!data?.path) {
        throw new Error("Upload path not returned from storage.")
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("verifications").getPublicUrl(data.path)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ verification_url: publicUrl })
        .eq("id", session.user.id)

      if (updateError) {
        console.log("[verification db update error]", updateError)
        throw updateError
      }

      console.log("Update Successful")

      console.log("[verification upload success]", {
        userId: session.user.id,
        filePath: data.path,
        publicUrl,
      })

      setSuccess("Document uploaded! Admin will verify soon.")
      setSelectedFile(null)
    } catch (err: any) {
      console.log("[verification flow error]", err)
      setError(err.message || "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  if (loadingSession) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="border-slate-800 bg-slate-900 text-slate-200 shadow-xl">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl text-slate-100">Account Verification Required</CardTitle>
            <CardDescription className="text-slate-400">
              You need to sign in first to upload your verification document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full bg-emerald-600 font-semibold text-slate-950 hover:bg-emerald-500"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card className="border-slate-800 bg-slate-900 text-slate-200 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Verification Pending</span>
          </div>
          <CardTitle className="text-2xl text-slate-100">Account Verification Required</CardTitle>
          <CardDescription className="text-slate-400">
            Your account is pending approval. Upload a Student ID or Certificate so our team can
            review it faster.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-600/50 bg-red-950/40 text-red-200">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-600/50 bg-emerald-950/40 text-emerald-200">
              <FileCheck2 className="h-4 w-4" />
              <AlertTitle>Uploaded</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verification-file" className="text-sm font-medium text-slate-300">
                Upload Document
              </label>
              <div className="rounded-md border border-slate-700 bg-slate-950/70 p-3">
                <Input
                  id="verification-file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
                <p className="mt-2 text-xs text-slate-400">Accepted: PDF, PNG, JPG, JPEG</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full bg-emerald-600 font-semibold text-slate-950 hover:bg-emerald-500"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Student ID or Certificate
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
