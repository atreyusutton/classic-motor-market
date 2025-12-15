import { loadEnvConfig } from '@next/env';
import {
  ConditionGrade,
  ListingStatus,
  MediaProvider,
  MediaType,
  PrismaClient,
  PublishFeeMethod,
  TitleStatus,
} from '@prisma/client';
import { init as initCuid } from '@paralleldrive/cuid2';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

loadEnvConfig(path.resolve(process.cwd(), '.'));

type ParsedVehicle = {
  blockLabel: string;
  listingStatus?: ListingStatus;
  featured?: boolean;
  year?: number;
  make?: string;
  model?: string;
  vehicleIdentifier?: string;
  location?: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  exteriorColor?: string;
  interiorColorMaterial?: string;
  askingPrice?: number;
  conditionGrade?: ConditionGrade;
  titleStatus?: TitleStatus;
  carfaxAvailable?: boolean;
  optionsAndFeatures?: string;
  modifications?: string;
  vehicleHistory?: string;
  maintenanceHistory?: string;
  publishFeePaid?: boolean;
  publishFeePaidAt?: Date | null;
  publishFeeMethod?: PublishFeeMethod;
  publishedAt?: Date | null;
};

type LocalMedia = {
  filePath: string;
  sortOrder: number;
  isCover: boolean;
};

type UploadResult = {
  providerId: string;
  sortOrder: number;
  isCover: boolean;
  altText: string | null;
};

const prisma = new PrismaClient();
const createShortId = initCuid({ length: 8 });

const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMPORT_ROOT = path.resolve(PROJECT_ROOT, '..', 'bulk-import-vehicles');
const DATA_FILE = path.join(IMPORT_ROOT, 'bulk-import-vehicles.txt');

const REQUIRED_ENVS = ['DATABASE_URL', 'CLOUDFLARE_ACCOUNT_ID'] as const;

function getImagesToken(): string | undefined {
  return process.env.CLOUDFLARE_IMAGES_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
}

function ensureEnv() {
  const missing: string[] = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (!getImagesToken()) missing.push('CLOUDFLARE_IMAGES_TOKEN or CLOUDFLARE_API_TOKEN');
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

function normalizeBool(value?: string): boolean | undefined {
  if (value === undefined) return undefined;
  const v = value.trim().toLowerCase();
  if (['true', 'yes', '1'].includes(v)) return true;
  if (['false', 'no', '0'].includes(v)) return false;
  return undefined;
}

function normalizeInt(value?: string): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value.replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function normalizePriceDollars(value?: string): number | undefined {
  const n = normalizeInt(value);
  if (n === undefined || !Number.isFinite(n)) return undefined;
  return Math.round(n);
}

function normalizeText(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/\\n/g, '\n').trim();
}

function normalizePublishFeeMethod(value?: string): PublishFeeMethod | undefined {
  if (!value) return undefined;
  const v = value.trim().split(/\s+/)[0]?.toLowerCase();
  if (v === 'stripe') return PublishFeeMethod.stripe;
  if (v === 'placeholder_checkbox') return PublishFeeMethod.placeholder_checkbox;
  return undefined;
}

const KEY_MAP = {
  listingStatus: (v: string) => v as ListingStatus,
  featured: normalizeBool,
  year: normalizeInt,
  make: (v: string) => v,
  model: (v: string) => v,
  vehicleIdentifier: (v: string) => v,
  location: (v: string) => v,
  mileage: normalizeInt,
  engine: (v: string) => v,
  transmission: (v: string) => v,
  exteriorColor: (v: string) => v,
  interiorColorMaterial: (v: string) => v,
  askingPrice: normalizePriceDollars,
  conditionGrade: (v: string) => v as ConditionGrade,
  titleStatus: (v: string) => v as TitleStatus,
  carfaxAvailable: normalizeBool,
  optionsAndFeatures: normalizeText,
  modifications: normalizeText,
  vehicleHistory: normalizeText,
  maintenanceHistory: normalizeText,
  publishedAt: (v: string) => (v && v.toLowerCase() !== 'null' ? new Date(v) : null),
  publishFeePaid: normalizeBool,
  publishFeePaidAt: (v: string) => (v && v.toLowerCase() !== 'null' ? new Date(v) : null),
  publishFeeMethod: normalizePublishFeeMethod,
} as const;

const KNOWN_KEYS = Object.keys(KEY_MAP);

