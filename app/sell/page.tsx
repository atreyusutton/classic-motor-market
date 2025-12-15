import { ListingWizard } from "@/components/listing/listing-wizard"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function SellPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login?callbackUrl=/sell")
  }

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">List Your Vehicle</h1>
        <p className="text-muted-foreground mt-2">
          Share your vehicle with our community of enthusiasts.
        </p>
      </div>
      <ListingWizard />
    </div>
  )
}

