"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner" // Assuming sonner or use basic alert

export function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false)

  const onUpgrade = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      })

      if (!response.ok) {
          throw new Error("Failed to create checkout session")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error(error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={onUpgrade} disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-primary/80">
      {isLoading ? "Redirecting..." : "Upgrade to Member"}
    </Button>
  )
}

