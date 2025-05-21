import axios from "axios";
import { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { UploadingImageS3 } from "../../services/api";
// import TimePick from '../../components/TimePicker';

const Events = () => {
  const [addEventLoader, setAddEventLoader] = useState(false);
  const [base64String, setBase64String] = useState("");
  const [formData, setFormData] = useState({
    heading: "",
    text: "",
    date: "",
    time: "",
    image: "",
    location: "",
    bookingUrl: "",
  });

  const { currentLoactionWebsiteData, loading } = useSelector(
    (state) => state?.hotelsWebsiteData
  );

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

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];

      setBase64String(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddEventLoader(true);
    const Url = await UploadingImageS3(base64String);

    const newEvent = {
      token: localStorage.getItem("token"),
      Heading: formData.heading,
      Text: formData.text,
      Image: Url,
      Date: formData.date,
      Time: formData.time,
      Location: formData.location,
      BookingUrl: formData.bookingUrl,
      operation: "append",
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/cms/operation/Events",
        // "https://nexon.eazotel.com/cms/operation/Events",
        newEvent
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Offer added successfully!",
        timer: 600,
        showConfirmButton: false,
      }).then(() => {
        if (response?.data?.Status) {
          // fetchData();
        }
      });
      // update UI
      setFormData({
        heading: "",
        text: "",
        date: "",
        time: "",
        image: "",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add event. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setFormData({
        heading: "",
        text: "",
        date: "",
        time: "",
        image: "",
      });
      setAddEventLoader(false);
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");

        try {
          const response = await axios.post(
            "http://127.0.0.1:5000/cms/operation/Events",
            {
              token: token,
              operation: "pop",
              index: indexToDelete,
            }
          );
          if (response?.data?.Status) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: result.Message || "Event has been deleted.",
              timer: 600,
              showConfirmButton: false,
            }).then(() => {
              if (response?.data?.Status) {
                // fetchData();
              }
            });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Failed to delete event. Please try again.",
            timer: 600,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  return (
    <div className="bg-white  p-4">
      <div className="bg-white">
        <h2 className="text-sm font-semibold text-[#575757]">Events</h2>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
            {[1, 2, 3].map((item, index) => (
              <div
                key={index}
                className="h-[60dvh] animate-pulse bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {currentLoactionWebsiteData?.Details?.Events?.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 mb-4 relative"
              >
                <div>
                  <span className="absolute top-2 right-2 bg-white">
                    <MdDeleteOutline
                      size={28}
                      onClick={() => handleDelete(index)}
                      className="absolute top-3 right-3 cursor-pointer bg-white p-1 text-red-600 rounded-full text-md"
                    />
                  </span>
                  <img
                    src={item?.Image}
                    alt={item?.title}
                    className="w-full h-[60vh] object-cover mb-4"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#575757] mb-2">
                    {item?.Heading}
                  </h3>
                  <p className="text-sm text-[#575757]/70 mb-2 ">
                    {item?.Text}
                  </p>
                  <p className="text-sm text-[#575757] font-semibold">
                    {item?.date}
                  </p>
                  <p className="text-sm text-[#575757]">{item?.time}</p>
                  {/*  <p className="text-sm text-gray-600">{item?.location}</p> */}
                </div>
              </div>
            ))}

            {addEventLoader && (
              <div className="h-[75dvh] animate-pulse bg-gray-100 mt-4" />
            )}
          </div>
        )}
      </div>

      <h1 className="text-sm font-semibold text-[#575757] mt-10">
        Add New Event
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2"
      >
        {/* <form className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2'> */}
        <input
          type="text"
          value={formData.heading}
          onChange={(e) =>
            setFormData({ ...formData, heading: e.target.value })
          }
          placeholder="Hotel"
          required
          className="border border-gray-300 rounded-md px-3 py-2 outline-none"
        />
        <input
          type="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Description"
          required
          className="border border-gray-300 col-span-2 rounded-md px-3 py-2 outline-none"
        />

        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          placeholder="Valid"
          required
          className="border border-gray-300 rounded-md px-3 py-2 outline-none"
        />

        {/* <TimePick
                    format="HH:mm"
                    value={formData.time}
                    onChange={(value) => setFormData({ ...formData, time: value })}
                    placeholder='Time'
                /> */}
        <input
          htmlFor="time"
          id="time"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          placeholder="Details"
          required
          className="border border-gray-300 col-span-2 rounded-md px-3 py-2 outline-none"
        />

        {/* <span className='flex flex-col gap-2 col-span-2'>

                    <input
                        type='text'
                        value={inclusionInput}
                        onChange={(e) => setInclusionInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder='Add inclusion'
                        className='border border-gray-300 rounded-md px-3 py-2 w-full'
                    />
                    <button
                        onClick={addInclusion}
                        className='px-3 py-2 w-fit bg-blue-500 text-white rounded-md'
                    >
                        Add
                    </button>
                </span> */}
        {/* <spna>

                    <ul className='mt-2 list-disc pl-5'>
                        {formData.inclusion.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </spna> */}

        <input
          type="text"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="Location"
          required
          className="border border-gray-300 col-span-2 rounded-md px-3 py-2 outline-none"
        />
        <input
          type="url"
          value={formData.bookingUrl}
          onChange={(e) =>
            setFormData({ ...formData, bookingUrl: e.target.value })
          }
          placeholder="Booking Url"
          //   required
          className="border border-gray-300 col-span-2 rounded-md px-3 py-2 outline-none"
        />

        <input
          type="file"
          id="file"
          onChange={uploadImage}
          required
          className="border border-gray-300 rounded-md px-3 py-2 outline-none"
        />

        {/* <input
                    type='text'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='Name'
                    required
                    className='border border-gray-300 rounded-md px-3 py-2 outline-none'
                /> */}

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

export default Events;