function slugifyVehicle(v: ParsedVehicle): string {
  const base = [v.year, v.make, v.model].filter(Boolean).join(' ');
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseVehicles(raw: string): ParsedVehicle[] {
  const blocks = raw.split(/Vehicle \d+:/g).slice(1); // drop leading junk
  const labels = [...raw.matchAll(/Vehicle (\d+):/g)].map((m) => m[0]);
  const multiLineKeys = new Set(['optionsAndFeatures', 'modifications', 'vehicleHistory', 'maintenanceHistory']);

  return blocks.map((block, idx) => {
    const lines = block.split('\n');
    const vehicle: ParsedVehicle = { blockLabel: labels[idx] ?? `Vehicle ${idx + 1}` };
    let currentKey: string | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line === '⸻') continue;
      const match = line.match(/^([A-Za-z][A-Za-z0-9]*)\s*:\s*(.*)$/);
      if (match && KNOWN_KEYS.includes(match[1])) {
        const key = match[1] as keyof typeof KEY_MAP;
        currentKey = key;
        const val = match[2];
        const parsed = KEY_MAP[key](val);
        // @ts-expect-error dynamic assign
        vehicle[key] = parsed;
      } else if (currentKey && multiLineKeys.has(currentKey)) {
        // Continuation of previous narrative key (multi-line text)
        // @ts-expect-error dynamic assign
        vehicle[currentKey] = `${vehicle[currentKey] ?? ''}\n${line}`.trim();
      }
    }

    // Normalize text fields after concatenation
    if (vehicle.optionsAndFeatures) {
      const normalized = normalizeText(vehicle.optionsAndFeatures);
      if (normalized !== undefined) vehicle.optionsAndFeatures = normalized;
    }
    if (vehicle.modifications) {
      const normalized = normalizeText(vehicle.modifications);
      if (normalized !== undefined) vehicle.modifications = normalized;
    }
    if (vehicle.vehicleHistory) {
      const normalized = normalizeText(vehicle.vehicleHistory);
      if (normalized !== undefined) vehicle.vehicleHistory = normalized;
    }
    if (vehicle.maintenanceHistory) {
      const normalized = normalizeText(vehicle.maintenanceHistory);
      if (normalized !== undefined) vehicle.maintenanceHistory = normalized;
    }

    return vehicle;
  });
}

async function getLocalMedia(slug: string): Promise<LocalMedia[]> {
  const folder = path.join(IMPORT_ROOT, slug);
  const stats = await stat(folder).catch(() => null);
  if (!stats || !stats.isDirectory()) {
    throw new Error(`Missing media folder: ${folder}`);
  }

  const entries = await readdir(folder);
  const files = entries
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return files.map((file, idx) => ({
    filePath: path.join(folder, file),
    sortOrder: idx + 1,
    isCover: idx === 0,
  }));
}

async function uploadImage(filePath: string): Promise<string> {
  ensureEnv();
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const token = getImagesToken();
  if (!token) throw new Error('Missing required env var: CLOUDFLARE_IMAGES_TOKEN or CLOUDFLARE_API_TOKEN');
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === '.jpg' || ext === '.jpeg'
      ? 'image/jpeg'
      : ext === '.png'
      ? 'image/png'
      : ext === '.webp'
      ? 'image/webp'
      : ext === '.gif'
      ? 'image/gif'
      : ext === '.svg'
      ? 'image/svg+xml'
      : 'application/octet-stream';

  const buffer = await readFile(filePath);
  const blob = new Blob([buffer], { type: mime });

  const form = new FormData();
  form.append('file', blob, path.basename(filePath));

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { success: boolean; result?: { id: string }; errors?: unknown };
  if (!json.success || !json.result?.id) {
    throw new Error(`Upload failed: ${JSON.stringify(json)}`);
  }
  return json.result.id;
}

