import React, { useState } from 'react'
import { MdDeleteOutline, MdOutlineNavigateBefore, MdOutlineNavigateNext } from 'react-icons/md';

const AdsPackage = ({ packageImage, packageName, packageDesc, packagePrice, packageId, DeleteMealPackage }) => {

    const [imageIndex, setImageIndex] = useState(0);

    const handleImageNext = () => {
        if (imageIndex === packageImage.length - 1) return;
        setImageIndex((pre) => pre + 1);
    };

    const handleImagePrev = () => {
        if (imageIndex === 0) return;
        setImageIndex((pre) => pre - 1);
    };
    return (
        <div className="">
            <div className="md:h-96 w-full relative">
                <img
                    src={packageImage[imageIndex]}
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


                <span className="absolute top-2 right-2 bg-white z-20">
                    <MdDeleteOutline
                        size={28}
                        onClick={() => { DeleteMealPackage(packageId) }}
                        className="absolute top-3 right-3 cursor-pointer bg-white p-1 text-red-600 rounded-full text-md"
                    />
                </span>
                <div className="absolute  inset-0 bg-black/10" />
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="text-md font-medium text-[#575771] mt-2">{packageName}</h1>
                <p className="text-[#575771]/80">{packageDesc}</p>
                <p className="font-semibold text-[#575771]">₹ {packagePrice}</p>
            </div>
        </div>
    )
}

export default AdsPackage