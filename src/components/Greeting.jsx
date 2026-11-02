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

// `name` is undefined while the profile is still loading.
// Phones put the greeting above the hotel name, so the name gets the whole
// width instead of a few letters after "Good afternoon,".
const Greeting = ({ name }) => {
  return (
    <div className="min-w-0">
      <h1 className="flex min-w-0 flex-col text-base font-semibold leading-snug text-app-text sm:flex-row sm:items-baseline sm:text-[17px]">
        <span className="shrink-0 text-xs font-medium text-app-text-muted sm:text-[17px] sm:font-semibold sm:text-app-text">
          {getGreeting()}
          {name !== "" && ","}
        </span>
        {name === undefined ? (
          <span className="mt-1 inline-block h-4 w-28 animate-pulse rounded bg-app-surface-secondary sm:ml-2 sm:mt-0 sm:self-center" />
        ) : (
          <span className="truncate capitalize text-ternary sm:ml-1.5">{name}</span>
        )}
      </h1>
      <p className="hidden text-xs leading-tight text-app-text-muted sm:block">
        {today()}
      </p>
    </div>
  );
};

export default Greeting;
