import { baseApi } from "./baseApi";
import { whatsappApi } from "./whatsappApi";

const NODE = { service: "node" };

const api = baseApi.enhanceEndpoints({ addTagTypes: ["NotificationSettings"] });

// Who is told about new leads, per lead source, and the WhatsApp message sent
// after a missed call. Settings are per location (hid):
//   { config: { [source]: { email: [], phone: [], isEmailAllowed, isPhoneAllowed } },
//     callConfig: { enabled, configs: { [callStatus]: { type, templateName, message, templateMeta } } } }
export const notificationApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNotificationSettings: build.query({
      query: (hid) => ({ url: "/api/v1/setting/get-config", params: { hid } }),
      transformResponse: (response) => response?.result?.docs || null,
      providesTags: ["NotificationSettings"],
      extraOptions: NODE,
    }),

    // body: { config, callConfig }
    updateNotificationSettings: build.mutation({
      query: ({ hid, ...body }) => ({
        url: "/api/v1/setting/update-config",
        method: "POST",
        params: { hid },
        body,
      }),
      invalidatesTags: ["NotificationSettings"],
      extraOptions: NODE,
    }),

    // turns WhatsApp alerts on or off for the connected number; saved at once.
    // The cached WhatsApp account (getWhatsAppAccount) is patched straight away
    // and put back if the request fails.
    setWhatsAppAlerts: build.mutation({
      query: ({ phoneNumberId, enable }) => ({
        url: `/api/v1/whatsapp/account/${phoneNumberId}/automessageConfig/update`,
        method: "PUT",
        body: { phoneNumberId, notification: { enable } },
      }),
      async onQueryStarted({ hid, enable }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          whatsappApi.util.updateQueryData("getWhatsAppAccount", hid, (account) => {
            if (account) account.notification = { ...account.notification, enable };
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useSetWhatsAppAlertsMutation,
} = notificationApi;
