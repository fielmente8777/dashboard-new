import CommanHeader from '../../components/Navbar/CommanHeader'

const GoogleMapItiration = () => {
    return (
        <div className="p-4 bg-white mb-10 cardShadow">
            <CommanHeader serviceName="Google Map Iteration" />
            <hr className="mt-3" />
            <p className="text-gray-600 mb-4 mt-2">
                We help correct, optimize, or update your location pin and appearance on Google Maps for better discoverability and accurate directions.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Location accuracy checks</li>
                <li>Map tagging & keyword optimization</li>
                <li>Issue resolution (duplicate listing, wrong location, etc.)</li>
            </ul>
        </div>
    )
}

export default GoogleMapItiration