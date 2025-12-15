"use client"

import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ShareButton({ title, url }: { title: string, url?: string }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const onCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Classic Motor Market",
          text: `Check out this ${title} on Classic Motor Market`,
          url: shareUrl,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      onCopy()
    }
  }

  return (
    <Button variant="outline" className="w-full" size="lg" onClick={onShare}>
      {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
      {copied ? "Copied Link" : "Share Listing"}
    </Button>
  )
}

