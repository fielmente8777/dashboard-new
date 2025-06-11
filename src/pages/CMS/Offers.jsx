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
import handleLocalStorage from "../../utils/handleLocalStorage";
import { BASE_URL } from "../../data/constant";
import Loader from "../../components/Loader";
import { FiPlus, FiUpload, FiX } from "react-icons/fi"; // For icons

const Analytics = () => {
  //   const dispatch = useDispatch();
  //   const { websiteData, loading, error } = useSelector(
  //     (state) => state.websiteData
  //   );

  const [websiteoffersdata, setwebsiteoffersdata] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
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
  const [loadingAddOffer, setLoadingAddOffer] = useState(false);
  const [inclusionInput, setInclusionInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const { currentLoactionWebsiteData, loading } = useSelector(
    (state) => state?.hotelsWebsiteData
  );

  const dispatch = useDispatch();

  // const addInclusion = (e) => {
  //   e.preventDefault();
  //   if (inclusionInput.trim() !== "") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       inclusion: [...prev.inclusion, inclusionInput.trim()],
  //     }));
  //     setInclusionInput("");
  //   }
  // };

  const addInclusion = () => {
    if (inclusionInput.trim()) {
      setFormData({
        ...formData,
        inclusion: [...formData.inclusion, inclusionInput.trim()],
      });
      setInclusionInput("");
    }
  };

  const removeInclusion = (index) => {
    setFormData({
      ...formData,
      inclusion: formData.inclusion.filter((_, i) => i !== index),
    });
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
    const file = imageInput.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select an image file.",
        confirmButtonText: "OK",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];

      setBase64String(base64String);
    };
    reader.readAsDataURL(file);
  };

  // handle submit for add new offer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAddOffer(true);

    const token = localStorage.getItem("token");
    const Url = await UploadingImageS3(base64String);
    const updatedData = {
      token: token,
      hid: String(handleLocalStorage("hid")),
      offer: [
        ...websiteoffersdata,
        {
          ...formData,
          image: Url,
        },
      ],
    };

    try {
      const { data } = await axios.post(
        `${BASE_URL}/cms/edit/offers`,
        updatedData
      );

      if (data?.Status) {
        dispatch(
          fetchWebsiteData(
            handleLocalStorage("token"),
            handleLocalStorage("hid")
          )
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Offer added successfully!",
          confirmButtonText: "OK",
        });
      }
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
      setLoadingAddOffer(false);
    }
  };

  const handleDelete = (indexToDelete) => {
    console.log(indexToDelete);
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
          hid: String(handleLocalStorage("hid")),
        };

        axios
          .post(`${BASE_URL}/cms/edit/offers`, updatedData)
          .then(() => {
            dispatch(
              fetchWebsiteData(
                handleLocalStorage("token"),
                handleLocalStorage("hid")
              )
            );
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

  useEffect(() => {
    if (currentLoactionWebsiteData && currentLoactionWebsiteData?.Offers) {
      setwebsiteoffersdata([...currentLoactionWebsiteData?.Offers]);
    }
  }, []);

  return (
    <div className="bg-white p-4">
      <div>
        <h2 className="text-sm font-semibold text-[#575757]">Offers</h2>
      </div>

      <hr className="mt-2" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
          {[1, 2, 3].map((item, index) => (
            <div key={index} className="h-[60dvh] animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
          {currentLoactionWebsiteData?.Offers &&
            currentLoactionWebsiteData?.Offers?.map((item, index) => (
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
          disabled={loadingAddOffer}
          type="submit"
          className="bg-primary disabled:opacity-75 text-white px-4 py-2 rounded-md flex items-center justify-center gap-4"
        >
          Add Offer {loadingAddOffer && <Loader size={18} color="#fff" />}
        </button>
      </form>
    </div>
  );
};

export default Analytics;

/* <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block mb-1 font-medium">Hotel Name</label>
    <input
      type="text"
      value={formData.hotel}
      onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
      placeholder="Enter hotel name"
      required
      className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
    />
  </div>

  <div>
    <label className="block mb-1 font-medium">Offer Name</label>
    <input
      type="text"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      placeholder="Enter offer name"
      required
      className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
    />
  </div>

  <div>
    <label className="block mb-1 font-medium">Valid Till</label>
    <input
      type="date"
      value={formData.valid}
      onChange={(e) => setFormData({ ...formData, valid: e.target.value })}
      required
      className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
    />
  </div>

  <div>
    <label className="block mb-1 font-medium">Upload Image</label>
    <label className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
      <FiUpload />
      <span>Select Image</span>
      <input type="file" className="hidden" onChange={uploadImage} id="file" />
    </label>
    {imagePreview && (
      <img
        src={imagePreview}
        alt="Preview"
        className="mt-2 w-32 h-20  rounded-md object-contain"
      />
    )}
  </div>

  <div className="md:col-span-2">
    <label className="block mb-1 font-medium">Description</label>
    <textarea
      value={formData.description}
      onChange={(e) =>
        setFormData({ ...formData, description: e.target.value })
      }
      placeholder="Enter description"
      required
      className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
    />
  </div>

  <div className="md:col-span-2">
    <label className="block mb-1 font-medium">Details</label>
    <textarea
      value={formData.details}
      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
      placeholder="Enter more details"
      required
      className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
    />
  </div>

  <div className="md:col-span-2">
    <label className="block mb-1 font-medium">Inclusions</label>
    <div className="flex gap-2">
      <input
        type="text"
        value={inclusionInput}
        onChange={(e) => setInclusionInput(e.target.value)}
        placeholder="Add inclusion"
        className="flex-1 border border-gray-300 rounded-md px-4 py-2 outline-none"
      />
      <button
        type="button"
        onClick={addInclusion}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <FiPlus size={20} />
      </button>
    </div>

    <ul className="mt-3 space-y-2">
      {formData.inclusion.map((item, index) => (
        <li
          key={index}
          className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded"
        >
          <span>{item}</span>
          <button
            type="button"
            onClick={() => removeInclusion(index)}
            className="text-red-500 hover:text-red-700"
          >
            <FiX size={18} />
          </button>
        </li>
      ))}
    </ul>
  </div>

  <div className="md:col-span-2 flex justify-end">
    <button
      disabled={loadingAddOffer}
      type="submit"
      className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
    >
      {loadingAddOffer && <span className="animate-spin">⏳</span>}
      Add Offer
    </button>
  </div>
</form>; */
