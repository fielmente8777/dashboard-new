import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

function Whatsapp({ whatsAppNumber }) {
  const { pathname } = useLocation();
  return (
    <div
      className={`fixed bottom-4 ${
        pathname !== "/login" ? "right-4" : "lg:left-6 left-4"
      }  z-20 cursor-pointer `}
    >
      <Link
        to={`https://wa.me/${whatsAppNumber}?text=Hi%20there!%20%F0%9F%91%8B%0AWelcome%20to%20Eazotel%20%F0%9F%8C%90%0AHow%20can%20I%20assist%20you%20today%3F`}
        target="_blank"
        rel="noreferrer"
        className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 transition-all hover:shadow-2xl"
      >
        <FaWhatsapp size={29} color="white" />
        <span className="sr-only">WhatsApp</span>
      </Link>
    </div>
  );
}

export default Whatsapp;
