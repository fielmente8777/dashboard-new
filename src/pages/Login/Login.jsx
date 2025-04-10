import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { loginUser } from '../../redux/slice/LoginSlice';
const Login = () => {


    const [formData, setFormData] = useState({
        // email: 'reservation@minimalisthotes.com',
        // email: 'oakclimbingresort@gmail.com',
        email: '',
        // email: '',
        password: ''
    });

    const dispatch = useDispatch()

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Dispatch login action
        const response = await dispatch(loginUser(formData));
        console.log(response);
        let timerInterval;
        if (response.data.Status) {
            const token = response?.data?.Token;
            localStorage.setItem("token", token || "");

        
            Swal.fire({
                title: "Logged in Successfully",
                html: "We will redirect you to the dashboard <b></b>",
                timer: 1000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    const timer = Swal.getPopup().querySelector("b");
                    timerInterval = setInterval(() => {
                        timer.textContent = `${Swal.getTimerLeft()}`;
                    }, 1000);
                },
                willClose: () => {
                    clearInterval(timerInterval);
                }
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                    window.location.href = "/";
                }
            });
        } else {
            Swal.fire({
                title: "Logged Failed",
                html: "Navigating you to Login <b></b>",
                timer: 700,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    const timer = Swal.getPopup().querySelector("b");
                    timerInterval = setInterval(() => {
                        timer.textContent = `${Swal.getTimerLeft()}`;
                    }, 1000);
                },
                willClose: () => {
                    clearInterval(timerInterval);
                }
            }).then((result) => {
                
            });
        }
    };
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword(prev => !prev);

    return (
        <div className='bg-[#f5f5f5] w-full h-screen flex justify-center items-center'>
            <form className=' bg-white w-[20rem] p-5 rounded-md shadow' onSubmit={handleSubmit}>
                <div className="flex flex-col flex-1 gap-5 w-full h-full">
                    <h1 className='text-2xl font-semibold text-center'>Welcome to Eazotel</h1>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-black text-base">
                            Email*
                        </label>
                        <input
                            type="text"
                            placeholder="Enter email"
                            id="email"
                            name="email"
                            value={formData?.email}
                            onChange={handleChange}
                            className="border-b focus:outline-none outline-none border-[#0a3a75] py-2"
                        />

                    </div>
                    {/* {error && <p className="error-message text-[#0a3a75]">{error}</p>} */}
                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor="password" className="text-black text-base">
                            Password*
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            id="password"
                            name="password"
                            value={formData?.password}
                            required
                            onChange={handleChange}
                            className="border-b focus:outline-none outline-none border-[#0a3a75] py-2 pr-10"
                        />

                        {/* Eye Icon */}
                        <span
                            onClick={togglePassword}
                            className="absolute right-2 top-[45px] cursor-pointer text-gray-600"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <input type="checkbox" id="Remember-me" className="w-3 h-3" />
                        <label htmlFor="Remember-me">Remember me</label>
                    </div>
                    <button
                        type="submit"
                        className="bg-[#0a3a75] text-base font-medium text-white py-1 px-4 mb-5 tracking-wider rounded-full"
                    >
                        Login
                    </button>
                </div>

            </form>
        </div>
    )
}

export default Login



