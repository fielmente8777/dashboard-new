import { RiWhatsappFill } from "react-icons/ri";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa6";

const ChatTool = ({ active, setActive }) => {
  const option = [
    {
      icon: <RiWhatsappFill color="green" size={24} />,
      name: "Whatsapp",
      link: "/whatsapp",
    },
    {
      icon: <AiFillInstagram size={26} />,
      name: "Instagram",
      link: "/instagram",
    },
    {
      icon: <FaFacebook color="#1178f2" size={24} />,
      name: "Facebook",
      link: "/facebook",
    },
  ];

  return (
    <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible hide-scrollbar">
      {option?.map((item, index) => {
        const isActive = active === item.name;

        return (
          <button
            onClick={() => setActive(item.name)}
            key={index}
            title={item.name}
            aria-label={item.name}
            aria-pressed={isActive}
            className={`shrink-0 flex items-center justify-center w-fit p-2 border-2 rounded-lg transition-colors duration-300 ${
              isActive
                ? "border-primary bg-primary/10"
                : "border-app-border bg-app-surface hover:bg-app-surface-secondary"
            } ${
              item.name === "Instagram"
                ? "text-[#a339a7] hover:bg-[#a339a7] hover:text-white"
                : ""
            }`}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
};

export default ChatTool;