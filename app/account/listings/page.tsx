import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import Image from "next/image"
import { generateListingSlug, formatCurrency, getCloudflareImageUrl } from "@/lib/utils"
import { CarFront } from "lucide-react"
import { ListingActions } from "@/components/listing/listing-actions"

export default async function AccountListingsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const listings = await prisma.listing.findMany({
    where: {
      sellerId: parseInt(session.user.id)
    },
    include: {
      media: {
        where: {
          isCover: true
        },
        take: 1
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Listings</CardTitle>
            <CardDescription>Manage your vehicle showcases</CardDescription>
          </div>
          <Button asChild>
            <Link href="/sell">List New Vehicle</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Publish Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <Link href={generateListingSlug(listing as any)} className="group relative block h-12 w-16 rounded overflow-hidden ring-1 ring-border hover:ring-2 hover:ring-primary transition">
                    {listing.media[0] ? (
                      <Image 
                        src={getCloudflareImageUrl(listing.media[0].providerId)} 
                        alt="Vehicle thumbnail" 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">
                        <CarFront className="h-5 w-5" />
                      </div>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={generateListingSlug(listing as any)} className="hover:underline">
                    {listing.year} {listing.make} {listing.model}
                  </Link>
                </TableCell>
                <TableCell>{formatCurrency(listing.askingPrice)}</TableCell>
                <TableCell>
                  <Badge variant={listing.listingStatus === 'active' ? 'default' : 'secondary'}>
                    {listing.listingStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={listing.publishFeePaid ? "secondary" : "outline"}>
                    {listing.publishFeePaid ? "Paid" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ListingActions listingId={listing.id} status={listing.listingStatus} publishFeePaid={listing.publishFeePaid} />
                </TableCell>
              </TableRow>
            ))}
            {listings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  You haven't listed any vehicles yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

