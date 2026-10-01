import { NEW_BASE_URL } from "../../data/constant";

export const getGlobalSearch = async ({
  q,
  hid,
  modules,
  limit = 10,
  signal,
}) => {
  const token = localStorage.getItem("token");
  try {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (modules?.length) params.append("modules", modules.join(","));

    // with hid -> search inside one hotel, without -> all hotels of this user
    const path = hid ? `/api/v1/search/${hid}` : `/api/v1/search`;

    const response = await fetch(
      `${NEW_BASE_URL}${path}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal,
      },
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || "Search failed");

    // controller sends httpResponse(..., { data: result })
    return result;
  } catch (error) {
    if (error.name === "AbortError") return null; // older request cancelled
    console.error("Error in global search:", error);
    throw error;
  }
};
