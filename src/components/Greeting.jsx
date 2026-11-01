const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
};

// "Saturday, 1 November"
const today = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

// `name` is undefined while the profile is still loading
const Greeting = ({ name }) => {
  return (
    <div className="min-w-0">
      <h1 className="flex min-w-0 items-baseline text-base font-semibold leading-snug text-app-text sm:text-[17px]">
        <span className="shrink-0">
          {getGreeting()}
          {name !== "" && ","}
        </span>
        {name === undefined ? (
          <span className="ml-2 inline-block h-4 w-28 animate-pulse self-center rounded bg-app-surface-secondary" />
        ) : (
          <span className="ml-1.5 truncate capitalize text-ternary">{name}</span>
        )}
      </h1>
      <p className="hidden text-xs leading-tight text-app-text-muted sm:block">
        {today()}
      </p>
    </div>
  );
};

export default Greeting;
