import {
  BedDouble,
  CalendarRange,
  ChevronRight,
  ClipboardList,
  Megaphone,
  Package,
  Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import { PAGES, dashboardPath } from "../../routes/paths";
import Icon from "../../components/ui/Icon";

const SECTIONS = [
  {
    page: PAGES.BOOKING_ROOMS_SETUP,
    icon: BedDouble,
    title: "Rooms Setup",
    description:
      "Add the room types guests can book, with photos and facilities.",
  },
  {
    page: PAGES.BOOKING_ROOMS_INVENTORY,
    icon: CalendarRange,
    title: "Rooms & Inventory",
    description: "Set availability and price for each day.",
  },
  {
    page: PAGES.BOOKING_PRICE_PACKAGES,
    icon: Package,
    title: "Price Packages",
    description: "Meal and stay packages guests can add while booking.",
  },
  {
    page: PAGES.BOOKING_ADS_PACKAGES,
    icon: Megaphone,
    title: "Ads Packages",
    description: "Holiday packages promoted in your ads.",
  },
  {
    page: PAGES.BOOKING_CUSTOMIZATION,
    icon: Palette,
    title: "Customization",
    description: "Colours of the booking engine your guests see.",
  },
  {
    page: PAGES.RESERVATION_DESK,
    icon: ClipboardList,
    title: "Reservation Desk",
    description: "Every booking made through the engine.",
  },
];

// Landing page of the booking engine: one card per section.
const BookingEngine = () => (
  <PageShell
    title="Booking Engine"
    description="Everything behind the booking page of your website."
  >
    <div className="anim-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {SECTIONS.map((section) => (
        <Link
          key={section.page}
          to={dashboardPath(section.page)}
          className="anim-lift group flex items-start gap-3 rounded-xl border border-app-border! bg-app-surface p-4 hover:border-blue-500!"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Icon icon={section.icon} size="xl" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-app-text">
              {section.title}
            </span>
            <span className="mt-0.5 block text-xs text-app-text-muted">
              {section.description}
            </span>
          </span>
          <Icon
            icon={ChevronRight}
            className="mt-1 shrink-0 text-app-text-faint transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ))}
    </div>
  </PageShell>
);

export default BookingEngine;
