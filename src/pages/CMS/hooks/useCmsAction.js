import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useApiAction } from "../../../hooks/useApiAction";
import { fetchWebsiteData } from "../../../redux/slice/websiteDataSlice";
import handleLocalStorage from "../../../utils/handleLocalStorage";
import { getToken } from "../../../utils/session";

// useApiAction for CMS saves: on success it also reloads the website data,
// so every CMS page shows what was just saved.
export const useCmsAction = () => {
  const dispatch = useDispatch();
  const run = useApiAction();

  return useCallback(
    async (request, messages) => {
      const result = await run(request, messages);
      if (result) {
        dispatch(fetchWebsiteData(getToken(), handleLocalStorage("hid")));
      }
      return result;
    },
    [dispatch, run],
  );
};
