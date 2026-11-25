import { FaGooglePlay } from "react-icons/fa6";
import { PLAY_STORE_URL } from "../../config/assets";

// "Get the Android app" at the foot of the sidebar: opens the Eazotel app on
// Google Play in a new tab. On the collapsed icon rail it is the Play icon only.
const GetAppLink = ({ collapsed }) => (
  <a
    href={PLAY_STORE_URL}
    target="_blank"
    rel="noopener noreferrer"
    title="Get the Eazotel app on Google Play"
    aria-label="Get the Eazotel app on Google Play"
    className={`flex items-center gap-3 rounded-xl border border-white/10! bg-white/5 text-white transition-colors hover:bg-white/10 ${
      collapsed ? "mx-auto size-10 justify-center" : "px-3 py-2.5"
    }`}
  >
    <FaGooglePlay className="size-5 shrink-0 text-emerald-400" />
    {!collapsed && (
      <span className="min-w-0 leading-tight">
        <span className="block text-sm font-semibold">Get the app</span>
        <span className="block text-xs text-white/60">Eazotel on Google Play</span>
      </span>
    )}
  </a>
);

export default GetAppLink;
