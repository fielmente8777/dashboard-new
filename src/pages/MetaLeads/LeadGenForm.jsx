// LeadGenForm.tsx
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../data/constant";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeadGenForm } from "../../redux/slice/MetaLeads";
import { IoIosEyeOff } from "react-icons/io";
import { IoMdEye } from "react-icons/io";
import { MdEditNote, MdDeleteForever } from "react-icons/md";

const LeadGenForm = () => {
  const [loading, setLoading] = useState(false);
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

  const [editField, setEditField] = useState(null);

  const dispatch = useDispatch();
  const { data: LeadGenFormData } = useSelector((state) => state?.metaLeads);

  // handleCreateLeadGenForm
  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/leadgen/create-lead-gen-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${handleLocalStorage("token")}`,
        },
        body: JSON.stringify({
          // Replace this with the data you want to send
          hId: handleLocalStorage("hid"),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create form");
      }

      dispatch(fetchLeadGenForm(handleLocalStorage("token")));

      // adjust according to response structure
    } catch (err) {
      console.error("Error fetching form", err);
    } finally {
      setLoading(false);
    }
  };

  // handle function for add field dymacially
  const addField = () => {
    if (!newField.field_label) return alert("Label is required");
    const isOptionField = newField.type === "select"; // or include "checkbox" if needed

    const fieldToAdd = {
      ...newField,
      id: Date.now(),
      ...(isOptionField ? { options: newField.options } : {}),
    };

    setFields([...fields, fieldToAdd]);

    setNewField({
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      visible: true,
    });
  };

  // handle selection for field from field controls
  const handleSelectField = (field) => {
    setFields([...fields, field]);
  };

  //  handle edit field
  const handleEditField = (e, field) => {
    e.stopPropagation();
    setEditField({
      ...field,
    });
  };

  // toggle the visibility for input fields
  const toggleVisibility = (e, lable) => {
    e.stopPropagation();
    setFields(
      fields.map((f) =>
        f.field_label === lable ? { ...f, status: !f.status } : f
      )
    );
  };

  // useEffect to dispatch for fetch lead gen form
  useEffect(() => {
    dispatch(fetchLeadGenForm(handleLocalStorage("token")));
  }, []);

  useEffect(() => {
    if (LeadGenFormData) {
      console.log(LeadGenFormData?.form_fields);
      setFields(LeadGenFormData?.form_fields);
    }
  }, [LeadGenFormData]);

  console.log(editField);

  return (
    <div className="flex flex-col gap-4 p-4">
      {!LeadGenFormData || Object.keys(LeadGenFormData).length === 0 ? (
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded w-fit"
        >
          {loading ? "Creating..." : "Create Lead Gen Form"}
        </button>
      ) : (
        <div className="space-y-4">
          <h2 className="relative px-4 py-1 w-fit rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-primary font-semibold text-sm shadow-md hover:shadow-lg transition-shadow duration-300">
            Form Preview
          </h2>

          <div
            className={`grid grid-cols-1 md:grid-cols-${
              editField ? "3" : "2"
            } gap-10`}
          >
            {/* LEFT: Preview */}
            <div className="col-span space-y-4">
              <div className="flex justify-between items-center border p-4 border-primary/25 rounded-lg space-y-2">
                <div>
                  <h2 className="text-xl font-bold">
                    {LeadGenFormData?.title}
                  </h2>
                  <p>{LeadGenFormData?.description}</p>
                </div>

                <div className="w-20 h-20 border border-gray-400 rounded-full p-2">
                  <img
                    src={LeadGenFormData?.Banner?.banner_image_url}
                    alt="Banner"
                    className="rounded w-full h-full object-cover"
                  />
                </div>
              </div>

              <form className="space-y-4 border border-primary/25 p-3">
                {fields?.map((field, idx) => (
                  <FormField key={idx} field={field} />
                ))}

                <button
                  onClick={addField}
                  className="relative w-full inline-flex items-center justify-center px-6 py-2 mt-4 text-white font-semibold rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg overflow-hidden transition-all duration-300 group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10">Submit</span>
                </button>
              </form>
            </div>
            {/* RIGHT: Form */}

            {editField && (
              <div className="space-y-4 col-span">
                <div className="col-span-7 space-y-4 border rounded-lg p-5 border-primary/25">
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
                      value={editField.field_label}
                      onChange={(e) =>
                        setEditField({
                          ...editField,
                          field_label: e.target.value,
                        })
                      }
                      className="border p-2 w-full outline-none border-primary/30 focus:border-primary/40 rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor=""
                      className="font-medium text-primary text-sm"
                    >
                      Placeholder
                    </label>

                    <input
                      type="text"
                      placeholder="Placeholder"
                      name="placeholder"
                      value={editField.field_placeholder}
                      onChange={(e) =>
                        setEditField({
                          ...editField,
                          field_placeholder: e.target.value,
                        })
                      }
                      className="border p-2 w-full outline-none border-primary/30 focus:border-primary/40 rounded-md"
                    />
                  </div>

                  {/* <select
                    name="type"
                    value={newField.field_type}
                    onChange={(e) =>
                      setNewField({ ...newField, field_type: e.target.value })
                    }
                    className="border p-2 w-full outline-none border-primary/30 focus:border-primary/40"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="select">Select</option>
                  </select> */}

                  {["select", "checkbox"].includes(newField.field_type) && (
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
                  )}

                  <label className="flex items-center gap-2 ml-1">
                    <input
                      type="checkbox"
                      checked={editField.is_required}
                      className="mt-1"
                      onChange={(e) =>
                        setEditField({
                          ...editField,
                          is_required: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-medium"> Required</span>
                  </label>

                  <button
                    onClick={addField}
                    className="relative inline-flex items-center justify-center px-6 py-2 mt-4 text-white font-semibold rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg overflow-hidden transition-all duration-300 group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10">Submit</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4 border border-primary/25 rounded-lg p-3">
              <h3 className="font-bold">Field Controls</h3>

              <div className="space-y-4">
                {fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex justify-between items-center border border-gray-200 px-4 py-3 shadow-sm rounded-md cursor-pointer"
                    style={{
                      backgroundColor: f.status
                        ? "#e6f0faba"
                        : "rgba(255, 255, 255, 0.05)",
                      color: f.status ? "black" : "black",
                    }}
                    onClick={() => handleSelectField(f)}
                  >
                    <span>
                      {f.field_label} ({f.field_type})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleVisibility(e, f.field_label)}
                        className="text-sm size-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#A81681] hover:text-white duration-300 shadow-xl"
                        title="Visibility"
                      >
                        {f.status ? (
                          <IoIosEyeOff size={15} />
                        ) : (
                          <IoMdEye size={15} />
                        )}
                      </button>

                      <button
                        className="text-sm size-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-[#618ae4] hover:text-white duration-300 shadow-xl"
                        title="Edit"
                        onClick={(e) => handleEditField(e, f)}
                      >
                        <MdEditNote size={15} />
                      </button>

                      <button
                        //   onClick={() => deleteField(f.id)}
                        className="text-sm size-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-red-500 duration-300 hover:text-white shadow-xl"
                        title="Delete"
                      >
                        <MdDeleteForever size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadGenForm;

// FormField.tsx

export const FormField = ({ field }) => {
  const { field_lable, field_placeholder, field_type, is_required } = field;
  const name = field_lable || field?.field_label;
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
        isVisible && (
          <div className="space-y-1">
            <label>{name}</label>
            <textarea {...commonProps} rows={4} />
          </div>
        )
      );
    case "date":
    case "email":
    case "number":
    case "text":
    case "phone":
      return (
        isVisible && (
          <div className="space-y-1">
            <label>{name}</label>
            <input
              type={field_type === "phone" ? "tel" : field_type}
              {...commonProps}
            />
          </div>
        )
      );
    case "select":
      return (
        isVisible && (
          <div className="space-y-1">
            <label>{name}</label>
            <select {...commonProps}>
              {/* Placeholder options: Update based on real use-case */}
              <option value="">Select an option</option>
              <option value="Option1">Option1</option>
              <option value="Option2">Option2</option>
            </select>
          </div>
        )
      );
    default:
      return null;
  }
};
