"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAd, updateAd } from "@/app/actions/ads"
import { AD_PLACEMENTS, type AdPlacement, getPlacementConfig } from "@/lib/ad-config"
import { getCloudflareImageUrl } from "@/lib/utils"

type Initial = {
  id?: number
  name?: string
  placement?: AdPlacement
  url?: string
  desktopImageId?: string
  mobileImageId?: string
  active?: boolean
}

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body: fd })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || "Upload failed")
  return data.id as string
}

function ImageField({
  label,
  expectedSize,
  value,
  onChange,
}: {
  label: string
  expectedSize: { width: number; height: number }
  value: string
  onChange: (id: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErr(null)
    setUploading(true)
    try {
      const id = await uploadImage(file)
      onChange(id)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground mb-2">
        Recommended: <span className="font-mono">{expectedSize.width}×{expectedSize.height}</span>
      </p>
      {value && (
        <div className="mb-2">
          <img src={getCloudflareImageUrl(value, "public")} alt="" className="max-h-32 rounded border" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="block w-full cursor-pointer rounded-md border border-dashed border-brand-dark/30 bg-brand-dark/5 text-sm text-muted-foreground file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-dark file:px-4 file:py-2 file:text-sm file:font-semibold file:uppercase file:tracking-wider file:text-white hover:file:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
      />
      {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
      {!uploading && !value && <p className="text-xs text-muted-foreground mt-1">No file selected yet.</p>}
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
    </div>
  )
}

export function AdForm({
  initial,
  onDone,
}: {
  initial?: Initial
  onDone?: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initial?.name ?? "")
  const [placement, setPlacement] = useState<AdPlacement>(initial?.placement ?? "home")
  const [url, setUrl] = useState(initial?.url ?? "")
  const [desktopImageId, setDesktopImageId] = useState(initial?.desktopImageId ?? "")
  const [mobileImageId, setMobileImageId] = useState(initial?.mobileImageId ?? "")
  const [active, setActive] = useState(initial?.active ?? true)

  const cfg = getPlacementConfig(placement)
  const isEdit = typeof initial?.id === "number"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!desktopImageId || !mobileImageId) {
      setError("Both desktop and mobile images are required.")
      return
    }
    startTransition(async () => {
      const payload = { name, placement, url, desktopImageId, mobileImageId, active }
      const result = isEdit ? await updateAd(initial!.id!, payload) : await createAd(payload)
      if (result && "error" in result && result.error) {
        setError(result.error)
        return
      }
      if (!isEdit) {
        setName(""); setUrl(""); setDesktopImageId(""); setMobileImageId(""); setActive(true)
      }
      router.refresh()
      onDone?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="name">Name (internal label)</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hagerty Insurance – Spring 2026" required />
      </div>

      <div>
        <Label htmlFor="placement">Placement</Label>
        <select
          id="placement"
          value={placement}
          onChange={(e) => setPlacement(e.target.value as AdPlacement)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          {AD_PLACEMENTS.map((p) => (
            <option key={p.placement} value={p.placement}>{p.label}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">{cfg.description}</p>
      </div>

      <div>
        <Label htmlFor="url">Click-through URL</Label>
        <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required />
      </div>

      <ImageField label="Desktop image" expectedSize={cfg.desktop} value={desktopImageId} onChange={setDesktopImageId} />
      <ImageField label="Mobile image" expectedSize={cfg.mobile} value={mobileImageId} onChange={setMobileImageId} />

      <div className="sm:col-span-2 flex items-center gap-2">
        <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />
        <Label htmlFor="active" className="cursor-pointer">Active</Label>
      </div>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <div className="sm:col-span-2 flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Save changes" : "Add advertisement"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone} disabled={isPending}>Cancel</Button>
        )}
      </div>
    </form>
  )
}
