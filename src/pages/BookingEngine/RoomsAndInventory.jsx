import { ChevronLeft, ChevronRight, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useApiAction } from "../../hooks/useApiAction";
import {
  useGetInventoryQuery,
  useGetPricesQuery,
  useSaveInventoryMutation,
  useSavePricesMutation,
} from "../../redux/api/bookingEngineApi";
import { selectHid } from "../../redux/slice/UserSlice";
import RateGrid from "./components/RateGrid";
import Icon from "../../components/ui/Icon";
import DatePicker from "../../components/ui/DatePicker";

const VIEWS = {
  inventory: { label: "Inventory", unit: "Rooms available" },
  price: { label: "Price", unit: "Price per night (₹)" },
};

const NO_EDITS = { inventory: {}, price: {} };

const toIsoDate = (date) => date.toISOString().split("T")[0];

// today in the user's own timezone, as "YYYY-MM-DD"
const getToday = () => {
  const now = new Date();
  return toIsoDate(new Date(now.getTime() - now.getTimezoneOffset() * 60_000));
};

// The "prev" request is sent with a date one week before the `prev` date the
// API reports. This is how the page has always asked for the previous week.
const weekBefore = (date) => {
  const result = new Date(date);
  result.setDate(result.getDate() - 7);
  return toIsoDate(result);
};

const countCells = (edits) =>
  Object.values(edits).reduce(
    (total, room) => total + Object.keys(room).length,
    0,
  );

const RoomsAndInventory = () => {
  const hid = useSelector(selectHid);
  const run = useApiAction();
  const today = getToday();

  const [view, setView] = useState("inventory");
  // { date, operation } once the user leaves the current week
  const [range, setRange] = useState(null);
  // cells changed and not saved yet: { inventory | price: { roomId: { date: value } } }
  const [edits, setEdits] = useState(NO_EDITS);

  const query = { hid, range: range || undefined };
  const options = { skip: !hid, refetchOnMountOrArgChange: true };
  const inventory = useGetInventoryQuery(query, options);
  const prices = useGetPricesQuery(query, options);
  const [saveInventory, inventorySave] = useSaveInventoryMutation();
  const [savePrices, priceSave] = useSavePricesMutation();

  // edits and the chosen week belong to one hotel location
  useEffect(() => {
    setRange(null);
    setEdits(NO_EDITS);
  }, [hid]);

  const active = view === "inventory" ? inventory : prices;
  const values = active.data?.values || {};
  const dates = Object.keys(Object.values(values)[0] || {}).sort();
  const next = inventory.data?.next ?? prices.data?.next;
  const prev = inventory.data?.prev ?? prices.data?.prev;

  const editCount = countCells(edits.inventory) + countCells(edits.price);
  const isSaving = inventorySave.isLoading || priceSave.isLoading;
  const isFetching = inventory.isFetching || prices.isFetching;
  // past days cannot be edited, so the calendar never goes before today
  const isFirstWeek = !dates[0] || dates[0] <= today;

  const handleCellChange = (roomId, date, value) =>
    setEdits((current) => ({
      ...current,
      [view]: {
        ...current[view],
        [roomId]: { ...current[view][roomId], [date]: value },
      },
    }));

  const handleSave = async () => {
    const requests = [
      countCells(edits.inventory) > 0 &&
        saveInventory({ hid, bulkinventory: edits.inventory }),
      countCells(edits.price) > 0 &&
        savePrices({ hid, bulkprice: edits.price }),
    ].filter(Boolean);

    const saved = await run(requests, {
      success: "Changes saved",
      error: "Could not save the changes.",
    });
    if (saved) setEdits(NO_EDITS);
  };

  return (
    <PageShell
      title="Rooms & Inventory"
      description="Set how many rooms are available and what they cost, day by day."
      actions={
        <>
          {editCount > 0 && (
            <Button
              variant="ghost"
              icon={RotateCcw}
              disabled={isSaving}
              onClick={() => setEdits(NO_EDITS)}
            >
              Discard
            </Button>
          )}
          <Button
            icon={Save}
            loading={isSaving}
            disabled={editCount === 0}
            onClick={handleSave}
          >
            {editCount > 0
              ? `Save ${editCount} change${editCount === 1 ? "" : "s"}`
              : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={view}
          onChange={setView}
          tabs={Object.entries(VIEWS).map(([value, { label }]) => ({
            value,
            label,
            count: countCells(edits[value]),
          }))}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            aria-label="Previous week"
            disabled={isFirstWeek || !prev || isFetching}
            onClick={() =>
              setRange({ date: weekBefore(prev), operation: "prev" })
            }
          >
            <Icon icon={ChevronLeft} />
          </Button>
          <div className="w-40">
            <DatePicker
              aria-label="Go to date"
              min={today}
              value={dates[0] || today}
              onChange={(date) => date && setRange({ date, operation: "next" })}
            />
          </div>
          <Button
            variant="secondary"
            aria-label="Next week"
            disabled={!next || isFetching}
            onClick={() => setRange({ date: next, operation: "next" })}
          >
            <Icon icon={ChevronRight} />
          </Button>
        </div>
      </div>

      {active.isError && (
        <ErrorState
          message={`Could not load the ${VIEWS[view].label.toLowerCase()}.`}
          onRetry={active.refetch}
        />
      )}

      {!active.isError && (active.isLoading || active.isUninitialized) && (
        <Skeleton className="h-72" />
      )}

      {!active.isError && active.data && dates.length === 0 && (
        <EmptyState
          title="No rooms to show"
          description="Add rooms in Rooms Setup first."
        />
      )}

      {!active.isError && dates.length > 0 && (
        <div className={`transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <RateGrid
            values={values}
            edits={edits[view]}
            dates={dates}
            today={today}
            unit={VIEWS[view].unit}
            onChange={handleCellChange}
          />
          <p className="mt-2 text-xs text-app-text-muted">
            Changed cells have a blue outline until you save. Weekends are
            shaded.
          </p>
        </div>
      )}
    </PageShell>
  );
};

export default RoomsAndInventory;
