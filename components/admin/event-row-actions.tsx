"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { deleteEvent } from "@/app/actions/events"
import { EventForm } from "./event-form"

type Event = {
  id: number
  title: string
  shortTitle: string | null
  date: string
}

export function EventRowActions({ event }: { event: Event }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onDelete = () => {
    if (!confirm(`Delete "${event.title}"?`)) return
    startTransition(async () => {
      await deleteEvent(event.id)
      router.refresh()
    })
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} disabled={isPending} title="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={isPending}
        title="Delete"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit event</DialogTitle>
          </DialogHeader>
          <EventForm initial={event} onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
