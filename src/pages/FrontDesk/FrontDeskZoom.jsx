import React, { useState } from "react";

const FrontDeskZoom = ({ onChange }) => {
  const [level, setLevel] = useState("month");

  const handleChange = (ev) => {
    const newLevel = ev.target.value;
    setLevel(newLevel);
    if (onChange) {
      onChange({ level: newLevel });
    }
  };

  return (
    <span className=" toolbar-item">
      Zoom:
      <label className="btn me">
        <input
          type="radio"
          name="zoom"
          value="month"
          onChange={handleChange}
          checked={level === "month"}
        />{" "}
        Month
      </label>
      <label className="btn">
        <input
          type="radio"
          name="zoom"
          value="week"
          onChange={handleChange}
          checked={level === "week"}
        />{" "}
        Week
      </label>
    </span>
  );
};

export default FrontDeskZoom;
