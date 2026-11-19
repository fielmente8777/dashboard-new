import handleLocalStorage from "../../utils/handleLocalStorage";
import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// The CMS endpoints read the token and the hotel id from the request body
// (not the Authorization header), so both are added here for every call.
const cmsMutation = (build, url, tokenKey = "token") =>
  build.mutation({
    query: (body) => ({
      url,
      method: "POST",
      body: {
        [tokenKey]: getToken(),
        hid: String(handleLocalStorage("hid")),
        ...body,
      },
    }),
    extraOptions: { skipAuth: true },
  });

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { operation: "append" | "remove", question, answer, index }
    faqOperation: cmsMutation(build, "/cms/operation/Faq"),
    // { operation: "append", Heading, Text, Image, ... } | { operation: "pop", index }
    eventOperation: cmsMutation(build, "/cms/operation/Events"),
    // { offer: [...] } - replaces the whole list
    saveOffers: cmsMutation(build, "/cms/edit/offers"),
    // { Privacy, Cancellation, TermsServices } - all three are saved together
    savePolicies: cmsMutation(build, "/cms/edit/termsandconditions"),
    addBlog: cmsMutation(build, "/cms/add/blog"),
    // { operation: "append" | "remove", category, imageurl }
    galleryImageOperation: cmsMutation(build, "/cms/edit/Gallery/Images"),
    saveSocialLinks: cmsMutation(build, "/cms/edit/sociallinks"),
    saveFooter: cmsMutation(build, "/cms/edit/footer"),
    saveTrackingCodes: cmsMutation(build, "/cms/post/reviewsection", "Token"),
  }),
});

export const {
  useFaqOperationMutation,
  useEventOperationMutation,
  useSaveOffersMutation,
  useSavePoliciesMutation,
  useAddBlogMutation,
  useGalleryImageOperationMutation,
  useSaveSocialLinksMutation,
  useSaveFooterMutation,
  useSaveTrackingCodesMutation,
} = cmsApi;
