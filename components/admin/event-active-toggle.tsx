"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toggleEventActive } from "@/app/actions/events"

export function EventActiveToggle({ id, active }: { id: number; active: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const onChange = () => {
    startTransition(async () => {
      await toggleEventActive(id)
      router.refresh()
    })
  }

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={active}
        onChange={onChange}
        disabled={isPending}
        className="h-4 w-4 cursor-pointer"
      />
    </label>
  )
}
