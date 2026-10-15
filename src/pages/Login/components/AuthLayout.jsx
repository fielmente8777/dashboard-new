// `action` sits next to the logo (e.g. a theme toggle); `compact` tightens the
// spacing so a longer form fits on one screen.
const AuthLayout = ({ title, subtitle, action, compact = false, children }) => {
  return (
    <div className="min-h-dvh w-full grid lg:grid-cols-2 bg-app-surface">
      {/* Brand panel - desktop only */}
      <aside className="relative hidden lg:flex flex-col justify-center gap-10 overflow-hidden bg-primary px-12 py-12 xl:px-20">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-ternary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-secondary/60 blur-3xl" />

        <div className="relative max-w-lg">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight text-white">
            Run your hotel from{" "}
            <span className="text-ternary">one dashboard</span>
          </h1>
          <p className="mt-4 text-base text-white/70">
            Leads, enquiries, payments and guest requests — managed together
            in one place.
          </p>
        </div>

        <img
          src="/LoginImage.png"
          alt=""
          className="relative w-full max-w-lg rounded-3xl shadow-2xl"
        />
      </aside>

      <main
        className={`flex items-center justify-center px-6 sm:px-10 ${compact ? "py-6" : "py-10"}`}
      >
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4">
            <img
              src="/EAZOTEL LOGO.png"
              alt="Eazotel"
              className="h-9 w-auto -ml-3 rounded-md object-contain dark:ml-0 dark:bg-white dark:px-2 dark:py-1"
            />
            {action}
          </div>

          <div className={compact ? "mt-6 space-y-1" : "mt-10 space-y-2"}>
            <h2
              className={`font-bold text-app-text ${compact ? "text-2xl" : "text-2xl sm:text-3xl"}`}
            >
              {title}
            </h2>
            <p className="text-app-text-muted">{subtitle}</p>
          </div>

          <div className={compact ? "mt-6 space-y-4" : "mt-8 space-y-6"}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
