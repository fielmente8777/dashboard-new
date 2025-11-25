import React, { useState } from 'react'
import { BASE_URL } from '../../data/constant';

const AddContactPopup = ({open,setOpen,getContacts}) => {

    const [data, setData] = useState({
        name: '',
        email: '',
        phone: '',
        added_from: ''
    })

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const response=await fetch(`${BASE_URL}/contact`, {
                method: 'POST',
                headers: {  
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            const result=await response.json();
            getContacts();
            console.log('Server Response:', result);
        } catch (error) {
            console.error('Error adding contact:', error);
        }
        finally{
            setOpen(false);
        }
    }
  return (
    <>
    {open&&<div className='absolute top-0 left-0 w-full h-screen bg-black/50'>
        
        <div className='flex justify-center items-center h-screen'>

            <form onSubmit={handleSubmit} className='bg-white p-4 w-[500px] flex justify-center items-center flex-col gap-5'>

                <h1 className='flex text-start justify-between gap-10'>
                    <span>Add New Contact</span>
                    <button onClick={()=>setOpen(false)} className='border w-7 font-bold bg-amber-200   '>X</button>
                    

                </h1>
                <input 
                    type='text'
                    placeholder='Enter name'
                    value={data.name}
                    className='w-full border-2 p-4 text-md outline-none'
                    onChange={(e) => setData({...data, name: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="Enter email" 
                    value={data.email} 
                     className='w-full border-2 p-4 text-md outline-none'
                    onChange={(e) =>  setData({...data, email: e.target.value})} 
                />
                <input 
                    type="text"
                    placeholder="Enter phone number"
                    value={data.phone}
                     className='w-full border-2 p-4 text-md outline-none'
                    onChange={(e) => setData({...data, phone: e.target.value})}
                />
                <input 
                type='text'
                placeholder='Contact Source'
                value={data.added_from}
                 className='w-full border-2 p-4 text-md outline-none'
                onChange={(e) => setData({...data, added_from: e.target.value})}
                />

                <button className='w-full p-4 text-md outline-none bg-amber-700 font-semibold' type="submit">Add Contact</button>

            </form>
        </div>
    </div>}
    </>

  )
}

export default AddContactPopup