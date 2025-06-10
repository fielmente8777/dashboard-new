import React, { useEffect, useState } from "react";
import { GetwebsiteDetails } from "../../services/api";
import { MdDeleteOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import handleLocalStorage from "../../utils/handleLocalStorage";

const Analytics = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [websitedata, setWebsitedata] = useState({});
  const [websitefaqdata, setWebsitefaqdata] = useState([]);
  const [filtered, setfiltered] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Events");
  const [loading, setLoading] = useState(false);

  const { currentLoactionWebsiteData } = useSelector(
    (state) => state?.hotelsWebsiteData
  );

  console.log(currentLoactionWebsiteData);

  useEffect(() => {
    if (currentLoactionWebsiteData?.Gallery) {
      const filteredImages = currentLoactionWebsiteData?.Gallery.filter(
        (item) => item.Category === selectedCategory
      );
      setfiltered(filteredImages);
    }
  }, [selectedCategory, currentLoactionWebsiteData]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleDeleteImage = (category, url, operation) => {
    fetch(`https://nexon.eazotel.com/cms/edit/Gallery/Images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        operation: operation,
        category: category,
        imageurl: url,
        hid: String(handleLocalStorage("hid")),
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const uploadImage = (e) => {
    e.preventDefault();
    const imageInput = document.getElementById("file");
    const file = imageInput.files[0];
    if (!file) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = function () {
      const base64String = reader.result.split(",")[1];

      UploadingImageS3(base64String);
    };
    reader.readAsDataURL(file);
  };

  const UploadingImageS3 = (base64String) => {
    // Replace 'YOUR_BACKEND_API_URL' with the actual URL of your backend API
    fetch(`https://nexon.eazotel.com/upload/file/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
        image: base64String,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from backend:", data);
        handleDeleteImage(selectedCategory, data.Image, "append");
        // Handle the backend response as needed
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="bg-white p-4">
      <div className="">
        <h2 className="text-sm font-semibold text-[#575757]">Gallery</h2>
      </div>

      <div>
        <div className="flex gap-4 ">
          {currentLoactionWebsiteData &&
            currentLoactionWebsiteData?.Gallery?.map((item, index) => (
              <button
                onClick={() => setSelectedCategory(item.Category)}
                key={index}
                className={`text-[14px] ${
                  selectedCategory === item.Category
                    ? "border-b-2 border-[#575757]"
                    : "border-b-2 border-transparent"
                } px-4 py-3 bg-white font-medium text-[#575757]`}
              >
                {item.Category}
              </button>
            ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5">
            {[1, 2, 3, 4].map((item, index) => (
              <div
                key={index}
                className="h-[200px] animate-pulse bg-gray-100 rounded"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5">
            {filtered.map((item, idx) =>
              item.Images.map((img, i) => (
                <div key={i} className="relative h-[200px]">
                  <img
                    src={img}
                    alt={item.Category}
                    className="w-full h-auto rounded object-cover"
                  />

                  <MdDeleteOutline
                    size={28}
                    onClick={() =>
                      handleDeleteImage(item.Category, img, "remove")
                    }
                    className="absolute top-1 right-1 cursor-pointer bg-white p-1 text-red-600 rounded-full text-md"
                  />
                </div>
              ))
            )}
          </div>
        )}
        <input type="file" id="file" onChange={uploadImage} />
      </div>
    </div>
  );
};

export default Analytics;
