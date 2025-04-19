import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const DataContext = createContext({});



export const DataProvider = ({ children }) => {
    const [auth, setAuth] = useState(false);
    const [totalRequests, setTotalRequests] = useState();
    const [emergencyRequests, setEmergencyRequests] = useState();
    const [emergencyRequestData, setEmergencyRequestData] = useState([])
    const [requestData, setRequestsData] = useState([]);
    const [loading, setLoading] = useState(false)
    const [pendingRequests, setPendingRequests] = useState('');
    const [inProgressRequests, setInProgressRequests] = useState('');
    const [completedRequests, setCompletedRequests] = useState('');
    const [cancelledRequests, setCancelledRequests] = useState('');
    const [homeNotifications, setHomeNotifications] = useState([]);
    const [emergencyNotifications, setEmergencyNotifications] = useState([]);

    const [editButton, setEditButton] = useState(false);

    // const host = "http://localhost:8000"
    const host = "https://hmsbackend-7pyp.onrender.com"

    const socket = io(host, {
        transports: ["websocket"],  // Ensure WebSocket transport is used
        reconnectionAttempts: 5,    // Optional: retry connection attempts
        reconnectionDelay: 1000,    // Optional: retry delay (in ms)
    });



    const getAllRequest = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${host}/api/getrequest`, {
                ndid: localStorage.getItem('ndid'),
                hid: localStorage.getItem('hid'),
            })

            // if (response.status === 404) {
            //     setLoading(false)
            //     return;
            // }

            if (!response?.data) {
                console.log("data not found")
            } else {
                setTotalRequests(response.data?.data.length);
                setRequestsData(response.data?.data)
                howManyPendingRequest(response.data?.data)
                howManyInProgressRequest(response.data?.data)
                howManyCompletedRequest(response.data?.data)
                howManyCancelledRequest(response.data?.data)
            }
        } catch (error) {
            return {}
        }
        finally {
            setLoading(false)
        }
    }
    const getEmergencyRequest = async () => {
        try {
            const response = await axios.post(`${host}/api/getallemergencyrequest`, {
                ndid: localStorage.getItem('ndid'),
                hid: localStorage.getItem('hid'),
            });

            setEmergencyRequestData(response.data.data)

        } catch (error) {
            setLoading(false)
            return {}
        }
    }

    const howManyPendingRequest = (data) => {
        const pendingRequests = data?.filter(request => request.status === 'Pending').length;
        setPendingRequests(pendingRequests)
    }

    const howManyInProgressRequest = (data) => {
        const inProgressRequests = data?.filter(request => request.status === 'In Progress').length;
        setInProgressRequests(inProgressRequests)
    }

    const howManyCompletedRequest = (data) => {
        const completedRequests = data?.filter(request => request.status === 'Completed').length;
        setCompletedRequests(completedRequests)
    }
    const howManyCancelledRequest = (data) => {
        const cancelledRequests = data?.filter(request => request.status === 'Cancelled').length;
        setCancelledRequests(cancelledRequests)
    }



    useEffect(() => {
        // localStorage.setItem('ndid', "f80fb327-020b-4fc7-a085-f2ae10edabe9");
        // localStorage.setItem('hid', "11960126");

        socket.on("newRequest", (newRequest) => {

            setRequestsData((prevRequests) => [...prevRequests, newRequest]);
            setTotalRequests((totalRequests) => totalRequests + 1);
            setPendingRequests((pendingRequests) => pendingRequests + 1);
            setEditButton(true);
            setHomeNotifications((prevNotifications) => [
                ...prevNotifications,
                { message: `New request from ${newRequest.guestName}` },
            ]);

        });

        socket.on("newEmergencyRequest", (newEmergencyRequest) => {
            setEmergencyRequestData((emergencyRequestData) => [...emergencyRequestData, newEmergencyRequest]);
            setEditButton(true);
            setEmergencyNotifications((prevNotifications) => [
                ...prevNotifications,
                { message: `New request from ${newEmergencyRequest.guestName}` },
            ]);
        })

        getAllRequest()
        getEmergencyRequest();

        return () => {
            socket.off("newRequest");
            socket.off("newEmergencyRequest");
        }

    }, []);


    return (
        <DataContext.Provider
            value={{
                socket,
                host,
                auth, setAuth,
                editButton, setEditButton,
                totalRequests, setTotalRequests,
                emergencyRequestData, setEmergencyRequestData,
                requestData, setRequestsData,
                loading, setLoading,
                pendingRequests, setPendingRequests,
                inProgressRequests, setInProgressRequests,
                completedRequests, setCompletedRequests,
                cancelledRequests, setCancelledRequests,
                getAllRequest,
                howManyPendingRequest,
                howManyInProgressRequest,
                howManyCompletedRequest,
                homeNotifications, setHomeNotifications,
                emergencyNotifications, setEmergencyNotifications
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;
