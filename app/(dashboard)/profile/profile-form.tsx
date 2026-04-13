"use client"

import { useFormStatus } from "react-dom"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ProfileFormProps = {
  defaultValues: {
    fullName: string
    bio: string
    batchYear: string
    currentCity: string
  }
  updateProfile: (formData: FormData) => void | Promise<void>
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-lg bg-emerald-400 px-4 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving Profile...
        </>
      ) : (
        "Save Profile"
      )}
    </Button>
  )
}

export default function ProfileForm({ defaultValues, updateProfile }: ProfileFormProps) {
  return (
    <form action={updateProfile} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="full_name" className="text-sm font-medium text-slate-200">
            Full Name
          </label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={defaultValues.fullName}
            placeholder="Your full name"
            className="h-11 border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="bio" className="text-sm font-medium text-slate-200">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={defaultValues.bio}
            placeholder="Share what you do, your interests, and how alumni can connect."
            rows={5}
            className="w-full rounded-md border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="batch_year" className="text-sm font-medium text-slate-200">
            Batch Year
          </label>
          <Input
            id="batch_year"
            name="batch_year"
            type="number"
            min="1980"
            max="2100"
            defaultValue={defaultValues.batchYear}
            placeholder="e.g. 2018"
            className="h-11 border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="current_city" className="text-sm font-medium text-slate-200">
            Current City
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-300/80" />
            <Input
              id="current_city"
              name="current_city"
              defaultValue={defaultValues.currentCity}
              placeholder="City, Country"
              className="h-11 border-slate-700/80 bg-slate-950/70 pl-10 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
