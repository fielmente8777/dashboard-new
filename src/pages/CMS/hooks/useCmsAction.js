import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useApiAction } from "../../../hooks/useApiAction";
import { refreshWebsiteData } from "../../../redux/session";

// useApiAction for CMS saves: on success it also reloads the website data,
// so every CMS page shows what was just saved.
export const useCmsAction = () => {
  const dispatch = useDispatch();
  const run = useApiAction();

  return useCallback(
    async (request, messages) => {
      const result = await run(request, messages);
      if (result) {
        dispatch(refreshWebsiteData());
      }
      return result;
    },
    [dispatch, run],
  );
};
