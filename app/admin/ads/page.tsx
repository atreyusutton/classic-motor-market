import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AdForm } from "@/components/admin/ad-form"
import { AdRowActions } from "@/components/admin/ad-row-actions"
import { AdActiveToggle } from "@/components/admin/ad-active-toggle"
import { AD_PLACEMENTS, getPlacementConfig } from "@/lib/ad-config"
import { getCloudflareImageUrl } from "@/lib/utils"

export default async function AdminAdsPage() {
  const ads = await prisma.ad.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advertising</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage sponsored placements. Each advertisement requires a desktop and mobile image.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-1">Placement specs</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share these pixel dimensions with advertisers.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {AD_PLACEMENTS.map((p) => (
              <div key={p.placement} className="rounded-md border p-4 text-sm">
                <div className="font-semibold">{p.label}</div>
                <div className="text-muted-foreground text-xs mt-1 mb-2">{p.description}</div>
                <div className="text-xs">
                  <div>Desktop: <span className="font-mono">{p.desktop.width}×{p.desktop.height}</span></div>
                  <div>Mobile: <span className="font-mono">{p.mobile.width}×{p.mobile.height}</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add new advertisement</h2>
          <AdForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Desktop</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No advertisements yet. Add one above.
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => {
                  const cfg = getPlacementConfig(ad.placement)
                  return (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium text-sm">{ad.name}</TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline">{cfg.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <img
                          src={getCloudflareImageUrl(ad.desktopImageId, "public")}
                          alt=""
                          className="h-12 w-auto rounded border"
                        />
                      </TableCell>
                      <TableCell>
                        <img
                          src={getCloudflareImageUrl(ad.mobileImageId, "public")}
                          alt=""
                          className="h-12 w-auto rounded border"
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                        <a href={ad.url} target="_blank" rel="noreferrer" className="underline">
                          {ad.url}
                        </a>
                      </TableCell>
                      <TableCell>
                        <AdActiveToggle id={ad.id} active={ad.active} />
                      </TableCell>
                      <TableCell className="text-right">
                        <AdRowActions
                          ad={{
                            id: ad.id,
                            name: ad.name,
                            placement: ad.placement,
                            url: ad.url,
                            desktopImageId: ad.desktopImageId,
                            mobileImageId: ad.mobileImageId,
                            active: ad.active,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
