import { useState } from "react";
import { FiX } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export default function CarouselSettings({ onSave, onCancel, data }) {
  const { setFilesMapCarousel } = data;

  const [body, setBody] = useState("Choose an option");

  const [cards, setCards] = useState([
    {
      id: uuidv4(),
      headerType: "image",
      headerText: "",
      previewUrl: "",
      description: "",
      buttons: ["Option 1"],
    },
  ]);

  // ✅ IMAGE HANDLER
  const handleImageUpload = (e, cardId) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    // store file
    setFilesMap((prev) => ({
      ...prev,
      [cardId]: file,
    }));

    // update UI
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, previewUrl } : c)),
    );
  };

  // ➕ ADD CARD
  const addCard = () => {
    if (cards.length >= 10) return;

    setCards((prev) => [
      ...prev,
      {
        id: uuidv4(),
        headerType: "image",
        headerText: "",
        previewUrl: "",
        description: "",
        buttons: ["Option 1"],
      },
    ]);
  };

  const removeCard = (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));

    setFilesMapCarousel((prev) => {
      const updated = { ...prev };
      delete updated[`carousel_${cardId}`]; // 🔥 match key
      return updated;
    });
  };

  // ✏️ UPDATE CARD
  const updateCard = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  // ➕ ADD BUTTON
  const addButton = (cardIndex) => {
    const updated = [...cards];
    if (updated[cardIndex].buttons.length >= 3) return;

    updated[cardIndex].buttons.push("New Button");
    setCards(updated);
  };

  const removeButton = (cardIndex, btnIndex) => {
    const updated = [...cards];
    updated[cardIndex].buttons.splice(btnIndex, 1);
    setCards(updated);
  };

  // ✏️ UPDATE BUTTON
  const updateButton = (cardIndex, btnIndex, value) => {
    const updated = [...cards];
    updated[cardIndex].buttons[btnIndex] = value;
    setCards(updated);
  };

  const handleSave = () => {
    const cardsPayload = cards.map((card, index) => {
      const fileKey = `carousel_${card.id}`;

      let header = {};

      if (card.headerType === "image") {
        header = {
          type: "image",
          image: {
            link: fileKey, // 🔥 IMPORTANT (not URL)
          },
        };
      } else {
        header = {
          type: "text",
          text: card.headerText || "Title",
        };
      }

      return {
        card_index: index,
        header,
        body: {
          text: card.description || "",
        },
        action: {
          buttons: card.buttons.map((btn, btnIndex) => ({
            type: "quick_reply",
            quick_reply: {
              id: `card_${index}_btn_${btnIndex}_${uuidv4()}`,
              title: btn,
            },
          })),
        },
      };
    });

    const payload = {
      type: "interactive",
      interactive: {
        type: "carousel",
        body: { text: body },
        action: {
          cards: cardsPayload,
        },
      },
    };

    onSave(payload);
  };

  return (
    <div className="bg-white w-full rounded-lg shadow-lg p-5 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Set Carousel</h2>
        <FiX onClick={onCancel} className="cursor-pointer" />
      </div>

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="border rounded w-full p-2 mb-4"
      />

      {/* Cards */}
      {cards.map((card, index) => (
        <div key={card.id} className="border rounded p-3 mb-4">
          <div className="flex justify-between">
            <h3>Card {index + 1}</h3>

            {cards.length > 1 && (
              <button
                onClick={() => removeCard(card.id)}
                className="text-red-500"
              >
                Remove
              </button>
            )}
          </div>

          {/* Header Type */}
          <select
            value={card.headerType}
            onChange={(e) => updateCard(index, "headerType", e.target.value)}
            className="border w-full p-2 mb-2"
          >
            <option value="image">Image</option>
            <option value="text">Text</option>
          </select>

          {/* IMAGE */}
          {card.headerType === "image" && (
            <>
              <input
                type="file"
                onChange={(e) => handleImageUpload(e, card.id)}
              />

              {card.previewUrl && (
                <img
                  src={card.previewUrl}
                  className="w-full h-32 object-cover mt-2"
                />
              )}
            </>
          )}

          {/* TEXT HEADER */}
          {card.headerType === "text" && (
            <input
              value={card.headerText}
              onChange={(e) => updateCard(index, "headerText", e.target.value)}
              className="border w-full p-2 mb-2"
            />
          )}

          {/* DESCRIPTION */}
          <textarea
            value={card.description}
            onChange={(e) => updateCard(index, "description", e.target.value)}
            className="border w-full p-2 mb-2"
          />

          {/* BUTTONS */}
          {card.buttons.map((btn, btnIndex) => (
            <div key={btnIndex} className="flex gap-2 mb-2">
              <input
                value={btn}
                onChange={(e) => updateButton(index, btnIndex, e.target.value)}
                className="border w-full p-2"
              />

              <button
                onClick={() => removeButton(index, btnIndex)}
                className="text-red-500"
              >
                X
              </button>
            </div>
          ))}

          {card.buttons.length < 3 && (
            <button
              onClick={() => addButton(index)}
              className="bg-green-500 text-white px-2 py-1"
            >
              Add Button
            </button>
          )}
        </div>
      ))}

      {/* Add Card */}
      <button
        onClick={addCard}
        className="bg-blue-500 text-white px-4 py-2 mb-4"
      >
        Add Card
      </button>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-5 py-2"
        >
          Save
        </button>
      </div>
    </div>
  );
}
