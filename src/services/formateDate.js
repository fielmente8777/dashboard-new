// export const formatDateTime = (isoString) => {
//   const date = new Date(isoString);

//   const month = date.toLocaleString("en-US", {
//     month: "short",
//     timeZone: "UTC",
//   });

//   const day = date.toLocaleString("en-US", { day: "2-digit", timeZone: "UTC" });

//   const time = date.toLocaleString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "UTC",
//   });

//   return `${month} ${day} - ${time}`;
// };
export const formatDateTime = (isoString) =>
  new Date(isoString).toLocaleString();
