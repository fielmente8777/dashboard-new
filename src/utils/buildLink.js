import { BASE_PATH, ROUTES_PATH } from "../data/constant";

export const buildLink = (group, item, fallbackHid) => {
  const hotelId = item.hId || fallbackHid;

  switch (group.key) {
    case "leads": {
      const params = new URLSearchParams({ hid: hotelId });
      if (item.source) params.set("source", item.source);
      return `${BASE_PATH}/${hotelId}/${ROUTES_PATH.LEADS_MANAGEMENT}/all-leads/${item.id}/view?${params.toString()}`;
    }

    case "conversations": {
      const params = new URLSearchParams({ conversationId: item.id });
      if (item.phone) params.set("phone", item.phone);
      if (item.convStatus) params.set("status", item.convStatus); // 👈
      return `${BASE_PATH}/${hotelId}/channel/wa/chat?${params.toString()}`;
    }

    case "calls": {
      const params = new URLSearchParams({ hid: hotelId });
      if (item.sid) params.set("sid", item.sid);
      // 👇 no "call" param -> detail page fetches directly
      return `${BASE_PATH}/${hotelId}/calls-management/all-calls/${item.id}/view?${params.toString()}`;
    }

    default:
      return null;
  }
};

// export const buildLink = (group, item, fallbackHid) => {
//   const hotelId = item.hId || fallbackHid;

//   switch (group.key) {
//     case "leads": {
//       const params = new URLSearchParams({ hid: hotelId });
//       if (item.source) params.set("source", item.source);
//       // 👇 no "lead" param -> detail page fetches by id
//       return `${BASE_PATH}/${hotelId}/${ROUTES_PATH.LEADS_MANAGEMENT}/all-leads/${item.id}/view?${params.toString()}`;
//     }
//     default:
//       return null;
//   }
// };
