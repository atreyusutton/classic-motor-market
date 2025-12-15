import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserActions } from "@/components/admin/user-actions"

type AdminUsersPageProps = {
  searchParams?: { filter?: string }
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const filter = searchParams?.filter === "paid" ? "paid" : "all"

  const users = await prisma.user.findMany({
    where:
      filter === "paid"
        ? {
            membershipStatus: "member",
            membershipPaymentStatus: "paid",
          }
        : undefined,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <div className="inline-flex rounded-md border border-border bg-card p-1">
          <Button asChild size="sm" variant={filter === "all" ? "secondary" : "ghost"}>
            <Link href="/admin/users">All</Link>
          </Button>
          <Button asChild size="sm" variant={filter === "paid" ? "secondary" : "ghost"}>
            <Link href="/admin/users?filter=paid">Paid Members</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Paid Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="outline">Member</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.membershipStatus === "member" ? (
                      <Badge variant="secondary">Member</Badge>
                    ) : user.membershipStatus === "expiredMember" ? (
                      <Badge variant="outline">Expired</Badge>
                    ) : (
                      <Badge variant="outline">None</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.membershipPaymentStatus === "paid" ? (
                      <Badge variant="secondary">Paid</Badge>
                    ) : user.membershipPaymentStatus === "placeholder_confirmed" ? (
                      <Badge variant="default">Pending (Stripe)</Badge>
                    ) : (
                      <Badge variant="outline">Unpaid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions 
                        userId={user.id} 
                        currentIsAdmin={user.isAdmin} 
                        currentUserName={user.name || user.email}
                    />
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

