import React from 'react'

const Feedback = () => {
    const handleNotifyClick = () => {
        alert('Thanks for registering with us')
    }
    return (
        <div className="flex flex-col justify-center items-center h-[80vh] bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-4xl font-bold mb-4 text-center animate-pulse">
                We're Launching Soon!
            </h1>
            <p className="text-lg mb-6 text-center max-w-md">
                Stay tuned for an exciting new experience! We're working hard to bring
                you something amazing. Thank you for your patience and support.
            </p>
            <button onClick={handleNotifyClick} className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-md shadow-lg hover:bg-gray-100 transition duration-300">
                Notify Me
            </button>
        </div>
    )
}

export default Feedback