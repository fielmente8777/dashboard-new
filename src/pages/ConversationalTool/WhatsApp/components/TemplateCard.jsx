const TemplateCard = ({ template, selected, onSelect, values }) => {
  let previewText = template.components[0].text;

  Object.keys(values).forEach((key) => {
    previewText = previewText.replace(
      `{{${key}}}`,
      values[key] || `{{${key}}}`,
    );
  });

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border p-4 transition
        ${selected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-400"}`}
    >
      <div className="text-xs text-gray-500 mb-1">
        {template.category} • {template.language}
      </div>

      <div className="text-sm text-gray-800 whitespace-pre-line">
        {previewText}
      </div>

      <div className="mt-2 text-[10px] uppercase text-gray-400">
        {template.status}
      </div>
    </div>
  );
};

export default TemplateCard;
