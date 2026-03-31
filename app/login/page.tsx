import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { SiteContainer } from "@/components/layout/site-container"
import { AlertCircle } from "lucide-react"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const message = params.message as string | undefined

  return (
    <div className="bg-page py-16">
      <SiteContainer className="flex justify-center">
        <div className="w-full max-w-lg bg-card px-8 py-10">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-brand-gold">Members</p>
          <h1 className="font-serif text-3xl text-brand-dark">Sign in to Classic Motor Market</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-text-muted">
            Use your email and password to access the private showroom
          </p>
          
          {message && (
            <div className="mt-6 rounded-md border border-brand-gold/30 bg-brand-gold/10 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-brand-dark">{message}</p>
                <p className="text-xs text-brand-dark/70">
                  Members get 10-minute early access to all new listings.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-8 space-y-6">
            <LoginForm />
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
              Need access?{" "}
              <Link href="/register" className="text-brand-dark underline underline-offset-4">
                Become a member
              </Link>
            </p>
          </div>
        </div>
      </SiteContainer>
    </div>
  )
}

