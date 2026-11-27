import {
  AlertTriangle,
  Bot,
  BookUser,
  CalendarCheck,
  Check,
  CircleDashed,
  Clock,
  Coins,
  ConciergeBell,
  Eye,
  Facebook,
  FileSpreadsheet,
  FileText,
  Globe,
  IndianRupee,
  Instagram,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

import TemplateChooser from "../../../components/WhatsApp/TemplateChooser";
import WhatsAppMark from "../../../components/WhatsApp/WhatsAppMark";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";
import Segmented from "../../../components/ui/Segmented";
import { Skeleton } from "../../../components/ui/States";
import { Sources } from "../../../data/constant";
import { useTradeCategories } from "../../TradeDirectory/useTradeCategories";
import {
  DAILY_SEND_LIMIT,
  TEMPLATE_CATEGORIES,
  formatNumber,
  formatRupees,
} from "../broadcastUtils";
import { useCreateCampaign } from "../hooks/useCreateCampaign";

const SOURCE_ICON = {
  eazbot: Bot,
  webform: FileText,
  whatsapp: MessageCircle,
  facebook: Facebook,
  google: Globe,
  visitors: Eye,
  exotel: Phone,
  insta_ad_dm: Instagram,
  instagram: Instagram,
  front_desk: ConciergeBell,
  booking_engine: CalendarCheck,
  email: Mail,
};
const sourceLabel = (value) =>
  Sources.find((s) => s.value === value)?.label ||
  value.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Step = ({ number, title, hint, children }) => (
  <section className="space-y-3">
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">
        {number}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-app-text">{title}</h3>
        {hint && <p className="text-xs text-app-text-muted">{hint}</p>}
      </div>
    </div>
    <div className="space-y-3 sm:pl-7.5">{children}</div>
  </section>
);

/** One audience: a tick card; its options open below it when ticked. */
const AudienceCard = ({
  checked,
  onChange,
  icon: CardIcon,
  tint,
  title,
  sub,
  count,
  counting,
  disabled,
  children,
}) => (
  <div
    className={`overflow-hidden rounded-xl border transition ${
      checked
        ? "border-emerald-500/60! bg-emerald-500/[0.04] ring-1 ring-emerald-500/30"
        : "border-app-border!"
    } ${disabled ? "opacity-50" : ""}`}
  >
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 px-3 py-3 text-left enabled:hover:bg-app-surface-secondary/50 disabled:cursor-not-allowed"
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
          checked
            ? "border-emerald-600! bg-emerald-600 text-white"
            : "border-app-border!"
        }`}
      >
        {checked && <Check className="size-3" />}
      </span>
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tint}`}
      >
        <CardIcon className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-app-text">{title}</span>
        {sub && (
          <span className="block text-xs text-app-text-muted">{sub}</span>
        )}
      </span>
      {count != null && (
        <span className="shrink-0 rounded-full bg-app-surface-secondary px-2.5 py-0.5 text-xs font-semibold tabular-nums text-app-text">
          {counting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            formatNumber(count)
          )}
        </span>
      )}
    </button>
    {checked && children && (
      <div className="border-t border-app-border! px-3 py-3">{children}</div>
    )}
  </div>
);

/** small tick chips: "All" plus each option with its count */
const ChipPicker = ({
  allLabel,
  allCount,
  items,
  selected,
  onToggle,
  onClear,
}) => (
  <div className="flex flex-wrap gap-1.5">
    <Chip
      active={!selected.length}
      onClick={onClear}
      label={allLabel}
      count={allCount}
    />
    {items.map((item) => (
      <Chip
        key={item.value}
        active={selected.includes(item.value)}
        onClick={() => onToggle(item.value)}
        icon={item.icon}
        color={item.color}
        label={item.label}
        count={item.count}
      />
    ))}
  </div>
);

