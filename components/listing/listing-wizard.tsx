"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { listingSchema } from "@/lib/validations/listing"
import { z } from "zod"
import { createListing } from "@/app/actions/listing"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ImageUpload } from "@/components/ui/image-upload"
import { cn, getCloudflareImageUrl } from "@/lib/utils"

type ListingFormValues = z.infer<typeof listingSchema>
type ListingIntent = "draft" | "publish"

const STEPS = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Options & Features" },
  { id: 3, title: "Condition & History" },
  { id: 4, title: "Images" },
  { id: 5, title: "Review & Publish" },
]

const CONDITION_LABELS: Record<ListingFormValues["conditionGrade"], string> = {
  show_car: "Show car",
  driver: "Driver",
  it_runs: "It runs",
  project: "Project",
}

const STEP_VALIDATION_MAP: Record<number, (keyof ListingFormValues)[]> = {
  1: ["year", "make", "model", "vehicleIdentifier", "location", "mileage", "exteriorColor", "interiorColorMaterial", "askingPrice"],
  2: [],
  3: ["conditionGrade", "vehicleHistory", "maintenanceHistory"],
  4: ["images"],
  5: [],
}

function buildDefaultValues(initialData?: Partial<ListingFormValues> & { id?: number; askingPrice?: number | null; images?: string[]; publishFeePaid?: boolean }) {
  const baseDefaults = {
    year: undefined as unknown as number,
    make: "",
    model: "",
    vehicleIdentifier: "",
    location: "",
    mileage: 0,
    exteriorColor: "",
    interiorColorMaterial: "",
    engine: "",
    transmission: "",
    askingPrice: 0,
    optionsAndFeatures: "",
    modifications: "",
    conditionGrade: "driver" as const,
    vehicleHistory: "",
    maintenanceHistory: "",
    titleStatus: undefined,
    carfaxAvailable: false,
    images: [],
    publishFeeConfirmed: false,
  }

  if (!initialData) {
    return baseDefaults satisfies ListingFormValues
  }

  return {
    year: typeof initialData.year === 'number' ? initialData.year : baseDefaults.year,
    make: initialData.make || "",
    model: initialData.model || "",
    vehicleIdentifier: initialData.vehicleIdentifier || "",
    location: initialData.location || "",
    mileage: typeof initialData.mileage === 'number' ? initialData.mileage : 0,
    exteriorColor: initialData.exteriorColor || "",
    interiorColorMaterial: initialData.interiorColorMaterial || "",
    engine: initialData.engine || "",
    transmission: initialData.transmission || "",
    askingPrice: typeof initialData.askingPrice === 'number' ? initialData.askingPrice : 0,
    optionsAndFeatures: initialData.optionsAndFeatures || "",
    modifications: initialData.modifications || "",
    conditionGrade: (initialData.conditionGrade as ListingFormValues["conditionGrade"]) || "driver",
    vehicleHistory: initialData.vehicleHistory || "",
    maintenanceHistory: initialData.maintenanceHistory || "",
    titleStatus: initialData.titleStatus || undefined,
    carfaxAvailable: initialData.carfaxAvailable || false,
    images: initialData.images || [],
    publishFeeConfirmed: initialData.publishFeeConfirmed ?? initialData.publishFeePaid ?? false,
  } satisfies ListingFormValues
}

const SAMPLE_DATA: ListingFormValues = {
  year: 1993,
  make: "Porsche",
  model: "911 Carrera RS",
  vehicleIdentifier: "WP0ZZZ96ZPS490123",
  location: "Los Angeles, CA",
  mileage: 45000,
  exteriorColor: "Maritime Blue",
  interiorColorMaterial: "Black Leather",
  engine: "3.6L Flat-6",
  transmission: "5-Speed Manual",
  askingPrice: 275000,
  optionsAndFeatures: `Original factory specification with lightweight bucket seats, aluminum hood and doors, adjustable rear spoiler, limited slip differential, sport suspension, original Fuchs wheels, and a period-correct radio delete. Everything presents as-delivered with no aftermarket add-ons.`,
  modifications: "All original factory RS specification. No modifications from original build. Matching numbers throughout. Original paint and interior.",
  conditionGrade: "show_car" as const,
  vehicleHistory: `This 1993 Porsche 911 Carrera RS is one of 2,282 produced. Delivered new in Germany, it was imported to the United States in 2005 and has remained in private collections since. The car retains its original Maritime Blue paint in excellent condition and has been climate-controlled stored. Documented ownership spans the original German owner (1993-2005), a California collector (2005-2018), and the current caretaker from 2018 to present.`,
  maintenanceHistory: `Comprehensive service history from new with regular visits to authorized Porsche specialists. A recent 2024 major service included a full engine inspection, timing-chain service, brake overhaul, suspension refresh, and new Michelin Pilot Sport tires. All fluids were replaced and a new battery installed. Documentation for all work is available, and the car is ready to drive or show.`,
  titleStatus: "clean",
  carfaxAvailable: true,
  images: [],
  publishFeeConfirmed: false,
}

