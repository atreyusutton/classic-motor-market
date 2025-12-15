"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cleanupOrphanedImages } from "@/app/actions/cleanup"
import { Loader2, Trash2, CheckCircle, AlertTriangle } from "lucide-react"

export function CleanupButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [lastMode, setLastMode] = useState<"scan" | "delete" | null>(null)

  const runCleanup = async (mode: "scan" | "delete") => {
    if (mode === "delete") {
      const ok = confirm("This will delete all orphaned Cloudflare images found in the most recent scan. Proceed?")
      if (!ok) return
    }

    setLoading(true)
    setResult(null)
    
    try {
      const res = await cleanupOrphanedImages(mode)
      setResult(res)
      setLastMode(mode)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-card w-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
           <h3 className="font-semibold text-lg">System Maintenance</h3>
           <p className="text-sm text-muted-foreground">Scan and remove orphaned Cloudflare images.</p>
        </div>
        <div className="flex gap-2 md:items-center">
          <Button
            onClick={() => runCleanup("scan")}
            disabled={loading}
            variant="outline"
            className="font-semibold shadow-sm hover:shadow md:min-w-[120px]"
          >
            {loading && lastMode === "scan" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Scan
          </Button>
          <Button
            onClick={() => runCleanup("delete")}
            disabled={loading}
            variant="outline"
            className="font-semibold shadow-sm hover:shadow md:min-w-[150px] border-red-500 text-red-600 hover:bg-red-50"
          >
            {loading && lastMode === "delete" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Delete orphans
          </Button>
        </div>
      </div>

      {result && (
        <div className={`p-4 rounded-md text-sm ${result.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
          {result.success ? (
             <div className="space-y-1">
               <div className="flex items-center gap-2 font-semibold">
                 <CheckCircle className="h-4 w-4" /> Cleanup Complete
               </div>
               <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2 text-xs">
                 <span>Database Images: {result.stats.dbImages}</span>
                 <span>Cloudflare Images: {result.stats.cfImages}</span>
                 <span>Orphans Found: {result.stats.orphansFound}</span>
                 <span className="font-bold text-red-600">Orphans Deleted: {result.stats.deleted}</span>
                 <span>Failed: {result.stats.failed}</span>
                 {result.sampleOrphanIds && result.sampleOrphanIds.length > 0 && (
                   <span className="col-span-2 text-muted-foreground">
                     Sample orphan IDs: {result.sampleOrphanIds.join(", ")}
                   </span>
                 )}
               </div>
             </div>
          ) : (
             <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {result.error}
             </div>
          )}
        </div>
      )}
    </div>
  )
}

