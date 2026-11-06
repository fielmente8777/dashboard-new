import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input, Textarea } from "../../../components/ui/Field";
import { Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../context/ToastContext";
import { billingError, useGetBillingDetailsQuery, useSaveBillingDetailsMutation } from "../../../redux/api/billingApi";

const GSTIN = /^[0-9]{2}[A-Z0-9]{13}$/;

// The name, GSTIN and address printed on the hotel's invoices. Starts from the hotel profile.
export default function BillingDetailsCard({ canEdit }) {
  const details = useGetBillingDetailsQuery();
  return (
    <Card
      title="Billing details for invoices"
      description="Printed on every new invoice. Add your GSTIN to claim input tax credit. Invoices already issued don't change."
    >
      {details.isLoading || !details.data ? <Skeleton className="h-40" /> : <Form initial={details.data} canEdit={canEdit} />}
    </Card>
  );
}

function Form({ initial, canEdit }) {
  const [form, setForm] = useState(initial);
  const [save, saving] = useSaveBillingDetailsMutation();
  const { showToast } = useToast();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: key === "gstin" ? e.target.value.toUpperCase() : e.target.value }));
  const gstinError = form.gstin && !GSTIN.test(form.gstin) ? "15 characters, starting with your state code" : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await save(form).unwrap();
      showToast({ message: "Billing details saved. Your next invoice will use them.", type: "success" });
    } catch (error) {
      showToast({ message: billingError(error, "Could not save the billing details."), type: "error" });
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Business name (as registered)">
        <Input value={form.legalName} onChange={set("legalName")} disabled={!canEdit} required />
      </Field>
      <Field label="GSTIN (optional)" error={gstinError}>
        <Input value={form.gstin} onChange={set("gstin")} disabled={!canEdit} placeholder="08AAACH1234K1Z2" maxLength={15} />
      </Field>
      <Field label="Address" className="sm:col-span-2">
        <Textarea value={form.address} onChange={set("address")} disabled={!canEdit} rows={2} />
      </Field>
      <Field label="City">
        <Input value={form.city} onChange={set("city")} disabled={!canEdit} />
      </Field>
      <Field label="State" hint="Decides CGST + SGST or IGST on your invoice">
        <Input value={form.state} onChange={set("state")} disabled={!canEdit} />
      </Field>
      <Field label="PIN code">
        <Input value={form.pinCode} onChange={set("pinCode")} disabled={!canEdit} inputMode="numeric" />
      </Field>
      <Field label="Invoice email" hint="Invoices are emailed here and to the account owner">
        <Input type="email" value={form.email} onChange={set("email")} disabled={!canEdit} />
      </Field>
      {canEdit ? (
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" loading={saving.isLoading} disabled={Boolean(gstinError) || !form.legalName.trim()}>
            Save billing details
          </Button>
        </div>
      ) : (
        <p className="text-xs text-app-text-muted sm:col-span-2">Only the account owner can change these.</p>
      )}
    </form>
  );
}
