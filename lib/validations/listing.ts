import { z } from "zod"

export const listingSchema = z.object({
  id: z.number().optional(), // Added for edit mode
  // Step 1: Basic Info
  year: z.coerce.number().min(1900).max(2100),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  vehicleIdentifier: z.string().min(3, "Vehicle identifier is required"),
  mileage: z.coerce.number().min(0),
  location: z.string().min(2, "Location is required"),
  exteriorColor: z.string().min(1, "Exterior Color is required"),
  interiorColorMaterial: z.string().min(1, "Interior Color & Material is required"),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  askingPrice: z.coerce.number().min(1),
  
  // Step 2: Options & Features
  optionsAndFeatures: z.string().optional(),
  modifications: z.string().optional(),
  
  // Step 3: Condition & History
  conditionGrade: z.enum(["show_car", "driver", "it_runs", "project"]),
  vehicleHistory: z.string().min(1),
  maintenanceHistory: z.string().min(1),
  titleStatus: z.enum(["clean", "salvage", "stolen", "lien", "flood"]).optional(),
  carfaxAvailable: z.boolean().default(false),

  // Step 4: Media
  images: z.array(z.string()).min(1, "At least one image is required"),

  // Step 5: Publish gating
  publishFeeConfirmed: z.boolean().default(false).optional(),
})

export type ListingFormValues = z.infer<typeof listingSchema>
