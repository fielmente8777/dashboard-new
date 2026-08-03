import React, { useContext, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import DataContext from "../../context/DataContext";
import { BASE_URL } from "../../data/constant";
import { MdDeleteOutline } from "react-icons/md";
import Swal from "sweetalert2";
function PricePackage() {
  const [Image, setImage] = useState([]);
  const [package_name, setpackage_name] = useState();
  const [package_description, setpackage_description] = useState();
  const [plan_price, setplan_price] = useState();
  const [plan_image, setplan_image] = useState([]);
  const [plan_start, setplan_start] = useState();
  const [plan_end, setplan_end] = useState();
  const [isPerRoom, setisPerRoom] = useState(false);
  const [Mealpackages, setMealpackages] = useState([]);
  const [currentPackage, setCurrentPackage] = useState([]);
  const [expiredPackage, setExpiredPackage] = useState([]);
  const [activeTab, setActiveTab] = useState("All Packages");

  function uploadImage(e) {
    e.preventDefault();
    if (Image.length >= 5) {
      alert("You can only upload a maximum of 5 images.");
      return;
    }
    else {
      const imageInput = document.getElementById("packageimg");
      const files = imageInput.files;

      if (files.length === 0) {
        alert("Please select at least one image file.");
        return;
      }
      if (files.length > 5) {
        alert("Can only upload a maximum of 5 images");
        return;
      }


      for (let i = 0; i < files.length && files.length <= 5; i++) {
        const file = files[i];

        const reader = new FileReader();
        reader.onloadend = function () {
          const base64String = reader.result.split(",")[1];
          setImage((prevImages) => [...prevImages, base64String]);
          // UploadingImageS3(base64String);
        };

        reader.readAsDataURL(file);
      }
    }

  }

  function UploadingImageS3(base64String) {
    fetch(`${BASE_URL}/upload/file/image`, {
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
        setImage((prevImages) => prevImages.concat(data.Image));

        document.getElementById("fileimg").value = null;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const deleteImage = (index) => {
    setImage((prevImages) => prevImages.filter((_, i) => i !== index));
  }



  const AddMealPackage = async () => {
    if (
      package_name === "" ||
      package_description === "" ||
      plan_price === "" ||
      plan_image === "" ||
      plan_start === "" ||
      plan_end === ""
    ) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please fill all details",
        confirmButtonText: "OK",
      });
    } else {
      try {
        const response = await fetch(
          `${BASE_URL}/mpackage/packages/create`,
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, /",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hId: localStorage.getItem("hid"),
              token: window.localStorage.getItem("token"),
              packageName: package_name,
              packageDesc: package_description,
              packagePrice: plan_price,
              packageImage: Image,
              planStart: plan_start,
              planEnd: plan_end,
              isPerRoom: "false",
            }),
          }
        );

        const json = await response.json();

        if (json.Status === true) {
          setActiveTab("All Packages");
          MealPackagesAPI();
          setpackage_name("");
          setpackage_description("");
          setplan_price("");
          setplan_image([]);
          setplan_start("");
          setplan_end("");
          setImage([]);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Package added successfully",
            confirmButtonText: "OK",
          });

        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "There was a problem adding the package. Please try again.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleDelete = async (planId) => {

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete this package. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/mpackage/packages/delete`, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: window.localStorage.getItem("token"),
            planId: planId,
            hId: localStorage.getItem("hid"),
          }),
        });

        const json = await response.json();

        if (json.Status === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Package deleted successfully",
            confirmButtonText: "OK",
          });
          MealPackagesAPI();
        }
      } catch {
        // Handle error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "There was a problem deleting the package. Please try again.",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const MealPackagesAPI = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/mpackage/packages/${localStorage.getItem(
          "token"
        )}/${localStorage.getItem("hid")}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
        }
      );

      const json = await response.json();
      //console.log(json)

      if (json.Status === true) {
        setMealpackages(json.Packages);
        handleCurrentPackage();
        handleExpiredPackage();
      }
    } catch {
      // alert("Some Problem");
    }
  };

  const handleCurrentPackage = () => {
    const currentDate = new Date();
    const currentPackages = Mealpackages?.filter((pack) => {
      const startDate = new Date(pack.planStart);
      // const endDate = new Date(pack.planEnd);
      // return startDate <= currentDate && endDate >= currentDate;
      return startDate >= currentDate;
    });
    setCurrentPackage(currentPackages);
    return;
  };

  const handleExpiredPackage = () => {
    const currentDate = new Date();
    const expiredPackages = Mealpackages?.filter((pack) => {
      const endDate = new Date(pack.planEnd);
      return endDate < currentDate;
    });
    setExpiredPackage(expiredPackages);
    return;
  };

  useEffect(() => {
    MealPackagesAPI();
  }, []);


  const Tab = ["All Packages", "Add New Packages", "Current Packages", "Expired Packages"]
  return (

    <div className="bg-app-surface mb-10 p-4 cardShadow">

      <div className="flex mb-4">
        {Tab.map((item, index) => (
          <button key={index} onClick={() => setActiveTab(item)} className={`px-3 py-3 font-medium ${activeTab === item ? "bg-primary  text-white " : " text-gray-500"}`}>{item}</button>
        ))}
      </div>

      {activeTab === "Add New Packages" &&
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Form Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app-text dark:text-app-text">Package Name</label>
                <input
                  type="text"
                  value={package_name}
                  onChange={(e) => setpackage_name(e.target.value)}
                  placeholder="Enter package name"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app-text dark:text-app-text">Package Description</label>
                <input
                  type="text"
                  value={package_description}
                  onChange={(e) => setpackage_description(e.target.value)}
                  placeholder="Enter description"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app-text dark:text-app-text">Package Price</label>
                <input
                  type="number"
                  value={plan_price}
                  onChange={(e) => setplan_price(e.target.value)}
                  placeholder="Enter price"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app-text dark:text-app-text">Plan Start Date</label>
                <input
                  type="date"
                  value={plan_start}
                  onChange={(e) => setplan_start(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app-text dark:text-app-text">Plan End Date</label>
                <input
                  type="date"
                  value={plan_end}
                  onChange={(e) => setplan_end(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-app-text dark:text-app-text">Upload Images</label>
              <p className=" mb-2 text-sm text-gray-300">Please select any 5 images*</p>
              <div className="relative border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-blue-400 transition-all duration-200">
                <input
                  type="file"
                  id="packageimg"
                  onChange={uploadImage}
                  multiple
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <FaPlus />
                  <span className="font-medium">Click or drag to upload</span>
                </div>
              </div>

              {Image.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3 ">
                  {Image.map((img, index) => {
                    // Detect image type based on base64 prefix
                    let mimeType = '';
                    if (img.startsWith('iVBORw0')) mimeType = 'image/png';
                    else if (img.startsWith('R0lGODlh')) mimeType = 'image/gif';
                    else mimeType = 'image/jpeg'; // fallback

                    return (
                      <div className="relative h-[150px]" key={index} >
                        <img
                          src={`data:${mimeType};base64,${img}`}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-contain rounded-sm shadow-sm border"
                        />
                        <button
                          onClick={() => deleteImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 hover:bg-red-50 transition"
                        >
                          <MdDeleteOutline size={20} />
                        </button>
                      </div>

                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-right">
            <button
              onClick={AddMealPackage}
              className="px-6 py-3 bg-primary text-white font-semibold transition"
            >
              Submit Package
            </button>
          </div>

        </div>}

      {activeTab === "All Packages" &&
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {Mealpackages && Mealpackages?.map((pack, index) => (
            <div key={index} className=" relative">
              <img src={pack.packageImage.length > 0 ? pack.packageImage[0] : "https://www.foodservicerewards.com/cdn/shop/t/262/assets/fsr-placeholder.png?v=45093109498714503231652397781"} className="h-[240px] object-cover w-full" alt={`package- ${index + 1}`} />
              <span className="absolute top-2 right-2 bg-white">
                <MdDeleteOutline
                  size={28}
                  onClick={() => handleDelete(pack.planId)}
                  className="absolute top-2 right-2 cursor-pointer bg-white p-1 text-red-600 rounded-full text-md"
                />
              </span>
              <div className="flex flex-col mt-2">
                <h5 className="text-[#575757] text-md font-medium">{pack.packageName}</h5>
                <p className="text-[#575757]/80">{pack.packageDesc}</p>
                <p className="text-[#575757]/80"><span className="font-medium">Start Date:</span> {pack.planStart}</p>
                <p className="text-[#575757]/80"><span className="font-medium">End Date:</span> {pack.planEnd}</p>

                <p className="text-[#575757] font-semibold">₹{pack.packagePrice}</p>

              </div>
            </div>
          ))}
        </div>}

      {activeTab === "Current Packages" &&
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {Mealpackages && currentPackage?.map((pack, index) => (
            <div key={index} className=" relative">
              <img src={pack.packageImage.length > 0 ? pack.packageImage[0] : "https://www.foodservicerewards.com/cdn/shop/t/262/assets/fsr-placeholder.png?v=45093109498714503231652397781"} className="h-[240px] object-cover w-full" alt={`package- ${index + 1}`} />
              <span className="absolute top-2 right-2 bg-white">
                <MdDeleteOutline
                  size={28}
                  onClick={() => handleDelete(pack.planId)}
                  className="absolute top-2 right-2 cursor-pointer bg-white p-1 text-red-600 rounded-full text-md"
                />
              </span>
              <div className="flex flex-col mt-2">
                <h5 className="text-[#575757] text-md font-medium">{pack.packageName}</h5>
                <p className="text-[#575757]/80">{pack.packageDesc}</p>
                <p className="text-[#575757]/80"><span className="font-medium">Start Date:</span> {pack.planStart}</p>
                <p className="text-[#575757]/80"><span className="font-medium">End Date:</span> {pack.planEnd}</p>

                <p className="text-[#575757] font-semibold">₹{pack.packagePrice}</p>

              </div>
            </div>
          ))}
        </div>}

      {activeTab === "Expired Packages" &&
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {Mealpackages && expiredPackage?.map((pack, index) => (
            <div key={index} className=" relative">
              <img src={pack.packageImage.length > 0 ? pack.packageImage[0] : "https://www.foodservicerewards.com/cdn/shop/t/262/assets/fsr-placeholder.png?v=45093109498714503231652397781"} className="h-[240px] object-cover w-full" alt={`package- ${index + 1}`} />
              <span className="absolute top-2 right-2 bg-white">
                <MdDeleteOutline
                  size={28}
                  onClick={() => handleDelete(pack.planId)}
                  className="absolute top-2 right-2 cursor-pointer bg-white p-1 text-red-600 rounded-full text-md"
                />
              </span>
              <div className="flex flex-col mt-2">
                <h5 className="text-[#575757] text-md font-medium">{pack.packageName}</h5>
                <p className="text-[#575757]/80">{pack.packageDesc}</p>
                <p className="text-[#575757]/80"><span className="font-medium">Start Date:</span> {pack.planStart}</p>
                <p className="text-[#575757]/80"><span className="font-medium">End Date:</span> {pack.planEnd}</p>

                <p className="text-[#575757] font-semibold">₹{pack.packagePrice}</p>

              </div>
            </div>
          ))}
        </div>}
    </div>

  );
}

export default PricePackage;
