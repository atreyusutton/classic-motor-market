"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Cloudflare API types
interface CFImage {
  id: string
  filename: string
  uploaded: string
  requireSignedURLs: boolean
  variants: string[]
}

interface CFListResponse {
  result: {
    images: CFImage[]
  }
  success: boolean
  errors: any[]
  messages: any[]
}

export async function cleanupOrphanedImages() {
  const session = await auth()
  
  // 1. Verify Admin Access
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized: Admin access required" }
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN

  if (!accountId || !token) {
    return { error: "Cloudflare credentials missing" }
  }

  try {
    // 2. Fetch all known images from our Database
    // We only need the providerId (which usually contains the full URL)
    const dbMedia = await prisma.listingMedia.findMany({
      select: { providerId: true }
    })
    
    // Extract just the IDs from the DB URLs
    // Cloudflare URLs format: https://imagedelivery.net/<hash>/<id>/<variant>
    const dbImageIds = new Set(
      dbMedia.map(m => {
        const parts = m.providerId.split('/')
        return parts.length >= 2 ? parts[parts.length - 2] : null
      }).filter(Boolean)
    )

    console.log(`Found ${dbImageIds.size} images in database.`)

    // 3. Fetch all images from Cloudflare
    // Note: CF API is paginated. For a full robust solution, you'd loop pages.
    // Here we fetch the first 1000 (CF limit per page might differ, usually 100)
    // We'll implement a simple loop for safety.
    
    let allCfImages: CFImage[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1?page=${page}&per_page=100`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )

        if (!response.ok) {
           const text = await response.text();
           console.error("CF List Fetch Error Status:", response.status, text);
           throw new Error(`Cloudflare API Error: ${response.statusText}`);
        }

        const data: CFListResponse = await response.json()
        
        if (!data.success) {
            console.error("CF List Error:", data.errors)
            // Break loop but continue processing what we found so far? 
            // Better to throw error as partial cleanup might be confusing.
            throw new Error(`Cloudflare API Logic Error: ${JSON.stringify(data.errors)}`);
        }

        allCfImages = [...allCfImages, ...data.result.images]
        
        // If we got fewer than requested, we're done
        if (data.result.images.length < 100) {
            hasMore = false
        } else {
            page++
        }
    }
    
    console.log(`Found ${allCfImages.length} images in Cloudflare.`)

    // 4. Find Orphaned Images (In CF but NOT in DB)
    const orphans = allCfImages.filter(cfImg => !dbImageIds.has(cfImg.id))

    console.log(`Found ${orphans.length} orphaned images to delete.`)

    // 5. Delete Orphans
    let deletedCount = 0
    const errors = []

    // Process in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < orphans.length; i += batchSize) {
        const batch = orphans.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (img) => {
            try {
                const res = await fetch(
                    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${img.id}`,
                    {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )
                if (res.ok) deletedCount++
                else errors.push(img.id)
            } catch (e) {
                errors.push(img.id)
            }
        }))
    }

    return { 
        success: true, 
        stats: {
            dbImages: dbImageIds.size,
            cfImages: allCfImages.length,
            orphansFound: orphans.length,
            deleted: deletedCount,
            failed: errors.length
        }
    }

  } catch (error: any) {
    console.error("Cleanup error:", error)
    return { error: `Failed to perform cleanup: ${error.message || String(error)}` }
  }
}

