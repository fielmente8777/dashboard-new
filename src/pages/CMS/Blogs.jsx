import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { GetwebsiteDetails, UploadingImageS3 } from "../../services/api";
import JoditEditor from "jodit-react";
import { FileUploader } from "react-drag-drop-files";
import { useSelector } from "react-redux";
import handleLocalStorage from "../../utils/handleLocalStorage";
const fileTypes = ["JPG", "PNG", "GIF", "JPEG", "WEBP"];
const Blogs = () => {
  const editor = useRef(null);
  //   const [editable, setEditable] = useState("None");
  const [blogText, setBlogText] = useState("");

  const [formData, setFormData] = useState({
    heading: "",
    text: "",
    slug: "",
    image: "",
  });

  const [selectedImage, setSelectedImage] = useState("");
  const [base64String, setBase64String] = useState(null);

  const { currentLoactionWebsiteData, loading } = useSelector(
    (state) => state?.hotelsWebsiteData
  );

  const autoGenerateSlug = (text) => {
    const slug = text
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-") // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end

    setFormData({ ...formData, slug: slug });
  };

  const handleChange = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1];
      setSelectedImage(URL.createObjectURL(file));
      setBase64String(base64);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
    // setSelectedImage(URL.createObjectURL(file));
  };
  // const uploadImage = async (e) => {
  //     e.preventDefault();
  //     const imageInput = document.getElementById("file");
  //     const file = imageInput.files[0];
  //     if (!file) {
  //         Swal.fire({
  //             icon: 'error',
  //             title: 'Error',
  //             text: 'Please select an image file.',
  //             confirmButtonText: 'OK',
  //         });
  //         return;
  //     }

  //     // console.log(file)

  //     const reader = new FileReader();
  //     reader.onloadend = async () => {
  //         const base64String = reader.result.split(",")[1];

  //         // setBase64String(base64String)

  //         // console.log(base64String)

  //         // const Url = await UploadingImageS3(base64String);
  //         // console.log(Url)
  //         // setFormData({ ...formData, image: Url });
  //     };
  //     reader.readAsDataURL(file);
  // }

  //   add blog function call
  const addBlog = async () => {
    if (!formData.heading || !formData.slug || !blogText || !selectedImage) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please fill all the fields.",
        confirmButtonText: "OK",
      });
      return;
    }

    const Url = await UploadingImageS3(base64String);

    try {
      const response = await fetch(`https://nexon.eazotel.com/cms/add/blog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Heading: formData?.heading,
          Slug: formData.slug,
          Text: blogText,
          Image: Url,
          token: localStorage.getItem("token"),
          operation: "append",
          hid: String(handleLocalStorage("hid")),
        }),
      });
      const result = await response.json();

      console.log(result);
    } catch (error) {
      console.error("Error adding blog:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add blog. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleChangeJodit = (idx, name, value) => {
    console.log("value", blogText);
    // const updatedTerms = [...termsAndCondition]; // Create a copy of the array
    // updatedTerms[idx][name] = value; // Update the value at the specified index
    // setTermsAndCondition(updatedTerms); // Update the state with the modified array
  };

  useEffect(() => {
    if (formData.heading) {
      autoGenerateSlug(formData.heading);
    }
  }, [formData.heading]);

  return (
    <div className="bg-white  p-4">
      <div className="">
        <h2 className="text-sm font-semibold text-[#575757]">All Blogs</h2>
      </div>

      <hr className="mt-2" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
            <div
              key={index}
              className="bg-gray-100 animate-pulse rounded-md p-4"
            >
              <h3 className="text-lg font-semibold text-[#575757]">
                Loading...
              </h3>
              <p className="text-sm text-gray-600 mt-2">Loading...</p>
              <a href="#" className="text-blue-500 hover:underline mt-2 block">
                Loading...
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {currentLoactionWebsiteData &&
          currentLoactionWebsiteData?.Blogs?.length > 0 ? (
            currentLoactionWebsiteData?.Blogs?.map((blog, index) => (
              <div key={index} className="bg-gray-100  rounded-md p-4">
                <h3 className="text-lg font-semibold text-[#575757]">
                  {blog.Heading}
                </h3>
                <p className="text-sm text-gray-600 mt-2">{blog.Text}</p>
                <a
                  href={blog?.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-2 block"
                >
                  Read More
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-2xl">No Blogs Found!❌</p>
          )}
        </div>
      )}

      <div className="mt-5">
        <h2 className="text-sm font-semibold capitalize text-[#575757]">
          Add new blog
        </h2>
      </div>

      <hr className="mt-2" />
      <div className="mt-2">
        <label
          htmlFor="heading"
          className="text-sm font-semibold text-[#575757] mt-4"
        >
          Heading
        </label>
        <input
          type="text"
          id="heading"
          className="w-full border outline-none text-[#575757]/70 border-gray-300 rounded p-2 mt-2"
          placeholder="Enter Heading"
          value={formData.heading}
          onChange={(e) =>
            setFormData({ ...formData, heading: e.target.value })
          }
        />
      </div>
      <div className="mt-2">
        <label
          htmlFor="slug"
          className="text-sm font-semibold text-[#575757] mt-4"
        >
          Slug
        </label>
        <input
          type="text"
          id="slug"
          className="w-full border outline-none text-[#575757]/70  border-gray-300 rounded p-2 mt-2"
          placeholder="Auto generated slug"
          disabled={true}
          value={formData.slug}
        />
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-semibold text-[#575757] ">
            Preview Banner Image
          </h1>
          {selectedImage && (
            <button
              onClick={() => setSelectedImage("")}
              className="py-1 px-5 text-sm text-white bg-red-700 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="h-[40dvh]">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Preview"
              className=" border w-full object-cover object-top h-full rounded"
            />
          ) : (
            <FileUploader
              handleChange={handleChange}
              name="selectedImage"
              id="file"
              className="h-full w-full"
              dropMessageStyle={{ height: "100%", color: "black" }}
              types={fileTypes}
            />
          )}
        </div>
        <div></div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="text"
          className="text-sm font-semibold text-[#575757] mt-4"
        >
          Text
        </label>
        <JoditEditor
          ref={editor}
          value={blogText}
          onChange={(newContent) => {
            setBlogText(newContent);
            handleChangeJodit(newContent);
          }}
          className="mt-2"
        />
      </div>

      <div>
        <button
          onClick={addBlog}
          className="py-2 px-5 text-sm text-white bg-primary rounded-sm font-semibold mt-4"
        >
          Add Blog
        </button>
      </div>

      {/* why-Varanasi-Is-Always-a-Good-Idea-Yes-even-in-Summer */}

      <div
        className="mt-12 flex flex-col gap-4 policy_content"
        dangerouslySetInnerHTML={{
          __html: blogText,
        }}
      />
    </div>
  );
};

export default Blogs;

// "https://eazotel-client-webp-image.s3.ap-south-1.amazonaws.com/minimalist/events/eventnew.png"

// const handleImageSelection = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//             setSelectedImage(reader.result);
//         };
//         reader.readAsDataURL(file);
//     }
// }