function buildListingData(vehicle: ParsedVehicle, sellerId: number, uploads: UploadResult[] | LocalMedia[]) {
  const now = new Date();
  const publishedAt =
    vehicle.publishedAt ??
    (vehicle.listingStatus === ListingStatus.active ? now : null);

  return {
    publicId: createShortId(), // short id to keep slugs concise
    sellerId,
    listingStatus: vehicle.listingStatus ?? ListingStatus.draft,
    publishedAt,
    featured: vehicle.featured ?? false,
    publishFeePaid: vehicle.publishFeePaid ?? false,
    publishFeePaidAt: vehicle.publishFeePaidAt ?? null,
    publishFeeMethod: vehicle.publishFeeMethod ?? PublishFeeMethod.placeholder_checkbox,
    year: vehicle.year ?? null,
    make: vehicle.make ?? null,
    model: vehicle.model ?? null,
    vehicleIdentifier: vehicle.vehicleIdentifier ?? null,
    mileage: vehicle.mileage ?? null,
    location: vehicle.location ?? null,
    engine: vehicle.engine ?? null,
    transmission: vehicle.transmission ?? null,
    exteriorColor: vehicle.exteriorColor ?? null,
    interiorColorMaterial: vehicle.interiorColorMaterial ?? null,
    askingPrice: vehicle.askingPrice ?? null,
    optionsAndFeatures: vehicle.optionsAndFeatures ?? null,
    modifications: vehicle.modifications ?? null,
    conditionGrade: vehicle.conditionGrade ?? null,
    vehicleHistory: vehicle.vehicleHistory ?? null,
    maintenanceHistory: vehicle.maintenanceHistory ?? null,
    titleStatus: vehicle.titleStatus ?? null,
    carfaxAvailable: vehicle.carfaxAvailable ?? null,
    media: uploads.map((m) => ({
      type: MediaType.image,
      provider: MediaProvider.cloudflare_images,
      providerId: 'providerId' in m ? m.providerId : '',
      sortOrder: m.sortOrder,
      isCover: m.isCover,
      altText: 'altText' in m ? m.altText : null,
    })),
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const sellerEmailArg = argv.find((a) => a.startsWith('--seller-email='));
  const sellerEmail = sellerEmailArg ? sellerEmailArg.split('=')[1] : undefined;
  const dryRun = !argv.includes('--run');

  if (!sellerEmail) {
    throw new Error('Missing required flag: --seller-email=<email>');
  }

  const raw = await readFile(DATA_FILE, 'utf8');
  const vehicles = parseVehicles(raw);

  const seller = await prisma.user.findUnique({ where: { email: sellerEmail } });
  if (!seller) {
    throw new Error(`Seller not found for email ${sellerEmail}`);
  }

  console.log(`Parsed ${vehicles.length} vehicles. Dry-run: ${dryRun ? 'yes' : 'no'}`);

  for (const vehicle of vehicles) {
    const slug = slugifyVehicle(vehicle);
    let localMedia: LocalMedia[];
    try {
      localMedia = await getLocalMedia(slug);
    } catch (err) {
      console.warn(`Skipping ${vehicle.blockLabel} (${slug}) - ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }
    console.log(`\n${vehicle.blockLabel} -> slug: ${slug}`);
    console.log(`Images: ${localMedia.length} files`);

    if (dryRun) {
      console.log(
        JSON.stringify(
          {
            listing: {
              status: vehicle.listingStatus,
              featured: vehicle.featured,
              year: vehicle.year,
              make: vehicle.make,
              model: vehicle.model,
              askingPrice: vehicle.askingPrice,
            },
            mediaFiles: localMedia.map((m) => path.basename(m.filePath)),
          },
          null,
          2,
        ),
      );
      continue;
    }

    if (vehicle.vehicleIdentifier) {
      const existing = await prisma.listing.findFirst({ where: { vehicleIdentifier: vehicle.vehicleIdentifier } });
      if (existing) {
        console.log(`Skipping ${vehicle.blockLabel} (${slug}) - listing already exists with vehicleIdentifier ${vehicle.vehicleIdentifier}`);
        continue;
      }
    }

    const uploads: UploadResult[] = [];
    for (const media of localMedia) {
      const providerId = await uploadImage(media.filePath);
      uploads.push({
        providerId,
        sortOrder: media.sortOrder,
        isCover: media.isCover,
        altText: `${vehicle.year ?? ''} ${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim() || null,
      });
      console.log(`Uploaded ${path.basename(media.filePath)} -> ${providerId}`);
    }

    const listingData = buildListingData(vehicle, seller.id, uploads);
    await prisma.listing.create({
      data: {
        ...listingData,
        media: {
          create: listingData.media.map((m) => ({
            type: m.type,
            provider: m.provider,
            providerId: m.providerId,
            sortOrder: m.sortOrder,
            isCover: m.isCover,
            altText: m.altText,
          })),
        },
      },
    });

    console.log(`Inserted listing for ${vehicle.make} ${vehicle.model}`);
  }

  console.log('\nDone.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

