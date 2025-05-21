import React, { useState, useEffect } from "react";
import { MdAddBusiness } from "react-icons/md";
import axios from "axios";
import handleLocalStorage from "../../utils/handleLocalStorage";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "../../redux/slice/UserSlice";

const AddLocationForm = ({ isOpen, handleClose }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [local, setLocal] = useState("");
  const [pin, setPinCode] = useState("");

  const dispatch = useDispatch();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!local || !pin || !selectedCity || !selectedCountry || !selectedState) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please fill in all fields.",
      });
      return;
    }

    try {
      const { data } = await axios.post(
        // "https://nexon.eazotel.com/multilocation/addlocations/dashboard",
        "http://127.0.0.1:5000/multilocation/addlocations/dashboard",
        {
          token: handleLocalStorage("token"),
          local: local,
          city: selectedCity,
          state: selectedState,
          country: selectedCountry,
          pincode: pin,
        }
      );

      if (data.Status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data?.Message || "Hotel added successfully.",
        });
        dispatch(fetchUserProfile(handleLocalStorage("token")));

        // alert(data.message);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data?.Message || "Something went wrong.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.Message || "Getting some rrror.",
      });
    } finally {
      handleClose();
    }
  };

  // Fetch countries on mount
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.data);
        setLoadingCountries(false);
      });
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      setLoadingStates(true);
      fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: selectedCountry,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setStates(data.data?.states || []);
          setLoadingStates(false);
        });
    }
  }, [selectedCountry]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      setLoadingCities(true);
      fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: selectedCountry,
          state: selectedState,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setCities(data.data || []);
          setLoadingCities(false);
        });
    }
  }, [selectedCountry, selectedState]);

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleFormSubmit}
            className="relative max-w-xl w-full mx-auto bg-white/95 py-7 px-5 rounded-lg space-y-6"
          >
            {/* Existing Local input */}
            <div>
              <div className="w-full">
                <label htmlFor="local" className="font-medium text-primary/70">
                  Local
                </label>
                <input
                  id="local"
                  type="text"
                  onChange={(e) => setLocal(e.target.value)}
                  className="outline-none py-2 px-3 border rounded-sm w-full"
                />
              </div>
            </div>

            {/* Country, State, City Dropdowns */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="font-medium text-primary/70">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedState("");
                    setSelectedCity("");
                  }}
                  className="outline-none py-2 px-3 border rounded-sm w-full"
                  disabled={loadingCountries}
                >
                  <option value="">Select Country</option>
                  {loadingCountries ? (
                    <option>Loading countries...</option>
                  ) : (
                    countries.map((country) => (
                      <option key={country.country} value={country.country}>
                        {country.country}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="font-medium text-primary/70">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity("");
                  }}
                  className="outline-none py-2 px-3 border rounded-sm w-full"
                  disabled={!selectedCountry || loadingStates}
                >
                  <option value="">Select State</option>
                  {loadingStates ? (
                    <option>Loading states...</option>
                  ) : (
                    states.map((state) => (
                      <option key={state.name} value={state.name}>
                        {state.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="font-medium text-primary/70">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="outline-none py-2 px-3 border rounded-sm w-full"
                  disabled={!selectedState || loadingCities}
                >
                  <option value="">Select City</option>
                  {loadingCities ? (
                    <option>Loading cities...</option>
                  ) : (
                    cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Existing Pin Code input */}
              <div className="flex flex-col gap-1 w-full">
                <label className="font-medium text-primary/70">Pin Code</label>
                <input
                  type="text"
                  onChange={(e) => setPinCode(e.target.value)}
                  className="outline-none py-2 px-3 border rounded-sm w-full"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex gap-2 justify-center items-center bg-primary/90 font-semibold text-white py-3"
              >
                <MdAddBusiness size={22} /> Add New Location
              </button>
            </div>

            {/* form close button  */}
            <div
              className="flex justify-end absolute right-3 -top-4"
              onClick={handleClose}
            >
              <span className="size-7 text-xs font-bold cursor-pointer rounded-full flex items-center justify-center bg-primary text-white">
                X
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddLocationForm;