export function ListingWizard({ initialData }: { initialData?: ListingFormValues & { id?: number; publishFeePaid?: boolean } }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema) as any,
    mode: "onChange",
    defaultValues: buildDefaultValues(initialData),
  })

  const fillSampleData = () => {
    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
      form.setValue(key as keyof ListingFormValues, value as any)
    })
  }

  const handleStepChange = async (direction: "next" | "prev") => {
    if (direction === "prev") {
      setCurrentStep((prev) => Math.max(1, prev - 1))
      window.scrollTo(0, 0)
      return
    }

    const fields = STEP_VALIDATION_MAP[currentStep] ?? []
    const isValid = fields.length === 0 ? true : await form.trigger(fields)
    if (isValid) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1))
      window.scrollTo(0, 0)
    }
  }

  const normalizeImageId = (value: string) => {
    try {
      const url = new URL(value)
      if (url.hostname.includes("imagedelivery.net")) {
        const parts = url.pathname.split("/").filter(Boolean)
        if (parts.length >= 2) {
          return parts[1]
        }
      }
    } catch (e) {
      // not a URL, keep as-is
    }
    return value
  }

  const handleAction = async (intent: ListingIntent) => {
    setFormError(null)
    const isValid = await form.trigger()
    if (!isValid) {
      setCurrentStep(1)
      return
    }

    startTransition(async () => {
      const values = form.getValues()
      const normalizedImages = (values.images || []).map(normalizeImageId)
      try {
        const result = await createListing(
          {
            ...values,
            images: normalizedImages,
            id: (initialData as any)?.id
          },
          intent
        )
        if (result?.error) {
          setFormError(result.error)
          return
        }
        const redirectPath = result?.redirectPath ?? "/account/listings"
        router.push(redirectPath)
      } catch {
        setFormError("Something went wrong while saving your listing.")
      }
    })
  }

  const images = form.watch("images") || []
  const askingPrice = form.watch("askingPrice") || 0
  const publishFeeConfirmed = form.watch("publishFeeConfirmed")

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Development Helper - Only show if no initial data */}
      {!initialData && process.env.NODE_ENV === 'development' && (
        <div className="mb-4 rounded-lg border border-dashed border-yellow-300 bg-yellow-50 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-yellow-800">Development Mode</h3>
              <p className="text-[0.7rem] sm:text-xs text-yellow-700">Auto-fill the form with sample data to preview the flow</p>
            </div>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={fillSampleData}
              className="border-yellow-300 bg-white hover:bg-yellow-50 w-full sm:w-auto"
            >
              Fill Sample Data
            </Button>
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between mb-2 gap-1 sm:gap-2">
          {STEPS.map((step) => (
            <div key={step.id} className={cn("text-[0.65rem] sm:text-xs md:text-sm font-medium truncate", step.id <= currentStep ? "text-primary" : "text-muted-foreground")}>
              <span className="hidden sm:inline">{step.title}</span>
              <span className="sm:hidden">{step.id}</span>
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300 ease-in-out" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Step {currentStep}: {STEPS[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <Form {...form}>
            <form className="space-y-4 sm:space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1990" 
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="make" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="Porsche" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="911 Carrera" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="vehicleIdentifier" render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN / WMI / Chassis</FormLabel>
                      <FormControl>
                        <Input placeholder="WP0AA..." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Austin, TX" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="mileage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000" 
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="askingPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asking Price (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="55000" 
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="engine" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine</FormLabel>
                      <FormControl>
                        <Input placeholder="3.6L Flat-6" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="transmission" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <FormControl>
                        <Input placeholder="6-speed manual" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="exteriorColor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exterior Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Guards Red" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="interiorColorMaterial" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interior Color & Material</FormLabel>
                      <FormControl>
                        <Input placeholder="Black leather" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField control={form.control} name="optionsAndFeatures" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Options & Special Features</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Tell buyers about noteworthy options or features." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="modifications" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is it stock? Any modifications?</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Detail any mods or confirm if the vehicle is stock." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="conditionGrade" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="show_car">Show car</SelectItem>
                            <SelectItem value="driver">Driver</SelectItem>
                            <SelectItem value="it_runs">It runs</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="titleStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title Status (optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clean">Clean</SelectItem>
                            <SelectItem value="salvage">Salvage</SelectItem>
                            <SelectItem value="stolen">Stolen</SelectItem>
                            <SelectItem value="lien">Lien</SelectItem>
                            <SelectItem value="flood">Flood</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="vehicleHistory" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle History</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Ownership story, special events, provenance..." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="maintenanceHistory" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance & Restoration History</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Recent service, restoration work, known issues addressed..." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="carfaxAvailable" render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Carfax available</FormLabel>
                      </div>
                    </FormItem>
                  )} />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Vehicle Photos</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload up to 50 photos. Click and drag the thumbnails to reorder; the first image becomes the cover photo.
                    </p>
                  </div>
                  <FormField control={form.control} name="images" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload value={field.value || []} onChange={field.onChange} maxFiles={50} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  {images.length > 0 && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                      <Image src={getCloudflareImageUrl(images[0])} alt="Hero Image" fill className="object-cover" />
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold mb-3 border-b pb-2">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-muted-foreground">Vehicle</span>
                        <span>{form.getValues("year")} {form.getValues("make")} {form.getValues("model")}</span>
                        <span className="text-muted-foreground">Location</span>
                        <span>{form.getValues("location") || "—"}</span>
                        <span className="text-muted-foreground">Mileage</span>
                        <span>{form.getValues("mileage")?.toLocaleString()} mi</span>
                        <span className="text-muted-foreground">Asking Price</span>
                        <span>${Number(askingPrice).toLocaleString()}</span>
                        <span className="text-muted-foreground">Identifier</span>
                        <span>{form.getValues("vehicleIdentifier")}</span>
                        <span className="text-muted-foreground">Engine</span>
                        <span>{form.getValues("engine") || "—"}</span>
                        <span className="text-muted-foreground">Transmission</span>
                        <span>{form.getValues("transmission") || "—"}</span>
                        <span className="text-muted-foreground">Colors</span>
                        <span>{form.getValues("exteriorColor")} / {form.getValues("interiorColorMaterial")}</span>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold mb-3 border-b pb-2">Condition & Highlights</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Condition</span>
                          <span className="font-semibold">{CONDITION_LABELS[form.getValues("conditionGrade")]}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">Options & Features</span>
                          <p className="line-clamp-3">{form.getValues("optionsAndFeatures") || "No notes provided."}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">Modifications</span>
                          <p className="line-clamp-3">{form.getValues("modifications") || "No notes provided."}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Vehicle History</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{form.getValues("vehicleHistory")}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Maintenance & Restoration</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{form.getValues("maintenanceHistory")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {form.getValues("titleStatus") && (
                        <span className="rounded-full border px-3 py-1 capitalize">
                          Title: {form.getValues("titleStatus")}
                        </span>
                      )}
                      {form.getValues("carfaxAvailable") && (
                        <span className="rounded-full border px-3 py-1">Carfax Available</span>
                      )}
                    </div>
                  </div>

                  {images.length > 1 && (
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold mb-3 border-b pb-2">Additional Photos</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.slice(1).map((img, idx) => (
                          <div key={img} className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted">
                            <Image src={getCloudflareImageUrl(img)} alt={`Photo ${idx + 2}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <FormField control={form.control} name="publishFeeConfirmed" render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 rounded-md border bg-muted/40 p-3 sm:p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                      </FormControl>
                      <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                        <FormLabel className="cursor-pointer">I confirm the listing publish fee has been collected.</FormLabel>
                        <p className="text-muted-foreground text-[0.7rem] sm:text-sm">
                          This temporary checkbox toggles the `Publish & Pay` action. Leave unchecked if you still need to collect payment.
                        </p>
                      </div>
                    </FormItem>
                  )} />

                  {formError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {formError}
                    </div>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6">
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" onClick={() => handleStepChange("prev")} disabled={currentStep === 1 || isPending} className="flex-1 sm:flex-none h-11 sm:h-12">
              Back
            </Button>
            {currentStep < STEPS.length && (
              <Button onClick={() => handleStepChange("next")} disabled={isPending} className="flex-1 sm:flex-none h-11 sm:h-12">
                Next Step
              </Button>
            )}
          </div>

          {currentStep === STEPS.length && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button variant="secondary" onClick={() => handleAction("draft")} disabled={isPending} className="h-11 sm:h-12">
                {isPending ? "Saving..." : "Save Draft"}
              </Button>
              <Button onClick={() => handleAction("publish")} disabled={isPending || !publishFeeConfirmed} className="h-11 sm:h-12">
                {isPending ? "Publishing..." : "Publish & Pay"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}




