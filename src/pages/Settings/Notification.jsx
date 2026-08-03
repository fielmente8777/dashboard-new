import { useCallback, useEffect, useState } from "react";
import {
  editNotificationData,
  getNotificationData,
} from "../../services/api/notification.api";
import { fetchUserManagementData } from "../../services/api/userManagement.api";
import CustomDropdown from "../../components/ui/Dropdown";
import ChannelToggle from "../Channels/Whatsapp/components/ChannelToggle";
import {
  getWhatsappAccountDetails,
  getWhatsAppMessageTemplates,
  updateAutoMessageConfig,
} from "../../services/api/whatsApp";
import { useToast } from "../../context/ToastContext";
import TemplatePreview from "../Channels/Whatsapp/components/TemplatePreview";
import { useSelector } from "react-redux";

const callStatuses = [
  { key: "notAnswered", label: "Not Answered" },
  { key: "missedCall", label: "Missed Call" },
  { key: "busy", label: "Busy" },
];

/* 🔘 Toggle */
const ToggleSwitch = ({ enabled, onChange }) => (
  <div
    onClick={onChange}
    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${
      enabled ? "bg-green-500" : "bg-gray-400"
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
        enabled ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </div>
);

const Notification = () => {
  const { subscription } = useSelector((state) => state?.subscription);
  const { showToast } = useToast();

  const initialData = {
    webform: {
      email: [],
      phone: [],
      isPhoneAllowed: false,
      isEmailAllowed: false,
    },
    eazbot: {
      email: [],
      phone: [],
      isPhoneAllowed: false,
      isEmailAllowed: false,
    },
    facebook: {
      email: [],
      phone: [],
      isPhoneAllowed: false,
      isEmailAllowed: false,
    },
    whatsapp: {
      email: [],
      phone: [],
      isPhoneAllowed: false,
      isEmailAllowed: false,
    },
    google: {
      email: [],
      phone: [],
      isPhoneAllowed: false,
      isEmailAllowed: false,
    },
  };

  const [data, setData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [templates, setTemplates] = useState([]);

  const [callConfig, setCallConfig] = useState({
    enabled: false,
    configs: {
      notAnswered: {
        type: "template",
        templateName: "",
        message: "",
        templateMeta: null,
      },
      missedCall: {
        type: "template",
        templateName: "",
        message: "",
        templateMeta: null,
      },
      busy: {
        type: "template",
        templateName: "",
        message: "",
        templateMeta: null,
      },
    },
  });

  // const [callConfig, setCallConfig] = useState({
  //   enabled: false,
  //   type: "text",
  //   templateName: "",
  //   message: "",
  //   flowId: "",
  // });

  const [originalCallConfig, setOriginalCallConfig] = useState(callConfig);

  const tab = ["webform", "eazbot", "whatsapp", "facebook", "google"];

  /* ================= Fetch ================= */

  const fetchUsersData = async () => {
    const token = localStorage.getItem("token");
    const users = await fetchUserManagementData(token);
    setAllUsers(users || []);
  };

  const fetchNotificationData = async () => {
    const res = await getNotificationData();

    if (res?.result?.docs?.config) {
      const config = res.result.docs.config;
      const callConfig = res.result.docs.callConfig;

      const normalized = Object.keys(initialData).reduce((acc, key) => {
        acc[key] = {
          email: config[key]?.email || [],
          phone: config[key]?.phone || [],
          isEmailAllowed: config[key]?.isEmailAllowed || false,
          isPhoneAllowed: config[key]?.isPhoneAllowed || false,
        };
        return acc;
      }, {});

      setData(normalized);
      setOriginalData(normalized);

      if (callConfig) setCallConfig(callConfig);
      // setOriginalCallConfig(callConfig);
    }
  };

  const fetchAccountDetails = useCallback(async () => {
    const res = await getWhatsappAccountDetails();
    setAccountDetails(res?.result?.docs);
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await getWhatsAppMessageTemplates();
      if (response.success) {
        setTemplates(response?.result?.docs?.data || []);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    fetchUsersData();
    fetchNotificationData();
    fetchAccountDetails();
    fetchTemplate();
  }, []);

  /* ================= Handlers ================= */

  const handleUserAssign = (source, type, value) => {
    setData((prev) => ({
      ...prev,
      [source]: {
        ...prev[source],
        [type]: Array.isArray(value) ? value : [value],
      },
    }));
  };

  const toggleActive = (source, type) => {
    const key = type === "email" ? "isEmailAllowed" : "isPhoneAllowed";

    setData((prev) => ({
      ...prev,
      [source]: {
        ...prev[source],
        [key]: !prev[source][key],
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        config: data, // ✅ existing
        callConfig: callConfig, // ✅ NEW
      };

      await editNotificationData(payload);
      setOriginalData(data);
      showToast({ message: "Saved successfully", type: "success" });
    } catch {
      showToast({ message: "Save failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWhatsAppNotification = async (status) => {
    setAccountDetails((prev) => ({
      ...prev,
      notification: { enable: status },
    }));

    await updateAutoMessageConfig({
      phoneNumberId: accountDetails?.phoneNumber?.id,
      notification: { enable: status },
    });
  };

  const updateCallConfig = (status, field, value) => {
    setCallConfig((prev) => ({
      ...prev,
      configs: {
        ...prev.configs,
        [status]: {
          ...prev.configs[status],
          [field]: value,
        },
      },
    }));
  };

  const hasChanges =
    JSON.stringify(data) !== JSON.stringify(originalData) ||
    JSON.stringify(callConfig) !== JSON.stringify(originalCallConfig);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* SAVE BUTTON */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* ================= WHATSAPP ================= */}
      {subscription?.appAccess && subscription?.appAccess?.whatsapp && (
        <div className="bg-app-surface border rounded-xl p-5 shadow-sm text-app-text dark:text-app-text ">
          <h2 className="font-semibold mb-4">💬 WhatsApp Notifications</h2>

          <ChannelToggle
            label="Enable WhatsApp"
            value={accountDetails?.notification?.enable}
            onChange={() =>
              handleUpdateWhatsAppNotification(
                !accountDetails?.notification?.enable
              )
            }
          />

          {/* CALL CONFIG */}
          <div className="border rounded-lg p-4 bg-app-surface-secondary text-app-text dark:text-app-text mt-4 space-y-3">
            <ChannelToggle
              label="Call Notification"
              value={callConfig.enabled}
              onChange={() =>
                setCallConfig((prev) => ({
                  ...prev,
                  enabled: !prev.enabled,
                }))
              }
            />

            {accountDetails?.notification?.enable && callConfig.enabled && (
              <div className="space-y-4 grid grid-cols-3 gap-4 bg-app-surface-secondary">
                {callStatuses?.map((status) => {
                  const config = callConfig?.configs[status?.key] || {};

                  return (
                    <div
                      key={status.key}
                      className="border p-3 rounded bg-app-surface-secondary"
                    >
                      <h4 className="font-medium mb-2">{status.label}</h4>

                      {/* TYPE */}
                      <select
                        value={config.type}
                        onChange={(e) =>
                          updateCallConfig(status.key, "type", e.target.value)
                        }
                        className="w-full border px-3 py-2 rounded mb-2"
                      >
                        {/* <option value="text">Text</option> */}
                        <option value="template">Template</option>
                      </select>

                      {/* TEXT */}
                      {/* {config.type === "text" && (
                      <textarea
                        value={config.message}
                        onChange={(e) =>
                          updateCallConfig(
                            status.key,
                            "message",
                            e.target.value,
                          )
                        }
                        className="w-full border px-3 py-2 rounded"
                      />
                    )} */}

                      {/* TEMPLATE */}
                      {config.type === "template" && (
                        <>
                          <select
                            value={config.templateName}
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              const selectedTemplate = templates.find(
                                (t) => t.name === selectedName
                              );
                              if (!selectedTemplate) return;

                              const bodyText =
                                selectedTemplate.components?.find(
                                  (c) => c.type === "BODY"
                                )?.text || "";

                              const bodyVariables =
                                selectedTemplate.components?.find(
                                  (c) => c.type === "BODY"
                                )?.example?.body_text[0] || [];

                              const headerVariables =
                                selectedTemplate.components?.find(
                                  (c) => c.type === "HEADER"
                                )?.example?.header_text || [];

                              const buttons =
                                selectedTemplate.components?.find(
                                  (c) => c.type === "BUTTONS"
                                )?.buttons || [];

                              updateCallConfig(
                                status.key,
                                "templateName",
                                selectedName
                              );

                              updateCallConfig(status.key, "templateMeta", {
                                name: selectedTemplate.name,
                                language: selectedTemplate.language,
                                bodyText,
                                variables: bodyVariables,
                                headerVariables,
                                headerType:
                                  selectedTemplate.components?.find(
                                    (c) => c.type === "HEADER"
                                  )?.format || null,
                                buttons,
                              });
                            }}
                            className="w-full border px-3 py-2 rounded mb-2 bg-app-surface-secondary"
                          >
                            <option value="">Select template</option>
                            {templates.map((t) => (
                              <option key={t.name}>{t.name}</option>
                            ))}
                          </select>

                          {config.templateName && (
                            <div className="w-full">
                              <TemplatePreview
                                components={
                                  templates.find(
                                    (t) => t.name === config.templateName
                                  )?.components || []
                                }
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* {accountDetails?.notification?.enable && callConfig.enabled && (
              <>
                <select
                  value={callConfig.type}
                  onChange={(e) => updateCallConfig("type", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="text">Text</option>
                  <option value="template">Template</option>
                  <option value="flow">Flow</option>
                </select>

                {callConfig.type === "text" && (
                  <textarea
                    value={callConfig.message}
                    onChange={(e) => updateCallConfig("message", e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                )}

                {callConfig.type === "template" && (
                  <div className="space-y-2">
                    <select
                      value={callConfig.templateName}
                      onChange={(e) => {
                        const selectedName = e.target.value;

                        const selectedTemplate = templates.find(
                          (t) => t.name === selectedName,
                        );

                        if (!selectedTemplate) return;

                        // extract body text
                        const bodyText =
                          selectedTemplate.components?.find(
                            (c) => c.type === "BODY",
                          )?.text || "";

                        // extract buttons (optional)
                        const buttons =
                          selectedTemplate.components?.find(
                            (c) => c.type === "BUTTONS",
                          )?.buttons || [];

                        updateCallConfig("templateName", selectedName);

                        updateCallConfig("templateMeta", {
                          name: selectedTemplate.name,
                          language: selectedTemplate.language,
                          bodyText,
                          variables: (bodyText.match(/{{\d+}}/g) || []).length,
                          headerType:
                            selectedTemplate.components?.find(
                              (c) => c.type === "HEADER",
                            )?.format || null,
                          buttons,
                        });
                      }}
                      className="w-full border px-3 py-2 rounded-md text-sm"
                    >
                      <option value="">Select template</option>
                      {templates.map((t) => (
                        <option key={t.name}>{t.name}</option>
                      ))}
                    </select>

                    {callConfig.templateName && (
                      <TemplatePreview
                        components={
                          templates.find(
                            (t) => t.name === callConfig.templateName,
                          )?.components || []
                        }
                      />
                    )}
                  </div>
                )}
              </>
            )} */}
          </div>

          {/* USERS */}
          {tab.map((item) => {
            const enabled =
              data[item]?.isPhoneAllowed &&
              accountDetails?.notification?.enable;

            return (
              <div key={item} className="flex justify-between py-3 border-b">
                <span className="capitalize">{item}</span>

                <div className="flex gap-3">
                  <CustomDropdown
                    multiple
                    disabled={!enabled}
                    label={data[item]?.phone}
                    options={allUsers.map((u) => ({
                      value: u.phone,
                      label: u.userName,
                    }))}
                    onChange={(val) => handleUserAssign(item, "phone", val)}
                  />

                  <ToggleSwitch
                    enabled={data[item]?.isPhoneAllowed}
                    onChange={() => toggleActive(item, "phone")}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= EMAIL ================= */}
      <div className="bg-app-surface-secondary border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-4">📧 Email Notifications</h2>

        {tab.map((item) => {
          const enabled = data[item]?.isEmailAllowed;

          return (
            <div key={item} className="flex justify-between py-3 border-b">
              <span className="capitalize">{item}</span>

              <div className="flex gap-3">
                <CustomDropdown
                  multiple
                  disabled={!enabled}
                  label={data[item]?.email}
                  options={allUsers.map((u) => ({
                    value: u.emailId,
                    label: u.userName,
                  }))}
                  onChange={(val) => handleUserAssign(item, "email", val)}
                />

                <ToggleSwitch
                  enabled={enabled}
                  onChange={() => toggleActive(item, "email")}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notification;

// import { useEffect, useState } from "react";
// import {
//   editNotificationData,
//   getNotificationData,
// } from "../../services/api/notification.api";
// import { fetchUserManagementData } from "../../services/api/userManagement.api";
// import CustomDropdown from "../../components/ui/Dropdown";

// const Notification = () => {
//   const initialData = {
//     webform: {
//       email: [],
//       phone: [],
//       isPhoneAllowed: false,
//       isEmailAllowed: false,
//     },
//     eazbot: {
//       email: [],
//       phone: [],
//       isPhoneAllowed: false,
//       isEmailAllowed: false,
//     },
//     facebook: {
//       email: [],
//       phone: [],
//       isPhoneAllowed: false,
//       isEmailAllowed: false,
//     },
//     whatsapp: {
//       email: [],
//       phone: [],
//       isPhoneAllowed: false,
//       isEmailAllowed: false,
//     },
//     google: {
//       email: [],
//       phone: [],
//       isPhoneAllowed: false,
//       isEmailAllowed: false,
//     },
//   };
//   const [data, setData] = useState(initialData);
//   const [allUsers, setAllUsers] = useState();

//   const fetchNofiticationData = async () => {
//     try {
//       const data = await getNotificationData();
//       if (data.result.docs) {
//         setData(data.result?.docs?.config);
//       }
//     } catch (error) {}
//   };
//   const editNofiticationData = async (payload) => {
//     try {
//       const res = await editNotificationData(payload);
//       console.log("Updated Successfully", res);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchUsersData = async () => {
//     const token = localStorage.getItem("token");
//     const usersData = await fetchUserManagementData(token);
//     setAllUsers(usersData);
//   };

//   const handleUserAssign = (source, type, value) => {
//     setData((prev) => {
//       const updated = {
//         ...prev,
//         [source]: {
//           ...prev[source],
//           [type]: value || "",
//         },
//       };

//       console.log("Updated payload", updated);
//       editNofiticationData(updated);

//       return updated;
//     });
//   };

//   const toggleActive = (source, type) => {
//     const key = type === "email" ? "isEmailAllowed" : "isPhoneAllowed";

//     setData((prev) => {
//       const updated = {
//         ...prev,
//         [source]: {
//           ...prev[source],
//           [key]: !prev[source][key],
//         },
//       };
//       editNofiticationData(updated);
//       return updated;
//     });
//   };

//   useEffect(() => {
//     setData(initialData);
//     fetchUsersData();
//     fetchNofiticationData();
//   }, []);

//   const tab = ["webform", "eazbot", "whatsapp", "facebook", "google"];

//   return (
//     <div className="p-5">
//       <h1 className="text-md font-medium max-w-300 mx-auto mb-5">
//         Notification Config
//       </h1>

//       <div className="">
//         <table className="w-full bg-white  max-w-300 mx-auto border  rounded  overflow-hidden border-collapse">
//           <thead>
//             <tr className="border">
//               <th className="p-2 text-left font-medium text-gray-600">
//                 Source
//               </th>
//               <th className="p-2 text-left font-medium text-gray-600">
//                 Email Notification
//               </th>
//               <th className="p-2 text-left font-medium text-gray-600">
//                 Whatsapp Notification
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {tab?.map((item) => (
//               <tr key={item} className="border-b">
//                 <td className="p-2 capitalize  text-sm font-medium text-gray-600">
//                   {item}
//                 </td>

//                 {/* EMAIL */}
//                 <td className="p-2">
//                   <div className="flex items-center gap-2">
//                     <CustomDropdown
//                       multiple
//                       label={data[item]?.email || "Select email"}
//                       options={
//                         allUsers?.map((user) => ({
//                           value: user?.emailId,
//                           label: user?.userName,
//                         })) || []
//                       }
//                       onChange={(value) =>
//                         handleUserAssign(item, "email", value)
//                       }
//                     />

//                     <button
//                       className={`px-2 py-1 flex items-center rounded-full text-xs text-white ${
//                         data[item]?.isEmailAllowed === true
//                           ? "bg-green-500!"
//                           : "bg-gray-400"
//                       }`}
//                       onClick={() => toggleActive(item, "email")}
//                     >
//                       {data[item]?.isEmailAllowed ? "Active" : "Inactive"}
//                     </button>
//                   </div>
//                 </td>

//                 {/* WHATSAPP */}
//                 <td className="p-2">
//                   <div className="flex items-center gap-2">
//                     <CustomDropdown
//                       label={data[item]?.phone || "Select whatsapp"}
//                       options={
//                         allUsers?.map((user) => ({
//                           value: user?.phone,
//                           label: user?.userName,
//                         })) || []
//                       }
//                       onChange={(value) =>
//                         handleUserAssign(item, "phone", value)
//                       }
//                     />

//                     <button
//                       className={`px-2 py-1 flex items-center rounded-full text-xs text-white ${
//                         data[item]?.isPhoneAllowed
//                           ? "bg-green-500"
//                           : "bg-gray-400"
//                       }`}
//                       onClick={() => toggleActive(item, "phone")}
//                     >
//                       {data[item]?.isPhoneAllowed ? "Active" : "Inactive"}
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Notification;
