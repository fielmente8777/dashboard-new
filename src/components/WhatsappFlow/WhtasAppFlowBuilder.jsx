import React, { useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

export default function WhatsAppFlowsBuilder() {
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);

  const addScreen = () => {
    const newScreen = {
      id: Date.now(),
      name: "New Screen",
      components: [],
    };
    setScreens([...screens, newScreen]);
  };

  const updateScreen = (id, data) => {
    const updated = screens.map((s) => (s.id === id ? { ...s, ...data } : s));
    setScreens(updated);
    setSelectedScreen(updated.find((s) => s.id === id));
  };

  const deleteScreen = (id) => {
    setScreens(screens.filter((s) => s.id !== id));
    setSelectedScreen(null);
  };

  const addComponent = (type) => {
    if (!selectedScreen) return;

    const newComponent = {
      id: Date.now(),
      type,
      label: "",
      value: "",
      options: [],
    };

    updateScreen(selectedScreen.id, {
      components: [...selectedScreen.components, newComponent],
    });
  };

  const updateComponent = (compId, data) => {
    const updatedComponents = selectedScreen.components.map((c) =>
      c.id === compId ? { ...c, ...data } : c,
    );

    updateScreen(selectedScreen.id, { components: updatedComponents });
  };

  const deleteComponent = (compId) => {
    const updatedComponents = selectedScreen.components.filter(
      (c) => c.id !== compId,
    );

    updateScreen(selectedScreen.id, { components: updatedComponents });
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 250, borderRight: "1px solid #ddd", padding: 16 }}>
        <h3>Screens</h3>
        <button onClick={addScreen} style={{ marginBottom: 10 }}>
          <FaPlus /> Add Screen
        </button>

        {screens.map((screen) => (
          <div
            key={screen.id}
            onClick={() => setSelectedScreen(screen)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 8,
              cursor: "pointer",
              background:
                selectedScreen?.id === screen.id ? "#eee" : "transparent",
              marginBottom: 4,
            }}
          >
            <span>{screen.name}</span>
            <FaTrash
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                deleteScreen(screen.id);
              }}
            />
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        {selectedScreen ? (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input
                value={selectedScreen.name}
                onChange={(e) =>
                  updateScreen(selectedScreen.id, { name: e.target.value })
                }
                placeholder="Screen Name"
              />

              <button onClick={() => addComponent("text")}>Text</button>
              <button onClick={() => addComponent("input")}>Input</button>
              <button onClick={() => addComponent("date")}>Date</button>
              <button onClick={() => addComponent("select")}>Select</button>
              <button onClick={() => addComponent("button")}>Button</button>
            </div>

            {selectedScreen.components.map((comp) => (
              <div
                key={comp.id}
                style={{
                  border: "1px solid #ccc",
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>{comp.type}</strong>
                  <FaTrash
                    color="red"
                    style={{ cursor: "pointer" }}
                    onClick={() => deleteComponent(comp.id)}
                  />
                </div>

                <input
                  placeholder="Label"
                  value={comp.label}
                  onChange={(e) =>
                    updateComponent(comp.id, { label: e.target.value })
                  }
                />

                {(comp.type === "text" || comp.type === "input") && (
                  <textarea
                    placeholder="Value"
                    value={comp.value}
                    onChange={(e) =>
                      updateComponent(comp.id, { value: e.target.value })
                    }
                  />
                )}

                {comp.type === "select" && (
                  <div>
                    {comp.options.map((opt, i) => (
                      <div key={i} style={{ display: "flex", gap: 5 }}>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...comp.options];
                            newOpts[i] = e.target.value;
                            updateComponent(comp.id, { options: newOpts });
                          }}
                        />
                        <FaTrash
                          color="red"
                          onClick={() => {
                            const newOpts = comp.options.filter(
                              (_, idx) => idx !== i,
                            );
                            updateComponent(comp.id, { options: newOpts });
                          }}
                        />
                      </div>
                    ))}

                    <button
                      onClick={() =>
                        updateComponent(comp.id, {
                          options: [...comp.options, ""],
                        })
                      }
                    >
                      <FaPlus /> Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <p>Select a screen</p>
        )}
      </div>

      {/* JSON Preview */}
      <div style={{ width: 300, borderLeft: "1px solid #ddd", padding: 16 }}>
        <h3>Flow JSON</h3>
        <pre style={{ fontSize: 12, height: "80vh", overflow: "auto" }}>
          {JSON.stringify({ screens }, null, 2)}
        </pre>

        <button style={{ marginTop: 10, width: "100%" }}>Export</button>
      </div>
    </div>
  );
}
