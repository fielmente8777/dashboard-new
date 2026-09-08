import { useEffect, useRef, useState } from "react";
import { facilitiesList, getRoomType, roomTypes } from "./Data";
import { PiUploadSimpleBold } from "react-icons/pi";
import { addRoom } from "../../services/api/bookingEngine";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { UploadingImageS3 } from "../../services/api/s3Image.api";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRooms } from "../../redux/slice/bookingEngine";
import RoomsCard from "../../components/Card/RoomCard";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";

/* ── styling only ───────────────────────────────────────────── */
const LABEL =
  "block text-sm font-medium text-app-text dark:text-app-text-muted mb-1";
const FIELD =
  "w-full rounded-md p-2 outline-none border border-primary/20 focus:border-primary/50 bg-app-surface text-app-text placeholder:text-app-text-faint transition-colors";
const OPTION = "bg-white dark:bg-[#1e293b] text-gray-800 dark:text-gray-100";

const Tabs = ["All Rooms", "Add Rooms"];

const BookingSetup = () => {
  const dispatch = useDispatch();
  const inputFileRef = useRef(null);
  const [activeTab, setActiveTab] = useState("All Rooms");
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [images, setImages] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({
    roomType: "",
    roomName: "",
    roomSubheading: "",
    roomDescription: "",
    child: "",
    adult: "",
    noOfRooms: "",
    price: "",
  });

  const { allRooms, loading } = useSelector((state) => state?.bookingEngine);

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFacilityToggle = (facility) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((item) => item !== facility)
        : [...prev, facility]
    );
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveImages = (img) => {
    setImages((prev) => prev.filter((item) => item !== img));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadToS3 = async (base64) => {
    const response = await UploadingImageS3(base64);
    return response;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    // let uploadedImageResponses = [];
    // console.log(images);
    // if (images?.length > 0) {
    //   for (const img of images) {
    //     try {
    //       const base64String = await readFileAsDataURL(img);
    //       const uploadResponse = await uploadToS3(base64String);
    //       uploadedImageResponses.push(uploadResponse); // you can update this logic depending on what the API returns
    //     } catch (error) {
    //       console.error("Error reading/uploading file:", error);
    //     }
    //   }
    // }

    const roomTypeValue = getRoomType(formData?.roomType);
    const newRoomData = {
      roomType: roomTypeValue?.toString(),
      hId: String(handleLocalStorage("hid")),
      roomName: formData?.roomName,
      roomDescription: formData?.roomDescription,
      child: formData?.child,
      adult: formData?.adult,
      noOfRooms: formData?.noOfRooms,
      price: formData?.price,
      roomImage: [],
      roomFacilities: selectedFacilities,
      roomSubheading: formData?.roomSubheading,
      isWeekendFormat: "false",
      changedPrice: {
        weekend: formData?.price,
        weekday: formData?.price,
      },
    };

    try {
      const response = await addRoom(newRoomData);

      if (response.status === true) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          titleText: "Success",
          title: "Room added in successfully",
        });
        // Reset form data
        setFormData({
          roomType: "",
          roomName: "",
          roomSubheading: "",
          roomDescription: "",
          child: "",
          adult: "",
          noOfRooms: "",
          price: "",
        });
        setSelectedFacilities([]);
        setImages([]);
        dispatch(
          fetchAllRooms(handleLocalStorage("token"), handleLocalStorage("hid"))
        );
        setActiveTab(Tabs[0]);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: response.message || "Room already exist with this name!",
          confirmButtonText: "OK",
        });

        return;
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add room. Please try again.",
      });
      console.error("Error uploading images:", error);
      return;
    } finally {
      setAddLoading(false);
    }
  };

  useEffect(() => {
    const token = handleLocalStorage("token");
    const hid = handleLocalStorage("hid");
    dispatch(fetchAllRooms(token, hid));
  }, []);

  return (
    <div className="bg-app-surface-secondary mb-10 cardShadow [color-scheme:light] dark:[color-scheme:dark] p-4">
      <div className="flex items-center divide-x gap-3.5 divide-app-border font-medium border-b border-app-border">
        {Tabs?.map((item, index) => (
          <button
            onClick={() => setActiveTab(item)}
            key={index}
            className={`px-4 py-4 rounded-sm transition-colors duration-300 ${
              activeTab.toLocaleLowerCase() === item.toLocaleLowerCase()
                ? "bg-primary text-white"
                : "bg-app-surface text-primary dark:text-app-text hover:bg-app-surface-secondary"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="py-4">
        {activeTab.toLocaleLowerCase() === "all rooms" && (
          <div className="">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {allRooms?.map((item, index) => (
                <RoomsCard {...item} key={index} />
              ))}
            </div>
          </div>
        )}

        {activeTab.toLocaleLowerCase() === "add rooms" && (
          <form
            onSubmit={handleFormSubmit}
            className="mx-auto rounded-2xl space-y-6"
          >
            <h2 className="text-2xl font-bold text-app-text dark:text-app-text">
              Room Setup Form
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Room Type */}
              <div>
                <label className={LABEL}>Room Type</label>
                <select
                  name="roomType"
                  className={`${FIELD} cursor-pointer`}
                  onChange={handleInputChange}
                >
                  {roomTypes.map((type, idx) => (
                    <option key={idx} value={type} className={OPTION}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Name */}
              <div>
                <label className={LABEL}>Room Name</label>
                <input
                  className={FIELD}
                  name="roomName"
                  placeholder="Enter room name"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Room Subheading */}
              <div>
                <label className={LABEL}>Room Subheading</label>
                <input
                  className={FIELD}
                  name="roomSubheading"
                  placeholder="Enter subheading"
                  onChange={handleInputChange}
                />
              </div>

              {/* price  */}
              <div>
                <label className={LABEL}>Price (per night)</label>
                <input
                  type="number"
                  className={FIELD}
                  min="0"
                  name="price"
                  placeholder="Enter price"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Numbers */}
            <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={LABEL}>Children</label>
                <input
                  type="number"
                  className={FIELD}
                  min="0"
                  name="child"
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={LABEL}>Adults</label>
                <input
                  type="number"
                  className={FIELD}
                  min="1"
                  name="adult"
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={LABEL}>Number of Rooms</label>
                <input
                  type="number"
                  className={FIELD}
                  min="1"
                  name="noOfRooms"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={LABEL}>Description</label>
              <textarea
                rows={8}
                className={`${FIELD} resize-y`}
                placeholder="Room description..."
                name="roomDescription"
                onChange={handleInputChange}
              />
            </div>

            {/* Facilities */}
            <div className="rounded-sm">
              <label className="block text-sm font-medium text-app-text dark:text-app-text-muted mb-2">
                Facilities
              </label>
              <div className="flex flex-wrap gap-3">
                {facilitiesList.map((facility, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleFacilityToggle(facility)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedFacilities.includes(facility)
                        ? "bg-primary border-primary text-white"
                        : "bg-app-surface border-primary/20 text-app-text hover:border-primary/50"
                    }`}
                  >
                    {facility}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Images */}
            <div>
              <label className="block text-sm font-medium text-app-text dark:text-app-text-muted mb-2">
                Upload Images
              </label>
              <input
                ref={inputFileRef}
                type="file"
                multiple
                hidden
                onChange={handleImageUpload}
              />
              <div
                className="flex items-center gap-2 w-fit text-sm bg-app-surface hover:bg-primary hover:text-white py-2 px-4
            rounded-sm border border-primary/20 text-app-text font-medium cursor-pointer duration-300"
                onClick={() => inputFileRef?.current?.click()}
              >
                <button type="button" className="cursor-pointer">
                  Upload
                </button>
                <PiUploadSimpleBold size={22} />
              </div>
              {/* Preview */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <div className="w-full h-40 overflow-hidden rounded-lg border border-app-border bg-app-surface">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`upload-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className="absolute -right-2 -top-2 size-6 flex justify-center items-center text-xs font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer rounded-full shadow transition-colors"
                      onClick={() => handleRemoveImages(img)}
                    >
                      X
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity">
                Add Room {addLoading && <Loader size={20} color="white" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingSetup;