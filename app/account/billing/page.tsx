import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, CreditCard } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { UpgradeButton } from "@/components/billing/upgrade-button"

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // Reload user to get latest membership status (real app would use webhooks to update this)
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) }
  })

  // Mock checking for success param to simulate webhook update for demo
  const params = await searchParams
  const isSuccess = params.success === "true"
  
  if (isSuccess && user && user.membershipStatus === 'none') {
      // DEMO ONLY: Auto-upgrade user if they return with ?success=true
      // In production, NEVER do this. Rely on Stripe Webhooks.
      await prisma.user.update({
          where: { id: user.id },
          data: { 
              membershipStatus: 'member',
              membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          }
      })
      // Force refresh data
      redirect("/account/billing")
  }

  const isMember = user?.membershipStatus === 'member'

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Membership & Billing</h1>

      {isMember ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <CardTitle className="text-green-800">Active Membership</CardTitle>
            </div>
            <CardDescription>
                You are a full member of Classic Motor Market.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-sm text-green-800 mb-4">
               Your membership is active until <strong>{user?.membershipExpiresAt?.toLocaleDateString()}</strong>.
             </div>
             <div className="grid gap-2">
               <div className="flex items-center gap-2 text-sm">
                 <CheckCircle className="h-4 w-4 text-green-600" /> Contact sellers directly
               </div>
               <div className="flex items-center gap-2 text-sm">
                 <CheckCircle className="h-4 w-4 text-green-600" /> 48-hour early access to listings
               </div>
               <div className="flex items-center gap-2 text-sm">
                 <CheckCircle className="h-4 w-4 text-green-600" /> Unlimited vehicle listings ($20/ea)
               </div>
             </div>
          </CardContent>
          <CardFooter>
             <Button variant="outline" className="bg-white hover:bg-gray-50 text-red-600 border-red-200 hover:border-red-300">
               Cancel Membership
             </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Free Account</CardTitle>
            <CardDescription>Upgrade to unlock full platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                    You are currently on a free account. You can browse listings but cannot contact sellers or view full details until you upgrade.
                </div>
            </div>
            
            <div className="grid gap-3">
               <div className="flex justify-between items-center border-b pb-3">
                 <span>Yearly Membership</span>
                 <span className="font-bold">$49.00 / year</span>
               </div>
               <ul className="space-y-2 text-sm text-muted-foreground">
                 <li>• Direct Seller Contact (Email Relay)</li>
                 <li>• View Full VINs</li>
                 <li>• Priority Support</li>
                 <li>• First Listing Included Free</li>
               </ul>
            </div>
          </CardContent>
          <CardFooter>
            <UpgradeButton />
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved cards</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-sm text-muted-foreground italic">
             No payment methods saved.
           </div>
        </CardContent>
        <CardFooter>
           <Button variant="outline" disabled>
             <CreditCard className="mr-2 h-4 w-4" />
             Add Payment Method
           </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

