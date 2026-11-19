// The position in this list (starting at 1) is the room type id the backend
// stores, so the order must not change. New types go at the end.
export const ROOM_TYPES = [
  "Deluxe",
  "Super Deluxe",
  "Suite",
  "Premium",
  "Premiere Retreat",
  "Elite Suite",
  "Grand Deluxe",
  "Imperial Suite",
  "Supreme Retreat",
  "Royal Deluxe",
  "Prestige Suite",
  "Exclusive Retreat",
];

export const getRoomTypeId = (name) => ROOM_TYPES.indexOf(name) + 1;
export const getRoomTypeName = (id) =>
  ROOM_TYPES[Number(id) - 1] || `Room type ${id}`;

// Room amenities, grouped the way guests look for them. The strings are
// what the backend stores, so existing names must not change.
export const FACILITY_GROUPS = [
  {
    key: "in-room",
    label: "In the room",
    items: ["Wi-Fi", "Air Conditioning", "Heater", "TV", "Refrigerator", "Mini Bar", "Safety Box", "Iron", "Hair Dryer", "Fireplace", "Balcony", "Terrace", "Private Entrance"],
  },
  {
    key: "bathroom",
    label: "Bathroom",
    items: ["Towels", "Linens", "Toiletries", "Shampoo", "Conditioner", "Soap", "Toilet Paper", "Bathtub", "Shower", "Hot Tub"],
  },
  {
    key: "kitchen",
    label: "Kitchen & laundry",
    items: ["Microwave", "Coffee Maker", "Toaster", "Stove", "Oven", "Dishwasher", "Washer", "Dryer"],
  },
  {
    key: "views",
    label: "Views",
    items: ["Garden View", "Sea View", "Mountain View", "City View", "Lake View"],
  },
  {
    key: "food",
    label: "Food & drink",
    items: ["Restaurant", "Bar", "Café", "Room Service", "Breakfast Included", "All-Inclusive", "BBQ Grill"],
  },
  {
    key: "services",
    label: "Services",
    items: ["24-Hour Front Desk", "Concierge Service", "Daily Housekeeping", "Laundry Service", "Dry Cleaning", "Airport Shuttle", "Car Rental", "Bicycle Rental", "Business Center", "Meeting Room", "Banquet Hall", "Elevator", "Parking", "Garage"],
  },
  {
    key: "leisure",
    label: "Leisure & sports",
    items: ["Swimming Pool", "Sauna", "Gym", "Game Room", "Library", "Playground", "Outdoor Furniture", "Outdoor Dining Area", "Golf Course", "Tennis Court", "Basketball Court", "Volleyball Court", "Soccer Field", "Cricket Ground"],
  },
  {
    key: "outdoors",
    label: "Outdoors & activities",
    items: ["Beach Access", "Boat Rental", "Kayak Rental", "Surfboard Rental", "Scuba Diving", "Snorkeling", "Fishing", "Hiking Trails", "Cycling Trails", "Horse Riding", "Ski-In/Ski-Out", "Farm Stay", "Petting Zoo"],
  },
  {
    key: "safety",
    label: "Safety & access",
    items: ["Smoke Detector", "Carbon Monoxide Detector", "First Aid Kit", "Fire Extinguisher", "Wheelchair Accessible"],
  },
  {
    key: "policies",
    label: "Guests & policies",
    items: ["Family Friendly", "Kid-Friendly", "Adult Only", "Pet Friendly", "Non-Smoking", "Smoking Area"],
  },
  {
    key: "eco",
    label: "Sustainability",
    items: ["Eco-Friendly", "Solar Power", "Rainwater Harvesting", "Recycling", "Compost Bin", "Organic Garden"],
  },
];

export const FACILITIES = FACILITY_GROUPS.flatMap((group) => group.items);

// offered as one-tap picks above the full list
export const POPULAR_FACILITIES = [
  "Wi-Fi",
  "Air Conditioning",
  "TV",
  "Towels",
  "Toiletries",
  "Daily Housekeeping",
  "Room Service",
  "Breakfast Included",
  "Parking",
];

export const MAX_PACKAGE_IMAGES = 5;
