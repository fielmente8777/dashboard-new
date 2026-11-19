import { ArrowUpRight, CalendarX2, Headphones, Inbox, Lock, PauseCircle, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserNdid } from "../../redux/slice/UserSlice";
import { plansPath } from "../../routes/paths";
import Button from "../ui/Button";
import SupportDialog from "./SupportDialog";

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-app-border! bg-app-surface px-4 py-3">
      <span className="grid size-9 shrink-0 place-content-center rounded-lg bg-app-surface-secondary text-app-text-muted">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-app-text-muted">{label}</span>
        <span className="block truncate text-sm font-semibold text-app-text">{value}</span>
      </span>
    </div>
  );
}

// Shown in place of every dashboard page while the subscription has ended or is
// paused. The sidebar and top bar stay, so the hotel still sees where it is.
export default function SubscriptionLock({ lock }) {
  const [action, setAction] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.userProfile.user);
  const hotelName = user?.Profile?.hotelName;
  const accountId = getUserNdid(user);
  const paused = lock.reason === "paused";

  return (
    <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
      <section
        aria-labelledby="lock-title"
        className="anim-fade relative w-full max-w-2xl overflow-hidden rounded-2xl border border-app-border! bg-app-surface shadow-xl"
      >
        {/* dusk glow, the same orange as the rest of Eazotel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-orange-500/15 via-orange-500/5 to-transparent"
        />

        <div className="relative px-6 pt-10 pb-8 text-center sm:px-10">
          <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/30">
            {paused ? <PauseCircle className="size-7" aria-hidden /> : <Lock className="size-7" aria-hidden />}
          </span>

          <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-orange-500 uppercase">
            {paused ? "Subscription paused" : "Subscription ended"}
          </p>
          <h1 id="lock-title" className="mt-2 text-2xl font-bold tracking-tight text-app-text sm:text-3xl">
            {paused ? "Your dashboard is on hold" : "Renew to keep growing your bookings"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-app-text-muted">
            {paused
              ? `${hotelName || "Your hotel"}'s subscription has been paused. Renew it to open your dashboard, chatbot and lead alerts again.`
              : `${hotelName || "Your hotel"}'s ${lock.planName ? `${lock.planName} ` : ""}plan has ended. Renew it to open your dashboard, chatbot and lead alerts again.`}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button size="lg" icon={RefreshCw} onClick={() => navigate(plansPath())} className="bg-orange-500! hover:bg-orange-600!">
              Renew subscription
            </Button>
            <Button size="lg" variant="secondary" icon={Sparkles} onClick={() => navigate(plansPath())}>
              Upgrade plan
              <ArrowUpRight className="size-4" aria-hidden />
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setAction("renew")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-app-text-muted hover:text-app-text"
          >
            <Headphones className="size-3.5" aria-hidden /> Need help or want to pay another way? Contact support
          </button>
        </div>

        <div className="relative grid gap-2.5 border-t border-app-border! bg-app-surface-secondary/40 px-6 py-5 sm:grid-cols-3 sm:px-8">
          <Fact icon={ShieldCheck} label="Plan" value={lock.planName || "Your plan"} />
          <Fact
            icon={CalendarX2}
            label={paused ? "Paused" : "Ended on"}
            value={lock.endDate ? day.format(new Date(lock.endDate)) : "—"}
          />
          <Fact icon={Inbox} label="Your leads" value="Safe and waiting" />
        </div>

        <p className="relative border-t border-app-border! px-6 py-4 text-center text-xs text-app-text-muted sm:px-8">
          New enquiries are still being saved. They&apos;ll be waiting in your dashboard as soon as you renew.
        </p>
      </section>

      <SupportDialog action={action} hotelName={hotelName} accountId={accountId} onClose={() => setAction(null)} />
    </div>
  );
}
