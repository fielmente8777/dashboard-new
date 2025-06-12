import React, { useEffect, useState } from 'react'
import CommanHeader from '../../components/Navbar/CommanHeader';
const Linktree = () => {

    const chatFlow = {
        "Start": {
            message: "Welcome! How can I assist you today?",
            buttons: ["Book Now", "About Us", "Explore Location"]
        },

        "Book Now": {
            message: "Great! Here are our available rooms:",
            apiCall: "/api/getAvailableRooms",  // optional if you fetch dynamically
            dynamicButtonsFrom: "rooms",        // instructs to create buttons from room list
            nextFlowKey: "Explore Location"
        },

        "Room Selected": {
            message: "You've selected a room. What would you like to do next?",
            buttons: ["Confirm Booking", "Go Back"]
        },

        "Confirm Booking": {
            message: "Booking confirmed! 🎉 We’ve sent your confirmation via email.",
            buttons: ["Back to Start"]
        },

        "About Us": {
            message: "We are a premium hotel offering cozy stays and exceptional service.",
            buttons: ["Book Now", "Explore Location", "Back to Start"]
        },

        "Explore Location": {
            message: "We are located in the heart of the city. Here’s more info.",
            location: ["manali", "delhi", "dehradun"],
            buttons: ["About Us", "Book Now", "Back to Start"]
        },

        "Check-In": {
            nextFlowKey: "Check-Out"
        },
        "Check-Out": {
            nextFlowKey: "Adults"
        },
        "Adults": {
            nextFlowKey: "Children"
        },
        "Children": {
            message: "We are fetching details for you",
            api: "/fetch-rooms-details",
            nextFlowKey: "Show Available Room"
        },
        "Show Available Room": {
            message: "Rooms fetched successfully",
            selected: [{ 1: 1 }, { 2: 1 }, { 3: 4 }, { 4: 2 }],
            nextFlowKey: "Room Selected"
        },

        "Back to Start": {
            redirect: "Start"
        },

        "Go Back": {
            redirect: "Book Now"
        }
    };
    const [currentStage, setCurrentStage] = useState(chatFlow["Start"])

    console.log(currentStage)
    return (
        <div className="p-4 bg-white mb-10 cardShadow">
            <CommanHeader serviceName="Linktree Setup" />
            <hr className="mt-3" />
            <p className="text-gray-600 mb-4 mt-2">
                Get a custom Linktree page to organize all your important links (website, OTA, WhatsApp, social media, etc.) in one sleek, mobile-friendly view.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Custom layout and design</li>
                <li>Link tracking integration</li>
                <li>Embedded WhatsApp & call buttons</li>
            </ul>



            {/* <p>{currentStage.message}</p>
            <div>
                {currentStage.buttons && currentStage?.buttons.map((item, index) => (
                    <button className='px-2 bg-gray-400' onClick={(e) => setCurrentStage(chatFlow[item])} key={index}>{item}</button>
                ))}
            </div>

            {currentStage.location && currentStage?.location.map((item, index) => (
                <button className='px-2 bg-gray-400' onClick={(e) => setCurrentStage(chatFlow[item])} key={index}>{item}</button>
            ))} */}

        </div>
    )
}

export default Linktree