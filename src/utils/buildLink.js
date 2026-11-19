import {
  PAGES,
  callViewPath,
  dashboardPath,
  leadViewPath,
} from "../routes/paths";

export const buildLink = (group, item, fallbackHid) => {
  const hid = item.hId || fallbackHid;

  switch (group.key) {
    case "leads": {
      const query = new URLSearchParams({ hid });
      if (item.source) query.set("source", item.source);
      return leadViewPath(item.id, { hid, query });
    }

    case "conversations": {
      const query = new URLSearchParams({ conversationId: item.id });
      if (item.phone) query.set("phone", item.phone);
      if (item.convStatus) query.set("status", item.convStatus);
      return dashboardPath(PAGES.CHAT_WHATSAPP, { hid, query });
    }

    case "calls": {
      const query = new URLSearchParams({ hid });
      if (item.sid) query.set("sid", item.sid);
      // no "call" param -> detail page fetches directly
      return callViewPath(item.id, { hid, query });
    }

    default:
      return null;
  }
};
