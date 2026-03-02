import axios from "axios";
import { NEW_BASE_URL } from "../../data/constant";

// handle api for getting user's profile details
export const getLeads = async ({
  created_from,
  page,
  pageId,
  formId,
  limit,
  search,
  startDate,
  endDate,
  is_export,
}) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  params.append("hid", localStorage.getItem("hid"));

  if (is_export) params.append("is_export", is_export);
  if (created_from) params.append("created_from", created_from);
  if (page) params.append("page", page);
  if (pageId) params.append("pageId", pageId);
  if (formId) params.append("formId", formId);
  if (limit) params.append("limit", limit);
  if (search) params.append("search", search);
  if (startDate && endDate) {
    params.append("from", startDate);
    params.append("to", endDate);
  }

  const { data } = await axios.get(
    `${NEW_BASE_URL}/api/v1/leads/get?${params.toString()}`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};

export const getLeadById = async (leadId, hid) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(
    `${NEW_BASE_URL}/api/v1/leads/get/${leadId}?hid=${hid}`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};

export const updateLead = async (payload) => {
  const token = localStorage.getItem("token");
  const hid = payload?.hid;
  const { data } = await axios.put(
    `${NEW_BASE_URL}/api/v1/leads/${payload?.leadId}/update?hid=${hid}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
};

export const UpdateLeadStatus = () => {};
