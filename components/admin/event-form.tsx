"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEvent, updateEvent } from "@/app/actions/events"

type EventFormValues = {
  id?: number
  title?: string
  shortTitle?: string | null
  date?: string
}

function toDateInputValue(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function EventForm({
  initial,
  onDone,
}: {
  initial?: EventFormValues
  onDone?: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEdit = typeof initial?.id === "number"

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateEvent(initial!.id!, formData)
        : await createEvent(formData)
      if (result && "error" in result && result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      onDone?.()
    })
  }

  return (
    <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initial?.title ?? ""}
          placeholder="FUELFED CLASSIC MOTOR MARKET POP-UP: MAY 15, 2026 / AT 2028 LEIGH / NORTHBROOK, IL / 9:00 TO 11:00AM"
          required
        />
      </div>

      <div>
        <Label htmlFor="shortTitle">Short title</Label>
        <Input
          id="shortTitle"
          name="shortTitle"
          defaultValue={initial?.shortTitle ?? ""}
          placeholder="FUELFED POP-UP: MAY 15, 2026"
        />
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={toDateInputValue(initial?.date)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <div className="sm:col-span-2 flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Save changes" : "Add event"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
