"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { deleteAd } from "@/app/actions/ads"
import { AdForm } from "./ad-form"
import type { AdPlacement } from "@/lib/ad-config"

type Ad = {
  id: number
  name: string
  placement: AdPlacement
  url: string
  desktopImageId: string
  mobileImageId: string
  active: boolean
}

export function AdRowActions({ ad }: { ad: Ad }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onDelete = () => {
    if (!confirm(`Delete advertisement "${ad.name}"?`)) return
    startTransition(async () => {
      await deleteAd(ad.id)
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
            <DialogTitle>Edit advertisement</DialogTitle>
          </DialogHeader>
          <AdForm initial={ad} onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
