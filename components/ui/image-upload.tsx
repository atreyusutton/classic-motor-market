"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
        newUrls.push(data.url)
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

  const onRemove = async (url: string) => {
    try {
      // Optimistically remove from UI first
      onChange(value.filter((current) => current !== url))

      // Call API to delete from Cloudflare
      await fetch("/api/upload", {
        method: "DELETE",
        body: JSON.stringify({ url }),
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

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= value.length) return
    const updated = [...value]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    onChange(updated)
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url, index) => (
          <div key={url} className="relative aspect-[4/3] group rounded-md overflow-hidden bg-muted border">
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6 bg-white/90 text-foreground"
                  onClick={(e) => {
                    e.preventDefault()
                    moveImage(index, "up")
                  }}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6 bg-white/90 text-foreground"
                  onClick={(e) => {
                    e.preventDefault()
                    moveImage(index, "down")
                  }}
                  disabled={index === value.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Vehicle image"
              src={url}
            />
          </div>
        ))}
      </div>
      
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
