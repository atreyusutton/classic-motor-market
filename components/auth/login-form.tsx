"use client"

import { useFormStatus } from "react-dom"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full h-11 sm:h-12 text-sm sm:text-base" type="submit" disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  )
}

export function LoginForm() {
  const [errorMessage, dispatch] = useActionState(loginAction, undefined)

  return (
    <form action={dispatch} className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">Email</Label>
        <Input id="email" name="email" type="email" placeholder="m@example.com" required className="h-11 sm:h-12" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm">Password</Label>
        <Input id="password" name="password" type="password" required className="h-11 sm:h-12" />
      </div>
      {errorMessage && (
        <div className="text-red-500 text-sm px-1">{errorMessage}</div>
      )}
      <SubmitButton />
    </form>
  )
}

