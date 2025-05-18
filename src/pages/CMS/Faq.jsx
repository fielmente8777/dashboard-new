import { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const Analytics = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [websitedata, setWebsitedata] = useState({});
  const [websitefaqdata, setWebsitefaqdata] = useState([]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const { currentLoactionWebsiteData, loading } = useSelector(
    (state) => state?.hotelsWebsiteData
  );

  // const deleteFaq = async (que, ans) => {
  //   const confirmation = await Swal.fire({
  //     title: "Are you sure?",
  //     text: `Do you really want to delete this ${que}? This action cannot be undone.`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Yes, delete it!",
  //     cancelButtonText: "Cancel",
  //   });
  //   if (confirmation.isConfirmed) {
  //     try {
  //       const response = await fetch(
  //         `https://nexon.eazotel.com/cms/operation/Faq`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             token: localStorage.getItem("token"),
  //             operation: "remove",
  //             question: que,
  //             answer: ans,
  //             index: "0",
  //           }),
  //         }
  //       );
  //       const data = await response.json();
  //       console.log(data);
  //       Swal.fire({
  //         icon: "success",
  //         title: "Deleted!",
  //         text: data.Message || "User has been deleted successfully.",
  //         timer: 600,
  //         showConfirmButton: false,
  //       });
  //       // .then(() => {
  //       //     if (data.Status) {
  //       //         fetchData();
  //       //     }
  //       // });
  //       fetchData();
  //       console.log("FAQ deleted successfully:", data);
  //     } catch (error) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error",
  //         text: "Faq API error. Please try again.",
  //       });
  //     }
  //   }
  // };

  // const addFaq = async () => {
  //   console.log("question", question, "answer", answer);
  //   if (question === "" || answer === "") {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error",
  //       text: "Please fill in all fields.",
  //     });
  //     return;
  //   }

  //   let obj = {
  //     token: localStorage.getItem("token"),
  //     operation: "append",
  //     question: question,
  //     answer: answer,
  //     index: 0,
  //   };

  //   try {
  //     obj["token"] = localStorage.getItem("token");
  //     const url = `https://nexon.eazotel.com/cms/operation/Faq`;
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(obj),
  //     });
  //     const resp = await response.json();
  //     console.log(resp);
  //     if (resp.Status === true) {
  //       Swal.fire({
  //         icon: "success",
  //         title: "Success",
  //         text: resp.Message || "FAQ added successfully.",
  //       }).then(() => {
  //         fetchData();
  //         setAnswer("");
  //         setQuestion("");
  //       });
  //       return true;
  //     } else {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error",
  //         text: resp.Message || "Failed to add FAQ.",
  //       });
  //       return false;
  //     }
  //   } catch {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error",
  //       text: "An error occurred while adding the FAQ.",
  //     });
  //     return false;
  //   }
  // };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white">
      <div className="bg-white p-4">
        <h2 className="text-sm font-semibold text-[#575757]">
          Frequently ask questions
        </h2>
      </div>
      <div className="px-4">
        {!loading ? (
          <>
            {currentLoactionWebsiteData?.Details &&
            currentLoactionWebsiteData?.Details?.Faq?.length > 0 ? (
              currentLoactionWebsiteData?.Details?.Faq.map((faq, index) => (
                <div key={index} className="border-b border-gray-200">
                  <button
                    className="w-full flex justify-between items-center text-left text-sm py-3 font-medium text-[#333] focus:outline-none"
                    onClick={() => toggleAccordion(index)}
                  >
                    {faq.Question}{" "}
                    {openIndex === index && (
                      <MdDeleteOutline
                        size={20}
                        // onClick={() => deleteFaq(faq.Question, faq.Answer)}
                        className="text-red-500 mt-[2px]"
                      />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="pb-4 text-sm text-gray-600">
                      {faq.Answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No FAQs available.</p>
            )}
          </>
        ) : (
          <p className="h-[50dvh] animate-pulse bg-gray-100 mt-2"></p>
        )}

        {/* <div className="mt-4 rounded">
          <h2 className="text-sm font-semibold text-[#575757] mt-4">Add FAQ</h2>
          <div className="flex flex-col gap-4 mt-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Question"
              className="border border-gray-300 p-2 rounded outline-none"
            />
            <textarea
              placeholder="Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={500}
              className="border border-gray-300 p-2 rounded outline-none"
              rows="4"
            />
            <button
              onClick={addFaq}
              className="bg-[#0a3a75] text-white py-2 px-4 rounded"
            >
              Add FAQ
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Analytics;
