import React, { useContext, useEffect, useState, useRef } from "react";
import AuthContext from "../../Context/AuthProvider";
import JoditEditor from "jodit-react";
import { FaPlus } from "react-icons/fa";
import { HashLoader } from "react-spinners";
function PricePackage() {
  const editor = useRef(null);
  const { Adspackages, AdsPackagesAPI, joditConfig, EngineNewUrl } =
    useContext(AuthContext);
  const [Image, setImage] = useState([]);

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
    fetch(`${EngineNewUrl}/upload/file/image`, {
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
          `${EngineNewUrl}/rpackage/ad/packages/create`,
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, /",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: window.localStorage.getItem("Token"),
              hId: localStorage.getItem("hotelLocationId"),
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
        `${EngineNewUrl}/rpackage/ad/packages/delete`,
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, /",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: window.localStorage.getItem("Token"),
            packageId: planId,
            hId: localStorage.getItem("hotelLocationId"),
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
  useEffect(() => {
    AdsPackagesAPI();
  }, []);

  return (
    <>
      {Adspackages === "None" ? (
        <>
          {" "}
          <div
            style={{
              display: "flex",
              width: "80vw",
              height: "70vh",
              justifyContent: "center",
              alignItems: "center",
              justifyItems: "center",
            }}
          >
            <HashLoader color="#E65502" />
          </div>
        </>
      ) : (
        <>
          {" "}
          <div className="boking_pricepack">
            <h4>Package</h4>
            <div>
              <div className="priceinput_div">
                <label htmlFor="#">Package Name</label>
                <input
                  type="text"
                  value={package_name}
                  onChange={(e) => {
                    setpackage_name(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Package Description</label>
                <input
                  type="text"
                  value={package_description}
                  onChange={(e) => {
                    setpackage_description(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Package Inclusion</label>
                <input
                  type="text"
                  value={package_Inclusion}
                  onChange={(e) => {
                    setpackage_Inclusion(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Package Itinerary</label>
                <div style={{ width: "80%" }}>
                  <JoditEditor
                    id="jodit1"
                    ref={editor}
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
                <label htmlFor="#">Package Guests</label>
                <input
                  type="text"
                  value={package_guests}
                  onChange={(e) => {
                    setpackage_guests(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Package Days</label>
                <input
                  type="text"
                  value={package_days}
                  onChange={(e) => {
                    setpackage_days(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Package Night</label>
                <input
                  type="text"
                  value={package_night}
                  onChange={(e) => {
                    setpackage_night(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Package Price</label>
                <input
                  type="text"
                  value={package_price}
                  onChange={(e) => {
                    setpackage_price(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Package Start</label>
                <input
                  type="date"
                  value={plan_start}
                  onChange={(e) => {
                    setplan_start(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Package End</label>
                <input
                  type="date"
                  value={plan_end}
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

              <div className="priceCardMain">
                {Adspackages.map((pack) => (
                  <div class="card priceCard">
                    {/* <img src="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?cs=srgb&dl=pexels-pixabay-164595.jpg&fm=jpg" class="card-img-top" alt="..." /> */}
                    <div class="card-body">
                      <h5 class="card-title">{pack.packageName}</h5>
                      <p class="card-text">{pack.packageDesc}</p>
                      <p class="card-text">{pack.packagePrice}</p>
                      <a
                        href="#"
                        class="btn btn-primary"
                        onClick={() => {
                          DeleteMealPackage(pack.packageId);
                        }}
                      >
                        Delete
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default PricePackage;
