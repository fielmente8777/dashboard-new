import { Link } from "react-router-dom";
import { GL, LS, OTA, PM, WD } from "../../icons/icon";

const Services = () => {


    const services = [
        { lable: 'Ota listing & optimization', color: '#01C99B', icon: <OTA />, link: "ota-listing" },
        { lable: 'Performance marketing', color: '#FEC107', icon: <PM />, link: "performance-marketing" },
        { lable: 'Google listing', color: '#F94A3D', icon: <GL />, link: "google-listing" },
        { lable: 'Linktree setup', color: '#3A86FF', icon: <LS />, link: "linktree-setup" },
        { lable: 'Website development', color: '#5C60F5', icon: <WD />, link: "custom-website" },
    ];

    return (
        <div className="lg:col-span-1 bg-white p-4 rounded-xl cardShadow w-full h-full">
            <h3 className="text-md font-semibold text-gray-600">Highlighted Services</h3>
            <ul className="flex mt-4 flex-col gap-5 text-gray-600">
                {services.map((s, i) => (
                    <li key={i} className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-full" style={{ backgroundColor: s.color }}>
                            {/* {s.icon} */}
                        </span>
                        <Link to={s?.link}>{s.lable}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Services