import React, { useEffect, useState } from "react";
import { FaCloud } from "react-icons/fa";
import { IoSunnySharp, IoPartlySunny, IoCloudOffline } from "react-icons/io5";

const WeatherCard = ({ icon, temp, time, text }) => {
    const [currHour, setCurrHour] = useState(false);

    const handleCurrTime = () => {
        const currtime = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const getHour = (time) => {
            const [hour, minuteAndPeriod] = time.split(":");
            const period = minuteAndPeriod.slice(-2); // AM/PM
            let parsedHour = parseInt(hour, 10);

            if (period === "PM" && parsedHour !== 12) {
                parsedHour += 12;
            }
            if (period === "AM" && parsedHour === 12) {
                parsedHour = 0;
            }
            return parsedHour;
        };

        const currHourValue = getHour(currtime);
        const timeHourValue = getHour(time);

        setCurrHour(currHourValue === timeHourValue);
    };

    useEffect(() => {
        handleCurrTime();
    }, [time]);


    return (
        <div
            className={`flex flex-col gap-1 justify-center px-2 `}>

            <span className={`flex justify-center !text-white  `} >
                {text === "Cloudy " ? (
                    <FaCloud size={20} />
                ) : text === "Sunny" ? (
                    <IoSunnySharp size={20} />
                ) : text === "Partly Cloudy " ? (
                    <IoPartlySunny size={20} />
                ) : (
                    <IoCloudOffline size={20} />
                )}
            </span>
            <span className={`text-center whitespace-nowrap text-sm !text-white `}>
                {time}
            </span>
            <span className={`text-center text-lg font-semibold !text-white  `}>{temp}°</span>

        </div >
    );
};

export default WeatherCard;
