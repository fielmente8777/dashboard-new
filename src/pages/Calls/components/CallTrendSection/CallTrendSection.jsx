import TrendChart from "./TrendChart";

const CallTrendSection = ({ trend }) => {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Call Trend</h2>

        <p className="text-sm text-slate-500">
          Daily incoming and successful calls.
        </p>
      </div>

      <TrendChart data={trend} />
    </section>
  );
};

export default CallTrendSection;
