"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const ACK_KEY = "cmm_disclaimer_ack_v1"

interface DisclaimerGateProps {
  children: React.ReactNode
}

export function DisclaimerGate({ children }: DisclaimerGateProps) {
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(ACK_KEY) : null
    setHasAcknowledged(Boolean(stored))
  }, [])

  const handleAcknowledge = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACK_KEY, new Date().toISOString())
    }
    setHasAcknowledged(true)
  }

  if (hasAcknowledged === null) {
    return null
  }

  if (hasAcknowledged) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-10 text-center">
        <div className="space-y-6 rounded-2xl border bg-card p-8 shadow-lg">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Important Legal Notice</p>
            <h1 className="text-2xl font-bold">Classic Motor Market - Development Version</h1>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground text-left">
            <div>
              <p className="font-semibold text-foreground">Development Version</p>
              <p>
                This site is currently under active development and is intended for testing and demonstration purposes only.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Images & Content</p>
              <p>
                All vehicle media and descriptions may be placeholders or test data. They are not representative of real vehicles for sale.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Transactions</p>
              <p>
                Commercial transactions are disabled. Pricing, availability, and purchase options are for demonstration purposes only.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Data & Privacy</p>
              <p>
                Do not submit real personal or financial data. Test data may be reset without notice and is not guaranteed to be secure.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Functionality</p>
              <p>
                Features may be incomplete or change without notice. This experience is not representative of the final product.
              </p>
            </div>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <p>
              By selecting &quot;I Understand - Enter Development Site&quot;, you acknowledge this is a development version and agree to use it for testing and evaluation only.
            </p>
            <Button onClick={handleAcknowledge} className="w-full">
              I Understand - Enter Development Site
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} Classic Motor Market · Development Version</p>
        </div>
      </div>
    </div>
  )
}




