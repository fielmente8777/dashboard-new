import { useMemo, useState } from "react";
import {
  getTemplateDefaults,
  isTemplateFilled,
} from "../../../components/WhatsApp/templateValues";
import { useApiAction } from "../../../hooks/useApiAction";
import { hasTenant, useTenant } from "../../../hooks/useTenant";
import { useCreateCampaignMutation } from "../../../redux/api/broadcastApi";
import { useGetWhatsAppTemplatesQuery } from "../../../redux/api/callsApi";
import { useGetCampaignAudienceQuery } from "../../../redux/api/whatsappApi";
import {
  DAILY_SEND_LIMIT,
  PRICE_PER_MESSAGE,
  buildCampaignTemplate,
} from "../broadcastUtils";

const EMPTY_VALUES = { body: [], header: [] };

// gian rejects imports larger than this (campaignController.createCampaign)
const MAX_IMPORTED_RECIPIENTS = 10000;

const isApproved = (template) =>
  !template.status || template.status.toUpperCase() === "APPROVED";

export const useCreateCampaign = ({
  open,
  onCreated,
  importedContacts = [],
  campaignMode = "default",
}) => {
  const tenant = useTenant();
  const run = useApiAction();

  const isExcelMode = campaignMode === "excel";
  const hasImportedContacts = importedContacts.length > 0;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("marketing");
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [source, setSource] = useState("");
  const [includeCrm, setIncludeCrm] = useState(false);

  const skip = !open || !hasTenant(tenant);

  const templatesQuery = useGetWhatsAppTemplatesQuery(tenant.hid, {
    skip,
  });

  // Default mode always uses CRM.
  // Excel mode uses CRM only when the user enables it.
  const audienceQuery = useGetCampaignAudienceQuery(
    { hid: tenant.hid, source },
    {
      skip: skip || (isExcelMode && !includeCrm),
    },
  );

  const [createCampaign, { isLoading: creating }] =
    useCreateCampaignMutation();

  const templates = useMemo(
    () =>
      (templatesQuery.data || []).filter(
        (t) =>
          isApproved(t) &&
          t.category?.toLowerCase() === category,
      ),
    [templatesQuery.data, category],
  );

  const crmAudience = audienceQuery.data || 0;

  // This is an estimated total. Backend removes overlapping phone numbers.
  const audience = isExcelMode
    ? importedContacts.length + (includeCrm ? crmAudience : 0)
    : crmAudience;

  const cost = audience * (PRICE_PER_MESSAGE[category] || 0);
  const overLimit = audience > DAILY_SEND_LIMIT;

  const changeCategory = (value) => {
    setCategory(value);
    setTemplate(null);
    setValues(EMPTY_VALUES);
  };

  const chooseTemplate = (value) => {
    setTemplate(value);
    setValues(getTemplateDefaults(value));
  };

  const reset = () => {
    setName("");
    setCategory("marketing");
    setTemplate(null);
    setValues(EMPTY_VALUES);
    setSource("");
    setIncludeCrm(false);
  };

  const audienceLoading =
    !isExcelMode || includeCrm
      ? audienceQuery.isFetching
      : false;

  const hasAudience =
    isExcelMode
      ? hasImportedContacts || (includeCrm && crmAudience > 0)
      : crmAudience > 0;

  const missing = !name.trim()
    ? "Give the campaign a name"
    : !template
      ? "Choose a template"
      : !isTemplateFilled(values)
        ? "Fill in every template value"
        : isExcelMode && importedContacts.length > MAX_IMPORTED_RECIPIENTS
          ? `An import can have at most ${MAX_IMPORTED_RECIPIENTS.toLocaleString("en-IN")} contacts`
          : audienceLoading
          ? "Please wait while audience is loading"
          : !hasAudience
            ? "No contacts match this audience"
            : null;

  const submit = async () => {
    if (missing) return;

    const payload = {
      hid: tenant.hid,
      campaignName: name.trim(),
      template: buildCampaignTemplate(template, values),
    };

    if (isExcelMode) {
      payload.recipients = importedContacts.map((contact) => ({
        name: contact.name || "",
        phone: contact.phone,
      }));

      // gian only adds CRM contacts to an import when this is true
      payload.includeCrm = includeCrm;
      if (includeCrm && source) {
        payload.source = source;
      }
    } else if (source) {
      payload.source = source;
    }

    const created = await run(
      createCampaign(payload),
      { success: "Campaign created" },
    );

    if (created) {
      reset();
      onCreated?.();
    }
  };

  return {
    name,
    setName,
    category,
    changeCategory,
    templates,
    templatesLoading: templatesQuery.isLoading,
    template,
    chooseTemplate,
    values,
    setValues,
    source,
    setSource,
    includeCrm,
    setIncludeCrm,
    isExcelMode,
    importedCount: importedContacts.length,
    crmAudience,
    audience,
    audienceLoading,
    cost,
    overLimit,
    missing,
    creating,
    submit,
  };
};
