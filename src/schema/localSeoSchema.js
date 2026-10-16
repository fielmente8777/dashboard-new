import { z } from "zod";

const coordinate = (label, limit) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => !Number.isNaN(Number(v)) && Math.abs(Number(v)) <= limit, {
      message: `Enter a valid ${label.toLowerCase()}`,
    });

// Local SEO first-time setup. The keywords are picked outside the form.
export const localSeoSetupSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(3, "Enter your property name as it appears on Google"),
  businessType: z.string().min(1),
  selfDomain: z.string().trim().optional(),
  lat: coordinate("Latitude", 90),
  lng: coordinate("Longitude", 180),
  radiusKm: z.string(),
  district: z.string().trim().min(1, "District / area is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
});

// fields checked before leaving each step
export const LOCAL_SEO_SETUP_STEPS = [
  ["businessName", "businessType", "selfDomain"],
  ["lat", "lng", "district", "city", "state", "radiusKm"],
  [],
];
