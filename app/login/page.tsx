import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { SiteContainer } from "@/components/layout/site-container"

export default function LoginPage() {
  return (
    <div className="bg-page py-16">
      <SiteContainer className="flex justify-center">
        <div className="w-full max-w-lg border border-border-strong bg-card px-8 py-10">
          <p className="font-serif text-xs uppercase tracking-[0.5em] text-brand-gold">Members</p>
          <h1 className="font-serif text-3xl text-brand-dark">Sign in to Classic Motor Market</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-text-muted">
            Use your email and password to access the private showroom
          </p>
          <div className="mt-8 space-y-6">
            <LoginForm />
            <p className="text-xs uppercase tracking-[0.35em] text-text-muted">
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

