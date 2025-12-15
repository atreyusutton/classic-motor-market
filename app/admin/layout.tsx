import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, Users, Car, LogOut } from "lucide-react"
import { signOut } from "@/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    redirect("/") // Or unauthorized page
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-muted/40 border-r shrink-0 hidden md:block">
        <div className="h-16 flex items-center px-6 border-b font-bold text-lg">
          Admin Console
        </div>
        <nav className="p-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/listings">
              <Car className="mr-2 h-4 w-4" />
              Listings
            </Link>
          </Button>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
           <form action={async () => {
             "use server"
             await signOut()
           }}>
             <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
               <LogOut className="mr-2 h-4 w-4" />
               Sign Out
             </Button>
           </form>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

