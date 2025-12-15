"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Shield, ShieldOff, UserCog } from "lucide-react"
import { updateUserRole, deleteUser } from "@/app/actions/admin"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface UserActionsProps {
  userId: number
  currentIsAdmin: boolean
  currentUserName: string
}

export function UserActions({ userId, currentIsAdmin, currentUserName }: UserActionsProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const onToggleRole = async () => {
    const action = currentIsAdmin ? "remove admin rights from" : "make admin";
    if (confirm(`Are you sure you want to ${action} ${currentUserName}?`)) {
        setIsPending(true)
        try {
            const result = await updateUserRole(userId, !currentIsAdmin);
            if (result.error) {
                alert(result.error);
            }
        } finally {
            setIsPending(false)
            router.refresh()
        }
    }
  }

  const onDelete = async () => {
    if (confirm(`Are you sure you want to delete user ${currentUserName}? This action cannot be undone.`)) {
        setIsPending(true)
        try {
            const result = await deleteUser(userId);
            if (result.error) {
                alert(result.error);
            }
        } finally {
            setIsPending(false)
            router.refresh()
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
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onToggleRole}>
          {currentIsAdmin ? (
            <>
                <ShieldOff className="mr-2 h-4 w-4 text-orange-500" /> Revoke Admin
            </>
          ) : (
            <>
                <Shield className="mr-2 h-4 w-4 text-blue-500" /> Make Admin
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <Trash2 className="mr-2 h-4 w-4" /> Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

