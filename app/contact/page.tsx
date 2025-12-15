import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SiteContainer } from "@/components/layout/site-container"

export default function ContactPage() {
  async function submitContact(formData: FormData) {
    "use server"

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string

    if (!name || !email || !message) return

    console.log("Contact Form Submission:", { name, email, message })
  }

  return (
    <div className="bg-page py-16">
      <SiteContainer className="max-w-2xl space-y-6">
        <div className="space-y-3">
          <p className="font-serif text-xs uppercase tracking-[0.5em] text-brand-gold">Correspondence</p>
          <h1 className="font-serif text-4xl text-brand-dark">Write to the Classic Motor Market team</h1>
          <p className="text-xs uppercase tracking-[0.35em] text-text-muted">
            Prefer email? reach us at{" "}
            <a href="mailto:atreyusutton@proton.me" className="text-brand-dark underline underline-offset-4">
              atreyusutton@proton.me
            </a>
          </p>
        </div>
        <Card className="border border-border-strong bg-card">
          <CardContent className="pt-8">
            <form action={submitContact} className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-[0.35em] text-text-muted">
                  Name
                </Label>
                <Input id="name" name="name" placeholder="Your Name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.35em] text-text-muted">
                  Email
                </Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message" className="text-xs uppercase tracking-[0.35em] text-text-muted">
                  Message
                </Label>
                <Textarea id="message" name="message" placeholder="How can we assist?" className="min-h-[180px]" required />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </SiteContainer>
    </div>
  )
}

