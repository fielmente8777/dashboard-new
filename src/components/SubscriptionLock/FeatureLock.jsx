import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { plansPath } from "../../routes/paths";
import Button from "../ui/Button";

const NAMES = {
  whatsapp: "WhatsApp Chat",
  eazbot: "Eazbot",
  meta: "Meta Leads",
  googleadsinsights: "Google Ads Insights",
  lead_management: "Lead Management",
  exotel: "Exotel calling",
  booking_engine: "Booking Engine + Reservation Desk",
  grm: "Guest Requests (GRM)",
  social_media: "Social Media",
};

// Shown in place of a page whose app the hotel's plan doesn't include (someone opened it by
// URL or an old bookmark; the menu already hides it).
export default function FeatureLock({ app }) {
  const navigate = useNavigate();
  const name = NAMES[app] || "This app";
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-app-border! bg-app-surface p-8 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-content-center rounded-xl bg-orange-500/15 text-orange-500">
          <Lock className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold text-app-text">{name} isn&apos;t in your plan</h1>
        <p className="mt-2 text-sm text-app-text-muted">
          Add it to your plan or move to a plan that includes it. It switches on as soon as the payment goes through.
        </p>
        <Button className="mt-6 bg-orange-500! hover:bg-orange-600!" icon={Sparkles} onClick={() => navigate(plansPath())}>
          See plans and add-ons
        </Button>
      </section>
    </div>
  );
}
