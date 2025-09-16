import React, { useEffect, useState } from "react";
import { JsonEditor } from "json-edit-react";
import axios from "axios";
const KnowledgeBase = () => {
  const [jsondata,setJsonData]=useState()
  // const jsonData = {
  //   description:
  //     "Explore Naturoville, Rishikesh's premier Ayurvedic & Retreat. Rejuvenate your mind and body at the best wellness center in Rishikesh.",
  //   headings: {
  //     h1: ["Welcome to Our Wellness Center"],
  //     h2: [
  //       "Our Unique Approach to Holistic Healing & Wellness",
  //       "Explore Our Signature Therapies & Treatments",
  //       "Facilities & Activities",
  //       "Explore Our Wellness Programs",
  //       "Accommodation",
  //       "Path to better stays!",
  //     ],
  //     h3: [
  //       "Ayurveda & Naturopathy Focus",
  //       "Integrated Healing Infrastructure",
  //       "Spiritual Natural Environment",
  //       "Sustainable Wellness",
  //       "Ayurveda & Naturopathy Focus",
  //       "Integrated Healing Infrastructure",
  //       "Spiritual Natural Environment",
  //       "Sustainable Wellness",
  //       "Kizhi & Patra Potli",
  //       "Kizhi & Patra Potli",
  //       "Abhyanga",
  //       "Abhyanga",
  //       "Akshi Tarpan",
  //       "Akshi Tarpan",
  //       "Pizhichil (Oil Bath)",
  //       "Pizhichil (Oil Bath)",
  //       "Shirodhara",
  //       "Shirodhara",
  //       "Kizhi & Patra Potli",
  //       "Kizhi & Patra Potli",
  //       "Abhyanga",
  //       "Abhyanga",
  //       "Akshi Tarpan",
  //       "Akshi Tarpan",
  //       "Pizhichil (Oil Bath)",
  //       "Pizhichil (Oil Bath)",
  //       "Shirodhara",
  //       "Shirodhara",
  //       "Kizhi & Patra Potli",
  //       "Kizhi & Patra Potli",
  //       "Abhyanga",
  //       "Abhyanga",
  //       "Akshi Tarpan",
  //       "Akshi Tarpan",
  //       "Pizhichil (Oil Bath)",
  //       "Pizhichil (Oil Bath)",
  //       "Shirodhara",
  //       "Shirodhara",
  //       "Kizhi & Patra Potli",
  //       "Kizhi & Patra Potli",
  //       "Abhyanga",
  //       "Abhyanga",
  //       "Akshi Tarpan",
  //       "Akshi Tarpan",
  //       "Pizhichil (Oil Bath)",
  //       "Pizhichil (Oil Bath)",
  //       "Shirodhara",
  //       "Shirodhara",
  //       "Detox & Panchakarma Therapy",
  //       "Weight Management Program",
  //       "Diabetes Management",
  //       "Arthritis & Pain Relief",
  //       "Depression & Stress Management",
  //       "Anti-Ageing & Skin Rejuvenation",
  //       "Shakti â Womenâs Wellness",
  //       "Geriatric Wellness (Senior Citizen Focused)",
  //       "Natural Immunization Boosting",
  //       "Spine, Neck & Joint Care",
  //       "Garden View Room with Balcony",
  //       "Premium Nature View Room",
  //       "Executive Garden View Suite",
  //       "Garden View Room with Balcony",
  //       "Premium Nature View Room",
  //       "Executive Garden View Suite",
  //       "Appreciation From Our Guests!",
  //       "Diwan Chand",
  //       "Jasleen Anand",
  //       "Krishna Murthy",
  //       "Pragya Mittal",
  //       "Sonam Wangmo",
  //       "Contact Us",
  //     ],
  //   },
  //   links: [
  //     "",
  //     "https://www.facebook.com/Naturovillewellnessrishikesh/",
  //     "tel: ‪+91 95208 90993‬ ",
  //     "mailto:marketing@naturovillespa.com",
  //     "mailto:sales@naturovillespa.com",
  //     "tel:‪+91 91493 61935‬",
  //     "https://www.eazotel.com/",
  //     "tel:+91 95208 90993",
  //     "https://wa.me/+919520890995?text=Hello",
  //     "https://www.instagram.com/naturovillewellness/#",
  //   ],
  //   title:
  //     "Best Ayurveda Wellness & Panchkarma Center in Rishikesh | Naturoville",
  //   url: "https://www.naturovillewellnessresort.com/",
  // };

  const fetchData = async () => {
    const { data } = await axios.post(
      "http://127.0.0.1:5000/leadeazbot/create-knowledge-base",
      {
        urls: ["https://www.naturovillewellnessresort.com/"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("APi response",data);
    setJsonData(data?.Data[0])

  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-2">
      Knowledge Base

      {/* <h1>Enter Url to get data</h1>
      <div>
        <input type="url" value={url} className="py-2 px-4 rounded-md outline-none"/>
      </div> */}
      {jsondata&&<JsonEditor data={jsondata} />}
    </div>
  );
};

export default KnowledgeBase;
