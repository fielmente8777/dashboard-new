import { useEffect, useRef, useState } from "react";
import { facilitiesList, roomTypes } from "./Data";
import { PiUploadSimpleBold } from "react-icons/pi";
import { addRoom } from "../../services/api/bookingEngine";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { UploadingImageS3 } from "../../services/api/s3Image.api";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRooms } from "../../redux/slice/bookingEngine";
import RoomsCard from "../../components/Card/RoomCard";

const Tabs = ["All Rooms", "Add Rooms"];

const BookingSetup = () => {
  const dispatch = useDispatch();
  const inputFileRef = useRef(null);
  const [activeTab, setActiveTab] = useState("All Rooms");
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [images, setImages] = useState([]);
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

    const newRoomData = {
      roomType: formData?.roomType,
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

    const response = await addRoom(newRoomData);
    console.log(response);
  };

  useEffect(() => {
    const token = handleLocalStorage("token");
    const hid = handleLocalStorage("hid");
    dispatch(fetchAllRooms(token, hid));
  }, []);

  return (
    <div className="bg-white p-4">
      <div className="flex gap-2 items-center divide-x divixe-gray-200 font-medium">
        {Tabs?.map((item, index) => (
          <button
            onClick={() => setActiveTab(item)}
            key={index}
            className={`px-4 py-1 text-primary rounded-sm ${
              activeTab.toLocaleLowerCase() === item.toLocaleLowerCase()
                ? "bg-primary text-white duration-500"
                : "bg-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {activeTab.toLocaleLowerCase() === "all rooms" && (
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-4">
            {allRooms?.map((item) => (
              <RoomsCard {...item} />
            ))}
          </div>
        </div>
      )}

      {activeTab.toLocaleLowerCase() === "add rooms" && (
        <form
          onSubmit={handleFormSubmit}
          className="mx-auto px-4 py-2 rounded-2xl space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            Room Setup Form
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ">
                Room Type
              </label>
              <select
                name="roomType"
                className="w-full border rounded-md p-2 outline-none border-primary/20 focus:border-primary/50"
                onChange={handleInputChange}
              >
                {roomTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Name
              </label>
              <input
                className="w-full rounded-md p-2 outline-none border border-primary/20 focus:border-primary/50"
                name="roomName"
                placeholder="Enter room name"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Room Subheading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Subheading
              </label>
              <input
                className="w-full border rounded-md p-2 outline-none border-primary/20 focus:border-primary/50"
                name="roomSubheading"
                placeholder="Enter subheading"
                onChange={handleInputChange}
              />
            </div>

            {/* price  */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (per night)
              </label>
              <input
                type="number"
                className="w-full border rounded-md p-2 outline-none border-primary/20 focus:border-primary/50"
                min="0"
                name="price"
                placeholder="Enter price"
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Children
              </label>
              <input
                type="number"
                className="w-full border rounded-md p-2 outline-none border-primary/20 focus:border-primary/50"
                min="0"
                name="child"
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 border-primary/40 focus:border-primary/50">
                Adults
              </label>
              <input
                type="number"
                className="w-full border rounded-md p-2 outline-none border-primary/20 focus:border-primary/50"
                min="1"
                name="adult"
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Rooms
              </label>
              <input
                type="number"
                className="w-full border rounded-md p-2 outline-none border-primary/20 focus:border-primary/50"
                min="1"
                name="noOfRooms"
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={8}
              className="w-full border rounded-md p-2 outline-none border-primary/20 focus:border-primary/50"
              placeholder="Room description..."
              name="roomDescription"
              onChange={handleInputChange}
            />
          </div>

          {/* Facilities */}
          <div className="rounded-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities
            </label>
            <div className="flex flex-wrap gap-3">
              {facilitiesList.map((facility, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleFacilityToggle(facility)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedFacilities.includes(facility)
                      ? "bg-primary/90 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="flex items-center gap-2 w-fit text-sm hover:bg-primary hover:text-white py-2 px-4
            rounded-sm border border-primary/20 text-primary font-medium cursor-pointer duration-300"
              onClick={() => inputFileRef?.current?.click()}
            >
              <button>Upload</button>
              <PiUploadSimpleBold size={22} />
            </div>
            {/* Preview */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <div className="w-full h-40 overflow-hidden rounded-lg border">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`upload-${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute right-0 -top-5 size-5 flex justify-center items-center text-xs font-semibold bg-primary text-white cursor-pointer rounded-full"
                    onClick={() => handleRemoveImages(img)}
                  >
                    X
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button className=" bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Add Room
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingSetup;

// function BookingSetup() {
//   const { baseUrl, EngineNewUrl } = useContext(AuthContext);
//   const [Image, setImage] = useState([]); //upload from S3

//   const { RoomsData, setRoomsData, fetchRoomsData } = useContext(AuthContext);
//   const [roomImages, setRoomImages] = useState([]); //upload from local
//   const [roomType, setRoomType] = useState("1");
//   const [roomName, setRoomName] = useState("");
//   const [roomSubheading, setRoomSubheading] = useState("");
//   const [roomDescription, setRoomDescription] = useState("");
//   const { selectedFacilities, setSelectedFacilities } = useContext(AuthContext);
//   const [child, setChild] = useState("");
//   const [adult, setAdult] = useState("");
//   const [noOfRooms, setNoOfRooms] = useState("");
//   const [price, setPrice] = useState("");

//   const get = `${EngineNewUrl}/room/${localStorage.getItem(
//     "Token"
//   )}/${localStorage.getItem("hotelLocationId")}`;
//   const post = `${EngineNewUrl}/room/create/${localStorage.getItem("Token")}`;

//   const facilitiesData = [
//     "wifi",
//     "television",
//     "airConditonar",
//     "hairdryers",
//     "coffeeMakers",
//     "directDial",
//     "tableWithChair",
//     "alarmclock",
//     "electronicLocker",
//     "fridge",
//     "bathroomWithShower",
//     "freeBreakfast",
//     "kidEquipment",
//     "Balcony",
//     "Bath",
//     "View",
//     "FlatscreenTV",
//     "Privatepool",
//     "Electrickettle",
//     "Spabath",
//     "RoomAmenities",
//     "Cots",
//     "Clothesrack",
//     "FoldupBed",
//     "SofaBed",
//     "Trashcans",
//     "Heatedpool",
//     "Infinitypool",
//     "Plungepool",
//     "Poolcover",
//     "Pooltowels",
//     "Rooftoppool",
//     "Dressingroom",
//     "Fan",
//     "Fireplace",
//     "Heating",
//     "Iron",
//     "Ironingfacilities",
//     "Hottub",
//     "Mosquitonet",
//     "PrivateEntrance",
//     "Sofa",
//     "Soundproofing",
//     "SeatingArea",
//     "Pantspress",
//     "Washingmachine",
//     "Desk",
//     "Hypoallergenic",
//     "Cleaningproducts",
//     "Pajamas",
//     "Yukata",
//     "Adapter",
//     "Featherpillow",
//     "Non_feather_pillow",
//     "Bathroom",
//     "Privatebathroom",
//     "Shared_bathroom",
//     "Toilet_paper",
//     "Bidet",
//     "Bath_shower",
//     "Bathrobe",
//     "Free_toiletries",
//     "Additional_toilet",
//     "Hairdryer",
//     "Shared_toilet",
//     "Sauna",
//     "Shower",
//     "Slippers",
//     "Toilet",
//     "Additional_bathroom",
//     "Toothbrush",
//     "Shampoo",
//     "Conditioner",
//     "Cd_player",
//     "Dvd_player",
//     "Fax",
//     "Radio",
//     "Satellitechannels",
//     "Telephone",
//     "Tv",
//     "Smartphone",
//     "Streamingservice_like_Netflix",
//     "Dining_table",
//     "Bottle_of_water",
//     "Chocolate_or_cookies",
//     "Fruits",
//     "Barbecue",
//     "Oven",
//     "Stovetop",
//     "Toaster",
//     "Dishwasher",
//     "Outdoor_furniture",
//     "Minibar",
//     "Kitchen",
//     "Key_card_access",
//     "Lockers",
//     "Key_access",
//     "Alarm_clock",
//     "Wake_up_service",
//     "Linen",
//     "Blanket",
//     "Extra_blankets",
//     "Pillow",
//     "Towels",
//     "Patio",
//     "City_view",
//     "Garden_view",
//     "Lake_view",
//     "Landmark_view",
//     "Mountain_view",
//     "Pool_view",
//     "River_view",
//     "Sea_view",
//     "Hearingaccessible",
//     "Adaptedbath",
//     "Raisedtoilet",
//     "Loweredsink",
//     "Showerchair",
//     "Entertainment_family_services",
//     "Baby_safety_gates",
//     "Books",
//     "DVDs",
//     "Smokealarm",
//     "Fire_extinguisher",
//     "Safety_features",
//     "Air_purifiers",
//     "Physicaldistancing",
//     "Handsanitiser",
//   ];

//   const headers = {
//     Accept: "application/json, text/plain, /",
//     "Content-Type": "application/json",
//   };

//   // GET All room API
//   useEffect(() => {
//     fetchRoomsData();
//   }, []);

//   // Add Room API

//   const handleSubmit = async (e) => {
//     console.log(roomType);

//     e.preventDefault();
//     const newRoomData = {
//       roomType: roomType,
//       hId: localStorage.getItem("hotelLocationId"),
//       roomName: roomName,
//       roomSubheading: roomSubheading,
//       roomDescription: roomDescription,
//       facilities: selectedFacilities,
//       child: child,
//       adult: adult,
//       noOfRooms: noOfRooms,
//       price: price,
//       roomImage: Image,
//     };
//     const responseRoomData = {
//       roomType: roomType,
//       hId: localStorage.getItem("hotelLocationId"),
//       roomName: roomName,
//       roomDescription: roomDescription,
//       child: child,
//       adult: adult,
//       noOfRooms: noOfRooms,
//       price: price,
//       roomImage: Image,
//       roomFacilities: selectedFacilities,
//       roomSubheading: roomSubheading,
//       isWeekendFormat: "false",
//       changedPrice: {
//         weekend: price,
//         weekday: price,
//       },
//     };

//     try {
//       const response = await fetch(post, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(responseRoomData),
//       });

//       if (!response.ok) {
//         console.error(`Error: ${response.status} - ${response.statusText}`);
//       } else {
//         const d = await response.json();
//         console.log(d);
//         if (response.status) {
//           fetchRoomsData();
//         } else {
//           console.log("roomdata has successfully set");

//           setRoomsData([...RoomsData, newRoomData]);
//         }
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//     setRoomType("");
//     setRoomName("");
//     setRoomSubheading("");
//     setRoomDescription("");
//     setSelectedFacilities([]);
//     setChild("");
//     setAdult("");
//     setImage([]);
//     setNoOfRooms("");
//     setPrice("");
//   };

//   const handleImageChange = (e) => {
//     const files = e.target.files;

//     if (files.length > 0) {
//       const newRoomImages = [];

//       for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         const imageUrl = URL.createObjectURL(file);

//         newRoomImages.push(imageUrl);
//       }
//       setRoomImages(newRoomImages);
//     }
//   };

//   // const handleFacilitiesChange = (e) => {
//   //     const inputValue = e.target.value;

//   //     if (inputValue) {
//   //         const facilitiesArray = inputValue.split(',').map((facility) => facility.trim());
//   //         setFacilities(facilitiesArray);
//   //     } else {
//   //         setFacilities([]);
//   //     }
//   // };

//   const handleCheckboxChange = (facilityId) => {
//     // if selected then unselect
//     if (selectedFacilities.includes(facilityId)) {
//       setSelectedFacilities(
//         selectedFacilities.filter((id) => id !== facilityId)
//       );
//     }
//     // if not selected then select it
//     else {
//       setSelectedFacilities([...selectedFacilities, facilityId]);
//     }
//   };

//   // console.log(selectedFacilities)

//   function uploadImage(e) {
//     e.preventDefault();
//     const imageInput = document.getElementById("fileimg");
//     const files = imageInput.files;

//     if (files.length === 0) {
//       alert("Please select at least one image file.");
//       return;
//     }

//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];

//       const reader = new FileReader();
//       reader.onloadend = function () {
//         const base64String = reader.result.split(",")[1];
//         UploadingImageS3(base64String);
//       };

//       reader.readAsDataURL(file);
//     }
//   }

//   function UploadingImageS3(base64String) {
//     fetch(`${EngineNewUrl}/upload/file/image`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         token: window.localStorage.getItem("Token"),
//         image: base64String,
//       }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         setImage((prevImages) => prevImages.concat(data.Image));

//         document.getElementById("fileimg").value = null;
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   }

//   return (
//     <div className="cms_booking_setup">
//       <div className="d-flex justify-content-between my-3">
//         <h5>Step 1</h5>
//       </div>
//       <form onSubmit={handleSubmit}>
//         <div className="row setup_content">
//           <div className="first col-md-6">
//             <div className="BookingSetup_div">
//               <label htmlFor="/">Room Type:</label>
//               <select
//                 id="roomType"
//                 value={roomType}
//                 onChange={(e) => {
//                   setRoomType(e.target.value);
//                 }}
//                 style={{
//                   width: "60%",
//                   borderRadius: "5px",
//                   border: "1px solid #eceaea",
//                   padding: "10px 15px",
//                 }}
//               >
//                 <option value="1">Deluxe</option>
//                 <option value="2">Super Deluxe</option>
//                 <option value="3">Suite</option>
//                 <option value="4">Premium</option>
//                 <option value="5">Premiere Retreat</option>
//                 <option value="6">Elite Suite</option>
//                 <option value="7">Grand Deluxe</option>
//                 <option value="8">Imperial Suite</option>
//                 <option value="9">Supreme Retreat</option>
//                 <option value="10">Royal Deluxe</option>
//                 <option value="11">Prestige Suite</option>
//                 <option value="12">Exclusive Retreat</option>
//               </select>
//             </div>
//             <div className="BookingSetup_div">
//               <label htmlFor="/">Room Name:</label>
//               <input
//                 type="text"
//                 id="roomName"
//                 placeholder="Room Name"
//                 value={roomName}
//                 onChange={(e) => setRoomName(e.target.value)}
//               />
//             </div>
//             <div className="BookingSetup_div">
//               <label htmlFor="/">Room Subheading:</label>
//               <input
//                 type="text"
//                 id="roomSubheading"
//                 placeholder="Room Subheading"
//                 value={roomSubheading}
//                 onChange={(e) => setRoomSubheading(e.target.value)}
//               />
//             </div>
//             <div className="BookingSetup_div">
//               <label htmlFor="/">Room Description:</label>
//               <textarea
//                 textarea
//                 name="w3review"
//                 rows="1"
//                 style={{
//                   width: "60%",
//                   borderRadius: "5px",
//                   border: "1px solid #eceaea",
//                   padding: "10px 15px",
//                 }}
//                 type="textarea"
//                 id="roomDescription"
//                 placeholder="Room Description"
//                 value={roomDescription}
//                 onChange={(e) => setRoomDescription(e.target.value)}
//               />
//             </div>
//             <div className="BookingSetup_div">
//               <label htmlFor="/">Choose Facilities :</label>

//               <div class="dropdown">
//                 <button
//                   class="btn btn-secondary dropdown-toggle"
//                   type="button"
//                   id="dropdownMenuButton1"
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   Facilities
//                 </button>
//                 <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
//                   <li>
//                     <a class="dropdown-item">
//                       <div class="scrollable-content">
//                         {facilitiesData.map((facility) => (
//                           <div className="form-check row w-100">
//                             <input
//                               type="checkbox"
//                               className="form-check-input col-md-1"
//                               checked={selectedFacilities.includes(facility)}
//                               onChange={() => handleCheckboxChange(facility)}
//                             />
//                             <label className="form-check-label col-md-10 ">
//                               {facility}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     </a>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//           <div className="second col-md-6">
//             <div className="BookingSetup_div">
//               <label htmlFor="/">Child:</label>
//               <input
//                 type="number"
//                 id="child"
//                 placeholder="Child"
//                 value={child}
//                 onChange={(e) => setChild(e.target.value)}
//               />
//             </div>
//             <div className="BookingSetup_div">
//               <label htmlFor="/">Adult:</label>
//               <input
//                 type="number"
//                 id="adult"
//                 placeholder="Adult"
//                 value={adult}
//                 onChange={(e) => setAdult(e.target.value)}
//               />
//             </div>
//             <div className="BookingSetup_div">
//               <label htmlFor="/">No of Rooms:</label>
//               <input
//                 type="number"
//                 id="noOfRooms"
//                 placeholder="No Of Rooms"
//                 value={noOfRooms}
//                 onChange={(e) => setNoOfRooms(e.target.value)}
//               />
//             </div>
//             <div className="BookingSetup_div">
//               <label htmlFor="/">Price:</label>
//               <input
//                 type="number"
//                 id="price"
//                 placeholder="Price"
//                 value={price}
//                 onChange={(e) => setPrice(e.target.value)}
//               />
//             </div>
//           </div>
//         </div>

//         <div className="cmsForm_div">
//           <div className="cmsForm_div cmsimgdiv">
//             <div className="CmsNearImglabel">
//               <label htmlFor="/">Image:</label>
//               <button className="upload">
//                 <span className="cmsupldspn">Upload Image</span>
//                 <FaPlus className="cmsplusicon" />
//                 <input
//                   type="file"
//                   id="fileimg"
//                   onChange={uploadImage}
//                   multiple
//                 />
//               </button>
//             </div>
//             <div className="upl_img">
//               {Image.map((img) => {
//                 return <img src={img} alt="" />;
//               })}
//             </div>
//           </div>
//         </div>
//         <div className="d-flex justify-content-center">
//           <button type="submit" className="addbtn mt-4">
//             Add Room
//           </button>
//         </div>
//       </form>
//       {/* <SaveBtn /> */}
//       <BookingEngineRoomCard />
//     </div>
//   );
// }

// export default BookingSetup;
