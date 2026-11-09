import { Check, Zap } from "lucide-react";
import { formatCredits, formatMoney } from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";

// The recharge plans; onRecharge(pack) opens the confirmation.
const RechargePackages = ({ packages, onRecharge }) => (
  <Card title="Recharge packages" description="Credits never expire">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {packages.map((pack) => {
        const perCredit = pack.price / pack.credits;
        return (
          <div
            key={pack.id}
            className={`relative flex flex-col rounded-xl border p-4 transition hover:shadow-sm ${
              pack.popular
                ? "border-blue-500! ring-1 ring-blue-500"
                : "border-app-border! hover:border-app-text-faint!"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-app-text">{pack.name}</p>
              {pack.popular && <Badge tone="blue">Most popular</Badge>}
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums text-app-text">
              {formatMoney(pack.price, pack.currency)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-app-text-muted">
              <Icon icon={Check} size="sm" tone="success" />
              {formatCredits(pack.credits)} credits
            </p>
            <p className="mt-0.5 text-xs text-app-text-faint">
              {formatMoney(perCredit * 100, pack.currency)} per 100 credits
            </p>
            <Button
              icon={Zap}
              variant={pack.popular ? "primary" : "secondary"}
              onClick={() => onRecharge(pack)}
              className="mt-4 w-full"
            >
              Recharge
            </Button>
          </div>
        );
      })}
    </div>
  </Card>
);

export default RechargePackages;
