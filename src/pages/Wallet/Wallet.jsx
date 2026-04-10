import { useEffect, useState } from "react";
import { addSubscription, getWallet } from "../../services/api/wallet.api";
import CreditUsage from "./components/CreditUsage";
import UsageChart from "./components/UsageChart";
import CreditBreakdown from "./components/CreditBreakdown";
import ActivityRow from "./components/ActivityRow";
import ActivityTable from "./components/ActivityTable";
const Wallet = () => {


    const[data,setData]=useState();

    const fetchWalletData=async()=>{
        try {
            const data=await getWallet();
            console.log("Data",data);
            setData(data);
        } catch (error) {
            console.log(error);
            setData({});
        }
    };
    const handleAddSubscription=async()=>{
        try {
            const data=await addSubscription();
            console.log("Data",data);
        } catch (error) {
            console.log(error);
        }
            
        }


    useEffect(()=>{
        fetchWalletData()
    },[]);
    if(!data) return <div>Loading...</div>;

    const cards = [
  {
    title: "AI Credits",
    value: 2870,
    used: 2130,
    total: 5000,
    color: "bg-blue-500",
  },
  {
    title: "WhatsApp",
    value: 340,
    used: 1660,
    total: 2000,
    color: "bg-green-500",
  },
  {
    title: "Email",
    value: 4540,
    used: 5460,
    total: 10000,
    color: "bg-yellow-500",
  },
  {
    title: "Campaigns",
    value: 18,
    used: 32,
    total: 50,
    color: "bg-purple-500",
  },
];
    const chartData=[
        {date:"Apr 1", ai: 20, whatsapp: 10, email: 511},
        {date:"Apr 2", ai: 30, whatsapp: 15, email: 110},
        {date:"Apr 3", ai: 25, whatsapp: 20, email: 118},
    ];
    const pieData=[
        {name: "AI Credits", value: 1130},
        {name: "WhatsApp", value: 660},
        {name: "Email", value: 1180},
        {name: "Campaigns", value: 450},
    ];
    const activityData=[
        {id:1, date:"Apr 10,2026", service:"AI", action:"Auto Reply", credits:-20, status:"Completed"},
        {id:2, date:"Apr 2,2026", service:"WhatsApp", action:"Campagin Sent", credits:15, status:"Completed"},
        {id:3, date:"Apr 3,2026", service:"Email", action:"API Call", credits:-118, status:"Pending"},
    ];
    return (
        // <div>Wallet
        //     {/* <button onClick={handleAddSubscription}> Add subscribe</button> */}
        // </div>
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Wallet</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((card, index) => (
                    <CreditUsage key={card.title} {...card} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
  <UsageChart data={chartData} />
</div>
<div>
    <CreditBreakdown data={pieData} />
</div>

        </div>
        <div>
<ActivityTable data={activityData} />
</div>
        </div>

    );
};

export default Wallet