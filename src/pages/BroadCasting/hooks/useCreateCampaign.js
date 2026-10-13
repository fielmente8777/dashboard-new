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

const isApproved = (template) =>
  !template.status || template.status.toUpperCase() === "APPROVED";

// State and submit of the "new campaign" form. Only loads its data while
// the dialog is open.
export const useCreateCampaign = ({ open, onCreated }) => {
  const tenant = useTenant();
  const skip = !open || !hasTenant(tenant);
  const run = useApiAction();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("marketing");
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [source, setSource] = useState("");

  const templatesQuery = useGetWhatsAppTemplatesQuery(tenant.hid, { skip });
  const audienceQuery = useGetCampaignAudienceQuery(
    { hid: tenant.hid, source },
    { skip },
  );
  const [createCampaign, { isLoading: creating }] = useCreateCampaignMutation();

  const templates = useMemo(
    () =>
      (templatesQuery.data || []).filter(
        (t) => isApproved(t) && t.category?.toLowerCase() === category,
      ),
    [templatesQuery.data, category],
  );

  const audience = audienceQuery.data || 0;
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
  };

  // the first thing still missing, or null when the form can be sent
  const missing = !name.trim()
    ? "Give the campaign a name"
    : !template
      ? "Choose a template"
      : !isTemplateFilled(values)
        ? "Fill in every template value"
        : !audienceQuery.isFetching && audience === 0
          ? "No contacts match this audience"
          : null;

  const submit = async () => {
    if (missing) return;
    const created = await run(
      createCampaign({
        hid: tenant.hid,
        campaignName: name.trim(),
        template: buildCampaignTemplate(template, values),
        ...(source && { source }),
      }),
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
    audience,
    audienceLoading: audienceQuery.isFetching,
    cost,
    overLimit,
    missing,
    creating,
    submit,
  };
};
