import React, { useEffect, useState } from "react";
import {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTripadvisor,
    FaTwitter,
    FaYoutube,
} from "react-icons/fa";
import { GetwebsiteDetails } from '../../services/api';
import Swal from "sweetalert2";
const Profile = () => {

    const [websiteFooterData, setwebsiteFooterData] = useState(null);
    const [websiteLinksData, setwebsiteLinksData] = useState(null);
    const [websiteReviewsData, setwebsiteReviewsData] = useState(null);
    const [websiteImage, setwebsiteImage] = useState(null);
    // const [baseUrl, setBaseUrl] = useState("https://.example.com");
    const [EngineUrl, setEngineUrl] = useState("https://nexon.eazotel.com");
    const [WebsiteData, setWebsiteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [websitedata, setWebsitedata] = useState({});
    // const {
    //     websiteFooterData?,
    //     setwebsiteFooterData?,
    //     WebsiteData,
    //     baseUrl,
    //     EngineUrl,
    //     websiteLinksData?,
    //     setwebsiteLinksData?,
    //     websiteReviewsData?,
    //     setwebsiteReviewsData?,
    // } = useContext(AuthContext);
    function handleChangeSocialAccount(value, fieldName) {
        setwebsiteLinksData({
            ...websiteLinksData,
            [fieldName]: value,
        });
    }

    function handleChnageDataAccounts(value, fieldName) {
        setwebsiteFooterData({
            ...websiteFooterData,
            [fieldName]: value,
        });
    }
    function handleChnageInbuiltCodes(value, fieldName) {
        setwebsiteReviewsData({
            ...websiteReviewsData,
            [fieldName]: value,
        });
    }

    const UpdateSocialAccounts = () => {

        fetch(`${EngineUrl}/cms/edit/sociallinks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: localStorage.getItem("token"),
                Facebook: websiteLinksData?.Facebook,
                Instagram: websiteLinksData?.Instagram,
                Twitter: websiteLinksData?.Twitter,
                Youtube: websiteLinksData?.Youtube,
                Linkedin: websiteLinksData?.Linkedin,
                Tripadvisors: websiteLinksData?.Tripadvisors,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Profile has been updated",
                    confirmButtonText: "OK",
                }).then(() => {
                    UpdateDataAccounts();
                    UpdateInbuiltCodes();
                });

            })
            .catch((error) => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to update profile. Please try again.",
                    confirmButtonText: "OK",
                });
            });
    };

    const UpdateDataAccounts = () => {
        fetch(`${EngineUrl}/cms/edit/footer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: localStorage.getItem("token"),
                Address: websiteFooterData?.Address,
                Phone: websiteFooterData?.Phone,
                WhatsApp: websiteFooterData?.WhatsApp,
                NewsLetterText: websiteFooterData?.NewsLetterText,
                city: websiteFooterData?.City,
                email: websiteFooterData?.Email,
                Abouttext: websiteFooterData?.AboutText,
                logo: websiteFooterData?.Logo,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                const message = "Profile has been updated";
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const UpdateInbuiltCodes = () => {
        // Replace 'YOUR_BACKEND_API_URL' with the actual URL of your backend API
        fetch(`${EngineUrl}/cms/post/reviewsection`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Token: window.localStorage.getItem("token"),
                Clarity: websiteReviewsData?.Clarity,
                TagManager: websiteReviewsData?.TagManager,
                Console: websiteReviewsData?.Console,
                Pixel: websiteReviewsData?.Pixel,
                Analytics: websiteReviewsData?.Analytics,
                Pagespeed: websiteReviewsData?.Pagespeed,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Response from backend:", data);
                // Handle the backend response as needed
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const uploadImage = (e) => {
        e.preventDefault();
        const imageInput = document.getElementById("file");
        const file = imageInput.files[0];
        if (!file) {
            alert("Please select an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = function () {
            const base64String = reader.result.split(",")[1];

            UploadingImageS3(base64String);
        };
        reader.readAsDataURL(file);
    }

    const UploadingImageS3 = (base64String) => {
        // Replace 'YOUR_BACKEND_API_URL' with the actual URL of your backend API
        fetch(`${EngineUrl}/upload/file/image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: window.localStorage.getItem("token"),
                image: base64String,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Response from backend:", data);
                setwebsiteImage(data.Image);
                handleChnageDataAccounts(data.Image, "Logo");
                UpdateSocialAccounts();
                // Handle the backend response as needed
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const data = await GetwebsiteDetails(token); // Assuming this is an async function
            setWebsitedata(data);
            setwebsiteFooterData(data?.Footer)
            setwebsiteLinksData(data?.Links)
            setwebsiteReviewsData(data?.Reviews)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch website details. Please try again.',
                confirmButtonText: 'OK',
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            {websiteLinksData === "None" ||
                websiteReviewsData === "None" ||
                websiteFooterData === "None" ? (
                <div className="flex items-center justify-center w-[80vw] h-[70vh]">
                    {/* <HashLoader color="#E65502" /> */}
                    jhklm
                </div>
            ) : (
                <div className="bg-white p-4">
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-800">
                            Profile and Links
                        </h4>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 w-full">
                        {/* Right Section */}
                        <div className="md:w-7/12 flex flex-col gap-5">
                            <div className="border border-gray-300 rounded-lg flex justify-between p-4 items-center">
                                <div className="flex flex-col items-center">
                                    <img
                                        src={websiteFooterData?.Logo}
                                        alt=""
                                        className="w-24 h-24 rounded-full object-cover border"
                                    />
                                    <span className="text-gray-700 mt-3">Logo</span>

                                </div>
                                <div className="flex flex-col items-center">

                                    <input type="file" id="file" onChange={uploadImage} />
                                    <button onClick={() => { UpdateSocialAccounts() }} className="mt-3 px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition">
                                        Apply
                                    </button>
                                </div>

                            </div>

                            <div className="border border-gray-300 rounded-lg p-6 bg-white space-y-4">
                                {[
                                    { label: "Address", key: "Address" },
                                    { label: "Phone", key: "Phone" },
                                    { label: "Whatsapp-Phone", key: "WhatsApp" },
                                    { label: "Email", key: "Email" },
                                    { label: "City", key: "City" },
                                    { label: "About Text", key: "AboutText" },
                                    { label: "NewsLetter Text", key: "NewsLetterText" },
                                ].map(({ label, key }) => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            {label}:
                                        </label>
                                        <input
                                            type="text"
                                            value={websiteFooterData?.[key]}
                                            onChange={(e) => handleChnageDataAccounts(e.target.value, key)}
                                            placeholder={`Enter ${label}`}
                                            className="w-full px-3 py-2 border rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Left Section */}
                        <div className="md:w-5/12 flex flex-col gap-5">
                            {/* Profile Image and Button */}

                            {/* Social Links */}
                            <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-4">
                                {[
                                    { icon: <FaFacebook />, label: "Facebook", key: "Facebook" },
                                    { icon: <FaInstagram />, label: "Instagram", key: "Instagram" },
                                    { icon: <FaLinkedin />, label: "Linkedin", key: "Linkedin" },
                                    { icon: <FaYoutube />, label: "Youtube", key: "Youtube" },
                                    { icon: <FaTwitter />, label: "Twitter", key: "Twitter" },
                                    { icon: <FaTripadvisor />, label: "Tripadvisors", key: "Tripadvisors" },
                                ].map(({ icon, label, key }) => (
                                    <div key={key} className="space-y-1">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            {icon} {label}
                                        </label>
                                        <input
                                            type="text"
                                            value={websiteLinksData?.[key]}
                                            onChange={(e) => handleChangeSocialAccount(e.target.value, key)}
                                            placeholder={`https://www.${label.toLowerCase()}.com/`}
                                            className="w-full px-3 py-2 border rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Tracking Codes */}
                            <div className="border border-gray-300 rounded-lg p-4 bg-white space-y-4">
                                {[
                                    { icon: <FaFacebook />, label: "Google Tag Manager", key: "TagManager" },
                                    { icon: <FaInstagram />, label: "Facebook Pixel", key: "Pixel" },
                                    { icon: <FaLinkedin />, label: "Google Console", key: "Console" },
                                    { icon: <FaYoutube />, label: "Google Analytics", key: "Analytics" },
                                    { icon: <FaTwitter />, label: "Page-Insight", key: "Pagespeed" },
                                ].map(({ icon, label, key }) => (
                                    <div key={key} className="space-y-1">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            {icon} {label}
                                        </label>
                                        <input
                                            type="text"
                                            value={websiteReviewsData?.[key]}
                                            onChange={(e) => handleChnageInbuiltCodes(e.target.value, key)}
                                            placeholder={`Enter ${label}`}
                                            className="w-full px-3 py-2 border rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            )}
        </>
    );

};

export default Profile;
