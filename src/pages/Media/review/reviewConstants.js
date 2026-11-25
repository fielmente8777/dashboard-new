// Shared constants for the import review screens.

export const REVIEW_TYPES = [
  { id: "rooms", label: "Rooms", hint: "Bedrooms, bathrooms, suites, lobby" },
  { id: "inventory", label: "Inventory", hint: "Furniture, appliances, linen, supplies" },
  { id: "food", label: "Food & menus", hint: "Dishes, menu boards, restaurant" },
  { id: "exterior", label: "Exterior & amenities", hint: "Building, pool, garden, gym" },
  { id: "documents", label: "Documents", hint: "Invoices, floor plans, receipts" },
  { id: "marketing", label: "Marketing", hint: "Banners, offers, social posts" },
  { id: "maintenance", label: "Maintenance / damage", hint: "Repairs, broken items, leaks" },
  { id: "other", label: "Other", hint: "Anything that fits nowhere else" },
];

export const DEFAULT_INVENTORY_ITEMS = ["Chairs", "Tables", "Beds", "TVs"];

export const CROPS = [
  { value: "", label: "Original" },
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "16:9", label: "16:9" },
];

// job statuses the review dialog waits on
export const BUSY = ["queued", "resolving", "downloading", "analyzing", "scanning", "committing"];
export const IN_REVIEW = ["awaiting_review", "scanned"];

export const VERDICT_ORDER = { include: 0, unsure: 1, exclude: 2 };
