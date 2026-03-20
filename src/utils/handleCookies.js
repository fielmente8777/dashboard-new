// Set a cookie with expiration in seconds
export const setCookie = (name, value, options = { days: 1 }) => {
  let expires;

  if (options.seconds) {
    expires = new Date(Date.now() + options.seconds * 1000).toUTCString();
  } else if (options.days) {
    expires = new Date(Date.now() + options.days * 864e5).toUTCString();
  } else {
    // Default to 7 days if nothing is provided
    expires = new Date(Date.now() + 7 * 864e5).toUTCString();
  }

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

// Get a cookie
export const getCookie = (name) => {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] || null
  );
};

// Remove a cookie
export const removeCookie = (name) => {
  setCookie(name, "", -1); // expires in the past
};
