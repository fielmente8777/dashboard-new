import { useEffect, useState } from "react";
import { addSubscription, getWallet } from "../../services/api/wallet.api";
import CreditUsage from "./components/CreditUsage";
import UsageChart from "./components/UsageChart";
import CreditBreakdown from "./components/CreditBreakdown";
import ActivityTable from "./components/ActivityTable";
import TemplateUsage from "./components/TemplateUsage";
import {
  cardsMock,
  chartMock,
  pieMock,
  activityMock,
  templateMockData,
} from "./mockData";
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


    return (
        // <div>Wallet
        //     {/* <button onClick={handleAddSubscription}> Add subscribe</button> */}
        // </div>
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Wallet</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cardsMock.map((card, index) => (
                    <CreditUsage key={card.title} {...card} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
  <UsageChart data={chartMock} />
</div>
<div>
    <CreditBreakdown data={pieMock} />
</div>

        </div>
        <div>
<ActivityTable data={activityMock} />
</div>
<TemplateUsage data={templateMockData} />
        </div>

    );
};

export default Wallet