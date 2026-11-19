import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useApiAction } from "../../../hooks/useApiAction";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { hasTenant, useTenant } from "../../../hooks/useTenant";
import { useGetEazbotQuery, useSaveEazbotMutation } from "../../../redux/api/eazbotApi";
import { selectCurrentLocation } from "../../../redux/slice/UserSlice";
import { toForm, toPayload, withDefaults } from "../eazbotUtils";

// Loads the location's Eazbot into an editable draft; save() publishes it.
export const useEazbot = () => {
  const run = useApiAction();
  const tenant = useTenant();
  const bot = useGetEazbotQuery(tenant, { skip: !hasTenant(tenant) });
  const [saveEazbot, { isLoading: isSaving }] = useSaveEazbotMutation();
  const { upload, isUploading } = useImageUpload();
  const profile = useSelector((state) => state.userProfile.user?.Profile);
  const location = useSelector(selectCurrentLocation);

  const saved = useMemo(() => toForm(bot.data), [bot.data]);
  // name, email, phone and messages the bot has not saved yet are prefilled
  const initial = useMemo(
    () =>
      withDefaults(saved, {
        // the hotel name; a location's "local" is often its address
        name: profile?.hotelName || location?.local,
        email: profile?.hotelEmail,
        phone: profile?.hotelPhone,
      }),
    [saved, location?.local, profile?.hotelName, profile?.hotelEmail, profile?.hotelPhone],
  );
  const [form, setForm] = useState(initial);

  // start again from the server copy whenever it (re)loads
  useEffect(() => setForm(initial), [initial]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // --- questions (chat_flow); key and type are fixed by the backend ---
  const updateFlow = (update) =>
    setForm((prev) => ({ ...prev, chat_flow: update(prev.chat_flow) }));

  const setQuestion = (index, changes) =>
    updateFlow((flow) => flow.map((q, i) => (i === index ? { ...q, ...changes } : q)));

  const setOptions = (index, update) =>
    updateFlow((flow) =>
      flow.map((q, i) => (i === index ? { ...q, options: update(q.options || []) } : q)),
    );

  const setOption = (index, optionIndex, changes) =>
    setOptions(index, (options) =>
      options.map((o, i) => (i === optionIndex ? { ...o, ...changes } : o)),
    );

  const addOption = (index) =>
    setOptions(index, (options) => [
      ...options,
      { label: "New option", value: `option_${options.length + 1}`, active: true },
    ]);

  const removeOption = (index, optionIndex) =>
    setOptions(index, (options) => options.filter((_, i) => i !== optionIndex));

  // the avatar is uploaded straight away; the draft keeps its URL
  const uploadAvatar = async (file) => {
    const url = await upload(file);
    if (url) setField("avatar_url", url);
  };

  // publishes every section of the draft at once
  const save = () =>
    run(saveEazbot({ hid: tenant.hid, bot: toPayload(form) }), {
      success: "Eazbot published",
      error: "Could not publish the chatbot.",
    });

  return {
    tenant,
    bot,
    form,
    isDirty,
    isSaving,
    isUploading,
    setField,
    setQuestion,
    setOption,
    addOption,
    removeOption,
    uploadAvatar,
    save,
    isNew: !bot.data,
    discard: () => setForm(initial),
  };
};
