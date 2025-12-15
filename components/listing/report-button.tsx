"use client"

import { Button } from "@/components/ui/button"
import { reportListing } from "@/app/actions/report"
import { useState } from "react"

export function ReportButton({ listingId }: { listingId: number }) {
  const [reported, setReported] = useState(false)

  const onReport = async () => {
    if (confirm("Are you sure you want to report this listing?")) {
        await reportListing(listingId)
        setReported(true)
        alert("Listing reported. Thank you.")
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-muted-foreground text-xs hover:text-red-600"
      onClick={onReport}
      disabled={reported}
    >
      {reported ? "Reported" : "Report Listing"}
    </Button>
  )
}

