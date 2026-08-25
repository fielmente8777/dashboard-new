export const getGoogleMapsUrl = (location) => {
  const name = encodeURIComponent(location.name || "Location");

  return `https://www.google.com/maps/search/${name}/@${location.latitude},${location.longitude},17z?hl=en`;
};
