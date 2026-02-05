import { useEffect, useState } from 'react'
import { extractBookingInfo } from './Leads';
import handleLocalStorage from '../../utils/handleLocalStorage';
import { getAllClientEnquires } from '../../services/api/clientEnquire.api';
import { formatDateTime } from '../../services/formateDate';

export const formatPhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, ""); // remove non-digit characters

  if (cleaned.length === 10) {
    cleaned = "91" + cleaned; // prepend country code if it's a 10-digit
  }

  return cleaned;
};
const EazbotEnquiries = () => {
    const [enquires, setEnquires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    const fetchEnquires = async (token) => {
        setLoading(true);
        try {
            const hid = handleLocalStorage("hid");
            const response = await getAllClientEnquires({
            token,
            hid,
            // status: "Open",
            });
            setEnquires(response?.reverse());
        } catch (error) {
            console.error("Error fetching enquires:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    fetchEnquires(localStorage.getItem("token"));
    }, []);

    const totalPages = Math.ceil(enquires.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = enquires.slice(
        startIndex,
        startIndex + itemsPerPage
    );

const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <div className=''>
        {!loading ? (
                  <div className="overflow-auto">
                 
                    <table className="w-full text-left bg-[#0a3a75] text-white/90 shadow-md shadow-black/20">
                      <thead>
                        <tr className="border-b">
                         
                          <th className="py-3 px-2 text-[14px] font-medium capitalize">
                            #
                          </th>

                          <th className="py-3 px-2 text-[14px] font-medium capitalize">
                            Date Added
                          </th>
                          <th className="py-3 px-2 text-[14px] font-medium capitalize">
                            Source
                          </th>
        

                          <th className="py-3 px-2 text-[14px] font-medium capitalize">
                            Visitor Name
                          </th>
                          <th className="py-3 px-2 text-[14px] font-medium capitalize">
                            Contact
                          </th>
                          <th className="py-3 px-2 text-[14px] font-medium capitalize">
                            Email
                          </th>
                          {/* <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                            Number of Guests
                          </th>
                          <th className="py-3 px-2 text-[14px] font-medium capitalize whitespace-nowrap">
                            Check In
                          </th>
                          <th className="py-3 px-2 text-[14px] font-medium capitalize whitespace-nowrap">
                            Check Out
                          </th> */}
                          
                        </tr>
                      </thead>
        
                      {currentItems?.length > 0 ? (
                        <tbody>
        
                          {currentItems.map((enquery, index) => (
                            <tr
                              key={index}
                              className={`py-1 border-b odd:bg-gray-50 even:bg-gray-100 border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer ${
                                enquery?.status === "Open"
                                  ? " text-[#575757]"
                                  : "text-[#575757]"
                              }`}
                              
                            >
                              
                              <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                                {index + 1}
                              </td>
        
                              <td className="py-3 px-2 text-[14px] whitespace-nowrap capitalize">
                                {enquery?.Created_at
                                  ? formatDateTime(enquery?.Created_at)
                                  : ""}
                              </td>
                              <td className="py-3 px-2 text-[14px] font-semibold">
                                {enquery?.created_from?.toLowerCase() === "chatbot"
                                  ? "Eazbot"
                                  : enquery?.created_from?.toLowerCase() === "Eazbot"
                                  ? "Eazbot"
                                  : enquery?.created_from === "Eazobt"
                                  ? "Eazbot"
                                  : enquery?.created_from?.toLowerCase() === "eazobot"
                                  ? "Eazbot"
                                  : enquery?.created_from === "Website"
                                  ? "Webform"
                                  : enquery?.created_from === null
                                  ? "Webform"
                                  : "Webform"}
                              </td>

                              <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
                                {/* {enquery?.Name.slice(0, 15)} */}
                                {enquery?.Name?.substring(0, 15)}
                              </td>
                              <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                                {formatPhoneNumber(enquery?.Contact)}
                              </td>
                              <td className="py-3 px-2 text-[14px] text-[#575757]">
                                {enquery?.Email === "undefined" ? "-" : enquery?.Email}
                              </td>
        
                              {/* <td className="py-3 px-2 text-[14px] text-[#575757] text-center">
                                {enquery?.numberOfGuest == ""
                                  ? "-"
                                  : enquery?.numberOfGuest
                                  ? enquery?.numberOfGuest
                                  : isNaN(
                                      extractBookingInfo(enquery?.Message)?.guests
                                    ) ||
                                    extractBookingInfo(enquery?.Message)?.guests === 0
                                  ? "-"
                                  : extractBookingInfo(enquery?.Message)?.guests}
                              </td>
        
                        
                              <td className="py-3 px-2 text-[14px] text-[#575757]">
                                {enquery?.check_in
                                  ? enquery?.check_in === "undefined"
                                    ? "-"
                                    : enquery.check_in
                                  : extractBookingInfo(enquery?.Message)?.checkIn ||
                                    "-"}
                              </td>
                              <td className="py-3 px-2 text-[14px] text-[#575757]">
                                {enquery?.check_out
                                  ? enquery?.check_out === "undefined"
                                    ? "-"
                                    : enquery.check_out
                                  : extractBookingInfo(enquery?.Message)?.checkOut ||
                                    "-"}
                              </td> */}
                            </tr>
                          ))}
                        </tbody>
                      ) : (
                        <tbody>
                          <tr className="bg-white text-gray-600 text-center border">
                            <td colSpan={12} className="py-2">
                              Data not found!
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </table>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...Array(itemsPerPage)].map((_, index) => (
                      <div key={index}>
                        <p className="py-[1.35rem] animate-pulse bg-gray-100"></p>
                      </div>
                    ))}
                  </div>
                )}


                {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 max-w-[800px] overflow mx-auto">
            <nav className="inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 shadow-sm">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm rounded-md transition-all whitespace-nowrap duration-200
          ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100 text-gray-700"
          }`}
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="flex overflow-x-auto hide-scrollbar">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) => {
                    return (
                      page === 1 || // first page
                      page === totalPages || // last page
                      (page >= currentPage - 1 && page <= currentPage + 1) // nearby pages
                    );
                  })
                  .reduce((acc, page, index, arr) => {
                    if (index > 0 && page - arr[index - 1] > 1) {
                      acc.push("ellipsis");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200
                  ${
                    currentPage === item
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-all duration-200
          ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100 text-gray-700"
          }`}
              >
                Next →
              </button>
            </nav>
          </div>
        )}
    </div>
  )
}

export default EazbotEnquiries