"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, Upload, Move } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn, getCloudflareImageUrl } from "@/lib/utils"

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  maxFiles?: number
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  maxFiles = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  )

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true)
      const newUrls: string[] = []

      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        newUrls.push(data.id || data.url)
      }

      onChange([...value, ...newUrls])
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }, [value, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    disabled: disabled || isUploading || value.length >= maxFiles,
    maxFiles: maxFiles - value.length
  })

  const onRemove = async (providerId: string) => {
    try {
      // Optimistically remove from UI first
      onChange(value.filter((current) => current !== providerId))

      // Call API to delete from Cloudflare
      await fetch("/api/upload", {
        method: "DELETE",
        body: JSON.stringify({ id: providerId }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error("Delete error:", error)
      // We don't revert UI because even if API fails, user wanted it gone from UI.
      // Ideally we'd show a toast error but this is "good enough" for cleanup.
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = value.findIndex((url) => url === active.id)
    const newIndex = value.findIndex((url) => url === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onChange(arrayMove(value, oldIndex, newIndex))
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={value}>
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {value.map((url) => (
              <SortableThumbnail
                key={url}
                id={url}
                url={url}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-10 hover:bg-muted/50 transition cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground",
            isDragActive && "border-primary bg-muted",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="p-4 rounded-full bg-muted">
             {isUploading ? (
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
             ) : (
               <Upload className="h-6 w-6" />
             )}
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm">
              SVG, PNG, JPG or GIF (max {maxFiles} photos)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function SortableThumbnail({ id, url, onRemove }: { id: string; url: string; onRemove: (url: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const displayUrl = getCloudflareImageUrl(url)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative aspect-[4/3] group rounded-md overflow-hidden bg-muted border",
        isDragging && "z-20 shadow-lg ring-2 ring-primary/50"
      )}
    >
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
        <Button
          type="button"
          onClick={() => onRemove(url)}
          variant="destructive"
          size="icon"
          onPointerDown={(e) => e.stopPropagation()}
          className="h-6 w-6 opacity-80 hover:opacity-100 group-hover:opacity-100 transition-opacity shadow-sm group-hover:bg-white group-hover:text-red-600 group-hover:hover:text-red-700"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-black/30 opacity-0 group-hover:opacity-80 transition-opacity flex items-center justify-center z-10">
        <Move className="h-6 w-6 text-white drop-shadow" />
      </div>
      <Image
        fill
        className="object-cover z-0"
        alt="Vehicle image"
        src={displayUrl}
      />
    </div>
  )
}
