import { useContext, useEffect, useState, useRef } from "react";
import JoditEditor from "jodit-react";
import { FaPlus } from "react-icons/fa";
import { BASE_URL } from "../../data/constant";
import DataContext from "../../context/DataContext";
import AdsPackage from "../../components/Card/AdsPackage";
function PricePackage() {
  const editor = useRef(null);
  const { joditConfig } =
    useContext(DataContext);
  const [Adspackages, setAdspackages] = useState([])




  const tab = ["Current Packages", "Add New Packages"]

  const [activeTab, setActiveTab] = useState(tab[0])

  const [package_name, setpackage_name] = useState();
  const [package_description, setpackage_description] = useState();
  const [package_Inclusion, setpackage_Inclusion] = useState();
  const [package_Itinerary, setpackage_Itinerary] = useState();
  const [package_guests, setpackage_guests] = useState();
  const [package_days, setpackage_days] = useState();
  const [package_night, setpackage_night] = useState();
  const [package_price, setpackage_price] = useState();
  const [plan_image, setplan_image] = useState();
  const [plan_start, setplan_start] = useState();
  const [plan_end, setplan_end] = useState();
  const [roomType, setroomType] = useState();
  const [Image, setImage] = useState([]);



  function uploadImage(e) {
    e.preventDefault();
    const imageInput = document.getElementById("packageimges");
    const files = imageInput.files;

    if (files.length === 0) {
      alert("Please select at least one image file.");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const reader = new FileReader();
      reader.onloadend = function () {
        const base64String = reader.result.split(",")[1];
        UploadingImageS3(base64String);
      };

      reader.readAsDataURL(file);
    }
  }

  function UploadingImageS3(base64String) {
    fetch(`${BASE_URL}/upload/file/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("Token"),
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

  const AddMealPackage = async () => {
    if (
      package_name === "" ||
      package_description === "" ||
      package_Inclusion === "" ||
      package_Itinerary === "" ||
      package_guests === "" ||
      package_days === "" ||
      package_night === "" ||
      package_price === "" ||
      plan_start === "" ||
      plan_end === ""
    ) {
      alert("Please fill details");
    } else {
      try {
        const response = await fetch(
          `${BASE_URL}/rpackage/ad/packages/create`,
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, /",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: window.localStorage.getItem("token"),
              hId: localStorage.getItem("hid"),
              packageName: package_name,
              packageDesc: package_description,
              packageInclusion: package_Inclusion,
              packageItinerary: package_Itinerary,
              packageguests: package_guests,
              packagePrice: package_price,
              NoofDays: package_days,
              NoofNight: package_night,
              packageImage: Image,
              packageStart: plan_start,
              packageEnd: plan_end,
              roomTypeProvided: "1",
            }),
          }
        );

        const json = await response.json();
        console.log(json);

        if (json.Status === true) {
          AdsPackagesAPI();
          Referesh();
        }
      } catch {
        alert("Some Problem");
      }
    }
  };

  const DeleteMealPackage = async (planId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/rpackage/ad/packages/delete`,
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: window.localStorage.getItem("token"),
            packageId: planId,
            hId: localStorage.getItem("hid"),
          }),
        }
      );

      const json = await response.json();
      console.log(json);

      if (json.Status === true) {
        AdsPackagesAPI();
        Referesh();
      }
    } catch {
      alert("Some Problem");
    }
  };

  const Referesh = () => {
    setpackage_name();
    setpackage_description();
    setpackage_Inclusion();
    setpackage_Itinerary();
    setpackage_guests();
    setpackage_days();
    setpackage_night();
    setpackage_price();
    setplan_image([]);
    setplan_start();
    setplan_end();
    setroomType();
  };


  const AdsPackagesAPI = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/rpackage/ad/packages/${localStorage.getItem(
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

      if (json.Status === true) {
        setAdspackages(json.Packages);
      }
    } catch {
      // alert("Some Problem");
    }
  };
  useEffect(() => {
    AdsPackagesAPI();
  }, []);

  console.log(Adspackages)



  return (
    <div className="bg-white p-4">

      <div className="flex">
        {tab.map((item, index) => (
          <button key={index} onClick={() => setActiveTab(item)} className={`active:scale-90 px-3 py-2 ${activeTab === item ? "bg-primary  text-white border border-primary" : " text-gray-500 border border-gray-600"}`}>{item}</button>
        ))}
      </div>


      {activeTab === "Add New Packages" && <div className="flex flex-col gap-2 mt-4">
        <div className="">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
          <input
            type="text"
            value={package_name}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
            onChange={(e) => {
              setpackage_name(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Description</label>
          <input
            type="text"
            value={package_description}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none "

            onChange={(e) => {
              setpackage_description(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Inclusion</label>
          <input
            type="text"
            value={package_Inclusion}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none "
            onChange={(e) => {
              setpackage_Inclusion(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Itinerary</label>
          <div >
            <JoditEditor
              id="jodit1"
              ref={editor}
              className="w-full border border-gray-300 rounded-md text-sm outline-none "
              value={package_Itinerary}
              onChange={(content) => {
                setpackage_Itinerary(content);
                editor.current?.focus();
              }}
              config={joditConfig}
            />
          </div>
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Guests</label>
          <input
            type="text"
            value={package_guests}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none "
            onChange={(e) => {
              setpackage_guests(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Days</label>
          <input
            type="text"
            value={package_days}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none "
            onChange={(e) => {
              setpackage_days(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Night</label>
          <input
            type="text"
            value={package_night}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none "
            onChange={(e) => {
              setpackage_night(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Price</label>
          <input
            type="text"
            value={package_price}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none "
            onChange={(e) => {
              setpackage_price(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package Start</label>
          <input
            type="date"
            value={plan_start}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none "
            onChange={(e) => {
              setplan_start(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className="block text-sm font-medium text-gray-700 mb-1">Package End</label>
          <input
            type="date"
            value={plan_end}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none "
            onChange={(e) => {
              setplan_end(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>

        <div className="cmsForm_div">
          <div className="cmsForm_div cmsimgdiv">
            <div className="CmsNearImglabel">
              <label htmlFor="/">Image:</label>
              <button className="upload">
                <span className="cmsupldspn">Upload Image</span>
                <FaPlus className="cmsplusicon" />
                <input
                  type="file"
                  id="packageimges"
                  onChange={uploadImage}
                  multiple
                />
              </button>
            </div>
            <div className="upl_img">
              {Image.map((img) => {
                return <img src={img} alt="" />;
              })}
            </div>
          </div>
        </div>
        <button className="pricSubmitBtn" onClick={AddMealPackage}>
          Submit
        </button>

        {/* card start  */}


      </div>}

      {activeTab === "Current Packages" && <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-5">
        {Adspackages && Adspackages?.map((pack) => (
          <AdsPackage
            packageImage={pack.packageImage}
            packageName={pack.packageName}
            packageDesc={pack.packageDesc}
            packagePrice={pack.packagePrice}
            packageId={pack.packageId}
            DeleteMealPackage={DeleteMealPackage}
          />
        ))}
      </div>}
    </div>
  );
}

export default PricePackage;
