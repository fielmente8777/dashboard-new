import React, { useEffect, useState } from "react";
import {
  DeleteImage,
  GetwebsiteDetails,
  UploadingImageS3,
} from "../../services/api";
import axios from "axios";
import Swal from "sweetalert2";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { fetchWebsiteData } from "../../redux/slice/websiteDataSlice";

const Analytics = () => {
  //   const dispatch = useDispatch();
  //   const { websiteData, loading, error } = useSelector(
  //     (state) => state.websiteData
  //   );

  const [websitedata, setWebsitedata] = useState({});
  const [websiteoffersdata, setwebsiteoffersdata] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    hotel: "",
    description: "",
    valid: "",
    inclusion: [],
    details: "",
    image: "",
  });
  const [base64String, setBase64String] = useState("");

  const [inclusionInput, setInclusionInput] = useState("");

  const token = localStorage.getItem("token");
  //   useEffect(() => {
  //     if (localStorage.getItem("token")) {
  //       dispatch(fetchWebsiteData(token));
  //     }
  //   }, [dispatch, token]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const data = await GetwebsiteDetails(token);
        setWebsitedata(data);
        setwebsiteoffersdata(data?.Offers || []);
      } catch (error) {
        console.error("Error fetching website details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(websiteoffersdata);

  const addInclusion = () => {
    if (inclusionInput.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        inclusion: [...prev.inclusion, inclusionInput.trim()],
      }));
      setInclusionInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInclusion();
    }
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    const imageInput = document.getElementById("file");
    console.log(imageInput);
    const file = imageInput.files[0];
    console.log(file);
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select an image file.",
        confirmButtonText: "OK",
      });
      return;
    }

    // console.log(file)

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];

      setBase64String(base64String);

      // console.log(base64String)

      // const Url = await UploadingImageS3(base64String);
      // console.log(Url)
      // setFormData({ ...formData, image: Url });
    };
    reader.readAsDataURL(file);
  };

  // const UploadingImageS3 = (base64String) => {
  //   // Replace 'YOUR_BACKEND_API_URL' with the actual URL of your backend API
  //   fetch(`https://nexon.eazotel.com/upload/file/image`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       token: window.localStorage.getItem("token"),
  //       image: base64String,
  //     }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // console.log("Response from backend:", data);
  //       setFormData({ ...formData, image: data?.Image });
  //       // handleDeleteImage(selectedCategory, data.Image, "append")
  //       // Handle the backend response as needed
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const Url = await UploadingImageS3(base64String);
    const updatedData = {
      token: token,
      offer: [
        ...websiteoffersdata,
        {
          ...formData,
          image: Url,
        },
      ],
    };

    try {
      await axios.post(
        "https://nexon.eazotel.com/cms/edit/offers",
        updatedData
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Offer added successfully!",
        confirmButtonText: "OK",
      });
      setwebsiteoffersdata(updatedData.offer); // update UI
      setFormData({
        name: "",
        hotel: "",
        description: "",
        valid: "",
        inclusion: [],
        details: "",
        image: "",
      });
      setInclusionInput("");
    } catch (error) {
      console.error("Error adding offer:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add offer. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setFormData({ ...formData, image: "" });
    }
  };

  const handleDelete = (indexToDelete) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the API to delete the offer
        const token = localStorage.getItem("token");
        const updatedData = {
          token: token,
          offer: websiteoffersdata.filter((_, i) => i !== indexToDelete),
        };

        axios
          .post("https://nexon.eazotel.com/cms/edit/offers", updatedData)
          .then(() => {
            // DeleteImage(selectedCategory, data[indexToDelete].Image, token)
            setwebsiteoffersdata(updatedData?.offer); // update UI
            Swal.fire("Deleted!", "Your offer has been deleted.", "success");
          })
          .catch((error) => {
            console.error("Error deleting offer:", error);
            Swal.fire(
              "Error!",
              "Failed to delete offer. Please try again.",
              "error"
            );
          });
      }
    });
  };

  //   console.log("data from redux", websiteData);
  return (
    <div className="bg-white p-4">
      <div>
        <h2 className="text-sm font-semibold text-[#575757]">Offers</h2>
      </div>
      <hr className="mt-2" />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 mt-5">
          {[1, 2, 3].map((item, index) => (
            <div key={index} className="h-[60dvh] animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 mt-5">
          {websiteoffersdata[0]?.image &&
            websiteoffersdata?.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col relative gap-2 ${
                  activeIndex === index ? "bg-white z-10" : ""
                }`}
                onMouseEnter={() => setActiveIndex(true)}
                onMouseLeave={() => setActiveIndex(false)}
              >
                <MdDeleteOutline
                  size={28}
                  onClick={() => handleDelete(index)}
                  className="absolute top-3 right-3 cursor-pointer bg-white p-1 text-red-600 rounded-full text-md"
                />
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full object-cover md:h-[40dvh]"
                />
                <div>
                  <h2 className="text-sm font-semibold text-[#575757] ">
                    {item.name}
                  </h2>
                  <p className="text-[#575757]/80">{item.description}</p>
                  <p className="text-sm text-[#575757]/80 font-semibold uppercase">
                    {item.valid}
                  </p>
                  <div className="mt-1">
                    <h3 className="font-semibold text-[#575757] text-sm">
                      Includes:
                    </h3>
                    <ul className="list-disc pl-4 text-[#575757]/80">
                      {item?.inclusion?.map((inc, i) => (
                        <li key={i}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-1">
                    <h3 className="font-semibold text-[#575757] text-sm">
                      Need to Know:
                    </h3>
                    <p className="text-[#575757]/80">{item.details}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      <h1 className="text-sm font-semibold text-[#575757] mt-10">
        Add New Offer
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2"
      >
        <input
          type="text"
          value={formData.hotel}
          onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
          placeholder="Hotel"
          required
          className="border border-gray-300 rounded-md px-3 py-2 outline-none"
        />
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Description"
          required
          className="border border-gray-300 col-span-2 rounded-md px-3 py-2 outline-none"
        />

        <input
          type="date"
          value={formData.valid}
          onChange={(e) => setFormData({ ...formData, valid: e.target.value })}
          placeholder="Valid"
          required
          className="border border-gray-300 rounded-md px-3 py-2 outline-none"
        />
        <input
          type="text"
          value={formData.details}
          onChange={(e) =>
            setFormData({ ...formData, details: e.target.value })
          }
          placeholder="Details"
          required
          className="border border-gray-300 col-span-2 rounded-md px-3 py-2 outline-none"
        />

        <span className="flex flex-col gap-2 col-span-2">
          <input
            type="text"
            value={inclusionInput}
            onChange={(e) => setInclusionInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add inclusion"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
          <button
            onClick={addInclusion}
            className="px-3 py-2 w-fit bg-blue-500 text-white rounded-md"
          >
            Add
          </button>
        </span>
        <spna>
          <ul className="mt-2 list-disc pl-5">
            {formData.inclusion.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </spna>

        <input
          type="file"
          id="file"
          onChange={uploadImage}
          required
          className="border border-gray-300 rounded-md px-3 py-2 outline-none"
        />

        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
          required
          className="border border-gray-300 rounded-md px-3 py-2 outline-none"
        />

        <button
          type="submit"
          className="bg-[#0a3a75] text-white px-4 py-2 rounded-md"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default Analytics;
