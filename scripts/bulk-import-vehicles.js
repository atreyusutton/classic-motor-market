#!/usr/bin/env node
/**
 * Bulk Vehicle Import Script
 * 
 * This script imports vehicles from a text file and uploads their images to Cloudflare.
 * 
 * Usage:
 *   node scripts/bulk-import-vehicles.js <data-file> <images-dir> <seller-email>
 * 
 * Example:
 *   node scripts/bulk-import-vehicles.js \
 *     /path/to/vehicles.txt \
 *     /path/to/images \
 *     seller@example.com
 * 
 * Data file format:
 *   See example in /Users/atreyu/Documents/GitHub/cmm-docs/vehicles/bulk-import-vehicles.txt
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { Blob } = require('buffer')

const prisma = new PrismaClient()

// Parse command line arguments
const args = process.argv.slice(2)
if (args.length < 3) {
  console.error('Usage: node bulk-import-vehicles.js <data-file> <images-dir> <seller-email>')
  process.exit(1)
}

const [DATA_FILE, IMAGES_DIR, SELLER_EMAIL] = args

// Cloudflare credentials from environment
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
  console.error('❌ Missing Cloudflare credentials in environment variables')
  console.error('   Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN')
  process.exit(1)
}

// Condition mapping
const conditionMap = {
  'show_perfect': 'show_car',
  'local_hero': 'show_car',
  'driver': 'driver',
  'it_runs': 'it_runs',
  'project': 'project'
}

// Title status mapping
const titleStatusMap = {
  'Clean': 'clean',
  'Salvage': 'salvage',
  'Stolen': 'stolen',
  'Lien': 'lien',
  'Flood': 'flood'
}

// Parse vehicle data from text file
function parseVehicleData(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const vehicles = []
  const sections = content.split(/\n---\n/)
  
  for (const section of sections) {
    if (!section.trim() || section.startsWith('#')) continue
    
    const vehicle = {}
    const lines = section.split('\n')
    
    for (const line of lines) {
      if (!line.trim() || line.startsWith('#') || line.startsWith('Vehicle ')) continue
      
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) continue
      
      const key = line.substring(0, colonIndex).trim()
      let value = line.substring(colonIndex + 1).trim()
      
      if (key && value) {
        if (value.startsWith('[')) {
          try {
            vehicle[key] = JSON.parse(value)
          } catch (e) {
            vehicle[key] = value
          }
        } else if (value === 'true') {
          vehicle[key] = true
        } else if (value === 'false') {
          vehicle[key] = false
        } else if (key === 'year' || key === 'mileage' || key === 'price') {
          vehicle[key] = parseInt(value)
        } else {
          vehicle[key] = value
        }
      }
    }
    
    if (Object.keys(vehicle).length > 0) {
      vehicles.push(vehicle)
    }
  }
  
  return vehicles
}

// Generate slug from vehicle info
function generateSlug(year, make, model) {
  return `${year}-${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Upload image to Cloudflare
async function uploadImageToCloudflare(imagePath) {
  const fileBuffer = fs.readFileSync(imagePath)
  const fileName = path.basename(imagePath)
  const blob = new Blob([fileBuffer], { type: 'image/webp' })
  
  const formData = new FormData()
  formData.append('file', blob, fileName)

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: formData,
    }
  )

  const data = await response.json()

  if (!data.success) {
    throw new Error(`Cloudflare upload failed: ${JSON.stringify(data.errors)}`)
  }

  return {
    id: data.result.id,
    url: data.result.variants[0]
  }
}

// Find images for a vehicle
function findVehicleImages(vehicleSlug) {
  const vehicleDir = path.join(IMAGES_DIR, vehicleSlug)
  
  if (!fs.existsSync(vehicleDir)) {
    console.warn(`⚠️  Directory not found: ${vehicleDir}`)
    return []
  }
  
  const files = fs.readdirSync(vehicleDir)
  return files
    .filter(f => f.match(/\.(webp|jpg|jpeg|png)$/i))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '999')
      const numB = parseInt(b.match(/\d+/)?.[0] || '999')
      return numA - numB
    })
    .map(f => path.join(vehicleDir, f))
}

// Build vehicle history from data
function buildVehicleHistory(vehicle) {
  const sections = []
  
  if (vehicle.paint_condition) {
    sections.push(`**Paint Condition:**\n${vehicle.paint_condition}`)
  }
  if (vehicle.interior_condition) {
    sections.push(`**Interior Condition:**\n${vehicle.interior_condition}`)
  }
  if (vehicle.engine_condition) {
    sections.push(`**Engine Condition:**\n${vehicle.engine_condition}`)
  }
  if (vehicle.mechanical_condition) {
    sections.push(`**Mechanical Condition:**\n${vehicle.mechanical_condition}`)
  }
  if (vehicle.tire_condition) {
    sections.push(`**Tire Condition:**\n${vehicle.tire_condition}`)
  }
  if (vehicle.ownership_duration || vehicle.total_owners) {
    let ownershipInfo = '**Ownership:**\n'
    if (vehicle.total_owners) ownershipInfo += `Total owners: ${vehicle.total_owners}\n`
    if (vehicle.owner_position) ownershipInfo += `${vehicle.owner_position}\n`
    if (vehicle.ownership_duration) ownershipInfo += `Current ownership: ${vehicle.ownership_duration} years`
    sections.push(ownershipInfo)
  }
  if (vehicle.previous_owner_details) {
    sections.push(`**Previous Owner:**\n${vehicle.previous_owner_details}`)
  }
  if (vehicle.rust_or_damage) {
    sections.push(`**Rust/Damage:**\n${vehicle.rust_or_damage}`)
  }
  if (vehicle.accidents) {
    sections.push(`**Accident History:**\n${vehicle.accidents}`)
  }
  
  return sections.join('\n\n')
}

// Build maintenance history
function buildMaintenanceHistory(vehicle) {
  const sections = []
  
  if (vehicle.maintenance_history) {
    sections.push(`**Service History:**\n${vehicle.maintenance_history}`)
  }
  if (vehicle.maintenance_documentation) {
    sections.push(`**Documentation:**\n${vehicle.maintenance_documentation}`)
  }
  
  return sections.join('\n\n')
}

// Create listing with images
async function createListing(seller, vehicleData) {
  console.log(`\n📝 Creating: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`)
  
  const slug = generateSlug(vehicleData.year, vehicleData.make, vehicleData.model)
  const imageFiles = findVehicleImages(slug)
  
  if (imageFiles.length === 0) {
    console.warn(`   ⚠️  No images found`)
  } else {
    console.log(`   Found ${imageFiles.length} images`)
  }
  
  const conditionGrade = conditionMap[vehicleData.condition] || 'driver'
  const titleStatus = titleStatusMap[vehicleData.title_status] || 'clean'
  
  const listingData = {
    publicId: require('crypto').randomUUID(),
    sellerId: seller.id,
    listingStatus: vehicleData.status === 'active' ? 'active' : 'draft',
    publishedAt: vehicleData.status === 'active' ? new Date() : null,
    featured: vehicleData.featured || false,
    publishFeePaid: true,
    publishFeePaidAt: new Date(),
    publishFeeMethod: 'placeholder_checkbox',
    
    year: vehicleData.year,
    make: vehicleData.make,
    model: vehicleData.model,
    vehicleIdentifier: vehicleData.vin,
    mileage: vehicleData.mileage,
    location: vehicleData.location,
    engine: vehicleData.engine,
    transmission: vehicleData.transmission,
    exteriorColor: vehicleData.exterior_color,
    interiorColorMaterial: vehicleData.interior_color_material,
    askingPrice: vehicleData.price,
    
    optionsAndFeatures: Array.isArray(vehicleData.key_features) 
      ? vehicleData.key_features.join('\n') 
      : vehicleData.key_features,
    modifications: vehicleData.modifications,
    conditionGrade: conditionGrade,
    vehicleHistory: buildVehicleHistory(vehicleData),
    maintenanceHistory: buildMaintenanceHistory(vehicleData),
    titleStatus: titleStatus,
    carfaxAvailable: vehicleData.carfax_available || false,
  }
  
  const listing = await prisma.listing.create({ data: listingData })
  console.log(`   ✅ Created listing ID: ${listing.id}`)
  
  // Upload images
  if (imageFiles.length > 0) {
    console.log(`   📸 Uploading images...`)
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i]
      const fileName = path.basename(imagePath)
      
      try {
        const uploaded = await uploadImageToCloudflare(imagePath)
        
        await prisma.listingMedia.create({
          data: {
            listingId: listing.id,
            type: 'image',
            provider: 'cloudflare_images',
            providerId: uploaded.id,
            sortOrder: i,
            isCover: i === 0,
            altText: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} - Image ${i + 1}`
          }
        })
        
        console.log(`      ✅ ${fileName}`)
      } catch (error) {
        console.error(`      ❌ ${fileName}: ${error.message}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  return listing
}

// Main function
async function main() {
  console.log('🚗 Classic Motor Market - Bulk Vehicle Import\n')
  
  // Validate files exist
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ Data file not found: ${DATA_FILE}`)
    process.exit(1)
  }
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found: ${IMAGES_DIR}`)
    process.exit(1)
  }
  
  // Find seller
  console.log(`👤 Looking for seller: ${SELLER_EMAIL}`)
  
  const seller = await prisma.user.findUnique({
    where: { email: SELLER_EMAIL }
  })
  
  if (!seller) {
    console.error(`❌ Seller not found: ${SELLER_EMAIL}`)
    process.exit(1)
  }
  
  console.log(`✅ Found seller: ${seller.name || seller.username} (ID: ${seller.id})`)
  
  // Parse vehicle data
  console.log(`\n📄 Reading: ${DATA_FILE}`)
  const vehicles = parseVehicleData(DATA_FILE)
  console.log(`✅ Parsed ${vehicles.length} vehicles`)
  
  // Import each vehicle
  let successCount = 0
  let failCount = 0
  
  for (let i = 0; i < vehicles.length; i++) {
    const vehicle = vehicles[i]
    
    try {
      await createListing(seller, vehicle)
      successCount++
    } catch (error) {
      console.error(`❌ Failed: ${vehicle.year} ${vehicle.make} ${vehicle.model}`)
      console.error(`   ${error.message}`)
      failCount++
    }
    
    if (i < vehicles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Import Summary')
  console.log('='.repeat(60))
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📝 Total: ${vehicles.length}`)
  console.log('='.repeat(60))
}

// Run the import
main()
  .catch(e => {
    console.error('\n❌ Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

