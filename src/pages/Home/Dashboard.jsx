import React, { useContext, useEffect } from "react";
import DataContext from "../../context/DataContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import handleLocalStorage from "../../utils/handleLocalStorage";
import CommanHeader from "../../components/Navbar/CommanHeader";

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

  return (
    <div className="flex flex-col gap-5 hide-scrollbar">
      {/* <CommanHeader serviceName={"Influencer Marketing"} buttonName={"Mark as interested"} /> */}
      {/* <div className="grid grid-cols-3 gap-5 bg-white p-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
          <div key={item} className="bg-[#f3f4f6] p-4 rounded-md flex flex-col justify-center items-center px-4 pt-10 pb-12 h-[20rem]">
            <p className="text-4xl font-bold">{item}</p>
            <h3 className="text-[14px] mt-2">Item {item}</h3>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default Dashboard;
