import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import { FeaturedToggle } from "@/components/admin/featured-toggle"
import { ListingActions } from "@/components/listing/listing-actions"

import { generateListingSlug, formatCurrencyFromCents } from "@/lib/utils"

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    include: {
      seller: {
        select: { email: true, name: true, username: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-mono text-xs">{listing.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{listing.year} {listing.make} {listing.model}</div>
                    <div className="text-xs text-muted-foreground">{listing.publicId}</div>
                  </TableCell>
                  <TableCell>{formatCurrencyFromCents(listing.askingPrice)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{listing.seller.username ? `@${listing.seller.username}` : listing.seller.name}</span>
                      <span className="text-xs text-muted-foreground">{listing.seller.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={listing.listingStatus === 'active' ? 'default' : listing.listingStatus === 'sold' ? 'secondary' : 'outline'}>
                      {listing.listingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={listing.publishFeePaid ? "secondary" : "outline"}>
                      {listing.publishFeePaid ? "Paid" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <FeaturedToggle id={listing.id} isFeatured={listing.featured} />
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={generateListingSlug(listing as any)}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/sell/${listing.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <ListingActions listingId={listing.id} status={listing.listingStatus} publishFeePaid={listing.publishFeePaid} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

