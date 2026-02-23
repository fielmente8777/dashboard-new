import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { BASE_URL, NEW_BASE_URL } from "../data/constant";
import { is24HoursCompletedFnc } from "../utils/is24Hours";
import { getMetaAccounts, getMetaLeads } from "../services/api/MetaLeads.api";

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [pageId, setSelectedPageId] = useState(null);
  const [isOpenProfilePopup, setIsOpenProfilePopup] = useState(false);
  const [auth, setAuth] = useState(false);
  const [totalRequests, setTotalRequests] = useState();
  const [emergencyRequestData, setEmergencyRequestData] = useState([]);
  const [requestData, setRequestsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState("");
  const [inProgressRequests, setInProgressRequests] = useState("");
  const [completedRequests, setCompletedRequests] = useState("");
  const [cancelledRequests, setCancelledRequests] = useState("");
  const [homeNotifications, setHomeNotifications] = useState([]);
  const [emergencyNotifications, setEmergencyNotifications] = useState([]);
  const [Leads, setLeads] = useState([]);
  const [leadsList, setLeadsList] = useState([]);
  const [integrationStatus, setIntegrationStauts] = useState({
    WebsiteTracking: false,
    gmail: false,
    google_analytics: false,
    meta: false,
    exotel: false,
    googleAdsInsight: {
      status: false,
      lastSyncTime: null,
    },
  });

  const [RoomsData, setRoomsData] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [editButton, setEditButton] = useState(false);

  // whatsapp
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [is24HoursCompleted, setIs24HoursCompleted] = useState(false);
  const [limit, setLimit] = useState(10);
  const [isLoadingIntegrationStatus, setIsLoadingIntegrationStatus] =
    useState(false);

  // const host = "http://localhost:8000"
  const host = "https://hmsbackend-7pyp.onrender.com";

  // const socket = io(host, {
  //   transports: ["websocket"], // Ensure WebSocket transport is used
  //   reconnectionAttempts: 1, // Optional: retry connection attempts
  //   reconnectionDelay: 10000, // Optional: retry delay (in ms)
  // });

  const [metaLeads, setMetaLeads] = useState([]);
  const fetchMetaPages = async () => {
    try {
      const response = await getMetaAccounts();
      if (response?.success) {
        const pagesData = response?.result?.docs?.pages || [];
        // setPages(pagesData);

        if (pagesData.length === 1) {
          setSelectedPageId(pagesData[0].id);
          // fetchPageForms(pagesData[0].id);
          fetchLeads(pagesData[0].id);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLeads = async (pageId, formId, cursor) => {
    // setLoadingLeads(true);
    try {
      const response = await getMetaLeads(pageId, formId, cursor, limit);
      if (response?.success) {
        // setLeads(response?.result?.docs?.leads || []);

        const sortedLeads = [...(response?.result?.docs?.allLeads || [])].sort(
          (a, b) => new Date(b.created_time) - new Date(a.created_time),
        );
        setMetaLeads(sortedLeads || []);
        // const cursors = response?.result?.paging?.cursors;
        // setAfterCursor(cursors?.after || null);
        // setBeforeCursor(cursors?.before || null);
      }
    } catch (error) {
      console.log(error);
    }
    // setLoadingLeads(false);
  };

  useEffect(() => {
    fetchMetaPages();
  }, [limit]);

  const fetchRoomsData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/room/${localStorage.getItem(
          "token",
        )}/${localStorage.getItem("hid")}`,
        {
          method: "GET",
          header: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
      } else {
        const responseData = await response.json();
        setRoomsData(responseData.data);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const fetchBookingData = async () => {
    try {
      const bookingDataResponse = await fetch(
        `${BASE_URL}/booking/bookings/${localStorage.getItem(
          "token",
        )}/${localStorage.getItem("hid")}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (bookingDataResponse.ok) {
        const bookingData = await bookingDataResponse.json();

        setBookingData(bookingData);
      } else {
        console.error("Failed to fetch booking data");
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  const getAllRequest = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${host}/api/getrequest`, {
        ndid: localStorage.getItem("ndid"),
        hid: localStorage.getItem("hid"),
      });

      // if (response.status === 404) {
      //     setLoading(false)
      //     return;
      // }

      if (!response?.data) {
        // console.log("data not found");
      } else {
        setTotalRequests(response.data?.data.length);
        setRequestsData(response.data?.data);
        howManyPendingRequest(response.data?.data);
        howManyInProgressRequest(response.data?.data);
        howManyCompletedRequest(response.data?.data);
        howManyCancelledRequest(response.data?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  // const getEmergencyRequest = async () => {
  //   try {
  //     const response = await axios.post(`${host}/api/getallemergencyrequest`, {
  //       ndid: localStorage.getItem("ndid"),
  //       hid: localStorage.getItem("hid"),
  //     });

  //     setEmergencyRequestData(response.data.data);
  //   } catch (error) {
  //     setLoading(false);
  //     return {};
  //   }
  // };

  const howManyPendingRequest = (data) => {
    const pendingRequests = data?.filter(
      (request) => request.status === "Pending",
    ).length;
    setPendingRequests(pendingRequests);
  };

  const howManyInProgressRequest = (data) => {
    const inProgressRequests = data?.filter(
      (request) => request.status === "In Progress",
    ).length;
    setInProgressRequests(inProgressRequests);
  };

  const howManyCompletedRequest = (data) => {
    const completedRequests = data?.filter(
      (request) => request.status === "Completed",
    ).length;
    setCompletedRequests(completedRequests);
  };
  const howManyCancelledRequest = (data) => {
    const cancelledRequests = data?.filter(
      (request) => request.status === "Cancelled",
    ).length;
    setCancelledRequests(cancelledRequests);
  };

  const checkIntegrationStatus = async () => {
    setIsLoadingIntegrationStatus(true);
    try {
      const response = await fetch(`${NEW_BASE_URL}/api/v1/integration/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      const isCompleted = is24HoursCompletedFnc(
        data.result?.docs?.googleAdsInsight?.lastSyncTime,
      );

      setIs24HoursCompleted(isCompleted);
      setIntegrationStauts(data?.result?.docs);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingIntegrationStatus(false);
    }
  };

  // useEffect(() => {
  //   // localStorage.setItem('ndid', "f80fb327-020b-4fc7-a085-f2ae10edabe9");
  //   // localStorage.setItem('hid', "11960126");

  //   socket.on("newRequest", (newRequest) => {
  //     setRequestsData((prevRequests) => [...prevRequests, newRequest]);
  //     setTotalRequests((totalRequests) => totalRequests + 1);
  //     setPendingRequests((pendingRequests) => pendingRequests + 1);
  //     setEditButton(true);
  //     setHomeNotifications((prevNotifications) => [
  //       ...prevNotifications,
  //       { message: `New request from ${newRequest.guestName}` },
  //     ]);
  //   });

  //   socket.on("newEmergencyRequest", (newEmergencyRequest) => {
  //     setEmergencyRequestData((emergencyRequestData) => [
  //       ...emergencyRequestData,
  //       newEmergencyRequest,
  //     ]);
  //     setEditButton(true);
  //     setEmergencyNotifications((prevNotifications) => [
  //       ...prevNotifications,
  //       { message: `New request from ${newEmergencyRequest.guestName}` },
  //     ]);
  //   });

  //   getAllRequest();
  //   getEmergencyRequest();

  //   return () => {
  //     socket.off("newRequest");
  //     socket.off("newEmergencyRequest");
  //   };
  // }, []);

  return (
    <DataContext.Provider
      value={{
        // socket,
        host,
        auth,
        setAuth,
        editButton,
        setEditButton,
        totalRequests,
        setTotalRequests,
        emergencyRequestData,
        setEmergencyRequestData,
        requestData,
        setRequestsData,
        loading,
        setLoading,
        pendingRequests,
        setPendingRequests,
        inProgressRequests,
        setInProgressRequests,
        completedRequests,
        setCompletedRequests,
        cancelledRequests,
        setCancelledRequests,
        getAllRequest,
        howManyPendingRequest,
        howManyInProgressRequest,
        howManyCompletedRequest,
        homeNotifications,
        setHomeNotifications,
        emergencyNotifications,
        setEmergencyNotifications,
        fetchRoomsData,
        RoomsData,
        fetchBookingData,
        bookingData,
        Leads,
        setLeads,
        leadsList,
        setLeadsList,
        integrationStatus,
        setIntegrationStauts,
        checkIntegrationStatus,
        isLoadingIntegrationStatus,
        is24HoursCompleted,
        selectedConversation,
        setSelectedConversation,
        conversations,
        setConversations,
        limit,
        setLimit,
        metaLeads,
        setMetaLeads,
        isOpenProfilePopup,
        setIsOpenProfilePopup,
        pageId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
