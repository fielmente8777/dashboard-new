import React, { useContext, useEffect } from 'react'
import Request from '../DynamicPage/Request';
import { useLocation, useNavigate } from 'react-router-dom';
import useSound from 'use-sound';
import notificationSound from "../../assets/mixkit-guitar-notification-alert-2320.mp3"
import DataContext from '../../context/DataContext';
import DataCard from '../../components/Card/DataCard';

const GrmMain = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { totalRequests, pendingRequests,
        inProgressRequests,
        completedRequests, setHomeNotifications, editButton, setEditButton } = useContext(DataContext);



    useEffect(() => {
        // if (localStorage.getItem('authPassword') && localStorage.getItem('authUsername')) {
        //     navigate('/')
        // }

        if (location.pathname === "/") {
            setHomeNotifications([]);
        }
    }, [])

    const [play] = useSound(notificationSound);





    useEffect(() => {
        if (editButton) {
            play();
            setEditButton(false);
        }
    }, [editButton]);


    return (
        <div className='flex flex-col gap-5'>
            <button onClick={play} className='hidden'>Boop!</button>
            <div className='grid grid-cols-2 gap-4 '>
                <DataCard count={totalRequests ? totalRequests : "0"} heading={"Total Requests"} />
                <DataCard count={pendingRequests ? pendingRequests : "0"} heading={"Pending"} />
                <DataCard count={inProgressRequests ? inProgressRequests : "0"} heading={"In Progress"} />
                <DataCard count={completedRequests ? completedRequests : "0"} heading={"Completed"} />
            </div>
            <Request />
        </div>
    )
}

export default GrmMain