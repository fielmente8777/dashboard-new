const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
};

// `name` is undefined while the profile is still loading
const Greeting = ({ name }) => {
  return (
    <div className="hidden min-w-0 shrink-0 xl:block">
      <p className="text-xs leading-tight text-white/60">{getGreeting()}</p>
      {name === undefined ? (
        <div className="mt-1 h-4 w-32 animate-pulse rounded bg-white/10" />
      ) : (
        <h1 className="max-w-64 truncate text-sm font-semibold capitalize leading-tight text-white">
          {name}
        </h1>
      )}
    </div>
  );
};

export default Greeting;
