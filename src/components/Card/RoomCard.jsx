import axios from "axios";
import { useState } from "react";
import { MdOutlineNavigateNext, MdOutlineNavigateBefore, MdDeleteOutline } from "react-icons/md";
import Swal from "sweetalert2";
import { deleteRoom } from "../../services/api/bookingEngine";
import { useDispatch } from "react-redux";
import { fetchAllRooms } from "../../redux/slice/bookingEngine";
import handleLocalStorage from "../../utils/handleLocalStorage";

const RoomsCard = ({
  roomImage,
  price,
  noOfRooms,
  roomSubheading,
  roomName,
  roomTypeName,
  roomType,
  roomDescription,
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const dispatch = useDispatch();

  const handleImageNext = () => {
    if (imageIndex === roomImage.length - 1) return;
    setImageIndex((pre) => pre + 1);
  };

  const handleImagePrev = () => {
    if (imageIndex === 0) return;
    setImageIndex((pre) => pre - 1);
  };


  const handleDelete = async (roomId) => {

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete this room. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await deleteRoom(localStorage.getItem("token"), localStorage.getItem("hid"), roomId)
        if (response?.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Room deleted successfully.",
            confirmButtonText: "OK",
          })
          dispatch(fetchAllRooms(handleLocalStorage("token"), handleLocalStorage("hid")));
        }
        else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response?.message || "Something went wrong while deleting the room.",
            confirmButtonText: "OK",
          })
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Something went wrong while deleting the room.",
          confirmButtonText: "OK",
        })
      }
    }
  }
  return (
    <div className="border border-gray-300 rounded-md shadow-sm">
      <div>
        <div className="h-60 w-full relative">
          <img
            src={roomImage[imageIndex]}
            alt="rooms-image"
            className="object-cover h-full w-full"
          />

          <div className="absolute inset-0 flex items-center z-10">
            <div className="w-full flex justify-between px-5">
              <div
                className="size-7 bg-white cursor-pointer rounded-full flex items-center justify-center hover:scale-95 hover:bg-primary hover:text-white duration-150"
                onClick={() => handleImagePrev()}
              >
                <MdOutlineNavigateBefore />
              </div>
              <div
                className="size-7 bg-white cursor-pointer rounded-full flex items-center justify-center  hover:scale-95 hover:bg-primary hover:text-white duration-150"
                onClick={() => handleImageNext()}
              >
                <MdOutlineNavigateNext />
              </div>
            </div>
          </div>

          <div className="absolute w-fit right-1 top-1 bg-white/80 px-2 text-sm rounded-full font-medium tracking-widest z-10">
            <h2>{roomTypeName}</h2>
          </div>
          <div onClick={() => handleDelete(roomType)} className="absolute w-fit right-1 top-10 bg-white/80 px-2 text-sm rounded-full font-medium tracking-widest z-10">
            <MdDeleteOutline size={22} color="#df4545" />
          </div>

          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      <div className="space-y-2 p-3">
        <h2 className="text-xl font-semibold">{roomName}</h2>
        <h2 className="font-medium">{roomSubheading}</h2>
        <p className="text-gray-500">
          {showFullDescription
            ? roomDescription
            : roomDescription.slice(0, 150)}{" "}
          <span
            className="text-blue-600 cursor-pointer font-medium"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? "Read less" : "more..."}
          </span>
        </p>
        {/* <h2>{roomTypeName}</h2> */}
        {/* <h2>{noOfRooms}</h2> */}
        <div>
          <span className="font-bold text-md">₹{price}</span>
        </div>
      </div>
    </div>
  );
};

export default RoomsCard;
