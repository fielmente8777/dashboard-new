import { useSelector } from "react-redux";
import DashboardCard from "../../components/Card/DashboardCard";
import AnalyticsCard from "../../components/Card/AnalyticsCard";
import TemperatureCard from "../../components/Card/TemperatureCard";
import MiniLineChartCard from "../../components/Card/MiniLineChartCard";
import { GL, LS, OTA, PM, WD } from "../../icons/icon";
import Greeting from "../../components/Greeting";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { getAllClientEnquires } from "../../services/api/clientEnquire.api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [enquiriesLength, setEnquiriesLength] = useState(0)
  const [convertedEnquiries, setConvertedEnquiries] = useState(0)
  const [loading, setLoading] = useState(true)
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

  const fetchEnquires = async (token) => {
    const hid = handleLocalStorage("hid");
    try {
      const response = await getAllClientEnquires({
        token,
        hid,
      });

      const data = response?.filter((item) => item?.status.toLowerCase() === "open")
      const converted = response?.filter((item) => item.status.toLowerCase() === "converted")
      setEnquiriesLength(data?.length);
      setConvertedEnquiries(converted?.length)

    } catch (error) {
      console.error("Error fetching enquires:", error);
    }
    finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchEnquires(localStorage.getItem("token"));
  }, []);

  const data = [
    {
      "amount": enquiriesLength,
      "lable": "Totle Leads",
      "progress": 50
    },
    {
      "amount": "₹ 0",
      "lable": "Daily average income",
      "progress": 18
    },
    {
      "amount": convertedEnquiries,
      "lable": "Lead Conversion",
      "progress": 78
    },
    {
      "amount": 1,
      "lable": "Campaign Running",
      "progress": 100
    },
  ]


  const reviews = [
    { lable: 'Positive', value: 1 },
    { lable: 'Negative', value: 1 },
    { lable: 'Average', value: 1 },
  ];

  const services = [
    { lable: 'Ota listing & optimization', color: '#01C99B', icon: <OTA />, link: "ota-listing" },
    { lable: 'Performance marketing', color: '#FEC107', icon: <PM />, link: "performance-marketing" },
    { lable: 'Google listing', color: '#F94A3D', icon: <GL />, link: "google-listing" },
    { lable: 'Linktree setup', color: '#3A86FF', icon: <LS />, link: "linktree-setup" },
    { lable: 'Website development', color: '#5C60F5', icon: <WD />, link: "custom-website" },
  ];


  const total = reviews.reduce((acc, r) => acc + r.value, 0);

  const getColor = (index) => {
    const colors = ['#4339F2', '#A19EF0', '#C9C8FC'];
    return colors[index % colors.length];
  };

  const donutStyle = {
    background: `conic-gradient(
      ${getColor(0)} 0% ${reviews[0].value / total * 100}%,
      ${getColor(1)} ${reviews[0].value / total * 100}% ${(reviews[0].value + reviews[1].value) / total * 100}%,
      ${getColor(2)} ${(reviews[0].value + reviews[1].value) / total * 100}% 100%
    )`
  };


  return (

    <>
      {!loading ?
        <div className="flex flex-col gap-5 hide-scrollbar px-4">
          <Greeting />

          {/*   */}
          <div className="grid grid-cols-1 md:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xxl:grid-cols-6">
            {data?.map((item, index) => (
              <DashboardCard amount={item.amount} label={item.lable} progress={item.progress} key={index} />

            ))}
          </div>
          <div className="grid grid-cols-5 gap-5 ">
            <div className="col-span-3">
              <AnalyticsCard />
            </div>
            <div className="col-span-2">
              <TemperatureCard />


            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 pb-10">
            <div className="lg:col-span-2 bg-white p-4 rounded-xl cardShadow w-full ">
              <h3 className="text-md font-semibold text-gray-600">Customer Reviews</h3>
              <p className="text-sm text-gray-500 mb-4">Overview of Reviews</p>

              <div className="flex justify-center items-center">
                <div className="relative w-40 h-40 rounded-full" style={donutStyle}>
                  <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>

              <div className="flex justify-around mt-6 text-sm text-gray-600">
                {reviews.map((r, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(i) }}></span>
                    <span>{r.lable}</span>
                    <span className="font-medium text-gray-800">{r.value}%</span>
                  </div>
                ))}
              </div>
            </div>


            <div className="lg:col-span-1 bg-white p-4 rounded-xl cardShadow w-full h-full">
              <h3 className="text-md font-semibold text-gray-600">Highlighted Services</h3>
              <ul className="flex mt-4 flex-col gap-5 text-gray-600">
                {services.map((s, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full" style={{ backgroundColor: s.color }}>
                      {/* {s.icon} */}
                    </span>
                    <Link to={s?.link}>{s.lable}</Link>
                  </li>
                ))}
              </ul>
            </div>


            <div className="col-span-2">
              <MiniLineChartCard
                title="Other"
                value="0.00"
                changePercent={0.0}
                isPositive={false}
                currentData={[20, 15, 30, 35, 25, 50]}
                lastWeekData={[25, 30, 22, 40, 33, 38]}
              />
            </div>
          </div>
        </div>
        :

        <div className="flex flex-col gap-5 hide-scrollbar px-4">
          <div className="h-14 w-1/3 bg-zinc-200 animate-pulse rounded" />

          <div className="grid grid-cols-1 md:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xxl:grid-cols-6">
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
      }
    </>

  );
};

export default Dashboard;
