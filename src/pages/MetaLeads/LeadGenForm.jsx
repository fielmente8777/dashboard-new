// LeadGenForm.tsx
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../../data/constant";
import { fetchLeadGenForm } from "../../redux/slice/MetaLeads";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { MdEditNote, MdDeleteForever, MdOutlineEdit } from "react-icons/md";
import { TbEditOff } from "react-icons/tb";

import { BiSolidEditAlt } from "react-icons/bi";
import { HiPlusSm } from "react-icons/hi";
import {
  deleteLeadGenForm,
  getLeadGenFromData,
  getLeadGenFromFields,
  UpdateLeadGenForm,
} from "../../services/api/MetaLeads.api";
import { IoMdEye, IoIosEyeOff } from "react-icons/io";
import Swal from "sweetalert2";
import { UploadingImageS3 } from "../../services/api/s3Image.api";
import Modal from "../../components/Modal/Modal";
import { FaCopy } from "react-icons/fa";
import { Link } from "react-router-dom";

const LeadGenForm = () => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(null);
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    field_label: "", // corresponds to "Name"
    field_placeholder: "", // corresponds to "Enter your name"
    field_type: "text", // corresponds to input type
    index: 0, // position in form
    is_required: false,
    status: true, // visible/enabled field
    step: 1, // for multi-step forms
    validation: {
      max_length: 50,
      min_length: 2,
      pattern: "",
    },
    options: [], // only used for 'select' or 'checkbox' types — can remove if not needed initially
  });

  const [isBannerContentEdit, setIsBannerContentEdit] = useState(false);
  const [isSelectedField, setIsSelectedField] = useState(false);
  const [isNewFormOpen, setisNewFormOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editFieldsData, setEditFieldsData] = useState([]);
  const [index, setIndex] = useState(null);
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);

  const [base64Image, setBase64Image] = useState(null);
  const [base64CoverImage, setBase64CoverImage] = useState(null);
  const [previewImageLogo, setPreviewImageLogo] = useState(null);
  const [previewImageCover, setPreviewImageCover] = useState(null);

  const fileInputRef = useRef(null);
  const fileInputRefCoverImage = useRef(null);
  const bannerHeadingRef = useRef(null);

  const dispatch = useDispatch();
  const { data: LeadGenFormData, loading: isLeadGenFormLoading } = useSelector(
    (state) => state?.metaLeads
  );

  console.log(isLeadGenFormLoading);

  // handleCreateLeadGenForm

  const handleCreateFormSubmit = async (e) => {
    setLoading(true);
    if (!title) {
      setTitleError("Title is required");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/leadgen/create-lead-gen-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${handleLocalStorage("token")}`,
        },
        body: JSON.stringify({
          // Replace this with the data you want to send
          hId: String(handleLocalStorage("hid")),
          title: title,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create form");
      }
      setisNewFormOpen(false);
      setTitle("");
      dispatch(
        fetchLeadGenForm(handleLocalStorage("token"), handleLocalStorage("hid"))
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Form Created Successfully",
        confirmButtonText: "OK",
      });

      // adjust according to response structure
    } catch (err) {
      console.error("Error fetching form", err);
    } finally {
      setTitle("");
      setLoading(false);
    }
  };

  const handleDelete = async (form_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const token = handleLocalStorage("token");
      const response = await deleteLeadGenForm(token, form_id);
      console.log(response);
      dispatch(
        fetchLeadGenForm(handleLocalStorage("token"), handleLocalStorage("hid"))
      );
    });
  };

  // handle function for add field dymacially
  // const addField = () => {
  //   if (!newField.field_label) return alert("Label is required");
  //   const isOptionField = newField.type === "select"; // or include "checkbox" if needed

  //   const fieldToAdd = {
  //     ...newField,
  //     ...(isOptionField ? { options: newField.options } : {}),
  //   };

  //   setFields([...fields, fieldToAdd]);

  //   setNewField({
  //     type: "text",
  //     label: "",
  //     placeholder: "",
  //     required: false,
  //     visible: true,
  //   });
  // };

  // handle selection for field from field controls
  const handleSelectField = (field) => {
    setIsSelectedField(true);
    const updatedField = {
      ...field,
      field_label: "Label",
      field_placeholder: "Placeholder",
      index: formData?.form_fields?.length + 1,
    };

    setFormData({
      ...formData,
      form_fields: [...formData.form_fields, updatedField],
    });

    setEditFieldsData([...editFieldsData, updatedField]);
  };

  //  handle edit form
  const handleEditForm = (e, field) => {
    e.preventDefault();
    setFormData({
      ...field,
    });
    setEditFieldsData([...editFieldsData, ...field.form_fields]);
  };

  //  handle edit form field
  const handleEditField = (e, field, index) => {
    e.preventDefault();
    setIndex(index);
    // const isExist = editFieldsData.find(
    //   (f) => f.field_label === field.field_label
    // );

    // if (!isExist) setEditFieldsData([...editFieldsData, field]);

    setEditField({
      ...editField,
      ...field,
    });
  };

  const handledeleteField = (e, field, index) => {
    setEditField(true);
    e.preventDefault();
    setIndex(index);
    setFormData({
      ...formData,
      form_fields: formData.form_fields?.filter(
        (f) => f.field_label !== field.field_label
      ),
    });
  };

  // toggle the visibility for input fields
  const toggleVisibility = (e, lable) => {
    e.preventDefault();
    setIsSelectedField(true);
    setFormData({
      ...formData,
      form_fields: formData.form_fields?.map((f) =>
        f.field_label === lable ? { ...f, status: !f.status } : f
      ),
    });

    setEditFieldsData([
      ...formData.form_fields?.map((f) =>
        f.field_label === lable ? { ...f, status: !f.status } : f
      ),
    ]);
  };

  const handleUpdateChanges = async (e) => {
    e.preventDefault();
    if (isLocalUpdate) {
      setFormData({
        ...formData,
        form_fields: editFieldsData,
      });
    }
  };

  const handleFileChangeLogoImage = async (e) => {
    e.preventDefault();
    setIsSelectedField(true);
    const file = e.target.files[0];
    setPreviewImageLogo(URL.createObjectURL(file));

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
      setBase64Image(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChangeCoverImage = async (e) => {
    e.preventDefault();
    setIsSelectedField(true);
    const file = e.target.files[0];
    setPreviewImageCover(URL.createObjectURL(file));

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
      setBase64Image(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handlePublishChanges = async (e) => {
    // const imageUrl = await UploadingImageS3(base64Image);
    // console.log(imageUrl);
    try {
      const response = await UpdateLeadGenForm(
        handleLocalStorage("token"),
        formData
      );
      if (response?.Status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Form Updated Successfully",
          confirmButtonText: "OK",
        });
        setFormData(null);
        setEditField(null);
        setIsLocalUpdate(false);
        setEditFieldsData([]);
        dispatch(
          fetchLeadGenForm(
            handleLocalStorage("token"),
            handleLocalStorage("hid")
          )
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
        confirmButtonText: "OK",
      });
    }
  };

  const fetchFormFields = async () => {
    const formFields = await getLeadGenFromFields(handleLocalStorage("token"));
    setFields([...formFields?.Data]);
  };

  // useEffect to dispatch for fetch lead gen form
  useEffect(() => {
    dispatch(
      fetchLeadGenForm(handleLocalStorage("token"), handleLocalStorage("hid"))
    );

    fetchFormFields();
  }, []);

  // for rendering col span if editField exist or true
  const colSpan = editField ? "col-span-6" : "col-span-9";

  return (
    <div className="flex flex-col gap-4 p-4 overflow-hidden bg-white mb-10 cardShadow">
      {/* heading content  */}
      <div className=" grid grid-cols-8 gap-6">
        <div className="space-y-1 col-span-5">
          <h2 className="font-semibold text-lg">Forms</h2>
          {/* <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto
            voluptatum quam labore quia sint quod? Ex doloribus molestiae
            adipisci neque iste eveniet id nesciunt, commodi maiores blanditiis
            fuga expedita esse.
          </p> */}
        </div>

        <div className="col-span-3 flex justify-end items-start">
          <button
            onClick={() => setisNewFormOpen(true)}
            className=" bg-primary/90 text-white px-4 py-2 rounded w-fit"
          >
            <span className="flex items-center">
              <HiPlusSm size={22} /> New Form
            </span>
          </button>
        </div>
      </div>

      {/* table  */}
      <div>
        <table className="w-full text-left bg-[#0a3a75] text-white/90 rounded-sm">
          <thead>
            <tr className="border-b whitespace-nowrap">
              {/* <th className="w-1"></th> */}
              <th className="py-3 px-4 text-[16px] font-medium  capitalize">
                Form Title
              </th>
              <th className="py-3 px-4 text-[16px] font-medium  capitalize">
                Form Url
              </th>

              <th className="py-2 px-4 text-[16px] font-medium  capitalize">
                Status
              </th>

              <th className="py-2 px-4 text-[16px] font-medium  capitalize whitespace-nowrap">
                Created At
              </th>

              <th className="py-2 px-4 text-[16px] font-medium capitalize whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-500">
            {LeadGenFormData?.length > 0 &&
              LeadGenFormData?.map((formDetails, index) => (
                <tr
                  key={index}
                  className="border-b odd:bg-gray-50 even:bg-gray-100 rounded-lg border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer"
                >
                  {/* <td>
                  <input type="checkbox" className="ml-4 text-md" />
                </td> */}
                  <td className="text-gray-500 px-4 py-3">
                    {formDetails?.title.slice(0, 20)}
                  </td>
                  <td className="text-gray-500 flex gap-2 items-center px-4 py-3">
                    {/* <span><FaCopy onClick={() => { console.log("fhff") }} /></span> */}
                    <Link
                      to={formDetails?.form_url}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {formDetails?.form_url?.split("/").slice(0, 5).join("/")}
                    </Link>
                  </td>
                  <td className="text-gray-500 px-4">{formDetails?.status}</td>
                  <td className="py-2 px-4 text-[16px] whitespace-nowrap  text-[#575757]">
                    {new Date(formDetails.created_at).toLocaleString("en-Ca", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      {/* <button
                      onClick={(e) => toggleVisibility(e, f.field_label)}
                      className="text-sm size-6 rounded-sm border border-gray-200 flex items-center justify-center hover:bg-[#A81681] hover:text-white duration-300 shadow-xl text-primary"
                      title="Visibility"
                    >
                      {f.status ? (
                        <IoIosEyeOff size={15} />
                      ) : (
                        <IoMdEye size={15} />
                      )}
                    </button> */}

                      <button
                        className="text-sm size-6 rounded-sm border border-gray-200 flex items-center justify-center hover:bg-[#618ae4] hover:text-white duration-300 shadow-xl text-primary"
                        title="Edit"
                        onClick={(e) => handleEditForm(e, formDetails)}
                      >
                        <MdEditNote size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(formDetails.form_id)}
                        className="text-sm size-6 rounded-sm border border-gray-200 flex items-center justify-center hover:bg-red-500 duration-300 hover:text-white shadow-xl text-primary"
                        title="Delete"
                      >
                        <MdDeleteForever size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* {LeadGenFormData?.length === 0 && (
          <div className="flex justify-center items-center mt-2 font-medium text-gray-500 border-b pb-2">
            <span>No Data Found!</span>
          </div>
        )} */}

        {/* <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((index) => (
            <div key={index}>
              <p className="py-5 animate-pulse bg-gray-100"></p>
            </div>
          ))}
        </div> */}
      </div>

      {formData && (
        <div className="fixed inset-0 bg-gray-600/20 flex items-center">
          <div className="relative space-y-4 w-[90%] mx-auto h-[90vh] bg-white p-6 rounded-md">
            <div className="flex items-center justify-between mt-5">
              <h2 className="relative px-4 py-1 w-fit rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-primary font-semibold text-sm shadow-md hover:shadow-lg transition-shadow duration-300">
                Form Preview
              </h2>

              {(isSelectedField || editField) && (
                <button
                  onClick={handlePublishChanges}
                  className="relative inline-flex items-center justify-center px-3 py-2 mt-4 text-white font-semibold rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg overflow-hidden transition-all duration-300 group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 text-sm">
                    Publish Chagnges
                  </span>
                </button>
              )}
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-12 gap-10`}>
              {/* LEFT: Preview */}
              <div className="space-y-4 border col-span-3 border-primary/25 rounded-lg p-3 h-[560px] overflow-auto scrollbar-hidden">
                <h3 className="font-bold">Field Controls</h3>

                <div className="space-y-4">
                  {fields?.map((f) => {
                    return (
                      <div
                        key={f.id}
                        className="flex justify-between items-center border border-gray-200 px-4 py-3 shadow-sm rounded-md cursor-pointer"
                        style={
                          {
                            // backgroundColor: isActive
                            //   ? "#e6f0faba"
                            //   : "rgba(255, 255, 255, 0.05)",
                            // color: f.status ? "black" : "black",
                          }
                        }
                        onClick={() => handleSelectField(f)}
                      >
                        <span>{f.field_type}</span>

                        <div className="flex items-center gap-2">
                          {/* <button
                            onClick={(e) => toggleVisibility(e, f.field_label)}
                            className={`text-sm size-6 ${
                              !isActive && "bg-gray-100 text-gray-400"
                            } rounded-full border border-gray-300 flex items-center justify-center ${
                              isActive && "hover:bg-[#A81681] hover:text-white"
                            }  duration-300 shadow-xl`}
                            title={"Visibility"}
                            disabled={!isActive}
                          >
                            {isVisible ? (
                              <IoIosEyeOff size={15} />
                            ) : (
                              <IoMdEye size={15} />
                            )}
                          </button> */}

                          {/* <button
                          className="text-sm size-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#618ae4] hover:text-white duration-300 shadow-xl"
                          title="Edit"
                          onClick={(e) => handleEditField(e, f)}
                        >
                          <MdEditNote size={15} />
                        </button> */}

                          {/* <button
                            //   onClick={() => deleteField(f.id)}
                            className={`text-sm size-6 ${
                              !isActive && "bg-gray-100 text-gray-400"
                            } rounded-full border border-gray-300 flex items-center justify-center ${
                              isActive && "hover:bg-red-500 hover:text-white"
                            }  duration-300 shadow-xl`}
                            title="Delete"
                            disabled={!isActive}
                          >
                            <MdDeleteForever size={15} />
                          </button> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Form */}
              <div
                className={`relative ${colSpan} bg-cover bg-center bg-no-repeat p-4 rounded-md overflow-hidden h-[560px]`}
                style={{
                  backgroundImage: `url(${formData?.form_cms?.bg_image_url})`,
                }}
              >
                <div className="relative max-w-[450px] mx-auto space-y-4 z-10 h-full overflow-y-auto scrollbar-hidden">
                  <div
                    className="relative flex items-center border h-36 rounded-lg bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${previewImageCover ||
                        formData?.form_cms?.banner_image_url
                        })`,
                    }}
                  >
                    <div className="px-4 grid grid-cols-12 items-center z-40 relative">
                      <div className="text-white col-span-7">
                        <div className="flex flex-col items-center">
                          <input
                            ref={bannerHeadingRef}
                            value={formData?.title}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              });
                            }}
                            readOnly={!isBannerContentEdit}
                            className="text-xl w-full font-bold capitalize bg-transparent outline-none text-white"
                          />
                          <input
                            readOnly={!isBannerContentEdit}
                            value={formData?.description}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              });
                            }}
                            className="w-full text-sm font-normal capitalize bg-transparent outline-none text-white"
                          />
                        </div>

                        <div
                          className="cursor-pointer mt-2"
                          onClick={() => {
                            setIsSelectedField(true);
                            setIsBannerContentEdit(!isBannerContentEdit);
                            bannerHeadingRef?.current?.focus();
                          }}
                        >
                          {isBannerContentEdit ? (
                            <TbEditOff size={22} />
                          ) : (
                            <MdOutlineEdit size={22} />
                          )}
                        </div>
                      </div>

                      <div className="col-span-5 flex flex-col items-end space-y-2">
                        <div
                          className=" w-20 h-20 border border-gray-400 rounded-full p-1 cursor-pointer"
                          style={{
                            backgroundColor: formData?.form_cms?.bg_color,
                          }}
                          onClick={() => fileInputRef?.current?.click()}
                        >
                          <img
                            src={
                              previewImageLogo || formData?.form_cms?.logo_url
                            }
                            alt="Logo"
                            className="w-full h-full object-cover rounded-full"
                          />

                          <input
                            type="file"
                            onChange={handleFileChangeLogoImage}
                            ref={fileInputRef}
                            hidden
                          />
                        </div>

                        <div
                          className=""
                          onClick={() => {
                            fileInputRefCoverImage?.current?.click();
                          }}
                        >
                          <button className="flex font-medium rounded-md text-primary bg-gray-200 text-xs px-2 py-1">
                            Edit Cover
                          </button>

                          <input
                            type="file"
                            ref={fileInputRefCoverImage}
                            hidden
                            onChange={handleFileChangeCoverImage}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10 rounded-md" />
                  </div>

                  <form className="space-y-4 border border-primary/25 rounded-sm p-3 bg-white/80">
                    {formData?.form_fields?.map((field, idx) => (
                      <FormField
                        key={idx}
                        field={field}
                        editField={handleEditField}
                        deleteField={handledeleteField}
                        toggleVisibility={toggleVisibility}
                        index={idx}
                        activeIndex={index}
                      />
                    ))}

                    <button
                      // onClick={addField}
                      disabled={true}
                      className="relative w-full inline-flex items-center justify-center px-6 py-2 mt-4 text-white font-semibold rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg overflow-hidden transition-all duration-300 group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10">Submit</span>
                    </button>
                  </form>
                </div>

                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
              </div>

              {editField && (
                <div className="space-y-4 col-span-3">
                  <form className="space-y-4 border rounded-lg p-5 border-primary/25">
                    <h2 className="text-lg font-bold">Edit Field</h2>

                    <div className="space-y-1">
                      <label
                        htmlFor=""
                        className="font-medium text-primary text-sm"
                      >
                        Name
                      </label>

                      <input
                        type="text"
                        placeholder="Label"
                        name="label"
                        value={editFieldsData[index]?.field_label}
                        onChange={(e) => {
                          setIsLocalUpdate(true);
                          setEditFieldsData((prevFields) => {
                            const updatedFields = [...prevFields];
                            updatedFields[index] = {
                              ...updatedFields[index],
                              field_label: e.target.value,
                            };
                            return updatedFields;
                          });
                        }}
                        className="border p-2 w-full outline-none border-primary/30 focus:border-primary/40 rounded-md"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-primary text-sm">
                        Placeholder
                      </label>

                      <input
                        type="text"
                        placeholder="Placeholder"
                        name="placeholder"
                        value={editFieldsData[index]?.field_placeholder}
                        onChange={(e) => {
                          setEditFieldsData((prevFields) => {
                            setIsLocalUpdate(true);
                            const updatedFields = [...prevFields];
                            updatedFields[index] = {
                              ...updatedFields[index],
                              field_placeholder: e.target.value,
                            };
                            return updatedFields;
                          });
                        }}
                        className="border p-2 w-full outline-none border-primary/30 focus:border-primary/40 rounded-md"
                      />
                    </div>

                    {/* <div className="space-y-1">
                      <label
                        htmlFor=""
                        className="font-medium text-primary text-sm"
                      >
                        Index
                      </label>

                      <input
                        type="text"
                        placeholder="Index"
                        name="placeholder"
                        value={editFieldsData[index]?.index}
                        onChange={(e) => {
                          setEditFieldsData((prevFields) => {
                            setIsLocalUpdate(true);
                            const updatedFields = [...prevFields];
                            updatedFields[index] = {
                              ...updatedFields[index],
                              index: e.target.value,
                            };
                            return updatedFields;
                          });
                        }}
                        className="border p-2 w-full outline-none border-primary/30 focus:border-primary/40 rounded-md"
                      />
                    </div> */}

                    <div className="space-y-1">
                      <label className="font-medium text-primary text-sm">
                        Step
                      </label>

                      <input
                        type="text"
                        placeholder="Step"
                        name="placeholder"
                        value={editFieldsData[index]?.step}
                        onChange={(e) => {
                          setIsLocalUpdate(true);
                          setEditFieldsData((prevFields) => {
                            const updatedFields = [...prevFields];
                            updatedFields[index] = {
                              ...updatedFields[index],
                              step: e.target.value,
                            };
                            return updatedFields;
                          });
                        }}
                        className="border p-2 w-full outline-none border-primary/30 focus:border-primary/40 rounded-md"
                      />
                    </div>

                    {/* {["select", "checkbox"].includes(newField.field_type) && (
                      <div className="space-y-2">
                        <h4 className="font-medium mt-2">Options</h4>

                        <div className="space-y-3">
                          {newField.options.map((opt, i) => (
                            <input
                              key={i}
                              type="text"
                              className="border p-2 w-full outline-none border-primary/30 focus:border-primary/40"
                              value={opt}
                              onChange={(e) => {
                                const opts = [...newField.options];
                                opts[i] = e.target.value;
                                setNewField({ ...newField, options: opts });
                              }}
                            />
                          ))}
                        </div>

                        <button
                          className="text-sm text-blue-600 mt-3 bg-gray-100 px-2 py-1 rounded-md font-medium"
                          onClick={() =>
                            setNewField({
                              ...newField,
                              options: [...newField.options, ""],
                            })
                          }
                        >
                          + Add Option
                        </button>
                      </div>
                    )} */}

                    <label className="flex items-center gap-2 ml-1">
                      <input
                        type="checkbox"
                        checked={editFieldsData[index]?.is_required}
                        className="mt-1"
                        onChange={(e) => {
                          setEditFieldsData((prevFields) => {
                            const updatedFields = [...prevFields];
                            updatedFields[index] = {
                              ...updatedFields[index],
                              is_required: e.target.checked,
                            };
                            return updatedFields;
                          });
                        }}
                      />
                      <span className="text-sm font-medium"> Required</span>
                    </label>

                    <button
                      disabled={!isLocalUpdate}
                      onClick={handleUpdateChanges}
                      className={`relative inline-flex items-center justify-center px-6 py-2 mt-4 text-white font-semibold rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg overflow-hidden transition-all duration-300 group ${!isLocalUpdate && "opacity-40"
                        }`}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10">Update Chagnges</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div
              className="absolute right-2 top-0 size-8 rounded-sm bg-gray-600 flex justify-center items-center text-white font-semibold cursor-pointer"
              onClick={() => {
                setFormData(null);
                setEditField(null);
                setIsLocalUpdate(false);
                setEditFieldsData([]);
              }}
            >
              <span>X</span>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isNewFormOpen}
        onConfirm={handleCreateFormSubmit}
        onCancel={() => {
          setisNewFormOpen(false);
          setTitleError(null);
        }}
        title={"Create Lead Gen Form"}
        labels={{
          confirm: "Submit",
          cancel: "Cancel",
        }}
        render={() => (
          <form>
            <input
              type="text"
              value={title}
              required
              onChange={(e) => {
                if (e.target.value.length > 60) {
                  Swal.fire({
                    icon: "warning",
                    title: "Warning",
                    text: "Title cannot exceed 60 characters.",
                    confirmButtonText: "OK",
                  });
                  return;
                }
                setTitle(e.target.value);
              }}
              placeholder="Please Enter Form Name"
              className="outline-none border border-primary/40 bg-transparent p-2 rounded-sm w-full"
            />
            <div className="flex items-center justify-between">
              <p className="text-red-500 text-sm ml-2 font-normal">
                {titleError}
              </p>

              <span className="flex justify-end text-xs text-gray-500">
                {title.length}/60
              </span>
            </div>
          </form>
        )}
      />
    </div>
  );
};

export default LeadGenForm;

// FormField.tsx

export const FormField = ({
  field,
  toggleVisibility,
  editField,
  deleteField,
  index,
  activeIndex,
}) => {
  const { field_label, field_placeholder, field_type, is_required } = field;
  const name = field?.label || field?.field_label;
  const isVisible = field?.status || field?.status;

  // for typo fields
  const commonProps = {
    placeholder: field_placeholder,
    name,
    required: is_required,
    className:
      "w-full px-4 py-2 outline-none border border-gray-300 rounded focus:outline-none",
  };

  switch (field_type) {
    case "textarea":
      return (
        <div
          className={`space-y-2 scale-[1] duration-300  ${!isVisible && "opacity-70 scale-[1] p-2 rounded-sm"
            }`}
        >
          <div className="flex items-center justify-between">
            <label>{name}</label>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => toggleVisibility(e, field_label)}
                className={`text-sm size-6 rounded-full border border-gray-300 flex items-center justify-center
                    hover:bg-[#A81681] hover:text-white
                   duration-300 shadow-xl`}
                title={"Visibility"}
              >
                {isVisible ? <IoIosEyeOff size={15} /> : <IoMdEye size={15} />}
              </button>

              <button
                className="text-sm size-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#618ae4] hover:text-white duration-300 shadow-xl"
                title="Edit"
                onClick={(e) => editField(e, field, index)}
                style={{
                  backgroundColor: activeIndex === index ? "#5abe78" : "",
                }}
              >
                <MdEditNote size={15} />
              </button>

              <button
                onClick={(e) => deleteField(e, field)}
                className={`text-sm size-6 
                   rounded-full border border-gray-300 flex items-center justify-center 
                    hover:bg-red-500 hover:text-white
                    duration-300 shadow-xl`}
                title="Delete"
              >
                <MdDeleteForever size={15} />
              </button>
            </div>
          </div>
          <textarea {...commonProps} rows={4} disabled />
        </div>
      );
    case "date":
    case "email":
    case "number":
    case "text":
    case "phone":
      return (
        <div
          className={`space-y-2 scale-[1] duration-300  ${!isVisible && "opacity-70 scale-[1] p-2 rounded-sm"
            }`}
        >
          <div className="flex items-center justify-between">
            <label>{name}</label>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => toggleVisibility(e, field_label)}
                className={`text-sm size-6 rounded-full border border-gray-300 flex items-center justify-center
                    hover:bg-[#A81681] hover:text-white
                   duration-300 shadow-xl`}
                title={"Visibility"}
                style={{
                  backgroundColor: !isVisible ? "#A81681" : "",
                  color: !isVisible ? "white" : "",
                }}
              >
                {isVisible ? <IoIosEyeOff size={15} /> : <IoMdEye size={15} />}
              </button>

              <button
                className={`text-sm size-6 rounded-full border border-gray-300 flex items-center justify-center duration-300 shadow-xl ${isVisible
                    ? "hover:bg-[#618ae4] hover:text-white  "
                    : "bg-gray-300 cursor-not-allowed"
                  }`}
                title="Edit"
                disabled={!isVisible}
                onClick={(e) => editField(e, field, index)}
                style={{
                  backgroundColor:
                    isVisible && activeIndex === index ? "#5abe78" : "",
                }}
              >
                <MdEditNote size={15} />
              </button>

              <button
                onClick={(e) => deleteField(e, field)}
                className={`text-sm size-6 
                   rounded-full border border-gray-300 flex items-center justify-center 
                    ${isVisible
                    ? "hover:bg-red-500 hover:text-white"
                    : "bg-gray-300 cursor-not-allowed"
                  }
                    duration-300 shadow-xl `}
                title="Delete"
                disabled={!isVisible}
              >
                <MdDeleteForever size={15} />
              </button>
            </div>
          </div>

          <div>
            <input
              type={field_type === "phone" ? "tel" : field_type}
              disabled
              {...commonProps}
            />
          </div>
        </div>
      );
    case "select":
      return (
        <div className="space-y-1 scale-90">
          <label>{name}</label>
          <select {...commonProps}>
            {/* Placeholder options: Update based on real use-case */}
            <option value="">Select an option</option>
            <option value="Option1">Option1</option>
            <option value="Option2">Option2</option>
          </select>
        </div>
      );
    default:
      return null;
  }
};
