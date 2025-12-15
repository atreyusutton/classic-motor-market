import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Car, Settings, CreditCard, LogOut, Bookmark } from "lucide-react"
import { signOut } from "@/auth"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="font-semibold text-lg px-4 mb-2">My Account</div>
          <nav className="flex flex-col space-y-1">
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/account/listings">
                <Car className="mr-2 h-4 w-4" />
                My Listings
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/account/watchlist">
                <Bookmark className="mr-2 h-4 w-4" />
                Watchlist
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/account/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/account/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Membership
              </Link>
            </Button>
          </nav>
          <Separator />
          <div className="px-4">
             <form action={async () => {
               "use server"
               await signOut()
             }}>
               <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                 <LogOut className="mr-2 h-4 w-4" />
                 Sign Out
               </Button>
             </form>
          </div>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

