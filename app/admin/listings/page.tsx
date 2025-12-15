import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeaturedToggle } from "@/components/admin/featured-toggle"
import { ListingActions } from "@/components/listing/listing-actions"

import { generateListingSlug, formatCurrency } from "@/lib/utils"

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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Listings</h1>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1 min-w-0">
                  <Link href={generateListingSlug(listing as any)} className="block hover:underline">
                    <div className="font-medium text-base">{listing.year} {listing.make} {listing.model}</div>
                    <div className="text-xs text-muted-foreground font-mono">{listing.publicId}</div>
                  </Link>
                  <div className="text-sm font-semibold">{formatCurrency(listing.askingPrice)}</div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant={listing.listingStatus === 'active' ? 'default' : listing.listingStatus === 'sold' ? 'secondary' : 'outline'}>
                    {listing.listingStatus}
                  </Badge>
                  <Badge variant={listing.publishFeePaid ? "secondary" : "outline"}>
                    {listing.publishFeePaid ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Seller: </span>
                  <span>{listing.seller.username ? `@${listing.seller.username}` : listing.seller.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">{listing.seller.email}</div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <FeaturedToggle id={listing.id} isFeatured={listing.featured} />
                <ListingActions listingId={listing.id} status={listing.listingStatus} publishFeePaid={listing.publishFeePaid} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[60px]">ID</TableHead>
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
                      <Link href={generateListingSlug(listing as any)} className="block hover:underline">
                        <div className="font-medium">{listing.year} {listing.make} {listing.model}</div>
                        <div className="text-xs text-muted-foreground">{listing.publicId}</div>
                      </Link>
                    </TableCell>
                    <TableCell>{formatCurrency(listing.askingPrice)}</TableCell>
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
                        <ListingActions listingId={listing.id} status={listing.listingStatus} publishFeePaid={listing.publishFeePaid} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

