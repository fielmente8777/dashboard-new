import React, { useEffect, useState } from "react";
import axios from "axios";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../data/constant";
import Loader from "../../components/Loader";

const Steps = {
  1: {
    name: "Property Details",
    fields: [
      {
        label: "Hotel Name",
        type: "text",
        name: "hotelName",
        placeholder: "Enter Hotel Name",
        required: true,
      },
      {
        label: "Hotel Email",
        type: "email",
        name: "hotelEmail",
        placeholder: "Enter Email",
        required: true,
      },
      {
        label: "Hotel Phone",
        type: "number",
        name: "hotelPhone",
        placeholder: "Enter Phone",
        required: true,
      },
      {
        label: "Currency",
        type: "select",
        name: "currency",
        // placeholder: "Enter address",
        required: true,
        options: [
          { value: "INR", label: "INR" },
          { value: "USD", label: "USD" },
          { value: "EUR", label: "EUR" },
        ],
      },
      {
        label: "Hotel Description",
        type: "textarea",
        name: "hotelDescription",
        placeholder: "Enter Hotel Description",
        required: true,
      },
    ],
  },
  2: {
    name: "Address Details",
    fields: [
      {
        label: "Local",
        type: "text",
        placeholder: "Enter Local",
        required: true,
        name: "local",
      },
      {
        label: "Country",
        type: "select",
        name: "country",
        // placeholder: "Enter address",
        required: true,

        options: [],
      },
      {
        label: "State",
        type: "select",
        name: "state",
        // placeholder: "Enter address",
        required: true,

        options: [],
      },
      {
        label: "City",
        type: "select",
        name: "city",
        // placeholder: "Enter address",
        required: true,

        options: [],
      },
      {
        label: "Pincode",
        type: "number",
        placeholder: "Enter Pincode",
        name: "pinCode",
        required: true,
      },
    ],
  },
};

