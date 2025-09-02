import { useSelector } from "react-redux";
import DashboardCard from "../../components/Card/DashboardCard";
import AnalyticsCard from "../../components/Card/AnalyticsCard";
import TemperatureCard from "../../components/Card/TemperatureCard";
import MiniLineChartCard from "../../components/Card/MiniLineChartCard";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { getAllClientEnquires } from "../../services/api/clientEnquire.api";
import { useContext, useEffect, useState } from "react";
import { getTodayQuery } from "../../utils/getDataInRange";
import Review from "../../components/Card/Review";
import Services from "../../components/Card/Services";
import AdLeadsAnalytics from "../Enquiry/AdLeadsAnalytics";
import { BASE_URL } from "../../data/constant";
import DataContext from "../../context/DataContext";
import ReservationForm from "../../components/ReservationForm/hotel_reservation_form_react_frontend";

const Dashboard = () => {
  const [enquires, setEnquires] = useState([]);
  const [enquiresList, setEnquiresList] = useState([]);
  const [convertedEnquiries, setConvertedEnquiries] = useState(0);
  const [eazobotEnquiries, setEazobotEnquiries] = useState(0);
  const [eazobotEnquiriesList, setEazobotEnquiriesList] = useState(0);

  const [loading, setLoading] = useState(true);
  const { Leads, setLeads, setLeadsList } = useContext(DataContext);

  const [dateRange, setDateRange] = useState(""); // default 7 days
  // const [data, setData] = useState([]);

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

  const FetchSheetsDataofSpreadSheet = async (sheetid, sheetname) => {
    try {
      const response = await fetch(
        `${BASE_URL}/leadmanagement/getSheetDetailLead/${localStorage.getItem(
          "token"
        )}/${sheetid}/${sheetname}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      // console.log(json);
      if (json.Status) {
        // setsheetNamess(sheetname);
        // setsheetid(sheetid);
        setLeads(json.Message.values);
        setLeadsList(json.Message.values);
        // settokenExpire(false);
      } else {
        // setLeads([]);
        // settokenExpire(true);
      }
    } catch {
      // alert("Some Problem update token");
    }
  };

  const fetchEnquires = async (token) => {
    const hid = handleLocalStorage("hid");
    try {
      const response = await getAllClientEnquires({
        token,
        hid,
      });
      setEnquires(response);
      setEnquiresList(response);
      const converted = response?.filter((item) => {
        if (item?.status) {
          return item?.status.toLowerCase() === "converted";
        }

        return false;
      });

      const fromEazobot = response?.filter((item) => {
        if (item?.created_from === "null") return false;
        else {
          if (item?.created_from) {
            const source = item?.created_from?.toLowerCase();
            return (
              source === "eazobot" ||
              source === "chatbot" ||
              source === "chat bot"
            );
          }

          return false;
        }
      });

      setEazobotEnquiries(fromEazobot);
      setEazobotEnquiriesList(fromEazobot);
      setConvertedEnquiries(converted?.length);
    } catch (error) {
      console.error("Error fetching enquires:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (e) => {
    const { value } = e.target;
    setDateRange(value);
    const now = new Date();

    if (value === "all") {
      setEnquires(enquiresList);
      return;
    }

    let days = 7;
    if (value === "30d") days = 30;
    else if (value === "90d") days = 90;

    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);

    const filtered = enquiresList.filter((item) => {
      const createdDate = new Date(item.Created_at);
      return createdDate >= cutoff;
    });

    const filteredEazobot = eazobotEnquiriesList.filter((item) => {
      const createdDate = new Date(item.Created_at);
      return createdDate >= cutoff;
    });

    setEnquires(filtered);
    setEazobotEnquiries(filteredEazobot);
  };

  useEffect(() => {
    fetchEnquires(localStorage.getItem("token"));
    FetchSheetsDataofSpreadSheet(
      localStorage.getItem("SheetId"),
      localStorage.getItem("SheetName")
    );
  }, []);

  const data = [
    {
      amount: enquires?.length,
      lable: "Total Leads",
      progress: 100,
    },
    {
      amount: getTodayQuery(enquires).length,
      lable: "Today",
      progress: 5.8,
    },
    {
      amount: eazobotEnquiries?.length,
      lable: "Eazbot",
      progress: 67,
    },
    {
      amount: enquires?.length - eazobotEnquiries.length,
      lable: "Webform",
      progress: 33,
    },
    {
      amount: convertedEnquiries,
      lable: "Conversion Rate",
      progress: 0,
    },
  ];

  return (
    <>
      {!loading ? (
        <div className="flex flex-col gap-5 hide-scrollbar md:px-4">
          {/*   */}

          <div className="flex items-center justify-end p-2">
            {/* <h2 className="text-lg font-semibold">Date Selected</h2> */}
            <select
              value={dateRange}
              onChange={handleDateSelect}
              className="border border-gray-400 shadow-md rounded-md px-3 py-2 text-sm outline-none cursor-pointer"
            >
              <option value="" disabled>
                Select Date
              </option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6 gap-4 md:gap-6 mt-4">
            {data?.map((item, index) => (
              <DashboardCard
                amount={item.amount}
                label={item.lable}
                progress={item.progress}
                key={index}
              />
            ))}
          </div>

          <div>
            <AdLeadsAnalytics showTitle={false} rangeDate={dateRange} />
          </div>
          {/* <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 ">
            <div className="lg:col-span-3">
              <AnalyticsCard />
            </div>
            <div className="md:hidden lg:block lg:col-span-2">
              <TemperatureCard />
            </div>
          </div> */}

          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 pb-10">
            <Review />
            <div className="hidden md:block lg:hidden">
              <TemperatureCard />
            </div>
            <Services />

            <div className="lg:col-span-2">
              <MiniLineChartCard
                title="Other"
                value="0.00"
                changePercent={0.0}
                isPositive={false}
                currentData={[20, 15, 30, 35, 25, 50]}
                lastWeekData={[25, 30, 22, 40, 33, 38]}
              />
            </div>
          </div> */}
        </div>
      ) : (
        <div className="flex flex-col gap-5 hide-scrollbar px-4">
          {/* <div className="h-14 w-1/3 bg-zinc-200 animate-pulse rounded" /> */}

          <div className="grid grid-cols-1 md:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xxl:grid-cols-6 mt-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="h-[156px] p-4 rounded-xl overflow-hidden bg-zinc-200 animate-pulse flex flex-col justify-between"
              ></div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-3">
              <div className="h-[335px] rounded-xl bg-zinc-200 animate-pulse w-full"></div>
            </div>
            <div className="col-span-2">
              <div className="h-[335px] rounded-xl bg-zinc-200 animate-pulse w-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 pb-10">
            <div className="lg:col-span-2 bg-zinc-200 animate-pulse p-4 rounded-xl h-[300px]" />

            <div className="lg:col-span-1 bg-zinc-200 animate-pulse p-4 rounded-xl h-[300px]" />

            <div className="col-span-2 bg-zinc-200 animate-pulse rounded-xl h-[300px]" />
          </div>
        </div>
      )}

      {/* <ReservationForm /> */}
    </>
  );
};

export default Dashboard;
