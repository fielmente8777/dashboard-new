import { useState } from "react";
import { MdOutlineNavigateNext, MdOutlineNavigateBefore } from "react-icons/md";

const RoomsCard = ({
  roomImage,
  price,
  noOfRooms,
  roomSubheading,
  roomName,
  roomTypeName,
  roomDescription,
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleImageNext = () => {
    if (imageIndex === roomImage.length - 1) return;
    setImageIndex((pre) => pre + 1);
  };

  const handleImagePrev = () => {
    if (imageIndex === 0) return;
    setImageIndex((pre) => pre - 1);
  };

  return (
    <div className="border border-gray-300 rounded-md shadow-sm">
      <div>
        <div className="h-60 w-full relative">
          <img
            src={roomImage[imageIndex]}
            alt="rooms-image"
            className="object-cover h-full w-full"
          />

          <div className="absolute inset-0 flex items-center z-40">
            <div className="w-full flex justify-between px-5">
              <div
                className="size-6 bg-white cursor-pointer rounded-full flex items-center justify-center"
                onClick={() => handleImagePrev()}
              >
                <MdOutlineNavigateBefore />
              </div>
              <div
                className="size-6 bg-white cursor-pointer rounded-full flex items-center justify-center"
                onClick={() => handleImageNext()}
              >
                <MdOutlineNavigateNext />
              </div>
            </div>
          </div>

          <div className="absolute w-fit right-1 top-1 bg-white/80 px-2 text-sm rounded-full font-medium tracking-widest z-30">
            <h2>{roomTypeName}</h2>
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
