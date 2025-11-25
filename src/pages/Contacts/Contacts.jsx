import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../data/constant";
import { formatDate, formatDateByDay } from "../../utils/formateData";
import AddContactPopup from "../../components/Popup/AddContactPopup";

const dummyContacts = [
  {
    id: 1,
    name: "John Doe",
    contact: "9800000001",
    email: "john@example.com",
    guests: 2,
    checkIn: "2025-12-20",
    checkOut: "2025-12-22",
    stage: "Open",
  },
  {
    id: 2,
    name: "Jane Smith",
    contact: "9800000002",
    email: "jane@example.com",
    guests: 4,
    checkIn: "-",
    checkOut: "-",
    stage: "Potential",
  },
  {
    id: 3,
    name: "David Lee",
    contact: "9800000003",
    email: "david@example.com",
    guests: 3,
    checkIn: "2025-12-12",
    checkOut: "2025-12-14",
    stage: "Contacted",
  },
  {
    id: 4,
    name: "Emily Clark",
    contact: "9800000004",
    email: "emily@example.com",
    guests: "-",
    checkIn: "-",
    checkOut: "-",
    stage: "Open",
  },
  {
    id: 5,
    name: "Robert Fox",
    contact: "9800000005",
    email: "robert@example.com",
    guests: 6,
    checkIn: "2025-12-01",
    checkOut: "2025-12-05",
    stage: "Converted",
  },
];

const Contacts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [contacts, setContacts] = useState([]);

  
  const getContacts= async() => {
     // API call to fetch contacts will be here
    try {
      console.log("first")
        const response = await fetch(`${BASE_URL}/contact`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        const result = await response.json();
        console.log(result)
        setContacts(result.Data.reverse());
    } catch (error) {
      console.error("Error fetching contacts:", error); 
    }
  }

  useEffect(() => {
    getContacts();
  }, []);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = contacts.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(contacts.length / itemsPerPage);


  const [open,setOpen]=useState(false);
  const handlePopup = () => {
    // Logic to open AddContactPopup will be here
    setOpen(true);
    console.log("Open Add Contact Popup");
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
      <h2 className="text-xl font-semibold mb-4">Contacts</h2>
      <button className="bg-primary py-2 px-5 text-white font-semibold" onClick={handlePopup}>Add new Contact</button>

      </div>
     
      <table className="w-full table-fixed text-left bg-[#0a3a75] text-white/90 rounded-sm shadow-sm">
        <thead>
          <tr className="border-b">
            {/* <th className="py-3 px-2 text-[14px] font-medium">Select</th> */}
            <th className="py-3 px-2 text-[14px] font-medium">#</th>
            <th className="py-3 px-2 text-[14px] font-medium">Date Added</th>
            <th className="py-3 px-2 text-[14px] font-medium">Source</th>

            <th className="py-3 px-2 text-[14px] font-medium">Name</th>
            <th className="py-3 px-2 text-[14px] font-medium">Contact</th>
            <th className="py-3 px-2 text-[14px] font-medium">Email</th>
          </tr>
        </thead>

        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((row,index) => (
              <tr
                key={row.id}
                className="py-1 border-b odd:bg-gray-50 even:bg-gray-100 text-black"
              >
                {/* <td className="py-3 px-2">
                  <input type="checkbox" />
                </td> */}
                <td className=" flex-1 py-3 px-2">{index+1}</td>
                <td className=" flex-1 py-3 px-2">{row.added_from}</td>

                <td className=" flex-1 py-3 px-2">{formatDateByDay(row.created_at)}</td>

                <td className="  flex-1 py-3 px-2 whitespace-nowrap">{row?.name}</td>
                <td className=" flex-1 py-3 px-2">{row.phone}</td>
                <td className=" flex-1 py-3 px-2">{row.email}</td>
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


      <div><AddContactPopup open={open} setOpen={setOpen} getContacts={getContacts} /></div>
    </div>
  );
};

export default Contacts;
