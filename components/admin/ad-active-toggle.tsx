"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toggleAdActive } from "@/app/actions/ads"

export function AdActiveToggle({ id, active }: { id: number; active: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const onChange = () => {
    startTransition(async () => {
      await toggleAdActive(id)
      router.refresh()
    })
  }

  return (
    <input
      type="checkbox"
      checked={active}
      onChange={onChange}
      disabled={isPending}
      className="h-4 w-4 cursor-pointer"
    />
  )
}
