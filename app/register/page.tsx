import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { SiteContainer } from "@/components/layout/site-container"

export default function RegisterPage() {
  return (
    <div className="bg-page py-16">
      <SiteContainer className="flex justify-center">
        <div className="w-full max-w-xl border border-border-strong bg-card px-8 py-10">
          <p className="font-serif text-xs uppercase tracking-[0.5em] text-brand-gold">Membership Application</p>
          <h1 className="font-serif text-3xl text-brand-dark">Join Classic Motor Market</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-text-muted">
            $49 yearly dues · Includes your first published listing
          </p>
          <div className="mt-8 space-y-6">
            <RegisterForm />
            <p className="text-xs uppercase tracking-[0.35em] text-text-muted">
              Already part of the club?{" "}
              <Link href="/login" className="text-brand-dark underline underline-offset-4">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </SiteContainer>
    </div>
  )
}

