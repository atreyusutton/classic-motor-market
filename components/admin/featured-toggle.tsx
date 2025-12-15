"use client"

import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { toggleFeatured } from "@/app/actions/admin"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

export function FeaturedToggle({ id, isFeatured }: { id: number, isFeatured: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await toggleFeatured(id)
      })}
      title={isFeatured ? "Remove from Featured" : "Add to Featured"}
    >
      <Star 
        className={cn(
          "h-4 w-4 transition-colors", 
          isFeatured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
        )} 
      />
    </Button>
  )
}

