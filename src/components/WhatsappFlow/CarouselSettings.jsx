import { useState, useRef } from "react";
import { FiX, FiUpload, FiImage } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

const transformCardsFromAPI = (cards = []) => {
  return cards.map((card) => ({
    id: uuidv4(),

    type: card.type || "cta_url",

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
  const fileInputRef = useRef(null);

  const { setFilesMap } = data;

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
  const handleImageUpload = (e, cardId) => {
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
    if (cards.length >= 10) return;

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

  const removeCard = (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // ===== SAVE =====
  const handleSave = () => {
    const cardsPayload = cards.map((card, index) => {
      const base = {
        card_index: index,
        type: card.type,
        header: {
          type: "image",
          image:
            card.mediaType === "upload"
              ? { link: card.id } // will replace later with mediaId
              : { link: card.imageLink },
        },
        ...(card?.description && { body: { text: card.description } }),
      };

      if (card.type === "cta_url") {
        base.action = {
          name: "cta_url",
          parameters: {
            display_text: card.buttonText || "Click",
            url: card.buttonUrl || "https://example.com",
          },
        };
      }

      if (card.type === "button") {
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
    console.log(payload);
    onSave(payload);
  };

  return (
    <div className="bg-white w-full rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-xl">Carousel Settings</h2>
        <FiX onClick={onCancel} className="cursor-pointer text-xl" />
      </div>

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="border rounded-lg w-full p-3 mb-6"
        placeholder="Enter message..."
      />

      {/* Cards */}
      {cards.map((card, index) => {
        return (
          <div key={card.id} className="border rounded-xl p-4 mb-5 bg-gray-50">
            <div className="flex justify-between mb-3">
              <h3 className="font-medium">Card {index + 1}</h3>

              {cards.length > 1 && (
                <button
                  onClick={() => removeCard(card.id)}
                  className="text-red-500"
                >
                  Remove
                </button>
              )}
            </div>

            {/* TYPE */}
            <select
              value={card.type}
              onChange={(e) => updateCard(index, "type", e.target.value)}
              className="border w-full p-2 mb-3 rounded"
            >
              <option value="cta_url">CTA URL</option>
              <option value="button">Quick Reply</option>
            </select>

            {/* IMAGE SOURCE TYPE */}
            <select
              value={card.mediaType}
              onChange={(e) => updateCard(index, "mediaType", e.target.value)}
              className="border w-full p-2 mb-3 rounded"
            >
              <option value="upload">Upload Image</option>
              <option value="link">Image Link</option>
            </select>

            {/* IMAGE INPUT */}
            {card.mediaType === "upload" ? (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={(e) => handleImageUpload(e, card.id)}
                />

                <div
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center justify-center border-2 border-dashed rounded-lg h-32 cursor-pointer bg-white hover:bg-gray-100"
                >
                  <div className="text-center text-gray-500">
                    <FiUpload className="mx-auto text-2xl mb-1" />
                    Upload Image
                  </div>
                </div>
              </>
            ) : (
              <input
                placeholder="Paste image URL"
                value={card.imageLink}
                onChange={(e) => updateCard(index, "imageLink", e.target.value)}
                className="border w-full p-2 mb-3 rounded"
              />
            )}

            {/* PREVIEW */}
            {(card.previewUrl || card.imageLink) && (
              <img
                src={card.previewUrl || card.imageLink}
                className="w-full h-36 object-cover rounded-lg mt-3 border"
              />
            )}

            {/* DESCRIPTION */}
            <textarea
              value={card.description}
              onChange={(e) => updateCard(index, "description", e.target.value)}
              className="border w-full p-2 mt-3 mb-3 rounded"
              placeholder="Card description..."
            />

            {/* CTA */}
            {card.type === "cta_url" && (
              <>
                <input
                  placeholder="Button Text"
                  value={card.buttonText}
                  onChange={(e) =>
                    updateCard(index, "buttonText", e.target.value)
                  }
                  className="border w-full p-2 mb-2 rounded"
                />
                <input
                  placeholder="https://example.com"
                  value={card.buttonUrl}
                  onChange={(e) =>
                    updateCard(index, "buttonUrl", e.target.value)
                  }
                  className="border w-full p-2 rounded"
                />
              </>
            )}

            {/* QUICK REPLY */}
            {card.type === "button" &&
              card.buttons.map((btn, i) => (
                <input
                  key={i}
                  value={btn}
                  onChange={(e) => {
                    const updated = [...cards];
                    updated[index].buttons[i] = e.target.value;
                    setCards(updated);
                  }}
                  className="border w-full p-2 mb-2 rounded"
                />
              ))}
          </div>
        );
      })}

      {/* Add Card */}
      <button
        onClick={addCard}
        className="bg-primary text-white px-4 py-2 rounded-lg mb-4"
      >
        + Add Card
      </button>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={handleSave}
          className="bg-primary text-white px-5 py-2 rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { FiX } from "react-icons/fi";
// import { v4 as uuidv4 } from "uuid";

// export default function CarouselSettings({ onSave, onCancel, data }) {
//   const { setFilesMap, filesMap } = data;

//   const [body, setBody] = useState("Choose an option");

//   const [cards, setCards] = useState(
//     data?.interactive?.action?.cards || [
//       {
//         id: uuidv4(),
//         type: "cta_url", // 🔥 default
//         previewUrl: "",
//         description: "",

//         // CTA
//         buttonText: "",
//         buttonUrl: "",

//         // Quick Reply
//         buttons: ["Option 1"],
//       },
//     ],
//   );

//   // ✅ IMAGE HANDLER
//   // const handleImageUpload = (e, cardId) => {
//   //   const file = e.target.files[0];
//   //   if (!file) return;

//   //   const previewUrl = URL.createObjectURL(file);

//   //   setFilesMapCarousel((prev) => ({
//   //     ...prev,
//   //     [`carousel_${cardId}`]: file,
//   //   }));

//   //   setCards((prev) =>
//   //     prev.map((c) => (c.id === cardId ? { ...c, previewUrl } : c)),
//   //   );
//   // };

//   const handleImageUpload = (e, cardId) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const previewUrl = URL.createObjectURL(file);

//     setFilesMap((prev) => ({
//       ...prev,
//       [`${cardId}`]: file, // ✅ unified key
//     }));

//     setCards((prev) =>
//       prev.map((c) => (c.id === cardId ? { ...c, previewUrl } : c)),
//     );
//   };

//   const addCard = () => {
//     if (cards.length >= 10) return;

//     setCards((prev) => [
//       ...prev,
//       {
//         id: uuidv4(),
//         type: "cta_url",
//         previewUrl: "",
//         description: "",
//         buttonText: "",
//         buttonUrl: "",
//         buttons: ["Option 1"],
//       },
//     ]);
//   };

//   const removeCard = (cardId) => {
//     setCards((prev) => prev.filter((c) => c.id !== cardId));

//     // setFilesMapCarousel((prev) => {
//     //   const updated = { ...prev };
//     //   delete updated[`carousel_${cardId}`];
//     //   return updated;
//     // });
//   };

//   const updateCard = (index, field, value) => {
//     const updated = [...cards];
//     updated[index][field] = value;
//     setCards(updated);
//   };

//   // ===== QUICK REPLY =====
//   const addButton = (cardIndex) => {
//     const updated = [...cards];
//     if (updated[cardIndex].buttons.length >= 3) return;

//     updated[cardIndex].buttons.push("New Button");
//     setCards(updated);
//   };

//   const removeButton = (cardIndex, btnIndex) => {
//     const updated = [...cards];
//     updated[cardIndex].buttons.splice(btnIndex, 1);
//     setCards(updated);
//   };

//   const updateButton = (cardIndex, btnIndex, value) => {
//     const updated = [...cards];
//     updated[cardIndex].buttons[btnIndex] = value;
//     setCards(updated);
//   };

//   // ===== SAVE =====
//   const handleSave = () => {
//     const cardsPayload = cards.map((card, index) => {
//       const fileKey = `carousel_${card.id}`;

//       const base = {
//         id: card.id,
//         card_index: index,
//         type: "cta_url", // 🔥 IMPORTANT
//         header: {
//           type: "image",
//           image: {
//             link: fileKey,
//           },
//         },
//         body: {
//           text: card.description || "Description",
//         },
//       };

//       // ✅ CTA URL
//       if (card.type === "cta_url") {
//         base.action = {
//           name: "cta_url",
//           parameters: {
//             display_text: card.buttonText || "Click",
//             url: card.buttonUrl || "https://example.com",
//           },
//         };
//       }

//       // ✅ QUICK REPLY
//       if (card.type === "button") {
//         base.action = {
//           buttons: card.buttons.map((btn, i) => ({
//             type: "quick_reply",
//             quick_reply: {
//               id: `card_${index}_btn_${i}_${uuidv4()}`,
//               title: btn,
//             },
//           })),
//         };
//       }

//       return base;
//     });

//     const payload = {
//       type: "interactive",
//       interactive: {
//         type: "carousel",
//         body: { text: body },
//         action: {
//           cards: cardsPayload,
//         },
//       },
//     };

//     console.log(payload);

//     onSave(payload);
//   };

//   return (
//     <div className="bg-white w-full rounded-lg shadow-lg p-5 max-h-[90vh] overflow-y-auto">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="font-semibold text-lg">Set Carousel</h2>
//         <FiX onClick={onCancel} className="cursor-pointer" />
//       </div>

//       {/* Body */}
//       <textarea
//         value={body}
//         onChange={(e) => setBody(e.target.value)}
//         className="border rounded w-full p-2 mb-4"
//       />

//       {/* Cards */}
//       {cards.map((card, index) => (
//         <div key={card.id} className="border rounded p-3 mb-4">
//           <div className="flex justify-between">
//             <h3>Card {index + 1}</h3>

//             {cards.length > 1 && (
//               <button
//                 onClick={() => removeCard(card.id)}
//                 className="text-red-500"
//               >
//                 Remove
//               </button>
//             )}
//           </div>

//           {/* TYPE SELECT */}
//           <select
//             value={card.type}
//             onChange={(e) => updateCard(index, "type", e.target.value)}
//             className="border w-full p-2 mb-2"
//           >
//             <option value="cta_url">CTA URL</option>
//             <option value="button">Quick Reply</option>
//           </select>

//           {/* IMAGE */}
//           <input type="file" onChange={(e) => handleImageUpload(e, card.id)} />

//           {card.previewUrl && (
//             <img
//               src={card.previewUrl}
//               className="w-full h-32 object-cover mt-2"
//             />
//           )}

//           {/* DESCRIPTION */}
//           <textarea
//             value={card.description}
//             onChange={(e) => updateCard(index, "description", e.target.value)}
//             className="border w-full p-2 mb-2"
//           />

//           {/* CTA */}
//           {card.type === "cta_url" && (
//             <>
//               <input
//                 placeholder="Button Text"
//                 value={card.buttonText}
//                 onChange={(e) =>
//                   updateCard(index, "buttonText", e.target.value)
//                 }
//                 className="border w-full p-2 mb-2"
//               />
//               <input
//                 placeholder="https://example.com"
//                 value={card.buttonUrl}
//                 onChange={(e) => updateCard(index, "buttonUrl", e.target.value)}
//                 className="border w-full p-2 mb-2"
//               />
//             </>
//           )}

//           {/* QUICK REPLY */}
//           {card.type === "button" && (
//             <>
//               {card.buttons.map((btn, btnIndex) => (
//                 <div key={btnIndex} className="flex gap-2 mb-2">
//                   <input
//                     value={btn}
//                     onChange={(e) =>
//                       updateButton(index, btnIndex, e.target.value)
//                     }
//                     className="border w-full p-2"
//                   />
//                   <button
//                     onClick={() => removeButton(index, btnIndex)}
//                     className="text-red-500"
//                   >
//                     X
//                   </button>
//                 </div>
//               ))}

//               {card.buttons.length < 3 && (
//                 <button
//                   onClick={() => addButton(index)}
//                   className="bg-green-500 text-white px-2 py-1"
//                 >
//                   Add Button
//                 </button>
//               )}
//             </>
//           )}
//         </div>
//       ))}

//       {/* Add Card */}
//       <button
//         onClick={addCard}
//         className="bg-blue-500 text-white px-4 py-2 mb-4"
//       >
//         Add Card
//       </button>

//       {/* Footer */}
//       <div className="flex justify-end gap-3">
//         <button onClick={onCancel}>Cancel</button>
//         <button
//           onClick={handleSave}
//           className="bg-green-500 text-white px-5 py-2"
//         >
//           Save
//         </button>
//       </div>
//     </div>
//   );
// }
