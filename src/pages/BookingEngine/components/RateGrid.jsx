import { getRoomTypeName } from "../constants";

const toDate = (value) => new Date(`${value}T00:00:00`);

const isWeekend = (value) => [0, 6].includes(toDate(value).getDay());

// One editable number per room type and day.
//   values: { [roomTypeId]: { [date]: value } }  what is saved
//   edits:  same shape, only the cells changed and not saved yet
const RateGrid = ({ values, edits, dates, today, unit, onChange }) => (
  <div className="overflow-x-auto rounded-xl border border-app-border!">
    <table className="w-full min-w-max border-collapse text-sm">
      <thead>
        <tr className="bg-app-surface-secondary">
          <th className="sticky left-0 z-10 bg-app-surface-secondary px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-app-text-muted">
            Room type
          </th>
          {dates.map((date) => {
            const day = toDate(date);

            return (
              <th
                key={date}
                className={`min-w-24 px-2 py-2 text-center font-normal ${isWeekend(date) ? "bg-amber-500/10" : ""}`}
              >
                <span className="block text-[11px] uppercase text-app-text-muted">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span
                  className={`mx-auto mt-0.5 flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                    date === today
                      ? "bg-primary text-white dark:bg-blue-600"
                      : "text-app-text"
                  }`}
                >
                  {day.getDate()}
                </span>
                <span className="block text-[11px] text-app-text-muted">
                  {day.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {Object.keys(values).map((roomId) => (
          <tr key={roomId} className="border-t border-app-border!">
            <th className="sticky left-0 z-10 bg-app-surface px-4 py-3 text-left">
              <span className="block font-semibold text-app-text">
                {getRoomTypeName(roomId)}
              </span>
              <span className="text-xs font-normal text-app-text-muted">
                {unit}
              </span>
            </th>
            {dates.map((date) => {
              const edited = edits[roomId]?.[date];
              const isEdited = edited !== undefined;

              return (
                <td
                  key={date}
                  className={`px-2 py-2 ${isWeekend(date) ? "bg-amber-500/5" : ""}`}
                >
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    aria-label={`${getRoomTypeName(roomId)} on ${date}`}
                    value={isEdited ? edited : (values[roomId][date] ?? "")}
                    onChange={(e) => onChange(roomId, date, e.target.value)}
                    className={`w-full rounded-lg border bg-app-surface px-2 py-1.5 text-center tabular-nums text-app-text outline-none transition focus:ring-1 focus:ring-blue-500 ${
                      isEdited
                        ? "border-blue-500! font-semibold"
                        : "border-app-border!"
                    }`}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RateGrid;
