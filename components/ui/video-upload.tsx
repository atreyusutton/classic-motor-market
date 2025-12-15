"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload, FileVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VideoUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  maxFiles?: number
}

export function VideoUpload({
  value,
  onChange,
  disabled,
  maxFiles = 5
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true)
      const newUrls: string[] = []

      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append("file", file)

        // TODO: Update this endpoint to handle video uploads (e.g., Cloudflare Stream)
        // For now, we'll try the same upload endpoint but it might need adjustment
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
      alert("Failed to upload video")
    } finally {
      setIsUploading(false)
    }
  }, [value, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': [],
      'video/quicktime': [], // MOV
      'video/webm': []
    },
    disabled: disabled || isUploading || value.length >= maxFiles,
    maxFiles: maxFiles - value.length
  })

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url))
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {value.map((url) => (
          <div key={url} className="relative aspect-video group rounded-md overflow-hidden bg-muted border">
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <video
              className="w-full h-full object-cover"
              controls
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
              MP4, MOV (max {maxFiles} videos)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

