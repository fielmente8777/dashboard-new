import { useMemo, useRef } from "react";
import { useApiAction } from "../../../../hooks/useApiAction";
import { getApiErrorMessage } from "../../../../redux/api/baseApi";
import {
  useReactInstagramMessageMutation,
  useSendInstagramMessageMutation,
} from "../../../../redux/api/instagramApi";
import { buildOutgoingMessage, getIgMediaType, sameMessage } from "../igUtils";
import { useInstagramCache } from "./useInstagramCache";

const PREVIEW = {
  image: "📷 Photo",
  video: "🎥 Video",
  audio: "🎤 Audio",
  file: "📎 File",
  like_heart: "❤️",
};

// Everything the Instagram composer can send. Each message is shown at once
// (status "sending"), then replaced by the saved one, or marked "failed" with
// Meta's reason and a Retry. One request per message, so each has its own status.
//   sendCompose({ text, file })  sendHeart()  sendQuickReply(reply)
//   resend(message)  react(message, true | false)
export const useIgSend = (hid, conversation) => {
  const run = useApiAction();
  const cache = useInstagramCache(hid);
  const [sendMessage] = useSendInstagramMessageMutation();
  const [reactMessage] = useReactInstagramMessageMutation();

  // what each pending message was sent with, for Retry (Files can't live in the store)
  const payloads = useRef(new Map());
  const latest = useRef();
  latest.current = { cache, conversation, sendMessage, reactMessage, run };

  return useMemo(() => {
    // shows `temp`, sends `payload`; resolves true when it was sent
    const deliver = async (temp, payload) => {
      const { cache, conversation, sendMessage } = latest.current;
      payloads.current.set(temp._id, payload);

      cache.patchMessages(conversation._id, (list) => {
        const index = list.findIndex((item) => item._id === temp._id);
        if (index >= 0) list[index] = temp;
        else list.push(temp);
      });

      try {
        const result = await sendMessage({
          conversationId: conversation._id,
          payload,
        }).unwrap();
        const saved = result?.messages?.[0] || result?.message;

        cache.patchMessages(conversation._id, (list) => {
          const index = list.findIndex((item) => item._id === temp._id);
          if (index < 0) return;
          // the websocket may have delivered the saved copy already
          if (saved && list.some((item, i) => i !== index && sameMessage(item, saved))) {
            list.splice(index, 1);
          } else {
            list[index] = saved || { ...temp, status: "sent" };
          }
        });
        cache.patchConversation(conversation._id, {
          // a team reply pauses the AI in this chat
          ...(result?.handling && { handling: result.handling }),
          last_message: {
            text: temp.text || PREVIEW[temp.messageType] || "",
            sender: "me",
            created_at: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        });

        payloads.current.delete(temp._id);
        // the local preview of a file is not needed once the real one is back
        temp.attachments?.forEach((item) => {
          if (item.url?.startsWith("blob:")) URL.revokeObjectURL(item.url);
        });
        return true;
      } catch (err) {
        cache.patchMessages(conversation._id, (list) => {
          const message = list.find((item) => item._id === temp._id);
          if (message) {
            message.status = "failed";
            message.failure = {
              message: getApiErrorMessage(err, "Could not send the message."),
            };
          }
        });
        return false;
      }
    };

    const fileMessage = (file) => {
      const type = getIgMediaType(file.type) || "file";
      const form = new FormData();
      form.append("file", file);
      return {
        temp: buildOutgoingMessage(latest.current.conversation, {
          messageType: type,
          attachments: [{ type, url: URL.createObjectURL(file) }],
          fileName: file.name,
        }),
        payload: form,
      };
    };

    const textMessage = (text) => ({
      temp: buildOutgoingMessage(latest.current.conversation, { messageType: "text", text }),
      payload: { text },
    });

    return {
      // the message box: the file first (Instagram has no captions), then the text
      sendCompose: async ({ text, file }) => {
        if (file) {
          const { temp, payload } = fileMessage(file);
          const sent = await deliver(temp, payload);
          if (!sent) return; // the text would arrive without its file
        }
        if (text) {
          const { temp, payload } = textMessage(text);
          await deliver(temp, payload);
        }
      },

      sendHeart: () =>
        deliver(
          buildOutgoingMessage(latest.current.conversation, { messageType: "like_heart" }),
          { sticker: "like_heart" },
        ),

      // a saved quick reply: its text and media, in order
      sendQuickReply: async (reply) => {
        const items = [...(reply.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
        for (const item of items) {
          if (item.type === "text") {
            if (!item.text?.trim()) continue;
            const { temp, payload } = textMessage(item.text.trim());
            if (!(await deliver(temp, payload))) return;
            continue;
          }
          for (const media of item.media || []) {
            const type = getIgMediaType(media.mimeType) || "file";
            const temp = buildOutgoingMessage(latest.current.conversation, {
              messageType: type,
              attachments: [{ type, url: media.url }],
              fileName: media.fileName,
            });
            const sent = await deliver(temp, {
              mediaUrl: media.url,
              mimeType: media.mimeType,
              fileName: media.fileName,
            });
            if (!sent) return;
          }
        }
      },

      resend: (message) => {
        const payload =
          payloads.current.get(message._id) || (message.text ? { text: message.text } : null);
        if (!payload) return;
        deliver({ ...message, status: "sending", failure: undefined }, payload);
      },

      // ❤️ on a guest's message (Instagram only has the heart)
      react: async (message, react) => {
        const { cache, conversation, reactMessage, run } = latest.current;
        const set = (value) =>
          cache.patchMessages(conversation._id, (list) => {
            const item = list.find((entry) => entry._id === message._id);
            if (item) item.myReaction = value;
          });
        const before = message.myReaction || null;
        set(react ? "❤️" : null);
        const result = await run(reactMessage({ messageId: message._id, react }), {
          error: "Could not react to the message.",
        });
        if (!result) set(before);
      },
    };
  }, []);
};
