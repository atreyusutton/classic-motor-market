import { SiteContainer } from "@/components/layout/site-container"

export const metadata = {
  title: "FAQ | Classic Motor Market",
}

export default function FAQPage() {
  return (
    <SiteContainer className="py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark mb-8">
        Frequently Asked Questions
      </h1>
    </SiteContainer>
  )
}
