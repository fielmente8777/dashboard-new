import { Plus, Tag } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input, Textarea } from "../../components/ui/Field";
import ImagePicker from "../../components/ui/ImagePicker";
import PageShell from "../../components/ui/PageShell";
import TagInput from "../../components/ui/TagInput";
import { useConfirm } from "../../context/ConfirmContext";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useSaveOffersMutation } from "../../redux/api/cmsApi";
import ContentCard from "./components/ContentCard";
import ContentGrid from "./components/ContentGrid";
import { useCmsAction } from "./hooks/useCmsAction";
import { useWebsiteData } from "./hooks/useWebsiteData";
import { formatDate } from "./utils";
import DatePicker from "../../components/ui/DatePicker";

const EMPTY_FORM = {
  name: "",
  hotel: "",
  description: "",
  valid: "",
  inclusion: [],
  details: "",
};

const Offers = () => {
  const { data, isLoading } = useWebsiteData();
  const { confirm } = useConfirm();
  const runCmsAction = useCmsAction();
  const { upload, isUploading } = useImageUpload();
  const [saveOffers, { isLoading: isSaving }] = useSaveOffersMutation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);

  // The endpoint replaces the whole list, so every save sends the current
  // offers from the store plus or minus the one being changed.
  const offers = data?.Offers || [];
  const setField = (name) => (e) =>
    setForm({ ...form, [name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageUrl = await upload(image);
    if (!imageUrl) return;

    const added = await runCmsAction(
      saveOffers({ offer: [...offers, { ...form, image: imageUrl }] }),
      { success: "Offer added", error: "Could not add the offer." },
    );

    if (added) {
      setForm(EMPTY_FORM);
      setImage(null);
    }
  };

  const handleDelete = async (offer, index) => {
    const confirmed = await confirm(
      `Delete "${offer.name}"? This cannot be undone.`,
      { title: "Delete offer" },
    );
    if (!confirmed) return;

    await runCmsAction(
      saveOffers({ offer: offers.filter((_, i) => i !== index) }),
      { success: "Offer deleted", error: "Could not delete the offer." },
    );
  };

  return (
    <PageShell
      title="Offers"
      description="Deals and packages shown on your website."
    >
      <ContentGrid
        isLoading={isLoading}
        isEmpty={offers.length === 0}
        emptyIcon={Tag}
        emptyTitle="No offers yet"
      >
        {offers.map((offer, index) => (
          <ContentCard
            key={`${index}-${offer.name}`}
            image={offer.image}
            title={offer.name}
            onDelete={() => handleDelete(offer, index)}
          >
            <p>{offer.description}</p>
            {offer.valid && (
              <p className="text-xs font-medium text-app-text">
                Valid till {formatDate(offer.valid)}
              </p>
            )}
            {offer.inclusion?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-app-text">Includes</p>
                <ul className="list-disc pl-4">
                  {offer.inclusion.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {offer.details && (
              <div>
                <p className="text-xs font-medium text-app-text">
                  Need to know
                </p>
                <p>{offer.details}</p>
              </div>
            )}
          </ContentCard>
        ))}
      </ContentGrid>

      <Card title="Add offer">
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <Field label="Offer image" as="div" className="lg:row-span-3">
            <ImagePicker file={image} onChange={setImage} className="h-52" />
          </Field>

          <Field label="Offer name">
            <Input
              required
              value={form.name}
              onChange={setField("name")}
              placeholder="e.g. Monsoon Getaway"
            />
          </Field>
          <Field label="Hotel">
            <Input
              required
              value={form.hotel}
              onChange={setField("hotel")}
              placeholder="Hotel name"
            />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea
              required
              rows={2}
              value={form.description}
              onChange={setField("description")}
              placeholder="What does the guest get?"
            />
          </Field>
          <Field label="Valid till">
            <DatePicker
              value={form.valid}
              onChange={(valid) => setForm({ ...form, valid })}
            />
          </Field>
          <Field label="Need to know">
            <Input
              required
              value={form.details}
              onChange={setField("details")}
              placeholder="Terms, blackout dates, ..."
            />
          </Field>
          <Field label="Inclusions" as="div" className="md:col-span-2">
            <TagInput
              value={form.inclusion}
              onChange={(inclusion) => setForm({ ...form, inclusion })}
              placeholder="e.g. Breakfast for two"
            />
          </Field>

          <div className="flex items-end justify-end">
            <Button
              type="submit"
              icon={Plus}
              loading={isUploading || isSaving}
              disabled={!image || !form.valid}
            >
              Add offer
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
};

export default Offers;
