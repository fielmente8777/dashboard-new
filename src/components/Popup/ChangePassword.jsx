import axios from 'axios';
import React from 'react'
import Swal from 'sweetalert2';
import { BASE_URL } from '../../data/constant';

const ChangePassword = ({ isOpen, onClose }) => {

    const [oldPassword, setOldPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/eazotel/edit/password`, {
                token: localStorage.getItem('token'),
                oldAccessId: oldPassword,
                newAccessId: newPassword,
            });

            if (response.data.Status !== true) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password changed successfully!',
                    confirmButtonText: 'OK',
                }).then(() => {
                    onClose(); // Close the popup after submission
                })
                setConfirmPassword("");
                setNewPassword("");
                setOldPassword("");
            }



            // onClose(); // Close the popup after submission
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            });
        }
    }
    return (
        <div
            // onClick={onClose}
            className={`fixed cursor-pointer z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
        // className={`fixed cursor-pointer inset-0  bg-black bg-opacity-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
            <div className="bg-white rounded-lg overflow-hidden w-96 ">
                <div className="flex relative flex-col justify-between items-center mb-4">
                    <button
                        onClick={onClose}
                        className="text-[#575757]/70 absolute right-2 top-2 text-2xl hover:text-[#575757]">
                        &times;
                    </button>
                    <div className='h-60 '>
                        <img src='/3099593.jpg' alt='illustration' className='w-full h-full' />
                    </div>
                    <h1 className='text-3xl font-semibold'>Reset Password</h1>
                    <div>
                        <p className='text-sm text-[#575757]/70'>Please kindly set your new password</p>
                    </div>

                </div>

                <div className='p-4'>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="currentPassword" className='font-medium text-[#575757]/90'>Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                                placeholder='Current password'
                                className='border border-gray-300 rounded-full px-4 py-2 outline-none'
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="newPassword" className='font-medium text-[#575757]/90'>New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder='New password'
                                className='border border-gray-300 rounded-full px-4 py-2 outline-none'
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="confirmPassword" className='font-medium text-[#575757]/90 '>Re-enter Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder='Confirm your new password'
                                className='border border-gray-300 rounded-full px-4 py-2 outline-none'
                            />
                        </div>
                        <button
                            type='submit'
                            className='bg-primary/90 text-white py-2 rounded-full hover:bg-primary transition-colors'>
                            Send Email
                        </button>
                    </form>
                </div>
            </div>

        </div>
    )
}

export default ChangePassword