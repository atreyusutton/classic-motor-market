// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) {
    console.error("Missing Cloudflare credentials");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const cfFormData = new FormData();
  cfFormData.append("file", file);

  // Determine endpoint based on file type
  // Note: For full video support, you should use Cloudflare Stream which has a different endpoint and response structure.
  // This implementation focuses on Cloudflare Images as requested.
  // If you have Stream enabled, you can uncomment/modify the logic below.
  
  const isVideo = file.type.startsWith("video/");
  if (isVideo) {
     // Placeholder for Stream implementation
     // const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`;
     // ...
     return NextResponse.json({ error: "Video upload requires Cloudflare Stream configuration" }, { status: 501 });
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: cfFormData,
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error("Cloudflare upload failed:", data.errors);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const imageId = data.result.id;
    const variants = data.result.variants as string[];
    // Assuming the first variant is a usable public URL or we construct it.
    // Cloudflare Images usually provides a 'public' variant or you configure delivery.
    // For now, we'll return the ID and a public URL if available, or construct one.
    // Standard format: https://imagedelivery.net/<account_hash>/<image_id>/<variant_name>
    
    // We'll use the 'public' variant by default if not specified
    const publicUrl = variants.find(v => v.endsWith('/public')) || variants[0];

    return NextResponse.json({ 
      success: true, 
      id: imageId,
      url: publicUrl 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await request.json();
  
  // Extract Cloudflare Image ID from URL
  // URL format: https://imagedelivery.net/<account_hash>/<image_id>/<variant>
  const parts = url.split('/');
  const imageId = parts[parts.length - 2]; 

  if (!imageId) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  try {
      const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
          {
              method: "DELETE",
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          }
      );
      
      const data = await response.json();
      
      if (!data.success) {
           return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
  } catch (error) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
