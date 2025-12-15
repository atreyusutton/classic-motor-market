"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { toggleWatchlist } from "@/app/actions/watchlist"
import { useTransition, useState } from "react"
import { cn } from "@/lib/utils"

interface WatchlistButtonProps {
  listingId: number
  initialSaved: boolean
}

export function WatchlistButton({ listingId, initialSaved }: WatchlistButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(initialSaved)

  const onClick = () => {
    startTransition(async () => {
      // Optimistic update
      const previousState = isSaved
      setIsSaved(!previousState)
      
      const result = await toggleWatchlist(listingId)
      if (result.error) {
        // Revert if error
        setIsSaved(previousState)
        // Ideally show toast
      } else if (result.success) {
        setIsSaved(result.saved)
      }
    })
  }

  return (
    <Button 
      variant="outline" 
      size="lg" 
      onClick={onClick}
      disabled={isPending}
      className={cn("w-full transition-colors", isSaved && "bg-primary/5 border-primary text-primary")}
    >
      <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} />
      {isSaved ? "Saved to Watchlist" : "Save to Watchlist"}
    </Button>
  )
}

