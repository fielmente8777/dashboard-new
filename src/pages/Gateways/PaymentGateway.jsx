import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Input } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import { ErrorState } from "../../components/ui/States";
import {
  useFindPaymentQuery,
  useGetPaymentsQuery,
} from "../../redux/api/paymentApi";
import { selectHid } from "../../redux/slice/UserSlice";
import GatewayCard from "./components/GatewayCard";
import GatewayKeysDialog from "./components/GatewayKeysDialog";
import PaymentsTable from "./components/PaymentsTable";
import { GATEWAYS, PAGE_SIZE } from "./constants";
import Icon from "../../components/ui/Icon";

const PaymentGateway = () => {
  const hid = useSelector(selectHid);
  const [connecting, setConnecting] = useState(null);
  const [skip, setSkip] = useState(0);
  const [searchId, setSearchId] = useState("");
  // { type: "order" | "payment", id } while a search is showing
  const [search, setSearch] = useState(null);

  // only one of the two requests runs: the page of payments, or the search
  const list = useGetPaymentsQuery(
    { hid, skip },
    { skip: !hid || Boolean(search), refetchOnMountOrArgChange: true },
  );
  const found = useFindPaymentQuery(
    { hid, ...search },
    { skip: !hid || !search, refetchOnMountOrArgChange: true },
  );
  const active = search ? found : list;

  // shown in the reverse of the API's order, as this table always has
  const payments = useMemo(
    () => [...(active.data || [])].reverse(),
    [active.data],
  );

  const closeDialog = useCallback(() => setConnecting(null), []);

  const runSearch = (type) => {
    const id = searchId.trim();
    if (id) setSearch({ type, id });
  };

  const clearSearch = () => {
    setSearch(null);
    setSearchId("");
  };

  return (
    <PageShell
      title="Payment Gateway"
      description="Connect a gateway to accept online payments, and review what has been paid."
    >
      <div className="anim-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GATEWAYS.map((gateway) => (
          <GatewayCard
            key={gateway.id}
            gateway={gateway}
            onConnect={setConnecting}
          />
        ))}
      </div>

      <Card
        title="Razorpay payments"
        description={
          search
            ? `Result for ${search.type} ID ${search.id}`
            : "Find one payment by its order ID or payment ID."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-52">
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Order or payment ID"
                aria-label="Order or payment ID"
              />
            </div>
            <Button
              variant="secondary"
              icon={Search}
              disabled={!searchId.trim()}
              onClick={() => runSearch("order")}
            >
              Order
            </Button>
            <Button
              variant="secondary"
              icon={Search}
              disabled={!searchId.trim()}
              onClick={() => runSearch("payment")}
            >
              Payment
            </Button>
            {search && (
              <Button variant="ghost" icon={X} onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
        }
      >
        {active.isError ? (
          <ErrorState
            message="Could not load the payments."
            onRetry={active.refetch}
          />
        ) : (
          <PaymentsTable
            payments={payments}
            loading={active.isFetching}
            emptyMessage={
              search
                ? "No payment found for that ID."
                : "No payments found. Connect Razorpay to see payments here."
            }
          />
        )}

        {!search && (
          <div className="mt-4 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={skip === 0 || list.isFetching}
              onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
            >
              Previous
            </Button>
            <span className="text-sm text-app-text-muted">
              Page {skip / PAGE_SIZE + 1}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={payments.length < PAGE_SIZE || list.isFetching}
              onClick={() => setSkip(skip + PAGE_SIZE)}
            >
              Next <Icon icon={ChevronRight} />
            </Button>
          </div>
        )}
      </Card>

      <GatewayKeysDialog gateway={connecting} onClose={closeDialog} />
    </PageShell>
  );
};

export default PaymentGateway;
