"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cleanupOrphanedImages } from "@/app/actions/cleanup"
import { Loader2, Trash2, CheckCircle, AlertTriangle } from "lucide-react"

export function CleanupButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const onCleanup = async () => {
    if (!confirm("This will scan ALL images in Cloudflare and delete any that are not linked in the database. Are you sure?")) return;
    
    setLoading(true)
    setResult(null)
    
    try {
      const res = await cleanupOrphanedImages()
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="font-semibold text-lg">System Maintenance</h3>
           <p className="text-sm text-muted-foreground">Scan and remove orphaned Cloudflare images.</p>
        </div>
        <Button onClick={onCleanup} disabled={loading} variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
          Run Cleanup
        </Button>
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
                 <span className="font-bold text-red-600">Orphans Deleted: {result.stats.deleted}</span>
                 <span>Failed: {result.stats.failed}</span>
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

