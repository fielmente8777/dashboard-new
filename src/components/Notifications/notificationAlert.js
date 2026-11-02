import { useEffect, useState } from "react";
import alertSound from "../../assets/mixkit-guitar-notification-alert-2320.mp3";

// What happens the moment a new notification arrives: the bell in the navbar
// rings and, unless switched off, the alert sound plays.

const SOUND_KEY = "notifications:sound";
const RING_EVENT = "eazotel:notification-ring";
const RING_MS = 1200;
// a burst of notifications (an import, a busy WhatsApp hour) plays the sound once
const SOUND_GAP_MS = 2000;

let audio = null;
let lastSoundAt = 0;

// on unless switched off in Notifications → Settings (kept per browser)
export const isSoundOn = () => {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
};

export const setSoundOn = (on) => {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // storage blocked: the setting lasts for this page only
  }
};

export const playNotificationSound = () => {
  audio ??= new Audio(alertSound);
  audio.currentTime = 0;
  // browsers only allow sound once the user has clicked somewhere on the
  // page; before that the play is refused and there is simply no sound
  return audio.play().catch(() => {});
};

// Call once per new notification.
export const alertNewNotification = () => {
  window.dispatchEvent(new Event(RING_EVENT));

  // only the tab being looked at plays it, so five open tabs don't chime five
  // times; the other tabs (and closed ones) get the push notification instead
  if (!isSoundOn() || document.visibilityState !== "visible") return;
  if (Date.now() - lastSoundAt < SOUND_GAP_MS) return;
  lastSoundAt = Date.now();
  playNotificationSound();
};

// true for a moment after each new notification, to animate the bell.
// `ring` changes every time, so a second notification restarts the animation.
export const useBellRing = () => {
  const [ring, setRing] = useState(0);

  useEffect(() => {
    let timer;
    const onRing = () => {
      setRing((n) => n + 1);
      clearTimeout(timer);
      timer = setTimeout(() => setRing(0), RING_MS);
    };
    window.addEventListener(RING_EVENT, onRing);
    return () => {
      window.removeEventListener(RING_EVENT, onRing);
      clearTimeout(timer);
    };
  }, []);

  return ring;
};
