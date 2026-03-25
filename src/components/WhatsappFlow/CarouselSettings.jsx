import { useState } from "react";
import { FiX } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export default function CarouselSettings({ onSave, onCancel }) {
  const [body, setBody] = useState("Choose an option");
  const [cards, setCards] = useState([
    {
      title: "",
      description: "",
      buttons: ["Option 1"],
    },
  ]);

  const addCard = () => {
    if (cards.length >= 10) return;

    setCards((prev) => [
      ...prev,
      { title: "", description: "", buttons: ["Option 1"] },
    ]);
  };

  const updateCard = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const addButton = (cardIndex) => {
    const updated = [...cards];
    if (updated[cardIndex].buttons.length >= 3) return;

    updated[cardIndex].buttons.push("New Button");
    setCards(updated);
  };

  const updateButton = (cardIndex, btnIndex, value) => {
    const updated = [...cards];
    updated[cardIndex].buttons[btnIndex] = value;
    setCards(updated);
  };

  const handleSave = () => {
    const interactiveMessage = {
      type: "interactive",
      interactive: {
        type: "carousel",

        body: {
          text: body,
        },

        action: {
          cards: cards.map((card, index) => ({
            card_index: index,

            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "text",
                    text: card.title || "Title",
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: card.description || "Description",
                  },
                ],
              },
              {
                type: "buttons",
                buttons: card.buttons.map((btn, btnIndex) => ({
                  type: "reply",
                  reply: {
                    id: `card_${index}_btn_${btnIndex}_${uuidv4()}`,
                    title: btn,
                  },
                })),
              },
            ],
          })),
        },
      },
    };

    onSave(interactiveMessage);
  };

  return (
    <div className="bg-white w-full rounded-lg shadow-lg p-5 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Set Carousel</h2>
        <FiX className="cursor-pointer" onClick={onCancel} />
      </div>

      {/* Body */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">Body Text (required)</label>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="border rounded w-full p-2 mt-1"
          rows={3}
        />
      </div>

      {/* Cards */}
      {cards.map((card, index) => (
        <div key={index} className="border rounded p-3 mb-4">
          <h3 className="font-medium mb-2">Card {index + 1}</h3>

          {/* Title */}
          <input
            value={card.title}
            onChange={(e) => updateCard(index, "title", e.target.value)}
            placeholder="Card Title"
            className="border rounded w-full p-2 mb-2"
          />

          {/* Description */}
          <textarea
            value={card.description}
            onChange={(e) => updateCard(index, "description", e.target.value)}
            placeholder="Card Description"
            className="border rounded w-full p-2 mb-2"
            rows={2}
          />

          {/* Buttons */}
          {card.buttons.map((btn, btnIndex) => (
            <input
              key={btnIndex}
              value={btn}
              maxLength={20}
              onChange={(e) => updateButton(index, btnIndex, e.target.value)}
              className="border rounded w-full p-2 mb-2"
              placeholder={`Button ${btnIndex + 1}`}
            />
          ))}

          {card.buttons.length < 3 && (
            <button
              onClick={() => addButton(index)}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Add Button
            </button>
          )}
        </div>
      ))}

      {/* Add Card */}
      {cards.length < 10 && (
        <button
          onClick={addCard}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Add Card
        </button>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="border px-4 py-2 rounded text-gray-600"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-5 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
