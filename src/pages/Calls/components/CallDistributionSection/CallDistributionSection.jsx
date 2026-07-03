import StatusChart from "./StatusChart";
import DirectionChart from "./DirectionChart";

const CallDistributionSection = ({
  statusDistribution,
  directionDistribution,
}) => {
  return (
    <section className="grid grid-cols-2 gap-5">
      <StatusChart data={statusDistribution} />
      <DirectionChart data={directionDistribution} />
    </section>
  );
};

export default CallDistributionSection;
