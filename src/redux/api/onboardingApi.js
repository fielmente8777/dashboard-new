import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

const FACILITY_KEYS = [
  "FrontDesk", "Wifi", "Board", "Rooftop_Cafe", "Health_Club", "Express_checks",
  "Wave_Bar", "Conference_Hall", "Alchemy", "Suncafe", "Doctor", "Spa",
  "Babysitting", "Electricity", "Concierge", "Conditinoer", "Security",
  "TravelTour", "Currency_Exchange", "Laundry", "Casino", "Parking", "Elevator",
  "Jacuzzi", "Room_Service", "Accept_Cards", "Child_Care", "Conference_Rooms",
  "Fitness_Center", "Health_&_Beauty", "Restaurant", "Swimming_Pool",
  "Housekeep", "cofeemaker", "minibar", "Evpoint", "SaunaStream",
];

// Same payload the onboarding site sends (on-boarding/src/utils/onboardingApi.js).
// Only the form fields are real, the rest are defaults the hotel edits later.
const buildWebsitePayload = (p) => ({
  Token: getToken(),
  template: "1",
  hotelName: p.hotelName,
  hotelPhone: p.hotelPhone,
  // nexon copies hotelAddress into the first location's `local`, which the
  // dashboard shows as the property name; the form has no address field, so
  // it gets the hotel name (as the website and on-boarding apps send it)
  hotelAddress: p.hotelName,
  hotelState: p.state,
  hotelCity: p.city,
  hotelCountry: p.country,
  hotelPinCode: p.pinCode,
  hotelEmail: p.hotelEmail,
  oldWebsite: p.hotelWebsite || "",
  planName: "P1",
  category: p.accommodationType || "Hotel",
  currency: p.currency || "INR",
  starRating: p.starCategory || "3",
  hasPool: "false",
  breakfastOption: [],
  serveBreakfast: "false",
  breakfastIncluded: "false",
  parkingType: "",
  parkingAvailability: "false",
  parkingCost: "",
  parkingLocation: "",
  pricingStructure: "",
  reservationRequirement: "false",
  logo: "",
  totalroomCategory: "0",
  roomCategories: [],
  bannerVideo: "",
  hotelDescription: p.hotelDescription || "",
  customDomain: "",
  colorCombination: {
    backgroundColor: "#153B5B",
    buttonColor: "#0A3A75",
    fontColor: "#0A3A75",
    boardColor: "#0A3A75",
  },
  Facilities: Object.fromEntries(
    FACILITY_KEYS.map((key) => [key, key === "FrontDesk" ? "true" : "false"]),
  ),
  checkInFrom: "12:00",
  checkInUntil: "23:59",
  petCharges: "",
  allowPets: "false",
  checkOutFrom: "07:00",
  allowChildren: "true",
  checkOutUntil: "11:00",
  languages: ["English"],
  pagesRequired: {},
  establishedSince: "",
  document: {},
  otaRequired: {},
});

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Creates the hotel profile, website and first location (nexon).
    // Answers { Status, hId, Message }.
    createWebsite: build.mutation({
      query: (propertyDetails) => ({
        url: "/eazotel/createwebsite",
        method: "POST",
        body: buildWebsitePayload(propertyDetails),
      }),
      // this endpoint reads the token from the body
      extraOptions: { skipAuth: true },
    }),

    // Starts the 14-day trial and links it to the profile made above (gian).
    // Must run after createWebsite. Answers 409 when already onboarded.
    completeOnboarding: build.mutation({
      query: (propertyDetails) => ({
        url: "/api/v1/onboarding",
        method: "POST",
        body: { propertyDetails },
      }),
      extraOptions: { service: "node" },
    }),
  }),
});

export const { useCreateWebsiteMutation, useCompleteOnboardingMutation } =
  onboardingApi;
