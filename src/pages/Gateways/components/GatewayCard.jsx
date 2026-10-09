import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

const GatewayCard = ({ gateway, onConnect }) => (
  <div className="anim-lift flex flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface">
    <div
      style={{ backgroundColor: gateway.logoBackground || "#fff" }}
      className="flex h-28 items-center justify-center p-5"
    >
      <img
        src={gateway.logo}
        alt={gateway.name}
        className="max-h-full max-w-full object-contain"
      />
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
