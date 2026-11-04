import { RefreshCw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import DatePopover from "../../../components/ui/DatePopover";
import DateRangePanel from "../../../components/ui/DateRangePanel";
import { addDays, toISODate } from "../../../utils/datePresets";

const MAX_DAYS_BACK = 90;

const daysAgo = (days) => toISODate(addDays(new Date(), -days));

const lastDays = (days) => ({
  key: `last${days}`,
  label: `Last ${days} days`,
  get: () => ({ start: daysAgo(days - 1), end: daysAgo(0) }),
});

const PRESETS = [7, 15, 30, 60, 90].map(lastDays);
const DEFAULT_PRESET = PRESETS[0];

// The Refresh button of the Meta leads page. It opens the same date panel as
// the date filter. onSubmit gets { from, to } as "YYYY-MM-DD" and resolves to
// true once the leads are in, which closes the panel.
const RefreshMetaLeads = ({ onSubmit, loading = false }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <div ref={triggerRef} className="inline-flex">
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={loading}
          onClick={() => setOpen(!open)}
        >
          Refresh
        </Button>
      </div>

      {open && (
        <DatePopover
          triggerRef={triggerRef}
          title="Refresh Meta leads"
          align="right"
          width={576}
          height={560}
          showTitle
          onClose={close}
        >
          {(sheet) => (
            <DateRangePanel
              sheet={sheet}
              presets={PRESETS}
              initial={{
                ...DEFAULT_PRESET.get(),
                preset: DEFAULT_PRESET.key,
                label: DEFAULT_PRESET.label,
              }}
              min={daysAgo(MAX_DAYS_BACK)}
              max={daysAgo(0)}
              submitLabel="Fetch leads"
              submitIcon={RefreshCw}
              loading={loading}
              hint={`Up to the last ${MAX_DAYS_BACK} days. Leads already in your list are skipped.`}
              onCancel={close}
              onSubmit={async ({ start, end }) => {
                if (await onSubmit({ from: start, to: end })) close();
              }}
            />
          )}
        </DatePopover>
      )}
    </>
  );
};

export default RefreshMetaLeads;