const Chip = ({ active, onClick, icon: ChipIcon, color, label, count }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
      active
        ? "border-emerald-600! bg-emerald-600 text-white"
        : "border-app-border! text-app-text hover:bg-app-surface-secondary"
    }`}
  >
    {ChipIcon && (
      <ChipIcon
        className="size-3.5"
        style={active ? undefined : { color }}
        aria-hidden
      />
    )}
    {label}
    {count != null && (
      <span
        className={`tabular-nums ${active ? "text-white/80" : "text-app-text-muted"}`}
      >
        {formatNumber(count)}
      </span>
    )}
  </button>
);

const segmentItems = (facets, categories) =>
  categories.map((s) => ({
    ...s,
    count: facets?.segments?.find((x) => x.segment === s.value)?.count || 0,
  })).filter((s) => s.count > 0);

const Summary = ({ icon: SumIcon, label, children, tone = "" }) => (
  <div className="flex items-center gap-3 rounded-xl bg-app-surface-secondary px-3 py-2.5">
    <SumIcon
      className={`size-4 shrink-0 text-app-text-muted ${tone}`}
      aria-hidden
    />
    <div className="min-w-0">
      <p className="text-[11px] text-app-text-muted">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-app-text">
        {children}
      </p>
    </div>
  </div>
);

/**
 * "New WhatsApp campaign": a name, who gets it (guests & leads by source, an imported file, trade
 * partners) and an approved template. Everything goes from the hotel's own WhatsApp number
 * (gian). Only contacts with a WhatsApp-able number are ever counted or sent to.
 */
const CreateCampaignDialog = ({
  open,
  onClose,
  importedContacts = [],
  campaignMode = "default",
}) => {
  const f = useCreateCampaign({
    open,
    onCreated: onClose,
    importedContacts,
    campaignMode,
  });
  const sourceItems = f.sourceList.map((s) => ({
    value: s.source,
    label: sourceLabel(s.source),
    icon: SOURCE_ICON[s.source] || CircleDashed,
    count: s.count,
  }));
  const { categories } = useTradeCategories();
  const tradeItems = segmentItems(f.tradeFacets, categories);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      sheetOnPhone
      title="New WhatsApp campaign"
      icon={
        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
          <WhatsAppMark className="size-5.5" />
        </span>
      }
      description="Pick who gets it and an approved template. Only contacts with a WhatsApp number are counted."
      footer={
        <>
          <p className="mr-auto min-w-0 self-center truncate text-xs text-app-text-muted">
            {f.missing ||
              `Ready to send to ${formatNumber(f.audience)} ${f.audience === 1 ? "contact" : "contacts"}`}
          </p>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={f.submit}
            loading={f.creating}
            disabled={Boolean(f.missing)}
          >
            <WhatsAppMark className="size-4" />
            Send campaign
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Field label="Campaign name" hint="Only you see this.">
          <Input
            autoFocus
            value={f.name}
            onChange={(e) => f.setName(e.target.value)}
            placeholder="e.g. Diwali weekend offer"
            maxLength={80}
          />
        </Field>

        <Step
          number={1}
          title="Who gets it?"
          hint="Tick one or more. A number in two lists gets it once."
        >
          <AudienceCard
            checked={f.crm}
            onChange={f.setCrm}
            icon={Users}
            tint="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            title="Guests & leads"
            sub="Everyone in your leads with a phone number, from all sources or the ones you pick"
            count={f.crm ? f.crmCount : f.crmTotal}
            counting={f.crm && f.audienceLoading}
          >
            {f.sourcesLoading ? (
              <Skeleton className="h-8" />
            ) : sourceItems.length ? (
              <ChipPicker
                allLabel="All sources"
                allCount={f.crmTotal}
                items={sourceItems}
                selected={f.sources}
                onToggle={f.toggleSource}
                onClear={f.clearSources}
              />
            ) : (
              <p className="text-xs text-app-text-muted">
                No leads with a phone number yet.
              </p>
            )}
          </AudienceCard>

          {f.hasImported && (
            <AudienceCard
              checked={f.useImported}
              onChange={f.setUseImported}
              icon={FileSpreadsheet}
              tint="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              title="Imported file"
              sub="The numbers you just imported from Excel / CSV"
              count={f.importedCount}
            />
          )}

          <AudienceCard
            checked={f.trade}
            onChange={f.setTrade}
            disabled={!f.tradeAvailable}
            icon={BookUser}
            tint="bg-violet-500/10 text-violet-600 dark:text-violet-300"
            title="Trade partners"
            sub={
              f.approved
                ? "Travel agents, MICE, wedding planners… with a mobile: your contacts, Eazotel's directory, or both"
                : "Your own travel agents, MICE, wedding planners… with a mobile number"
            }
            count={f.trade ? f.tradeCount : null}
            counting={f.trade && f.audienceLoading}
          >
            {f.approved && (
              <Segmented
                label="Trade list"
                value={f.tradePool}
                onChange={f.setTradePool}
                className="mb-3"
                options={[
                  { value: "mine", label: "My contacts" },
                  { value: "directory", label: "Eazotel's directory" },
                  { value: "both", label: "Both" },
                ]}
              />
            )}
            {tradeItems.length ? (
              <ChipPicker
                allLabel="All categories"
                allCount={f.tradeFacets?.total}
                items={tradeItems}
                selected={f.tradeSegments}
                onToggle={f.toggleTradeSegment}
                onClear={f.clearTradeSegments}
              />
            ) : (
              <p className="text-xs text-app-text-muted">
                {f.tradePool === "mine"
                  ? "No trade contacts yet. Add or import them on the Trade Directory page."
                  : "No partners in this list yet."}
              </p>
            )}
          </AudienceCard>
        </Step>

        <Step
          number={2}
          title="Message"
          hint="Only templates WhatsApp has approved can start a conversation."
        >
          <>
            <Segmented
              label="Template type"
              options={TEMPLATE_CATEGORIES}
              value={f.category}
              onChange={f.changeCategory}
            />
            {f.templatesLoading ? (
              <Skeleton className="h-40" />
            ) : (
              <TemplateChooser
                templates={f.templates}
                selected={f.template}
                values={f.values}
                onSelect={f.chooseTemplate}
                onValuesChange={f.setValues}
              />
            )}
          </>
        </Step>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Summary icon={Users} label="Contacts reached">
            {f.audienceLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              formatNumber(f.audience)
            )}
          </Summary>
          <Summary
            icon={IndianRupee}
            label="Cost (WhatsApp wallet)"
            tone={f.walletShort ? "text-red-600" : ""}
          >
            {formatRupees(f.cost)}
          </Summary>
          <Summary icon={Clock} label="Takes">
            {f.duration ? f.duration.text.replace(/^about /, "~") : "—"}
          </Summary>
          <Summary icon={ShieldCheck} label="Sent from" tone="text-emerald-600">
            Your WhatsApp number
          </Summary>
        </div>
        {f.walletBalance != null && (
          <p
            className={`flex items-center gap-1.5 text-xs ${f.walletShort ? "text-red-600 dark:text-red-400" : "text-app-text-muted"}`}
          >
            <Coins className="size-3.5" aria-hidden />₹
            {f.perMessage.toLocaleString("en-IN", { maximumFractionDigits: 4 })}{" "}
            a message, paid from your WhatsApp wallet (balance{" "}
            {formatRupees(f.walletBalance)}).
            {f.walletShort
              ? " Recharge it before sending."
              : " Messages that fail are not charged."}
          </p>
        )}
        {f.limitsKnown && (
          <p className="text-xs text-app-text-muted">
            Meta lets your number message{" "}
            <b className="text-app-text">
              {f.dailyLimit === -1 ? "unlimited" : formatNumber(f.dailyLimit)}
            </b>{" "}
            different people in 24 hours. We send at a steady pace and stay
            under that limit, so nothing is blocked by Meta. A template, wallet
            or account problem stops the campaign straight away instead of
            failing everyone.
          </p>
        )}

        {f.overLimit && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-px size-4 shrink-0" />
            This is more than your number may message in one day, so it goes out
            over {f.duration?.days || "several"} days ({f.duration?.text}).
            Nothing extra to do: the next part starts by itself every 24 hours.
          </p>
        )}
        {(f.useImported || f.trade) && f.crm && (
          <p className="text-xs text-app-text-muted">
            The total is an estimate: a number that is in more than one list is
            sent to once.
          </p>
        )}
      </div>
    </Dialog>
  );
};

export default CreateCampaignDialog;
