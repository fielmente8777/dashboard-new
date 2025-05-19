import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IoMdCheckmark } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import Swal from "sweetalert2";
import { fetchUserManagementData } from "../../services/api";
import EditUserPopup from "./EditUserPopup";
import UserMgmtPopup from "./UserMgmtPopup";
import handleLocalStorage from "../../utils/handleLocalStorage";

const Usermanagement = () => {
  const [userManagementData, setUserManagementData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isHover, setIsHover] = useState();
  const [editUserData, setEditUserData] = useState({});

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const usersData = await fetchUserManagementData(token);
    console.log(usersData);
    setUserManagementData(usersData);
  };

  const deleteUserFromManagement = async (emailId) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete user: ${emailId}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch(
          `https://nexon.eazotel.com/user/delete/${emailId}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: result.Message || "User has been deleted successfully.",
          timer: 600,
          showConfirmButton: false,
        }).then(() => {
          if (result.Status) {
            fetchData();
          }
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User Management API error. Please try again.",
        });
      }
    }
  };

  const handleEditUserData = (user) => {
    const scopeToPermissionMap = {
      cms: "CMS",
      bookingEngine: "Booking Engine",
      socialMedia: "Social Media",
      reservationDesk: "Reservation Desk",
      frontDesk: "Frontdesk",
      channelManager: "Channel Manager",
      seoManager: "SEO Manager",
      foodManager: "Food Manager",
      themes: "Themes Manager",
      gatewayManager: "Gateway Manager",
    };

    const userPermissions = Object.entries(user.accessScope || {})
      .filter(([key, value]) => value === "true" || value === true)
      .map(([key]) => scopeToPermissionMap[key])
      .filter(Boolean); // remove undefined if any mismatch

    setEditUserData({
      ...user,
      permissions: userPermissions, // this will be used by the popup
    });
    setIsEditPopupOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!userManagementData) return <div>Loading...</div>;
  return (
    <>
      <div className="flex justify-end items-center">
        <button
          onClick={() => setIsPopupOpen(true)}
          className="border transition-all duration-300 px-4 py-2 shadow-md font-medium text-sm border-primary text-gray-800 hover:bg-primary/90 hover:text-white rounded-md"
        >
          Add New User
        </button>
      </div>

      <div className="flex flex-col justify-center text-white overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-slate-800 text-white/90 rounded-sm shadow-md shadow-black/20">
            <thead>
              <tr className="border-b whitespace-nowrap">
                <th className="py-3 px-4 text-[14px] font-medium  capitalize">
                  Name
                </th>
                <th className="py-2 px-4 text-[14px] font-medium  capitalize">
                  Email
                </th>
                {/* {accessRoles?.slice(0, 4).map((role) => (
                  <th
                    key={role}
                    className="py-2 px-2 text-[14px] text-center font-medium text-[#575757] capitalize"
                  >
                    {role}
                  </th>
                ))} */}
                <th className="py-2 px-4 text-[14px] font-medium  capitalize">
                  Admin
                </th>
                <th className="py-2 px-4 text-[14px] font-medium  capitalize whitespace-nowrap">
                  Date Added
                </th>
                <th className="py-2 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-gray-500">
              {userManagementData &&
                userManagementData
                  ?.filter(
                    (data) =>
                      data?.isAdmin === true ||
                      data?.assigned_location?.some(
                        (location) =>
                          String(location?.hid) ===
                          String(handleLocalStorage("hid"))
                      )
                  )
                  .map((user, index) => (
                    <tr
                      key={index}
                      className="border-b odd:bg-gray-50 even:bg-gray-100 rounded-lg border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer"
                    >
                      <td className="py-2 px-4 text-[14px] font-medium text-[#575757] capitalize">
                        {user.displayName}
                      </td>
                      <td className="py-2 px-4 text-[14px] text-[#575757] lowercase">
                        {user.emailId}
                      </td>

                      <td className="py-3 px-4 text-[#575757] text-start">
                        {user?.role || "-"}
                      </td>

                      <td className="py-2 px-4 text-[14px] whitespace-nowrap  text-[#575757] lowercase">
                        {new Date(user.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                      </td>

                      <td className="text-gray-500">
                        {/* {isAdmin ? <button className='btn me-2' onClick={() => { editUserData(user) }}>edit</button> : ""} */}
                        {user.isAdmin ? (
                          <span className="ml-4">-</span>
                        ) : (
                          <span
                            className="flex items-center gap-3"
                            title="Preview & Edit"
                          >
                            {" "}
                            <MdDeleteOutline
                              size={20}
                              onClick={() =>
                                deleteUserFromManagement(user.emailId)
                              }
                              className="text-red-500 mt-[2px]"
                            />{" "}
                            <FaEdit
                              onClick={() => {
                                handleEditUserData(user);
                              }}
                              className="text-black"
                            />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* render user management popup for user deails */}
      <UserMgmtPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        fetchData={fetchData}
      />

      {/* render edit user popup for editing  */}
      <EditUserPopup
        editData={editUserData}
        setEditUserData={setEditUserData}
        isEditPopupOpen={isEditPopupOpen}
        onClose={() => setIsEditPopupOpen(false)}
        fetchData={fetchData}
      />
    </>
  );
};

export default Usermanagement;