const OnboardingForm = () => {
  const [spinner, setSpinner] = useState(false);
  const [stepsData, setStepsData] = useState({
    ...Steps,
  });

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    hotelName: "",
    hotelPhone: "",
    hotelEmail: "",
    currency: "",
    hotelDescription: "",
    local: "",
    country: "",
    state: "",
    city: "",
    pinCode: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSpinner(true);

    const dataToSend = {
      Token: handleLocalStorage("token"),
      template: "1",
      hotelName: formData.hotelName,
      hotelPhone: formData.hotelPhone,
      hotelAddress: "",
      hotelState: formData.state,
      hotelCity: formData.city,
      hotelCountry: formData.country,
      hotelPinCode: formData.pinCode,
      hotelEmail: formData.hotelEmail,
      currency: formData.currency,
      planName: "P1",

      oldWebsite: "",
      category: "Resort",
      starRating: "4",
      hasPool: "false",
      breakfastOption: [],
      serveBreakfast: "false",
      breakfastIncluded: "false",
      parkingType: "best",
      parkingAvailability: "false",
      parkingCost: "200",
      parkingLocation: "",
      pricingStructure: "",
      reservationRequirement: "false",
      logo: "",
      totalroomCategory: "0",
      roomCategories: [],
      bannerVideo: "",
      hotelDescription: "Best Resort",
      customDomain: "",
      colorCombination: {
        backgroundColor: "#153B5B",
        buttonColor: "#0A3A75",
        fontColor: "#0A3A75",
        boardColor: "#0A3A75",
      },
      Facilities: {
        FrontDesk: "true",
        Wifi: "false",
        Board: "false",
        Rooftop_Cafe: "false",
        Health_Club: "false",
        Express_checks: "false",
        Wave_Bar: "false",
        Conference_Hall: "false",
        Alchemy: "false",
        Suncafe: "false",
        Doctor: "false",
        Spa: "false",
        Babysitting: "false",
        Electricity: "false",
        Concierge: "false",
        Conditinoer: "false",
        Security: "false",
        TravelTour: "false",
        Currency_Exchange: "false",
        Laundry: "false",
        Casino: "false",
        Parking: "false",
        Elevator: "false",
        Jacuzzi: "false",
        Room_Service: "false",
        Accept_Cards: "false",
        Child_Care: "false",
        Conference_Rooms: "false",
        Fitness_Center: "false",
        "Health_&_Beauty": "false",
        Restaurant: "false",
        Swimming_Pool: "false",
        Housekeep: "false",
        cofeemaker: "false",
        minibar: "false",
        Evpoint: "false",
        SaunaStream: "false",
      },
      checkInFrom: "2024-02-12",
      checkInUntil: "01:33",
      petCharges: "100",
      allowPets: "true",
      checkOutFrom: "2024-02-12",
      allowChildren: "true",
      checkOutUntil: "01:33",
      languages: ["English", "Hindi"],
      pagesRequired: {},
      establishedSince: "1995",
      document: {},
      otaRequired: {},
    };

    const { data } = await axios.post(
      `${BASE_URL}/eazotel/createwebsite`,
      dataToSend,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data);

    if (data?.Status) {
      handleLocalStorage("hid", data?.hId);
      navigate(`dashboard/client/${data?.hId}`);
      setSpinner(false);
    }

    setSpinner(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const goToNextStep = () => {
    if (currentStep === Object.keys(Steps).length) return;

    if (currentStep === 2) {
      alert("Form submitted successfully!");

      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const goToPrevStep = () => {
    if (currentStep === 1) return;
    setCurrentStep(currentStep - 1);
  };

  const fetchCountries = async () => {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries"
    );
    const data = await response.json();

    console.log(data);

    setStepsData((prev) => {
      return {
        ...prev,
        2: {
          ...prev[2],
          fields: prev[2].fields.map((field) => {
            if (field.label === "Country") {
              return {
                ...field,
                options: data.data.map((country) => ({
                  value: country.country,
                  label: country.country,
                })),
              };
            }
            return field;
          }),
        },
      };
    });
  };

  const fetchStates = async () => {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries/states",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: formData.country,
        }),
      }
    );
    const data = await response.json();

    setStepsData((prev) => {
      return {
        ...prev,
        2: {
          ...prev[2],
          fields: prev[2].fields.map((field) => {
            if (field.label === "State") {
              return {
                ...field,
                options: data.data?.states?.map((state) => ({
                  value: state.name,
                  label: state.name,
                })),
              };
            }
            return field;
          }),
        },
      };
    });
  };

  const fetchCities = async () => {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries/state/cities",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: formData.country,
          state: formData.state,
        }),
      }
    );

    const data = await response.json();

    setStepsData((prev) => {
      return {
        ...prev,
        2: {
          ...prev[2],
          fields: prev[2].fields.map((field) => {
            if (field.label === "City") {
              return {
                ...field,
                options: data.data?.map((city) => ({
                  value: city,
                  label: city,
                })),
              };
            }
            return field;
          }),
        },
      };
    });
  };

  useEffect(() => {
    if (currentStep === 2) {
      fetchCountries();
    }
  }, [currentStep]);

  useEffect(() => {
    if (formData.country) {
      fetchStates();
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      fetchCities();
    }
  }, [formData.state]);

  return (
    <div
      className="h-screen w-full flex justify-center items-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/dashboard.png')",
      }}
    >
      <div className="h-full bg-white/25 w-full backdrop-blur-sm flex items-center">
        <div className="max-w-3xl w-full mx-auto border border-gray-200 rounded-md p-4 bg-white text-gray-800 shadow-lg">
          {/* steps indication and progress */}
          <div className="flex items-center gap-2">
            {Object.keys(stepsData).map((step) => {
              return (
                <div
                  key={step}
                  className={`w-8 h-2 rounded-full flex items-center gap-2 cursor-pointer ${
                    Number(step) === Number(currentStep)
                      ? "bg-blue-300"
                      : "bg-gray-300"
                  }`}
                />
              );
            })}
          </div>

          {/* form  */}
          <form action="" className="space-y-4 mt-4" onSubmit={handleSubmit}>
            {/* form heading  */}
            <div className="flex justify-between text-2xl font-semibold text-gray-700">
              <h2>{Steps[currentStep].name}</h2>
            </div>

            {/* form input fields  */}
            <div className="grid grid-cols-2 gap-4">
              {stepsData[currentStep].fields.map((field) => {
                const isTextArea = field.type === "textarea";
                const isSelect = field.type === "select";

                if (isTextArea) {
                  return (
                    <div
                      key={field.label}
                      className="col-span-full text-gray-700"
                    >
                      <label className="block mb-1 font-medium">
                        {field.label}
                      </label>
                      <textarea
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
                      />
                    </div>
                  );
                }

                if (isSelect) {
                  return (
                    <div key={field.label} className="">
                      <label className="block mb-1 font-medium text-gray-700">
                        {field.label}
                      </label>
                      <select
                        disabled={field.options?.length === 0}
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field.label} className="">
                    <label className="block mb-1 font-medium text-gray-700">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      required={field.required}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* form buttons  */}
            <div className="flex justify-end gap-2">
              <button
                disabled={currentStep === 1}
                type="button"
                className={`px-4 py-2 font-semibold bg-primary/85 text-white rounded-md  ${
                  currentStep === 1 ? "opacity-60" : "hover:bg-primary/80"
                }`}
                onClick={goToPrevStep}
              >
                Prev
              </button>

              {currentStep === Object.keys(Steps).length ? (
                <button
                  className="px-4 py-2 font-semibold bg-primary/85 text-white rounded-md hover:bg-primary/80 flex items-center gap-3"
                  type="submit"
                >
                  Submit {spinner && <Loader size={16} color="#fff" />}
                </button>
              ) : (
                <button
                  className="px-4 py-2 font-semibold bg-primary/85 shadow-md text-white rounded-md hover:bg-primary/80"
                  type="button"
                  onClick={goToNextStep}
                >
                  Next
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
