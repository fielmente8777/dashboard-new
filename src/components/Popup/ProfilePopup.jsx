import { MdClose } from 'react-icons/md';
import { removeCookie } from '../../utils/handleCookies';
import { useContext } from 'react';
import DataContext from '../../context/DataContext';
import { setHid } from '../../redux/slice/UserSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const ProfilePopup = ({ isProfileOpen, setIsProfileOpen }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user: hotel, authUser } = useSelector((state) => state.userProfile);
    const { setAuth } = useContext(DataContext);

    const handleLogout = () => {
        localStorage.clear();
        removeCookie("token");
        setAuth(false);
        dispatch(setHid(null));
        // setTimeout(() => {
        navigate("/login");
        // }, 1000)
    };
    return (
        <>
            {isProfileOpen && (
                <div
                    onClick={(e) => {
                        if (e.currentTarget) {
                            setIsProfileOpen(false);
                        }
                    }}
                    className="fixed top-0 left-0 z-[999999999999999999999999]  bg-black/50 w-full h-[100dvh] flex justify-end "
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#575757] bg-white w-[90%] sm:w-[70%] md:w-[50%] lg:w-[25%] absolute h-[100vh] z-[999999999999999999999999999999999]"
                    >
                        <div className=" p-4 space-y-4">
                            {/* Header Section */}
                            <div className="flex justify-between items-center space-x-4">
                                <div className='flex items-center gap-4'>
                                    <div className="w-14 h-14 bg-gray-200 rounded-full" />
                                    <div>
                                        <div className="font-semibold text-lg capitalize">{authUser?.userName}</div>
                                        <div className="text-sm text-gray-500 capitalize">Role: {authUser?.role}</div>
                                        <div className="text-sm text-gray-600">{authUser?.emailId}</div>
                                    </div>
                                </div>

                                <button onClick={() => setIsProfileOpen(false)} className="ml-auto text-white bg-gray-400 p-1 rounded-full hover:text-black"><MdClose size={24} /></button>
                            </div>

                            {/* My Account and Sign Out */}
                            <div className="flex justify-between">
                                <button className="bg-blue-100 text-blue-600 px-4 py-1 rounded">My Account</button>
                                <button onClick={handleLogout} className="text-red-500">Sign Out</button>
                            </div>

                            {/* Manage Account */}
                            <div className="bg-gray-100 p-4 rounded">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium text-gray-700">Organization</h3>

                                </div>
                                <div className="flex items-center space-x-3">
                                    {/* <img src="https://eazotel.com/logo.png" alt="" className="w-20" /> */}
                                    <span className="text-gray-700 text-sm font-semibold">{hotel?.Profile?.hotelName}</span>
                                </div>
                            </div>

                            {/* People Options */}
                            {/* <div className="bg-gray-100 p-4 rounded space-y-2">
                                <div className="font-medium text-gray-700">People Options</div>
                                <div className="flex justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-pink-500 text-xl">❓</span>
                                        <span className="text-gray-700 text-sm">Help</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-400 text-xl">🎁</span>
                                        <span className="text-gray-700 text-sm">What's New</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-600 text-xl">👥</span>
                                    <span className="text-gray-700 text-sm">Join the HR Community</span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ProfilePopup