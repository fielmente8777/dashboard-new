import { baseApi } from "./baseApi";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Eazbot"] });

// The Eazbot website chat widget of one location. The saved bot is
// { bot_name, email, contact, description, avatar_url, welcome_message,
//   fallback_message, chat_terminate_message, time_interval, active,
//   enable_live_chat, show_typing_indicator, show_eazotel_branding,
//   theme: { bg_color, text_color, button_color, button_text_color },
//   chat_flow: [{ key, question, type, active, options: [{ label, value, active }] }] }
export const eazbotApi = api.injectEndpoints({
  endpoints: (build) => ({
    // null when the location has no bot yet
    getEazbot: build.query({
      query: ({ ndid, hid }) => ({
        url: "/leadeazbot/get/dashboard",
        params: { ndid, hid },
      }),
      transformResponse: (response) => (response?.Status ? response.Data : null),
      providesTags: ["Eazbot"],
      extraOptions: { skipAuth: true },
    }),

    // creates the bot, or replaces the saved one
    saveEazbot: build.mutation({
      query: ({ hid, bot }) => ({
        url: "/leadeazbot/create",
        method: "POST",
        params: { hid },
        body: bot,
      }),
      invalidatesTags: ["Eazbot"],
    }),
  }),
});

export const { useGetEazbotQuery, useSaveEazbotMutation } = eazbotApi;
