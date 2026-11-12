
import {
  AlertTriangle,
  Filter,
  Loader2,
  Users,
  Wallet,
  FileSpreadsheet,
} from "lucide-react";

import TemplateChooser from "../../../components/WhatsApp/TemplateChooser";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import Segmented from "../../../components/ui/Segmented";
import SelectMenu from "../../../components/ui/SelectMenu";
import { Skeleton } from "../../../components/ui/States";
import { Sources } from "../../../data/constant";

import {
  DAILY_SEND_LIMIT,
  TEMPLATE_CATEGORIES,
  formatNumber,
  formatRupees,
} from "../broadcastUtils";

import { useCreateCampaign } from "../hooks/useCreateCampaign";

const SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  ...Sources,
];

const Step = ({ number, title, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-app-text">
      <span className="flex size-5 items-center justify-center rounded-full bg-blue-500/10 text-[11px] text-blue-600 dark:text-blue-400">
        {number}
      </span>
      {title}
    </h3>
    {children}
  </section>
);

const SummaryItem = ({ icon, label, children }) => (
  <div className="flex items-center gap-3 rounded-lg bg-app-surface-secondary px-3 py-2.5">
    <Icon icon={icon} tone="muted" />
    <div className="min-w-0">
      <p className="text-xs text-app-text-muted">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-app-text">
        {children}
      </p>
    </div>
  </div>
);

const CreateCampaignDialog = ({
  open,
  onClose,
  importedContacts = [],
  campaignMode = "default",
}) => {
  const form = useCreateCampaign({
    open,
    onCreated: onClose,
    importedContacts,
    campaignMode,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="New WhatsApp campaign"
      description="Send an approved template to a group of your contacts."
      footer={
        <>
          {form.missing && (
            <p className="mr-auto self-center text-xs text-app-text-muted">
              {form.missing}
            </p>
          )}

          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={form.submit}
            loading={form.creating}
            disabled={Boolean(form.missing)}
          >
            Create campaign
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Step 1: Campaign name */}
        <Step number={1} title="Name">
          <Field hint="Only you see this, it is not sent to contacts.">
            <Input
              autoFocus
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
              placeholder="e.g. Diwali weekend offer"
              maxLength={80}
            />
          </Field>
        </Step>

        {/* Step 2: Message template */}
        <Step number={2} title="Message">
          <Segmented
            label="Template type"
            options={TEMPLATE_CATEGORIES}
            value={form.category}
            onChange={form.changeCategory}
          />

          {form.templatesLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <TemplateChooser
              templates={form.templates}
              selected={form.template}
              values={form.values}
              onSelect={form.chooseTemplate}
              onValuesChange={form.setValues}
            />
          )}
        </Step>

        {/* Step 3: Audience */}
        <Step number={3} title="Audience">

          {/* Excel-specific audience UI */}
          {form.isExcelMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <Icon
                      icon={FileSpreadsheet}
                      tone="success"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-app-text">
                      Excel imported contacts
                    </p>
                    <p className="text-xs text-app-text-muted">
                      Imported contacts will be included.
                    </p>
                  </div>
                </div>

                <span className="whitespace-nowrap rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatNumber(form.importedCount)}
                </span>
              </div>

              {/* Option to combine CRM contacts */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-app-border p-3">
                <input
                  type="checkbox"
                  checked={form.includeCrm}
                  onChange={(e) =>
                    form.setIncludeCrm(e.target.checked)
                  }
                  className="mt-1 size-4 accent-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-app-text">
                    Also include contacts from other sources
                  </p>
                  <p className="mt-1 text-xs text-app-text-muted">
                    Combine Excel contacts with your existing CRM audience.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Existing CRM dropdown */}
          {(!form.isExcelMode || form.includeCrm) && (
            <Field as="div" label="Contacts from">
              <SelectMenu
                label="Contact source"
                icon={Filter}
                options={SOURCE_OPTIONS}
                value={form.source}
                onChange={form.setSource}
                className="w-full sm:w-72"
              />
            </Field>
          )}

          {/* Audience summary */}
          <div className="grid gap-2 sm:grid-cols-2">
            <SummaryItem icon={Users} label="Contacts reached">
              {form.audienceLoading ? (
                <Icon
                  icon={Loader2}
                  size="sm"
                  className="animate-spin"
                />
              ) : (
                formatNumber(form.audience)
              )}
            </SummaryItem>

            <SummaryItem icon={Wallet} label="Estimated cost">
              {formatRupees(form.cost)}
            </SummaryItem>
          </div>

          {form.isExcelMode && form.includeCrm && (
            <p className="text-xs text-app-text-muted">
              Combined count is an estimate. Duplicate phone numbers
              across Excel and CRM sources will be removed by the backend.
            </p>
          )}

          {form.overLimit && (
            <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
              <Icon
                icon={AlertTriangle}
                size="sm"
                className="mt-px"
              />

              This is more than WhatsApp's tier-1 limit of{" "}
              {formatNumber(DAILY_SEND_LIMIT)} contacts a day.
              Messages past the limit may fail; consider splitting
              the audience by source.
            </p>
          )}
        </Step>
      </div>
    </Dialog>
  );
};

export default CreateCampaignDialog;
