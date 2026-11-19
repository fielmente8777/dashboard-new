import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfileSuccess } from "../../../redux/slice/UserSlice";

// The signed-in user's profile, plus a way to apply a saved change to it so
// the rest of the dashboard (location switcher, SEO links...) sees it at once.
export const useProfile = () => {
  const dispatch = useDispatch();
  const { user, authUser } = useSelector((state) => state.userProfile);
  const profile = user?.Profile;

  const patchProfile = useCallback(
    (changes) => {
      if (!user) return;
      dispatch(
        getUserProfileSuccess({ ...user, Profile: { ...user.Profile, ...changes } }),
      );
    },
    [dispatch, user],
  );

  return { profile, authUser, patchProfile };
};
