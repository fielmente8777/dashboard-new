import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IoMdCheckmark } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import Swal from "sweetalert2";
import { fetchUserManagementData } from "../../services/api";
import EditUserPopup from "./EditUserPopup";
import UserMgmtPopup from "./UserMgmtPopup";

const accessRoles = [
  "bookingEngine",
  "channelManager",
  "cms",
  "foodManager",
  "frontDesk",
  "gatewayManager",
  "reservationDesk",
  "seoManager",
  "socialMedia",
  "themes",
  "PMS",
  "GRM",
  "HRM",
];

const Usermanagement = () => {
  const [userManagementData, setUserManagementData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isHover, setIsHover] = useState();
  const [editUserData, setEditUserData] = useState({});

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const usersData = await fetchUserManagementData(token);
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
          className="border-b-2 border-transparent hover:border-b-2 hover:border-[#575757] transition-all duration-300 px-4 py-3 bg-white font-medium text-[#575757]"
        >
          Add New user
        </button>
      </div>

      <div className="flex flex-col justify-center  bg-white  text-white overflow-hidden">
        <div className="px-4 overflow-x-auto">
          <table className="w-full text-left bg-white ">
            <thead>
              <tr className="border-b whitespace-nowrap">
                <th className="py-3 text-[14px] font-medium text-[#575757] capitalize">
                  Name
                </th>
                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">
                  Email
                </th>
                {accessRoles?.slice(0, 4).map((role) => (
                  <th
                    key={role}
                    className="py-2 px-2 text-[14px] text-center font-medium text-[#575757] capitalize"
                  >
                    {role}
                  </th>
                ))}
                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">
                  Admin
                </th>
                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize whitespace-nowrap">
                  Date Added
                </th>
                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {userManagementData?.map((user, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer"
                >
                  <td className="py-2 text-[14px] font-medium text-[#575757] capitalize">
                    {user.displayName}
                  </td>
                  <td className="py-2 text-[14px]  text-[#575757] lowercase">
                    {user.emailId}
                  </td>

                  {user.accessScope &&
                    Object.entries(user.accessScope)
                      .slice(0, 4)
                      .map(([role, hasAccess]) => (
                        <td key={role} className="text-center">
                          <div className="flex justify-center">
                            {hasAccess ? (
                              <IoMdCheckmark className="h-6 w-6 text-green-500" />
                            ) : (
                              <IoClose className="h-6 w-6 text-red-500" />
                            )}
                          </div>
                        </td>
                      ))}
                  {/* {
                                    accessRoles.slice(0, 4).map((role) => (
                                        <td key={role} className="text-center">
                                            <div className='flex justify-center'>
                                                {user.accessScope[role] !== "true" ? (
                                                    <IoClose className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <IoMdCheckmark className="h-6 w-6 text-red-500" />
                                                )}
                                            </div>
                                        </td>
                                    ))
                                } */}
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <IoMdCheckmark className="h-6 w-6 text-green-500" />
                    ) : (
                      <IoClose className="h-6 w-6 text-red-500" />
                    )}
                  </td>
                  <td className="py-2 text-[14px] whitespace-nowrap  text-[#575757] lowercase">
                    {new Date(user.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                  </td>

                  <td>
                    {/* {isAdmin ? <button className='btn me-2' onClick={() => { editUserData(user) }}>edit</button> : ""} */}
                    {user.isAdmin ? (
                      ""
                    ) : (
                      <span className="flex items-center gap-3">
                        {" "}
                        <MdDeleteOutline
                          size={20}
                          onClick={() => deleteUserFromManagement(user.emailId)}
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
