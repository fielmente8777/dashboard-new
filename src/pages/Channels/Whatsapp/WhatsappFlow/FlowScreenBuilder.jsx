import { useState } from "react";
import { FiX } from "react-icons/fi";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { useToast } from "../../../../context/ToastContext";
import { createWhatAppFlow } from "../../../../services/api/whatsApp";
import Loader from "../../../../components/Loader";
const FLOW_INPUTS = [
  {
    label: "Short Answer",
    value: "text",
  },
  {
    label: "Long Text",
    value: "textarea",
  },
  {
    label: "Email",
    value: "email",
  },
  {
    label: "Number",
    value: "number",
  },
  {
    label: "Date",
    value: "date",
  },
];

const FlowScreenBuilder = ({ flowMeta }) => {
  const { showToast } = useToast();
  const [screens, setScreens] = useState([
    { id: 1, title: "Sign up", fields: [] },
  ]);

  const [activeScreen, setActiveScreen] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const addField = () => {
    const updated = [...screens];
    updated[activeScreen].fields.push({
      label: "New Field",
      type: "text",
      required: false,
    });
    setScreens(updated);
  };

  const handlePublishFlow = async () => {
    setIsPublishing(true);

    try {
      const payload = {
        flowName: flowMeta?.name,
        screens, // 🔥 important
        category: flowMeta?.category,
      };

      const response = await createWhatAppFlow(payload);

      if (response?.success) {
        showToast({
          message: "Flow created successfully",
          type: "success",
        });

        return;
      }
      showToast({
        message: response?.responseMessage,
        type: "error",
      });
    } catch (error) {
      console.log(error);
      showToast({
        message: error?.message || "Failed to publish flow",
        type: "error",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center p-3 border-b bg-white">
        <h2 className="font-semibold text-gray-800">{flowMeta?.name}</h2>

        <div className="flex gap-2">
          {/* <button className="border px-3 py-1 rounded text-sm hover:bg-gray-100">
            Save as draft
          </button> */}
          <button
            disabled={isPublishing}
            onClick={handlePublishFlow}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm flex items-center gap-2"
          >
            Publish {isPublishing && <Loader color="#fefefe" size={16} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: SCREENS */}
        <div className="max-w-72 w-full border-r bg-white p-3 space-y-2">
          <p className="text-xs text-gray-500 mb-2">SCREENS</p>

          {screens.map((screen, index) => (
            <div
              key={screen.id}
              //   className={`group flex items-center justify-between p-2 rounded cursor-pointer ${
              //     activeScreen === index
              //       ? "bg-primary/90 text-white"
              //       : "hover:bg-gray-100"
              //   }`}
              className={`group flex items-center justify-between p-2 rounded cursor-pointer transition ${
                activeScreen === index
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveScreen(index)}
            >
              <span>{screen.title}</span>

              {/* Delete button (only on hover) */}
              {screens.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    const updated = screens.filter((_, i) => i !== index);
                    setScreens(updated);

                    if (activeScreen >= updated.length) {
                      setActiveScreen(updated.length - 1);
                    }
                  }}
                  className="size-4 rounded-full flex justify-center items-center bg-red-200 opacity-0 group-hover:opacity-100 text-red-500 text-xs"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() =>
              setScreens([
                ...screens,
                {
                  id: Date.now(),
                  title: "New Screen",
                  fields: [],
                },
              ])
            }
            className="mt-3 text-xs border text-primary border-primary/40! hover:bg-primary hover:text-white p-2 rounded-md duration-300"
          >
            + Add Screen
          </button>
        </div>

        <div className="flex flex-1 p-4 overflow-y-auto bg-gray-50">
          {/* CENTER: CONTENT */}
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-xs text-gray-500 mb-2">CONTENT</p>

            {/* Screen Title */}
            <input
              value={screens[activeScreen].title}
              onChange={(e) => {
                const updated = [...screens];
                updated[activeScreen].title = e.target.value;
                setScreens(updated);
              }}
              className="border border-gray-300! focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full p-2 mb-4 rounded"
            />

            {/* Fields */}
            {screens[activeScreen].fields.map((field, i) => (
              <div
                key={i}
                className="relative border border-gray-200 bg-white p-3 mb-3 rounded group hover:border-gray-300 transition space-y-2"
              >
                {/* Delete button */}
                <button
                  onClick={() => {
                    const updated = [...screens];
                    updated[activeScreen].fields.splice(i, 1);
                    setScreens(updated);
                  }}
                  className="absolute -top-2 -right-1 bg-red-200 rounded-full size-4 flex justify-center items-center text-red-500 opacity-0 group-hover:opacity-100 text-xs"
                >
                  <FiX size={12} />
                </button>

                {/* Label */}
                <input
                  value={field.label}
                  onChange={(e) => {
                    const updated = [...screens];
                    updated[activeScreen].fields[i].label = e.target.value;
                    setScreens(updated);
                  }}
                  className="border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full p-2 rounded"
                />

                {/* Field Type */}
                <div className="w-full">
                  <CustomDropdown
                    options={FLOW_INPUTS}
                    onChange={(value) => {
                      const updated = [...screens];
                      updated[activeScreen].fields[i].type = value;
                      setScreens(updated);
                    }}
                  />
                </div>

                {/* Required toggle (only on hover) */}
                <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition duration-150">
                  <span className="text-xs text-gray-500">Required</span>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={() => {
                      const updated = [...screens];
                      updated[activeScreen].fields[i].required =
                        !field.required;
                      setScreens(updated);
                    }}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addField}
              className="mt-2 border border-primary/60! text-primary hover:bg-primary/90 hover:text-white p-2 rounded-md text-xs duration-300"
            >
              + Add Field
            </button>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="max-w-96 w-full border-l p-2 flex justify-center items-start">
            <div className="bg-white border rounded-lg p-3 shadow w-full">
              <h3 className="text-center font-semibold mb-3">
                {screens[activeScreen].title}
              </h3>

              {screens[activeScreen].fields.map((field, i) => (
                <input
                  key={i}
                  placeholder={field.label}
                  className="border w-full p-2 mb-2 rounded"
                />
              ))}

              <button className="w-full bg-green-500 text-white py-2 rounded mt-2">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowScreenBuilder;
