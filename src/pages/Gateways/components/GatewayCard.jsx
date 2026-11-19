import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

const GatewayCard = ({ gateway, onConnect }) => (
  <div className="anim-lift flex flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface">
    {/* brand colour at low opacity reads well in light and dark themes */}
    <div
      style={{ backgroundColor: `${gateway.color}1A`, color: gateway.color }}
      className="flex h-28 items-center justify-center gap-3 p-5"
    >
      <gateway.icon size={40} aria-hidden="true" />
      <span className="text-xl font-bold tracking-tight">{gateway.name}</span>
    </div>

    <div className="flex items-center justify-between gap-3 border-t border-app-border! p-3">
      <p className="text-sm font-semibold text-app-text">{gateway.name}</p>
      {gateway.available ? (
        <Button size="sm" onClick={() => onConnect(gateway)}>
          Connect
        </Button>
      ) : (
        <Badge>Coming soon</Badge>
      )}
    </div>
  </div>
);

export default GatewayCard;
