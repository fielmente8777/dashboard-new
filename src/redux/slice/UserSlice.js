import { createSelector, createSlice } from "@reduxjs/toolkit";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { sessionApi } from "../api/sessionApi";
import { getAllowedHids } from "../../utils/resolveLocation";

const initialState = {
  user: null,
  authUser: null,
  // the hotel location selected last time (survives closing the browser)
  hid: localStorage.getItem("hid") || null,
  loading: false,
  isAuthLoading: false,
  error: null,
};

const { getUserProfile, getAuthUser } = sessionApi.endpoints;

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    // a saved profile change, shown before the next fetch (see useProfile)
    getUserProfileSuccess: (state, action) => {
      state.loading = false;
      state.user = {
        ...action.payload,
      };
    },
    setHid: (state, action) => {
      state.loading = false;
      state.hid = action.payload;
      if (action?.payload) {
        handleLocalStorage("hid", action?.payload);
      }
    },
  },
  // filled by the session queries (redux/session.js); a request skipped
  // because the answer is cached comes back as a "condition" rejection
  extraReducers: (builder) => {
    builder
      .addMatcher(getUserProfile.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(getUserProfile.matchFulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addMatcher(getUserProfile.matchRejected, (state, action) => {
        if (action.meta.condition) return;
        state.loading = false;
        state.error = action.error?.message ?? "Could not load the profile";
      })
      .addMatcher(getAuthUser.matchPending, (state) => {
        state.isAuthLoading = true;
      })
      .addMatcher(getAuthUser.matchFulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.authUser = action.payload;
      })
      .addMatcher(getAuthUser.matchRejected, (state, action) => {
        if (action.meta.condition) return;
        state.isAuthLoading = false;
      });
  },
});

export const { getUserProfileSuccess, setHid } = userProfileSlice.actions;

export default userProfileSlice.reducer;

// Selectors for the selected hotel location
export const selectHid = (state) => state.userProfile.hid;
const selectHotels = (state) => state.userProfile.user?.Profile?.hotels;
const selectAuthUser = (state) => state.userProfile.authUser;

export const selectCurrentLocation = createSelector(
  [selectHotels, selectHid],
  (hotels, hid) => hotels?.[hid] ?? null,
);

// true once the profile has loaded and the account has no hotel yet: the
// user has to finish onboarding before the dashboard can be used.
// null while it is not known (profile still loading or the request failed).
export const selectNeedsOnboarding = (state) => {
  const { user } = state.userProfile;
  if (!user) return null;
  return user.Status === false || !Object.keys(user.Profile?.hotels ?? {}).length;
};

// Locations the signed-in user may switch to
export const selectAvailableLocations = createSelector(
  [selectHotels, selectAuthUser],
  (hotels, authUser) =>
    getAllowedHids(hotels, authUser)
      .filter((hid) => hotels?.[hid])
      .map((hid) => ({ hid, ...hotels[hid] })),
);

// import { createSlice } from "@reduxjs/toolkit";
// import { getUserProfile } from "../../services/api";

// const initialState = {
//     userData: {}
//     // userProfile: {},
//     // userLinks: null,
//     // userPlan: null,
//     // userAccess: null,
//     // isAdmin: false,
// };

// const userSlice = createSlice({
//     name: "user",
//     initialState,
//     reducers: {
//         // setUserProfile: (state, action) => {
//         //     state.userProfile = action.payload;
//         // },
//         // setUserLinks: (state, action) => {
//         //     state.userLinks = action.payload;
//         // },
//         // setUserPlan: (state, action) => {
//         //     state.userPlan = action.payload;
//         // },
//         // setUserAccess: (state, action) => {
//         //     state.userAccess = action.payload;
//         // },
//         // setIsAdmin: (state, action) => {
//         //     state.isAdmin = action.payload;
//         // },
//         setUserData: (state, action) => {
//             console.log("Updating Redux State:", action?.payload);
//             state.userData = action.payload;
//             // const { Profile, Data, Plan, Access, Admin } = action.payload || {};
//             // state.userProfile = Profile || null;
//             // state.userLinks = Data || null;
//             // state.userPlan = Plan || null;
//             // state.userAccess = Access || null;
//             // state.isAdmin = Admin ?? false;
//         },
//     },
// });

// // export const { setUserProfile, setUserLinks, setUserPlan, setUserAccess, setIsAdmin, setUserData } = userSlice.actions;
// export const { setUserData } = userSlice.actions;
// export default userSlice.reducer;

// // Async Thunk to Fetch User Profile
// export const userProfile = (token) => async (dispatch) => {
//     try {
//         const response = await getUserProfile(token);
//         console.log("User Profile Response:", response);

//         // Destructure response directly
//         // const { Profile, Data, Plan, Access, Admin } = response || {};

//         // Dispatch all data at once
//         // dispatch(setUserData({ Profile, Data, Plan, Access, Admin }));
//         dispatch(setUserData(response));

//         return { success: true, data: response };
//     } catch (error) {
//         const errorMessage = error.response?.msg || "User Profile fetch failed";
//         console.error("Error getting user profile:", error);
//         return { success: false, error: errorMessage };
//     }
// };
