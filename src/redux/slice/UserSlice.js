import { createSelector, createSlice } from "@reduxjs/toolkit";
import handleLocalStorage from "../../utils/handleLocalStorage";
import {
  getAuthUserProfile,
  getUserProfile,
} from "../../services/api/profile.api";
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

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    getUserProfileRequest: (state) => {
      state.isAuthLoading = true;
      state.loading = true;
      state.error = null;
    },
    setAuthUserProfile: (state, action) => {
      state.isAuthLoading = false;
      state.authUser = action.payload?.User;
    },
    getUserProfileSuccess: (state, action) => {
      state.loading = false;
      state.user = {
        ...action.payload,
      };
    },
    getUserProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setHid: (state, action) => {
      state.loading = false;
      state.hid = action.payload;
      if (action?.payload) {
        handleLocalStorage("hid", action?.payload);
      }
    },
  },
});

export const {
  getUserProfileRequest,
  getUserProfileSuccess,
  getUserProfileFailure,
  setCurrentLocation,
  setAuthUserProfile,
  setHid,
} = userProfileSlice.actions;

export default userProfileSlice.reducer;

// Selectors for the selected hotel location
export const selectHid = (state) => state.userProfile.hid;
const selectHotels = (state) => state.userProfile.user?.Profile?.hotels;
const selectAuthUser = (state) => state.userProfile.authUser;

export const selectCurrentLocation = createSelector(
  [selectHotels, selectHid],
  (hotels, hid) => hotels?.[hid] ?? null,
);

// Locations the signed-in user may switch to
export const selectAvailableLocations = createSelector(
  [selectHotels, selectAuthUser],
  (hotels, authUser) =>
    getAllowedHids(hotels, authUser)
      .filter((hid) => hotels?.[hid])
      .map((hid) => ({ hid, ...hotels[hid] })),
);

// Thunk function to fetch user profile
export const fetchUserProfile = (token) => async (dispatch) => {
  dispatch(getUserProfileRequest());
  try {
    const data = await getUserProfile(token);

    dispatch(getUserProfileSuccess(data));
    return { success: true, response: data };
  } catch (error) {
    dispatch(getUserProfileFailure(error.message));
    return { success: false, error: error.message };
  }
};

export const fetchAuthUserProfile = (token) => async (dispatch) => {
  dispatch(getUserProfileRequest());
  if (token) {
    try {
      if (token) {
        const data = await getAuthUserProfile(token);
        dispatch(setAuthUserProfile(data));
        return { success: true, response: data };
      }
    } catch (error) {
      dispatch(getUserProfileFailure(error.message));
      return { success: false, error: error.message };
    }
  }
};

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
