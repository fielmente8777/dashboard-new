import { useEffect, useRef } from "react";
import WebSocketClient from "../../../../config/websocketClient";
import { WS_BASE_URL } from "../../../../data/constant";
import useNotificationSound from "../../../../hooks/useNotificationSound";
import { useMarkInstagramConversationReadMutation } from "../../../../redux/api/instagramApi";
import { IG_EVENTS, sameMessage } from "../igUtils";
import { useInstagramCache } from "./useInstagramCache";

// Keeps the Instagram chat live: new conversations, incoming DMs (and DMs the
// hotel sent from the Instagram app), seen receipts and reactions.
// One socket for the life of the page; the handler reads the latest props
// through a ref so the socket is never reopened.
export const useInstagramSocket = ({ hid, ndid, openConversation }) => {
  const cache = useInstagramCache(hid);
  const playSound = useNotificationSound("/notification-sound/Sound1.mp3");
  const [markRead] = useMarkInstagramConversationReadMutation();

  const latest = useRef();
  latest.current = { hid, ndid, openConversation, cache, playSound, markRead };

  useEffect(() => {
    const client = new WebSocketClient(WS_BASE_URL);

    client.connect(({ event, data }) => {
      const { hid, ndid, openConversation, cache, playSound, markRead } =
        latest.current;
      if (!data || !Object.values(IG_EVENTS).includes(event)) return;
      // every client gets every event: keep only this hotel location's
      // (status events carry no hid; the mid / conversation id is enough)
      if (data.ndid !== ndid) return;
      if (data.hid && String(data.hid) !== String(hid)) return;

      switch (event) {
        case IG_EVENTS.NEW_CONVERSATION: {
          cache.patchConversations((conversations) => {
            if (conversations.some((item) => item._id === data._id)) return;
            conversations.unshift({ ...data, unread_count: 0 });
          });
          return;
        }

        case IG_EVENTS.NEW_MESSAGE: {
          const { conversation: fresh, ...message } = data;
          const conversationId = String(message.conversationId);
          const isOpen = openConversation?._id === conversationId;
          const incoming = message.sender === "user";

          if (incoming) playSound();

          cache.patchConversations((conversations) => {
            const conversation = conversations.find(
              (item) => item._id === conversationId,
            );
            if (!conversation) {
              // arrived before NEW_CONVERSATION was handled
              if (fresh) conversations.unshift({ ...fresh, unread_count: isOpen ? 0 : 1 });
              return;
            }
            if (fresh) {
              conversation.last_message = fresh.last_message;
              conversation.last_user_message_at = fresh.last_user_message_at;
              conversation.name = fresh.name || conversation.name;
              conversation.username = fresh.username || conversation.username;
              conversation.profile_pic = fresh.profile_pic || conversation.profile_pic;
            }
            conversation.updatedAt = new Date().toISOString();
            if (incoming && !isOpen) {
              conversation.unread_count = (conversation.unread_count || 0) + 1;
            }
          });

          if (isOpen) {
            cache.patchMessages(conversationId, (messages) => {
              if (!messages.some((item) => sameMessage(item, message))) {
                messages.push(message);
              }
            });
            if (incoming) markRead(conversationId);
          }
          return;
        }

        case IG_EVENTS.MESSAGE_STATUS: {
          if (!openConversation) return;
          cache.patchMessages(openConversation._id, (messages) => {
            if (data.allOutbound) {
              if (data.conversationId !== openConversation._id) return;
              messages.forEach((item) => {
                if (item.sender === "me" && item.status !== "failed") {
                  item.status = data.status;
                }
              });
              return;
            }
            const message = messages.find((item) => item.mid === data.mid);
            if (!message) return;
            if (data.status) message.status = data.status;
            if (data.status === "deleted") {
              message.text = "This message was deleted";
              message.attachments = [];
            }
            if ("reaction" in data) message.reaction = data.reaction;
          });
          return;
        }

        default:
      }
    });

    return () => client.close();
  }, []);
};
