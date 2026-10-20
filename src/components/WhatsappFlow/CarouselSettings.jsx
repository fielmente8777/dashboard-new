import { useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import IconButton from "../ui/IconButton";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "../../context/ToastContext";
import {
  deleteImageFromServer,
  uploadImageToServer,
} from "../../redux/api/uploadApi";
import { isS3Image } from "../../utils/isS3Image";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { charHint } from "./blockStyles";
import { SettingsFooter, SettingsSection } from "./SettingsParts";

const transformCardsFromAPI = (cards = []) => {
  return cards.map((card) => ({
    id: uuidv4(),

    type: card?.action?.buttons?.length ? "quick_reply" : "cta_url",

    // detect media type
    mediaType: card?.header?.image?.link?.startsWith("http")
      ? "link"
      : "upload",

    previewUrl: card?.header?.image?.link || "",
    imageLink: card?.header?.image?.link || "",

    description: card?.body?.text || "",

    buttonText: card?.action?.parameters?.display_text || "",
    buttonUrl: card?.action?.parameters?.url || "",

    buttons: card?.action?.buttons?.map((b) => b.quick_reply.title) || [
      "Option 1",
    ],
  }));
};

export default function CarouselSettings({ onSave, onCancel, data }) {
  const { showToast } = useToast();
  const initialType = data?.interactive?.action?.cards?.[0]?.action?.buttons
    ?.length
    ? "quick_reply"
    : "cta_url";

  // const { setFilesMap } = data;
  const [filesMap, setFilesMap] = useState({});

  const [globalType, setGlobalType] = useState(initialType);
  const [body, setBody] = useState("Choose an option");

  const [cards, setCards] = useState(
    transformCardsFromAPI(data?.interactive?.action?.cards) || [
      {
        id: uuidv4(),
        type: "cta_url",
        mediaType: "upload", // 🔥 NEW (upload | link)
        previewUrl: "",
        imageLink: "",
        description: "",
        buttonText: "",
        buttonUrl: "",
        buttons: ["Option 1"],
      },
    ],
  );

  // ===== IMAGE HANDLER =====
  const handleImageUpload = async (e, cardId) => {
    const card = cards.find((c) => c.id === cardId);
    const isBucketImage = isS3Image(card?.imageLink);

    if (isBucketImage) {
      await deleteImageFromServer(card?.imageLink);
    }

    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setFilesMap((prev) => ({
      ...prev,
      [cardId]: file,
    }));

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, previewUrl } : c)),
    );
  };

  const updateCard = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const addCard = () => {
    if (cards.length >= 10) {
      showToast({
        type: "error",
        message: "You can add up to 10 cards",
      });
      return;
    }

    setCards((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: "cta_url",
        mediaType: "upload",
        previewUrl: "",
        imageLink: "",
        description: "",
        buttonText: "",
        buttonUrl: "",
        buttons: ["Option 1"],
      },
    ]);
  };

  const removeCard = async (cardId) => {
    // const card = cards.find((c) => c.id === cardId);

    // const isBucketImage = isS3Image(card?.imageLink);

    // if(isBucketImage) {
    //   await deleteImageFromServer(card?.imageLink);
    // }

    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const addButton = (cardIndex) => {
    const updated = [...cards];
    if (updated[cardIndex].buttons.length >= 2) {
      showToast({
        type: "error",
        message: "You can add up to 2 buttons per card",
      });
      return;
    } // WhatsApp limit

    updated[cardIndex].buttons.push("New Button");
    setCards(updated);
  };

  const removeButton = (cardIndex, btnIndex) => {
    const updated = [...cards];
    updated[cardIndex].buttons.splice(btnIndex, 1);
    setCards(updated);
  };

  const updateButton = (cardIndex, btnIndex, value) => {
    const updated = [...cards];
    updated[cardIndex].buttons[btnIndex] = value;
    setCards(updated);
  };

  // ===== SAVE =====
  const handleSave = async () => {
    const filesMapData = filesMap;

    // 🔥 STEP 1: Upload all images
    const uploadedMap = {};

    for (const card of cards) {
      if (card.mediaType === "upload" && filesMap[card.id]) {
        const file = filesMapData[card.id];
        const response = await uploadImageToServer(file);

        if (response?.success) {
          uploadedMap[card.id] = response?.result?.doc?.imageUrl;
        }
      }
    }

    const cardsPayload = cards.map((card, index) => {
      const base = {
        id: card.id,
        card_index: index,
        type: "cta_url",
        header: {
          type: "image",
          image:
            card.mediaType === "upload"
              ? { link: uploadedMap[card.id] } // will replace later with mediaId
              : { link: card.imageLink },
        },
        ...(card?.description && { body: { text: card.description } }),
      };

      if (globalType === "cta_url") {
        base.action = {
          name: "cta_url",
          parameters: {
            display_text: card.buttonText || "Click",
            url: card.buttonUrl || "https://example.com",
          },
        };
      }

      if (globalType === "quick_reply") {
        base.action = {
          buttons: card.buttons.map((btn, i) => ({
            type: "quick_reply",
            quick_reply: {
              id: `card_${index}_btn_${i}_${uuidv4()}`,
              title: btn,
            },
          })),
        };
      }

      return base;
    });

    const payload = {
      type: "interactive",
      interactive: {
        type: "carousel",
        body: { text: body },
        action: { cards: cardsPayload },
      },
    };

    onSave(payload);
  };

  return (
    <div className="space-y-4">
      <SettingsSection title="Message">
        <Field label="Text above the cards" hint={charHint(body, 1024)}>
          <Textarea
            value={body}
            maxLength={1024}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter message..."
          />
        </Field>

        <Field as="div" label="Card buttons" hint="The same kind of button on every card.">
          <Select
            aria-label="Button type"
            value={globalType}
            onChange={(e) => setGlobalType(e.target.value)}
            options={[
              { value: "cta_url", label: "Link button (opens a website)" },
              { value: "quick_reply", label: "Quick reply buttons" },
            ]}
          />
        </Field>
      </SettingsSection>

      {cards?.map((card, index) => {
        const inputId = `carousel-image-${card.id}`;

        return (
          <SettingsSection
            key={card.id}
            title={`Card ${index + 1}`}
            actions={
              cards?.length > 1 && (
                <IconButton
                  icon={Trash2}
                  label="Remove card"
                  tone="danger"
                  onClick={() => removeCard(card.id)}
                />
              )
            }
          >
            <Field as="div" label="Image">
              <Select
                aria-label="Image source"
                value={card.mediaType}
                onChange={(e) => updateCard(index, "mediaType", e.target.value)}
                options={[
                  { value: "upload", label: "Upload Image" },
                  { value: "link", label: "Image Link" },
                ]}
              />
            </Field>

            {card.mediaType === "upload" ? (
              <>
                <input
                  id={inputId}
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  hidden
                  onChange={(e) => handleImageUpload(e, card.id)}
                />
                <label
                  htmlFor={inputId}
                  className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-app-border! bg-app-surface-secondary text-app-text-muted transition hover:border-blue-500! hover:text-blue-500"
                >
                  <Icon icon={Upload} size="lg" />
                  <span className="text-xs font-medium">
                    {card.previewUrl ? "Change image" : "Upload image"}
                  </span>
                  <span className="text-[11px] text-app-text-faint">JPG or PNG</span>
                </label>
              </>
            ) : (
              <Input
                placeholder="Paste image URL"
                value={card.imageLink}
                onChange={(e) => updateCard(index, "imageLink", e.target.value)}
              />
            )}

            {(card.previewUrl || card.imageLink) && (
              <img
                src={card.previewUrl || card.imageLink}
                alt=""
                className="h-36 w-full rounded-lg border border-app-border! object-cover"
              />
            )}

            <Field label="Description" hint={charHint(card.description, 160)}>
              <Textarea
                value={card.description}
                onChange={(e) => updateCard(index, "description", e.target.value)}
                placeholder="Card description..."
              />
            </Field>

            {globalType === "cta_url" && (
              <>
                <Field label="Button text" hint={charHint(card.buttonText, 20)}>
                  <Input
                    placeholder="Button Text"
                    value={card.buttonText}
                    maxLength={20}
                    onChange={(e) => updateCard(index, "buttonText", e.target.value)}
                  />
                </Field>
                <Field label="Button link">
                  <Input
                    placeholder="https://example.com"
                    value={card.buttonUrl}
                    onChange={(e) => updateCard(index, "buttonUrl", e.target.value)}
                  />
                </Field>
              </>
            )}

            {globalType === "quick_reply" && (
              <div className="space-y-2">
                <span className="block text-xs font-medium text-app-text-muted">Quick replies</span>
                {card.buttons.map((btn, btnIndex) => (
                  <div key={btnIndex} className="flex items-center gap-2">
                    <Input
                      value={btn}
                      onChange={(e) => updateButton(index, btnIndex, e.target.value)}
                      maxLength={20}
                      placeholder={`Button ${btnIndex + 1}`}
                      aria-label={`Button ${btnIndex + 1}`}
                    />
                    {card.buttons.length > 1 && (
                      <IconButton
                        icon={X}
                        label="Remove button"
                        tone="danger"
                        onClick={() => removeButton(index, btnIndex)}
                      />
                    )}
                  </div>
                ))}

                {card.buttons.length < 3 && (
                  <Button variant="dashed" size="sm" icon={Plus} className="w-full" onClick={() => addButton(index)}>
                    Add button
                  </Button>
                )}
              </div>
            )}
          </SettingsSection>
        );
      })}

      <Button variant="dashed" icon={Plus} className="w-full" onClick={addCard}>
        Add card
      </Button>

      <SettingsFooter onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
