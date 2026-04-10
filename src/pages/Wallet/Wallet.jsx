import { useEffect, useState } from "react";
import { addSubscription, getWallet } from "../../services/api/wallet.api";

const Wallet = () => {


    const[data,setData]=useState();

    const fetchWalletData=async()=>{
        try {
            const data=await getWallet();
            console.log("Data",data);
        } catch (error) {
            
        }
    }
    const handleAddSubscription=async()=>{
        try {
            const data=await addSubscription();
            console.log("Data",data);
        } catch (error) {
            
        }
    }


    useEffect(()=>{
        fetchWalletData()
    },[])
    return (
        <div>Wallet
            {/* <button onClick={handleAddSubscription}> Add subscribe</button> */}


            




        </div>
    )
}

export default Wallet