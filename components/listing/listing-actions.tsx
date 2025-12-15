"use client"

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateListingStatus, deleteListing, updatePublishFeeStatus } from "@/app/actions/listing"
import { useState } from "react"

interface ListingActionsProps {
  listingId: number
  status: 'active' | 'sold' | 'draft'
  publishFeePaid: boolean
}

export function ListingActions({ listingId, status, publishFeePaid }: ListingActionsProps) {
  const [isPending, setIsPending] = useState(false)

  const onUpdateStatus = async (newStatus: 'active' | 'sold' | 'draft') => {
    setIsPending(true)
    try {
      await updateListingStatus(listingId, newStatus)
    } finally {
      setIsPending(false)
    }
  }

  const onTogglePublishFee = async (paid: boolean) => {
    setIsPending(true)
    try {
      await updatePublishFeeStatus(listingId, paid)
    } finally {
      setIsPending(false)
    }
  }

  const onDelete = async () => {
    if (confirm("Are you sure? This will delete the listing and images permanently.")) {
      setIsPending(true)
      try {
        await deleteListing(listingId)
      } finally {
        setIsPending(false)
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white text-foreground border border-border shadow-lg"
      >
        <DropdownMenuItem asChild>
          <Link href={`/sell/${listingId}`}>
            Edit Listing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {status !== 'active' && (
          <DropdownMenuItem onClick={() => onUpdateStatus('active')}>
            Mark Active
          </DropdownMenuItem>
        )}
        {status !== 'sold' && (
          <DropdownMenuItem onClick={() => onUpdateStatus('sold')}>
            Mark Sold
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onTogglePublishFee(!publishFeePaid)}>
          {publishFeePaid ? "Mark Publish Fee Unpaid" : "Confirm Publish Fee Paid"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

