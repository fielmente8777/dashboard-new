import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import { useSendMessageMutation } from "../../../../redux/api/whatsappApi";
import { PAGES, dashboardPath } from "../../../../routes/paths";
import {
  buildOutgoingMessage,
  buildResendPayload,
  fillTemplate,
  getMessageTypeOfFile,
} from "../chatUtils";
import { useChatCache } from "./useChatCache";

const NO_CREDITS = 402;

// Everything that can be sent to the open conversation. Each message shows
// up in the chat at once (as "sending"), then turns into sent or failed
// when the server answers.
// `onSend` is called as each message is handed over.
export const useSendMessage = (hid, conversation, onSend) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const cache = useChatCache(hid);
  const [sendMessage] = useSendMessageMutation();

  return useMemo(() => {
    const conversationId = conversation?._id;

    const setMessage = (messageKey, changes) =>
      cache.patchMessages(conversationId, (messages) => {
        const message = messages.find((item) => item._id === messageKey);
        if (message) Object.assign(message, changes);
      });

    // Sends `payload` for a message already in the chat. True when it went out.
    const post = async (messageKey, payload) => {
      const result = await sendMessage({ hid, payload });
      const answer = result.data;

      if (answer?.success) {
        setMessage(messageKey, {
          status: "sent",
          messageId: answer.result?.docs?.messageId,
        });
        return true;
      }

      setMessage(messageKey, { status: "failed" });
      showToast({
        message: answer?.responseMessage || "Could not send the message.",
        type: "error",
      });
      if (answer?.responseStatusCode === NO_CREDITS) {
        navigate(
          dashboardPath(PAGES.SETTINGS, {
            query: { tab: "WhatsApp", section: "credits" },
          }),
        );
      }
      return false;
    };

    // Adds the message to the chat, then sends it. `preview` is the line
    // shown for it in the conversation list.
    const deliver = (fields, payload, preview) => {
      const message = buildOutgoingMessage(conversation, fields);
      onSend?.();

      cache.patchMessages(conversationId, (messages) => {
        messages.push(message);
      });
      cache.patchConversation(conversationId, (current) => ({
        last_message: {
          ...current.last_message,
          text: preview,
          sender: "me",
          updated_at: message.createdAt,
        },
      }));

      return post(message._id, payload);
    };

    return {
      // text and / or one file
      sendText: ({ text, file }) => {
        const payload = new FormData();
        payload.append("phone", conversation.phone);
        if (text) payload.append("text", text);
        if (file) payload.append("file", file);

        return deliver(
          file
            ? {
                messageType: getMessageTypeOfFile(file),
                body: null,
                caption: text,
                media: {
                  url: URL.createObjectURL(file),
                  mimeType: file.type,
                  filename: file.name,
                },
              }
            : { messageType: "text", body: text },
          payload,
          text || file.name,
        );
      },

      // an approved template, with its sample values
      sendTemplate: (template) => {
        const { body, params, headerParams } = fillTemplate(template);
        const language = template.language || "en";

        return deliver(
          {
            messageType: "template",
            body,
            template: {
              template: { name: template.name, language, parameters: params },
            },
          },
          {
            phone: conversation.phone,
            templateName: template.name,
            templateLanguage: language,
            templateParams: params,
            templateParamsHeader: headerParams,
          },
          body || "Template",
        );
      },

      // a form (WhatsApp flow). `text` is { header, body, footer, cta }
      sendFlow: (flow, text) => {
        const interactive = {
          type: "flow",
          header: text.header ? { type: "text", text: text.header } : undefined,
          body: { text: text.body },
          footer: text.footer ? { text: text.footer } : undefined,
          action: {
            name: "flow",
            parameters: {
              flow_message_version: "3",
              flow_token: `flow_${Date.now()}`,
              flow_id: flow.flowId,
              flow_cta: text.cta || "Open Form",
            },
          },
        };

        return deliver(
          { messageType: "interactive", body: text.body, interactive },
          { phone: conversation.phone, interactive },
          text.body,
        );
      },

      // a saved reply: its texts and media, one message each, in order
      sendQuickReply: async (reply) => {
        const items = [...reply.items].sort((a, b) => a.order - b.order);

        for (const item of items) {
          if (item.type === "text") {
            const payload = new FormData();
            payload.append("phone", conversation.phone);
            payload.append("text", item.text);

            const sent = await deliver(
              { messageType: "text", body: item.text },
              payload,
              item.text,
            );
            // the rest would arrive out of context
            if (!sent) return;
            continue;
          }

          for (const media of item.media || []) {
            const file = {
              mediaUrl: media.url,
              mimeType: media.mimeType,
              filename: media.fileName,
            };
            const sent = await deliver(
              {
                messageType: item.type,
                body: null,
                media: {
                  url: media.url,
                  mimeType: media.mimeType,
                  filename: media.fileName,
                },
              },
              { phone: conversation.phone, file },
              media.fileName || item.type,
            );
            if (!sent) return;
          }
        }
      },

      // tries a failed message again
      resend: async (message) => {
        const payload = buildResendPayload(message);
        if (!payload) {
          showToast({
            message: "This message cannot be sent again. Please send a new one.",
            type: "error",
          });
          return;
        }

        setMessage(message._id, { status: "sending" });
        if (await post(message._id, payload)) {
          showToast({ message: "Message sent" });
        }
      },
    };
  }, [cache, conversation, hid, navigate, onSend, sendMessage, showToast]);
};
