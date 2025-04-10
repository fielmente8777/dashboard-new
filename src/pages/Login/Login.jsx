import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/slice/LoginSlice';
import Swal from 'sweetalert2';
const Login = () => {


    const [formData, setFormData] = useState({
        // email: 'reservation@minimalisthotes.com',
        email: 'oakclimbingresort@gmail.com',
        // email: '',
        // email: '',
        password: 'Eazotel@123',
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

        if (response.data.Status == true) {
            const token = response?.data?.Token;
            localStorage.setItem("token", token || "");

            let timerInterval;
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
            alert(response.payload?.error || "Login failed. Please check your credentials.");
        }
    };

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
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-black text-base">
                            Password*
                        </label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            id="password"
                            name="password"
                            value={formData?.password}
                            required
                            onChange={handleChange}
                            className="border-b focus:outline-none outline-none border-[#0a3a75] py-2"
                        />

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



