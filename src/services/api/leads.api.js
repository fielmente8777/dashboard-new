import axios from "axios";
import { NEW_BASE_URL } from "../../data/constant";

// handle api for getting user's profile details
export const getLeads = async ({
  created_from,
  page,
  pageId,
  formId,
  limit = 20,
  search,
  startDate,
  endDate,
}) => {
  const params = new URLSearchParams();
  params.append("hid", localStorage.getItem("hid"));

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
    `${NEW_BASE_URL}/api/v1/leads/${localStorage.getItem("ndid")}?${params.toString()}`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    },
  );
  return data;
};

export const UpdateLeadStatus = async ({ leadId, stage }) => {
  const response = await axios.post(
    "https://nexon.eazotel.com/eazotel/edit-contact-query",
    {
      token: localStorage.getItem("token"),
      status: stage,
      id: leadId,
    },
  );

  return response;
};
