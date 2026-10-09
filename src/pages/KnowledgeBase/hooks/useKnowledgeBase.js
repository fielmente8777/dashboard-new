import { useState } from "react";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { useApiAction } from "../../../hooks/useApiAction";
import { hasTenant, useTenant } from "../../../hooks/useTenant";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  useDeleteKnowledgeBaseMutation,
  useGenerateKnowledgeBaseMutation,
  useGetKnowledgeBasesQuery,
  useLazyFindKnowledgeBaseByUrlQuery,
  useLazyGetKnowledgeBaseQuery,
  useSaveKnowledgeBaseMutation,
} from "../../../redux/api/knowledgeBaseApi";
import { emptyKb, unwrapGeneratedKb } from "../utils/kbHelpers";

const EMPTY_INTAKE = { url: "", clientName: "", file: null, images: [] };
// id is null for a knowledge base that has not been saved yet
const NO_ACTIVE = { id: null, updatedAt: null, sourceUrl: null };
const GENERATE_ERROR =
  "Something went wrong while generating the knowledge base. Please try again.";

// State and actions of the knowledge base page, which moves through three
// steps: "list" (saved knowledge bases) -> "intake" (website + files to
// generate from) -> "edit" (review, then publish or save).
export const useKnowledgeBase = () => {
  const tenant = useTenant();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const run = useApiAction();

  const [phase, setPhase] = useState("list");
  const [intake, setIntake] = useState(EMPTY_INTAKE);
  const [generateError, setGenerateError] = useState("");
  const [kb, setKb] = useState(emptyKb);
  const [active, setActive] = useState(NO_ACTIVE);
  const [openingId, setOpeningId] = useState(null);

  const list = useGetKnowledgeBasesQuery(tenant, {
    skip: !hasTenant(tenant),
    refetchOnMountOrArgChange: true,
  });
  const items = list.data || [];

  const [fetchById] = useLazyGetKnowledgeBaseQuery();
  const [findByUrl] = useLazyFindKnowledgeBaseByUrlQuery();
  const [generate, { isLoading: generating }] =
    useGenerateKnowledgeBaseMutation();
  const [save, { isLoading: saving }] = useSaveKnowledgeBaseMutation();
  const [remove] = useDeleteKnowledgeBaseMutation();

  // opens a saved document in the editor
  const openSaved = (doc, fallbackUrl = null) => {
    setKb(doc);
    setActive({
      id: doc._id,
      updatedAt: doc.updatedAt || null,
      sourceUrl: doc.source_url || fallbackUrl,
    });
    setPhase("edit");
  };

  const clearIntake = () => {
    intake.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setIntake(EMPTY_INTAKE);
  };

  const startOver = () => {
    clearIntake();
    setKb(emptyKb);
    setActive(NO_ACTIVE);
    setGenerateError("");
    setPhase("intake");
  };

  const handleGenerate = async () => {
    const url = intake.url.trim();
    setGenerateError("");

    // Safety net for the "one knowledge base per account" rule: the Generate
    // button is hidden once one exists, but this can also be reached through
    // Start over.
    if (items.length > 0 && !active.id) {
      setGenerateError(
        "You already have a knowledge base. Edit your existing one, or delete it first to generate a new one.",
      );
      return;
    }

    // 1) Already generated and saved for this URL: open that record instead
    // of generating again, so saving updates it rather than creating a copy.
    try {
      const existing = await findByUrl(url).unwrap();
      if (existing) {
        openSaved(existing, url);
        return;
      }
    } catch {
      // a 404 means nothing is saved for this URL yet; any other failure
      // should not block generating either
    }

    // 2) Nothing saved: generate a fresh one.
    try {
      const data = await generate({
        url,
        clientName: intake.clientName.trim(),
        file: intake.file,
        images: intake.images.map((image) => image.file),
        ...tenant,
      }).unwrap();

      const generated = unwrapGeneratedKb(data);
      const isValid = generated !== null && typeof generated === "object";
      if (data?.success === false || data?.error || !isValid) {
        setGenerateError(
          getApiErrorMessage(
            { data },
            "Could not generate a valid knowledge base from that source.",
          ),
        );
        return;
      }

      setKb(generated);
      setActive({ ...NO_ACTIVE, sourceUrl: url });
      setPhase("edit");
      clearIntake();
    } catch (err) {
      setGenerateError(getApiErrorMessage(err, GENERATE_ERROR));
    }
  };

  const handleEdit = async (id) => {
    setOpeningId(id);
    try {
      const doc = await fetchById(id).unwrap();
      if (doc) openSaved(doc);
    } catch (err) {
      showToast({
        message: getApiErrorMessage(err, "Could not load that knowledge base."),
        type: "error",
      });
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = await confirm(
      "Delete this knowledge base? Your AI will have nothing to answer from until you generate a new one.",
      { title: "Delete knowledge base" },
    );
    if (!confirmed) return;

    await run(remove(item._id), {
      success: "Knowledge base deleted",
      error: "Could not delete the knowledge base.",
    });
  };

  const handleSave = async () => {
    const doc = await run(
      save({
        ...kb,
        id: active.id || undefined,
        source_url: active.sourceUrl || undefined,
        ...tenant,
      }),
      {
        success: active.id ? "Changes saved" : "Knowledge base published",
        error: "Failed to save knowledge base",
      },
    );

    // show what the server actually stored
    if (doc?._id) openSaved(doc, active.sourceUrl);
  };

  return {
    phase,
    list: {
      items,
      loading: list.isLoading || list.isUninitialized,
      error: list.isError
        ? getApiErrorMessage(list.error, "Could not load saved knowledge bases.")
        : "",
      refetch: list.refetch,
      openingId,
    },
    intake: { values: intake, setValues: setIntake, generating, error: generateError },
    editor: { kb, setKb, savedId: active.id, updatedAt: active.updatedAt, saving },
    actions: {
      startOver,
      backToList: () => setPhase("list"),
      generate: handleGenerate,
      edit: handleEdit,
      remove: handleDelete,
      save: handleSave,
    },
  };
};
