
import { RiWhatsappFill } from "react-icons/ri";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa6";
const ChatTool = ({ active, setActive }) => {
    const option = [
        {
            icon: <RiWhatsappFill color="green" size={24} />,
            name: "Whatsapp",
            link: "/whatsapp"
        },
        {
            icon: <AiFillInstagram size={26} />,
            name: "Instagram",
            link: "/instagram"
        },
        {
            icon: <FaFacebook color="#1178f2" size={24} />,
            name: "Facebook",
            link: "/facebook"
        },
    ]
    return (
        <div className="flex flex-col gap-4 text-blue-600">

            {option?.map((item, index) => (
                <button onClick={() => setActive(item.name)} key={index} title={item.name} className={`duration-300 w-fit p-1 border border-2  rounded-md   ${item.name === "Instagram" ? "-ml-[1px] text-[#a339a7] hover:bg-[#a339a7] hover:text-white" : ""}`} >
                    {item.icon}
                </button>
            ))}

            <div></div>
        </div>
    );
};

export default ChatTool