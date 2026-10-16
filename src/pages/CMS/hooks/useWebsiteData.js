import { useSelector } from "react-redux";

// Website content of the selected hotel location. `isLoading` is only true
// for the first load, so a page keeps showing its content while the data is
// refreshed after a save.
export const useWebsiteData = () => {
  const { currentLoactionWebsiteData: data, loading } = useSelector(
    (state) => state.hotelsWebsiteData,
  );

  return { data, isLoading: loading && !data };
};
