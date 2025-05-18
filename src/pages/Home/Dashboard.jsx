import React, { useContext, useEffect } from "react";
import DataContext from "../../context/DataContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import handleLocalStorage from "../../utils/handleLocalStorage";

const Dashboard = () => {
  // const navigate = useNavigate();
  // const location = useLocation();
  // const { setHomeNotifications, } = useContext(DataContext);

  // const CheckDashboard = async () => {
  //     try {
  //         const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6ImFiQGdtYWlsLmNvbSIsImV4cCI6MTc0MzkzOTY2Mi44NDY2ODV9.c7WpwtKuOdc37PwliLcocQooKtJgHlsmyPZDqDdz5W8"
  //           if (queryParameters.get("id") !== null) {
  //             localStorage.setItem("Token", queryParameters.get("id"));
  //           }
  //         const response = await fetch(
  //             `https://nexon.eazotel.com/eazotel/getuser/ ${token}}`,
  //             {
  //                 method: "GET",
  //                 headers: {
  //                     Accept: "application/json, text/plain, */*",
  //                     "Content-Type": "application/json",
  //                 },
  //             }
  //         );
  //         const json = await response.json();
  //         console.log(json)
  //           if (json.Status === true) {
  //             setUserProfile(json.Profile);
  //             setUserLinks(json.Data);
  //             setUserPlan(json.Plan);
  //             setUserAccess(json.Access);
  //             setIsadmin(json.Admin);

  //             GetAllLocations_hotel();
  //             CheckDinabiteToken_inDb();
  //             FetchAccessTokenFromDb();
  //             FetchSpreadSheetFromDb();
  //             setAuth(true);
  //           } else {
  //             LonestarDashboard()

  //           }
  //     } catch (error) {
  //         localStorage.clear();
  //     }
  //     setLoader(false);
  // };

  // useEffect(() => {
  //     CheckDashboard()
  //     if (localStorage.getItem('authPassword') && localStorage.getItem('authUsername')) {
  //         navigate('/')
  //     }

  //     if (location.pathname === "/") {
  //         setHomeNotifications([]);
  //     }
  // }, [])

  const { user } = useSelector((state) => state?.userProfile);

  return <div className="flex flex-col gap-5">Hello there!</div>;
};

export default Dashboard;
