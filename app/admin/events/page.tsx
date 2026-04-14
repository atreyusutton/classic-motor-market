import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EventForm } from "@/components/admin/event-form"
import { EventRowActions } from "@/components/admin/event-row-actions"
import { EventActiveToggle } from "@/components/admin/event-active-toggle"

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Active events show in the top ticker bar. Events are automatically removed one day after their date.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add new event</h2>
          <EventForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Short title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No events yet. Add one above.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-sm whitespace-normal break-words min-w-[320px]">{event.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{event.shortTitle || "—"}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <EventActiveToggle id={event.id} active={event.active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <EventRowActions
                        event={{
                          id: event.id,
                          title: event.title,
                          shortTitle: event.shortTitle,
                          date: event.date.toISOString(),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
