import { useContext, useEffect, useState, useRef } from "react";
import JoditEditor from "jodit-react";
import { FaPlus } from "react-icons/fa";
import { BASE_URL } from "../../data/constant";
import DataContext from "../../context/DataContext";
import AdsPackage from "../../components/Card/AdsPackage";

/* ── styling only ───────────────────────────────────────────── */
const LABEL =
  "block text-sm font-medium text-app-text dark:text-app-text mb-1";
const FIELD =
  "w-full rounded-md border border-app-border bg-app-surface px-4 py-2 text-sm text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";

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
        // console.log(json);

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
      // console.log(json);

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

  // console.log(Adspackages)



  return (
    <div className="bg-app-surface p-4 [color-scheme:light] dark:[color-scheme:dark]">

      <div className="flex flex-wrap">
        {tab.map((item, index) => (
          <button key={index} onClick={() => setActiveTab(item)} className={`active:scale-90 px-3 py-2 text-sm transition-colors ${activeTab === item ? "bg-primary text-white border border-primary" : "bg-app-surface-secondary text-app-text border border-app-border hover:bg-app-surface"}`}>{item}</button>
        ))}
      </div>


      {activeTab === "Add New Packages" && <div className="flex flex-col gap-2 mt-4">
        <div className="">
          <label htmlFor="#" className={LABEL}>Package Name</label>
          <input
            type="text"
            value={package_name}
            className={FIELD}
            onChange={(e) => {
              setpackage_name(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className={LABEL}>Package Description</label>
          <input
            type="text"
            value={package_description}
            className={FIELD}

            onChange={(e) => {
              setpackage_description(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className={LABEL}>Package Inclusion</label>
          <input
            type="text"
            value={package_Inclusion}
            className={FIELD}
            onChange={(e) => {
              setpackage_Inclusion(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className={LABEL}>Package Itinerary</label>
          <div className="rounded-md border border-app-border overflow-hidden bg-white">
            <JoditEditor
              id="jodit1"
              ref={editor}
              className="w-full text-sm outline-none "
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
          <label htmlFor="#" className={LABEL}>Package Guests</label>
          <input
            type="text"
            value={package_guests}
            className={FIELD}
            onChange={(e) => {
              setpackage_guests(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className={LABEL}>Package Days</label>
          <input
            type="text"
            value={package_days}
            className={FIELD}
            onChange={(e) => {
              setpackage_days(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className={LABEL}>Package Night</label>
          <input
            type="text"
            value={package_night}
            className={FIELD}
            onChange={(e) => {
              setpackage_night(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className={LABEL}>Package Price</label>
          <input
            type="text"
            value={package_price}
            className={FIELD}
            onChange={(e) => {
              setpackage_price(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className={LABEL}>Package Start</label>
          <input
            type="date"
            value={plan_start}
            className={FIELD}
            onChange={(e) => {
              setplan_start(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>
        <div className="priceinput_div">
          <label htmlFor="#" className={LABEL}>Package End</label>
          <input
            type="date"
            value={plan_end}
            className={FIELD}
            onChange={(e) => {
              setplan_end(e.target.value);
            }}
            placeholder="Enter Here"
          />
        </div>

        <div className="cmsForm_div">
          <div className="cmsForm_div cmsimgdiv">
            <div className="CmsNearImglabel">
              <label htmlFor="/" className={LABEL}>Image:</label>
              <button type="button" className="upload flex items-center gap-2 rounded-md border border-app-border bg-app-surface px-4 py-2 text-sm text-app-text hover:bg-primary hover:text-white hover:border-primary transition-colors">
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
            <div className="upl_img mt-3 flex flex-wrap gap-3">
              {Image.map((img) => {
                return <img src={img} alt="" className="h-24 w-24 rounded-md object-cover border border-app-border" />;
              })}
            </div>
          </div>
        </div>
        <button type="button" className="pricSubmitBtn mt-2 w-full sm:w-auto self-start rounded-md bg-primary hover:bg-primary/90 px-6 py-2 text-sm font-medium text-white transition-colors" onClick={AddMealPackage}>
          Submit
        </button>

        {/* card start  */}


      </div>}

      {activeTab === "Current Packages" && <div className=" grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
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