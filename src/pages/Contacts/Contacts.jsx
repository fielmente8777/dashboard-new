import { useEffect, useState } from "react";
import { BASE_URL } from "../../data/constant";
import { formatDateByDay } from "../../utils/formateData";
import AddContactPopup from "../../components/Popup/AddContactPopup";
import { MdDelete } from "react-icons/md";
import { getContacts } from "../../services/api/contact.api";
const Contacts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState({});

  const [isEdit, setIsEdit] = useState(false);

  const getContactsData = async () => {
    // API call to fetch contacts will be here
    try {
      const token = localStorage.getItem("token");
      const res = await getContacts(token);

      // console.log(res);
      setContacts(res);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    getContactsData();
  }, []);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = contacts.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(contacts.length / itemsPerPage);

  const [open, setOpen] = useState(false);
  const handlePopup = (contact) => {
    setIsEdit(true);
    setSelectedContact(contact);
    setOpen(true);
  };
  const handleAddPopup = () => {
    setIsEdit(false);
    setOpen(true);
  };

  const [loading, setLoading] = useState(false);

  const handleDeleteContact = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/contact/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (result.Status === true) {
        getContactsData();
      }
    } catch (error) {
      // console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold mb-4">Contacts</h2>
        <button
          className="bg-primary py-2 px-5 text-white font-semibold"
          onClick={handleAddPopup}
        >
          Add new Contact
        </button>
      </div>

      <table className="w-full  text-left bg-[#0a3a75] text-white/90 rounded-sm shadow-sm">
        <thead>
          <tr className="border-b">
            {/* <th className="py-3 px-2 text-[14px] font-medium">Select</th> */}
            <th className="py-3 px-2 text-[14px] font-medium">#</th>
           

            <th className="py-3 px-2 text-[14px] font-medium">Name</th>
            <th className="py-3 px-2 text-[14px] font-medium">Contact</th>
            <th className="py-3 px-2 text-[14px] font-medium">Email</th>
            <th className="py-3 px-2 text-[14px] font-medium">Date Added</th>
            <th className="py-3 px-2 text-[14px] font-medium">Source</th>
            <th className="py-3 px-2 text-[14px] font-medium">Action</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((row, index) => (
              <tr
                key={row.id}
                onClick={() => handlePopup(row)}
                className="py-1 border-b odd:bg-gray-50 even:bg-gray-100 text-black"
              >
                {/* <td className="py-3 px-2">
                  <input type="checkbox" />
                </td> */}
                <td className=" flex-1 py-3 px-2">{index + 1}</td>

                

                <td className="  flex-1 py-3 px-2 whitespace-nowrap">
                  {row?.name}
                </td>
                <td className=" flex-1 py-3 px-2">{row.phone}</td>
                <td className=" flex-1 py-3 px-2">{row.email}</td>

                <td className=" flex-1 py-3 px-2">
                  {formatDateByDay(row.created_at)}
                </td>
                <td className=" flex-1 py-3 px-2">
                  {row.added_from?.toLowerCase() === "eazobot"
                    ? "Eazbot"
                    : row.added_from}
                </td>

                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContact(row._id);
                    }}
                    className={`border hover:bg-red-600 hover:text-white flex justify-center text-lg  text-red-600 cursor-pointer flex-1 py-2 px-2`}
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white text-gray-600 text-center border">
              <td colSpan={9} className="py-2">
                Data not found!
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end gap-3 mt-3">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="font-medium text-[14px]">
          Page {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div>
        <AddContactPopup
          open={open}
          setOpen={setOpen}
          isEdit={isEdit}
          contact={selectedContact}
          setSelectedContact={setSelectedContact}
          getContacts={getContacts}
        />
      </div>
    </div>
  );
};

export default Contacts;
