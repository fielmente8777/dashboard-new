// utils/handleLocalStorage.js
function handleLocalStorage(key, value) {
  console.log(key, value);
  if (typeof window === "undefined") return null;
  if (value === undefined) {
    // Get item
    const storedValue = localStorage.getItem(key);
    try {
      return JSON.parse(storedValue);
    } catch (err) {
      // Not a JSON string, return as-is
      return storedValue;
    }
  } else {
    // Set item
    if (typeof value === "string") {
      // Save plain string directly
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}

export default handleLocalStorage;
