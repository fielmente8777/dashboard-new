
const CommanHeader = ({ serviceName, buttonName }) => {
    return (
        <div className='bg-white'>
            <div className="flex justify-between items-center">

                <p className="text-gray-600 font-semibold">{serviceName}</p>
                <button className="bg-green-600 text-white py-2 px-3 rounded-lg hover:scale-95 font-semibold">Mark as interested</button>
            </div>

        </div>
    )
}

export default CommanHeader