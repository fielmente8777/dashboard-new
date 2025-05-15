// utils/handleLocalStorage.js

function handleLocalStorage(key, value) {
  if (typeof window === "undefined") return null;

  console.log(key);

  if (value === undefined) {
    // Get item
    const stored = localStorage.getItem(key) || null;
    return stored;
  } else {
    // Set item
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export default handleLocalStorage;
