import { useEffect, useRef } from "react";
import WebSocketClient from "../../../../config/websocketClient";
import { WEBSOCKET_EVENTS, WS_BASE_URL } from "../../../../data/constant";
import useNotificationSound from "../../../../hooks/useNotificationSound";
import { useMarkConversationReadMutation } from "../../../../redux/api/whatsappApi";
import { samePhone } from "../chatUtils";
import { useChatCache } from "./useChatCache";

const sameMessage = (a, b) =>
  (a._id && a._id === b._id) || (a.messageId && a.messageId === b.messageId);

// Keeps the chat live: new conversations, incoming messages, replies sent by
// the AI and delivery ticks, as they are pushed over the websocket.
// `openConversation` is the one on screen (or null).
//
// One socket is opened for the life of the page. The handler reads the
// latest props through a ref, so the socket is never reopened when they
// change (reopening would drop whatever arrives in between).
export const useChatSocket = ({ hid, ndid, openConversation }) => {
  const cache = useChatCache(hid);
  const playSound = useNotificationSound("/notification-sound/Sound1.mp3");
  const [markRead] = useMarkConversationReadMutation();

  const latest = useRef();
  latest.current = { ndid, openConversation, cache, playSound, markRead };

  useEffect(() => {
    const client = new WebSocketClient(WS_BASE_URL);

    client.connect(({ event, data }) => {
      const { ndid, openConversation, cache, playSound, markRead } =
        latest.current;
      if (!data) return;

      const appendToOpenChat = (message) =>
        cache.patchMessages(openConversation._id, (messages) => {
          if (!messages.some((item) => sameMessage(item, message))) {
            messages.push(message);
          }
        });

      switch (event) {
        case WEBSOCKET_EVENTS.WHATSAPP_NEW_CONVERSATION: {
          if (data.ndid !== ndid) return;
          playSound();
          cache.patchConversations((conversations) => {
            if (conversations.some((item) => item._id === data._id)) return;
            conversations.unshift({
              _id: data._id,
              phone: data.phone,
              name: data.name,
              profile_image: data.profile_image,
              last_message: data.last_message,
              status: data.status,
              unread_count: 0,
              updatedAt: new Date().toISOString(),
              createdAt: data.createdAt,
            });
          });
          return;
        }

        case WEBSOCKET_EVENTS.WHATSAPP_NEW_MESSAGE: {
          if (data.ndid !== ndid) return;
          playSound();

          const isOpen =
            openConversation && samePhone(data.from, openConversation.phone);
          const time = data.createdAt || new Date().toISOString();

          cache.patchConversations((conversations) => {
            const conversation = conversations.find((item) =>
              samePhone(item.phone, data.from),
            );
            if (!conversation) return;

            conversation.last_message = {
              text: data.body || data.text,
              sender: data.sender,
              created_at: time,
              updated_at: data.updatedAt || time,
            };
            conversation.updatedAt = time;
            if (!isOpen) {
              conversation.unread_count = (conversation.unread_count || 0) + 1;
            }
          });

          if (isOpen) {
            appendToOpenChat(data);
            // it is being read right now
            markRead(openConversation._id);
          }
          return;
        }

        case WEBSOCKET_EVENTS.WHATSAPP_AUTO_NEW_MESSAGE: {
          if (data.ndid !== ndid || !openConversation) return;
          if (samePhone(data.to, openConversation.phone)) appendToOpenChat(data);
          return;
        }

        case WEBSOCKET_EVENTS.WHATSAPP_MESSAGE_STATUS: {
          if (!openConversation) return;
          cache.patchMessages(openConversation._id, (messages) => {
            const message = messages.find(
              (item) => item.messageId === data.messageId,
            );
            if (message) message.status = data.status;
          });
          return;
        }

        default:
      }
    });

    return () => client.close();
  }, []);
};
