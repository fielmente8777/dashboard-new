// const TemplateUsage = ({ data }) => {
//   const usage = data?.whatsapp_template_usage;

//   if (!usage) return null;

//   return (
//     <div className="bg-white p-5 rounded-xl shadow mt-6">
//       <h2 className="text-lg font-semibold mb-4">
//         WhatsApp Template Usage
//       </h2>

//       {/* Summary */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <div className="bg-gray-50 p-3 rounded-lg text-center">
//           <p className="text-xs text-gray-500">Sent</p>
//           <p className="font-bold text-lg">
//             {usage.summary?.total_templates_sent ?? 0}
//           </p>
//         </div>

//         <div className="bg-green-50 p-3 rounded-lg text-center">
//           <p className="text-xs text-gray-500">Delivered</p>
//           <p className="font-bold text-lg text-green-600">
//             {usage.summary?.total_delivered ?? 0}
//           </p>
//         </div>

//         <div className="bg-red-50 p-3 rounded-lg text-center">
//           <p className="text-xs text-gray-500">Failed</p>
//           <p className="font-bold text-lg text-red-500">
//             {usage.summary?.total_failed ?? 0}
//           </p>
//         </div>
//       </div>

//       {/* Categories */}
//       {Object.entries(usage.categories || {}).map(([key, value]) => (
//         <div key={key} className="mb-5">
//           {/* Category Header */}
//           <div className="flex justify-between items-center mb-2">
//             <h3 className="font-medium capitalize">{key}</h3>

//             <div className="text-xs text-gray-500">
//               {value.templates_sent ?? 0} sent •{" "}
//               <span className="text-green-600">
//                 {value.delivered ?? 0}
//               </span>{" "}
//               •{" "}
//               <span className="text-red-500">
//                 {value.failed ?? 0}
//               </span>
//             </div>
//           </div>

//           {/* Template List */}
//           <div className="space-y-2">
//             {value.templates?.map((t) => (
//               <div
//                 key={t.template_name}
//                 className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded-lg"
//               >
//                 <span className="capitalize">
//                   {t.template_name.replace(/_/g, " ")}
//                 </span>

//                 <span className="text-xs">
//                   {t.sent ?? 0} /{" "}
//                   <span className="text-green-600">
//                     {t.delivered ?? 0}
//                   </span>{" "}
//                   /{" "}
//                   <span className="text-red-500">
//                     {t.failed ?? 0}
//                   </span>
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TemplateUsage;
const TemplateUsage = ({ data }) => {
    const usage = data?.whatsapp_template_usage;
    if (!usage) return null;

    return (
        <div className="bg-primary p-6 rounded-xl shadow mt-8">
        <div className="bg-white p-5 rounded-xl shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">
                WhatsApp Template Usage
            </h2>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg text-center hover:bg-gray-100 transition">
                    <p className="text-xs text-gray-500">Sent</p>
                    <p className="font-bold text-lg">
                        {usage.summary?.total_templates_sent ?? 0}
                    </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center hover:bg-green-100 transition">
                    <p className="text-xs text-gray-500">Delivered</p>
                    <p className="font-bold text-lg text-green-600">
                        {usage.summary?.total_delivered ?? 0}
                    </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center hover:bg-red-100 transition">
                    <p className="text-xs text-gray-500">Failed</p>
                    <p className="font-bold text-lg text-red-500">
                        {usage.summary?.total_failed ?? 0}
                    </p>
                </div>
            </div>
            {/* Categories */}
            {Object.entries(usage.categories || {}).map(([key, value]) => (
                <div key={key} className="mb-5">    
                    {/* Category Header */} z
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium capitalize">{key}</h3>   
                        <div className="text-xs text-gray-500">
                            {value.templates_sent ?? 0} sent •{" "}
                            <span className="text-green-600">
                                {value.delivered ?? 0}
                            </span>{" "}
                            •{" "}
                            <span className="text-red-500">
                                {value.failed ?? 0}
                            </span>
                        </div>
                    </div>
                    {/* Template List */}   
                    <div className="space-y-2">
                        {value.templates?.map((t) => (
                            <div
                                key={t.template_name}
                                className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <span className="capitalize">
                                    {t.template_name.replace(/_/g, " ")}
                                </span>

                                <span className="text-xs">
                                    {t.sent ?? 0} /{" "}
                                    <span className="text-green-600">
                                        {t.delivered ?? 0}
                                    </span>{" "}
                                    /{" "}
                                    <span className="text-red-500">
                                        {t.failed ?? 0}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))} 
        </div>
        </div>
    );
};

export default TemplateUsage;