import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { NEW_BASE_URL } from "../../../data/constant";

const EMPTY_FORM = {
  local: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",
};

const useHotelManager = (profile) => {
  const [hotels, setHotels] = useState({});
  const [editingHotel, setEditingHotel] = useState(null);
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [hotelForm, setHotelForm] = useState(EMPTY_FORM);
  const [hotelLoading, setHotelLoading] = useState(false);

  // Prevent multiple POST requests from rapid clicks
  const addingHotelRef = useRef(false);

  useEffect(() => {
    setHotels(profile?.hotels || {});
  }, [profile?.hotels]);

  const resetForm = () => {
    setHotelForm({ ...EMPTY_FORM });
  };

  const handleHotelChange = (e) => {
    const { name, value } = e.target;

    setHotelForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // ADD HOTEL
  // =========================

  const handleOpenAddHotel = () => {
    if (hotelLoading) return;

    setEditingHotel(null);
    resetForm();
    setShowAddHotel(true);
  };

  const handleCloseAddHotel = () => {
    if (hotelLoading) return;

    setShowAddHotel(false);
    resetForm();
  };

  const handleAddHotel = async () => {
    // Very important:
    // prevents multiple POST requests
    if (addingHotelRef.current) {
      console.log("ADD HOTEL already in progress");
      return;
    }

    if (!hotelForm.local.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Hotel name required",
        text: "Please enter the hotel name.",
      });

      return;
    }

    try {
      addingHotelRef.current = true;
      setHotelLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication required",
          text: "Please login again.",
        });

        return;
      }

      const payload = {
        local: hotelForm.local.trim(),
        city: hotelForm.city.trim(),
        state: hotelForm.state.trim(),
        country: hotelForm.country.trim(),
        pinCode: hotelForm.pinCode.trim(),
      };

      console.log("ADD HOTEL REQUEST:", payload);

      const response = await axios.post(
        `${NEW_BASE_URL}/api/v1/profile/hotels`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("ADD HOTEL RESPONSE:", response.data);

      const newHotelId =
        response.data?.hotelId ??
        response.data?.data?.hotelId ??
        response.data?.id ??
        response.data?.data?.id;

      const newHotel =
        response.data?.hotel ??
        response.data?.data?.hotel ??
        payload;

      console.log("NEW HOTEL ID:", newHotelId);

      if (newHotelId) {
        setHotels((prev) => ({
          ...prev,
          [String(newHotelId)]: {
            ...payload,
            ...newHotel,
          },
        }));
      }

      setShowAddHotel(false);
      resetForm();

      Swal.fire({
        icon: "success",
        title: "Added",
        text: "Hotel added successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("ADD HOTEL ERROR:", error);
      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      Swal.fire({
        icon: "error",
        title: "Add hotel failed",
        text:
          error?.response?.data?.responseMessage ||
          error?.response?.data?.message ||
          "Unable to add hotel.",
      });
    } finally {
      addingHotelRef.current = false;
      setHotelLoading(false);
    }
  };

  // =========================
  // EDIT HOTEL
  // =========================

  const handleEditHotel = (hotelId, hotel) => {
    if (!hotelId || !hotel) {
      Swal.fire({
        icon: "error",
        title: "Unable to edit",
        text: "Hotel information is missing.",
      });

      return;
    }

    setShowAddHotel(false);
    setEditingHotel(hotelId);

    setHotelForm({
      local: hotel.local || "",
      city: hotel.city || "",
      state: hotel.state || "",
      country: hotel.country || "",
      pinCode: hotel.pinCode || "",
    });
  };

  const handleCloseHotelModal = () => {
    if (hotelLoading) return;

    setEditingHotel(null);
    resetForm();
  };

  const handleUpdateHotel = async () => {
    if (!editingHotel) {
      Swal.fire({
        icon: "warning",
        title: "No hotel selected",
        text: "Please select a hotel to edit.",
      });

      return;
    }

    if (!hotelForm.local.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Hotel name required",
        text: "Please enter the hotel name.",
      });

      return;
    }

    try {
      setHotelLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication required",
          text: "Please login again.",
        });

        return;
      }

      const payload = {
        local: hotelForm.local.trim(),
        city: hotelForm.city.trim(),
        state: hotelForm.state.trim(),
        country: hotelForm.country.trim(),
        pinCode: hotelForm.pinCode.trim(),
      };

      await axios.put(
        `${NEW_BASE_URL}/api/v1/profile/hotels/${editingHotel}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setHotels((prev) => ({
        ...prev,
        [editingHotel]: {
          ...prev[editingHotel],
          ...payload,
        },
      }));

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Hotel updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      handleCloseHotelModal();
    } catch (error) {
      console.error("UPDATE HOTEL ERROR:", error);
      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.responseMessage ||
          "Unable to update hotel.",
      });
    } finally {
      setHotelLoading(false);
    }
  };

  // =========================
  // DELETE HOTEL
  // =========================

  const handleDeleteHotel = async (hotelId) => {
    if (!hotelId) {
      Swal.fire({
        icon: "error",
        title: "Unable to delete",
        text: "Hotel information is missing.",
      });

      return;
    }

    const confirmDelete = await Swal.fire({
      title: "Delete hotel?",
      text: "This hotel will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      setHotelLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication required",
          text: "Please login again.",
        });

        return;
      }

      await axios.delete(
        `${NEW_BASE_URL}/api/v1/profile/hotels/${hotelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHotels((prev) => {
        const updated = { ...prev };
        delete updated[hotelId];
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Hotel deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("DELETE HOTEL ERROR:", error);
      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error?.response?.data?.message ||
          error?.response?.data?.responseMessage ||
          "Unable to delete hotel.",
      });
    } finally {
      setHotelLoading(false);
    }
  };

  return {
    hotels,

    editingHotel,
    showAddHotel,

    hotelForm,
    hotelLoading,

    handleHotelChange,

    handleAddHotel,
    handleOpenAddHotel,
    handleCloseAddHotel,

    handleEditHotel,
    handleCloseHotelModal,
    handleUpdateHotel,
    handleDeleteHotel,
  };
};

export default useHotelManager;