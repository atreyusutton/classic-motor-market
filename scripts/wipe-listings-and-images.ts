import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import path from 'path';

loadEnvConfig(path.resolve(process.cwd(), '.'));

const prisma = new PrismaClient();

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_IMAGES_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !token) {
  throw new Error('Missing Cloudflare creds: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_IMAGES_TOKEN or CLOUDFLARE_API_TOKEN');
}

function extractImageId(providerId: string): string | null {
  if (!providerId) return null;
  const parts = providerId.split('/');
  // providerId might already just be the image id
  return parts.length >= 2 ? parts[parts.length - 2] || parts[parts.length - 1] : providerId;
}

async function deleteCloudflareImage(imageId: string) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`CF delete failed for ${imageId}: ${res.status} ${res.statusText} ${body}`);
  }
}

async function main() {
  const media = await prisma.listingMedia.findMany({ select: { providerId: true } });
  console.log(`Found ${media.length} listing media records to delete`);

  let deleted = 0;
  let failed = 0;

  for (const { providerId } of media) {
    const imageId = extractImageId(providerId);
    if (!imageId) {
      failed++;
      console.warn(`Could not parse image id from providerId: ${providerId}`);
      continue;
    }
    try {
      await deleteCloudflareImage(imageId);
      deleted++;
    } catch (err) {
      failed++;
      console.warn(err instanceof Error ? err.message : String(err));
    }
  }

  console.log(`Cloudflare delete done. Deleted: ${deleted}, Failed: ${failed}`);

  // Clean database records (cascade will remove media and saved listings)
  const saved = await prisma.savedListing.deleteMany({});
  const mediaDelete = await prisma.listingMedia.deleteMany({});
  const listingsDelete = await prisma.listing.deleteMany({});

  console.log(`Deleted ${saved.count} saved listings, ${mediaDelete.count} media rows, ${listingsDelete.count} listings`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






