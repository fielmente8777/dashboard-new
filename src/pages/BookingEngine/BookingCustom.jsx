import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { inputClassName } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useApiAction } from "../../hooks/useApiAction";
import {
  useGetEngineDetailsQuery,
  useSaveEngineColorsMutation,
} from "../../redux/api/bookingEngineApi";
import { selectHid } from "../../redux/slice/UserSlice";

// `key` is the field name in the engine's Colors
const COLOR_FIELDS = [
  { key: "BackgroundColor", label: "Page colour", fallback: "#ffffff" },
  { key: "BoardColor", label: "Reservation card colour", fallback: "#f3f4f6" },
  {
    key: "ButtonColor",
    label: "Check-in / check-out button colour",
    fallback: "#152547",
  },
];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const toColors = (saved) =>
  Object.fromEntries(
    COLOR_FIELDS.map(({ key, fallback }) => [
      key,
      HEX_COLOR.test(saved?.[key]) ? saved[key] : fallback,
    ]),
  );

const BookingCustom = () => {
  const hid = useSelector(selectHid);
  const run = useApiAction();
  const engine = useGetEngineDetailsQuery(hid, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });
  const [saveColors, { isLoading: isSaving }] = useSaveEngineColorsMutation();
  const [colors, setColors] = useState(() => toColors());

  // start from what is saved (again after a save or a location switch)
  useEffect(() => {
    setColors(toColors(engine.data?.Colors));
  }, [engine.data]);

  const saved = toColors(engine.data?.Colors);
  const hasChanges = COLOR_FIELDS.some(({ key }) => colors[key] !== saved[key]);
  const backgroundImage = engine.data?.BgImage;

  const handleSave = () =>
    run(saveColors({ hid, ...colors }), {
      success: "Colours updated",
      error: "Could not update the colours.",
    });

  return (
    <PageShell
      title="Customization"
      description="Colours of the booking engine your guests see."
      actions={
        <Button
          icon={Save}
          loading={isSaving}
          disabled={!hasChanges || engine.isLoading}
          onClick={handleSave}
        >
          Save changes
        </Button>
      }
    >
      {engine.isError && (
        <ErrorState
          message="Could not load the booking engine settings."
          onRetry={engine.refetch}
        />
      )}

      {(engine.isLoading || engine.isUninitialized) && (
        <Skeleton className="h-72" />
      )}

      {engine.isSuccess && (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <Card title="Colours">
            <div className="space-y-4">
              {COLOR_FIELDS.map(({ key, label }) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-xs font-medium text-app-text-muted">
                    {label}
                  </span>
                  <span className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors[key]}
                      onChange={(e) =>
                        setColors({ ...colors, [key]: e.target.value })
                      }
                      className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-app-border! bg-app-surface p-1"
                    />
                    <input
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                      value={colors[key].toUpperCase()}
                      className={`${inputClassName} font-mono`}
                    />
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Card
            title="Preview"
            description="A rough idea of how the colours look together."
          >
            <div
              style={{
                backgroundColor: colors.BackgroundColor,
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : undefined,
              }}
              className="flex min-h-64 items-center justify-center rounded-xl border border-app-border! bg-cover bg-center p-6"
            >
              <div
                style={{ backgroundColor: colors.BoardColor }}
                className="w-full max-w-xs space-y-3 rounded-xl p-4 shadow-lg"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Reserve your stay
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["Check-in", "Check-out"].map((text) => (
                    <span
                      key={text}
                      style={{ backgroundColor: colors.ButtonColor }}
                      className="rounded-lg px-3 py-2 text-center text-xs font-medium text-white"
                    >
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-app-text-muted">
              {backgroundImage
                ? "Your background image is shown behind the card."
                : "No background image is set."}
            </p>
          </Card>
        </div>
      )}
    </PageShell>
  );
};

export default BookingCustom;
