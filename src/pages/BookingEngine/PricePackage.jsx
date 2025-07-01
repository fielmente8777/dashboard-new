import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../Context/AuthProvider";
import { FaPlus } from "react-icons/fa";
import { HashLoader } from "react-spinners";
function PricePackage() {
  const {
    Mealpackages,
    setMealpackages,
    baseUrl,
    MealPackagesAPI,
    EngineUrl,
    WebsiteData,
    EngineNewUrl,
  } = useContext(AuthContext);
  const [Image, setImage] = useState([]);
  const [package_name, setpackage_name] = useState();
  const [package_description, setpackage_description] = useState();
  const [plan_price, setplan_price] = useState();
  const [plan_image, setplan_image] = useState([]);
  const [plan_start, setplan_start] = useState();
  const [plan_end, setplan_end] = useState();
  const [isPerRoom, setisPerRoom] = useState(false);

  function uploadImage(e) {
    e.preventDefault();
    const imageInput = document.getElementById("packageimg");
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
      plan_price === "" ||
      plan_image === "" ||
      plan_start === "" ||
      plan_end === ""
    ) {
      alert("Please fill all Details");
    } else {
      try {
        const response = await fetch(
          `${EngineNewUrl}/mpackage/packages/create`,
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, /",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hId: localStorage.getItem("hotelLocationId"),
              token: window.localStorage.getItem("Token"),
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
        console.log(json);

        if (json.Status === true) {
          MealPackagesAPI();
          Referesh();
        }
      } catch {
        alert("Some Problem");
      }
    }
  };

  const DeleteMealPackage = async (planId) => {
    try {
      const response = await fetch(`${EngineNewUrl}/mpackage/packages/delete`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: window.localStorage.getItem("Token"),
          planId: planId,
          hId: localStorage.getItem("hotelLocationId"),
        }),
      });

      const json = await response.json();
      console.log(json);

      if (json.Status === true) {
        MealPackagesAPI();
        Referesh();
      }
    } catch {
      alert("Some Problem");
    }
  };
  useEffect(() => {
    MealPackagesAPI();
  }, []);

  const Referesh = () => {
    setpackage_name("");
    setpackage_description("");
    setplan_price("");
    setplan_image([]);
    setplan_start("");
    setplan_end("");
    setisPerRoom(false);
    setImage([]);
  };
  return (
    <>
      {Mealpackages === "None" ? (
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
      ) : (
        <>
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
                <label htmlFor="#">Package Price</label>
                <input
                  type="text"
                  value={plan_price}
                  onChange={(e) => {
                    setplan_price(e.target.value);
                  }}
                  placeholder="Enter Here"
                />
              </div>
              <div className="priceinput_div">
                <label htmlFor="#">Plan Start Date</label>
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
                <label htmlFor="#">Plan End Date</label>
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
                        id="packageimg"
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
                {Mealpackages.map((pack, index) => (
                  <div className="card priceCard">
                    {/* <img src="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?cs=srgb&dl=pexels-pixabay-164595.jpg&fm=jpg" className="card-img-top" alt="..." /> */}
                    <div className="card-body">
                      <h5 className="card-title">{pack.packageName}</h5>
                      <p className="card-text">{pack.packageDesc}</p>
                      <p className="card-text">{pack.packagePrice}</p>
                      <a
                        href="#"
                        className="btn btn-primary"
                        onClick={() => {
                          DeleteMealPackage(pack.planId);
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
