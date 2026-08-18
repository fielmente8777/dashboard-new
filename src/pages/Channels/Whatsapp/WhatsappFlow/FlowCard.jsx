const FlowCard = ({ data, onClick }) => {
  return (
    <div
      onClick={() => onClick(data)}
      className="flex items-center gap-[var(--sp-4)] p-[var(--sp-4)] border border-app-border rounded-[var(--r-md)] bg-app-surface cursor-pointer hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
    >
      <div className="w-10 h-10 shrink-0 bg-green-500 text-white flex items-center justify-center rounded-[var(--r-sm)] font-bold text-[length:var(--fs-base)]">
        {data.icon}
      </div>

      <div className="min-w-0">
        <p className="font-medium text-[length:var(--fs-base)] text-app-text truncate">
          {data.title}
        </p>
        <p className="text-[length:var(--fs-sm)] text-gray-600 dark:text-app-text-faint">
          {data.desc}
        </p>
      </div>
    </div>
  );
};

export default FlowCard;