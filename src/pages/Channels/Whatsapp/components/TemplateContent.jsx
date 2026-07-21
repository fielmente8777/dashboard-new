import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FiUploadCloud, FiFileText, FiImage, FiVideo } from "react-icons/fi";
import VariableSamples from "./VariableSample";

const TemplateContent = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const headerType = watch("headerType") || "NONE";
  const header = watch("header") || "";
  const body = watch("body") || "";
  const footer = watch("footer") || "";

  const headerImage = watch("headerImage");
  const headerVideo = watch("headerVideo");
  const headerDocument = watch("headerDocument");

  useEffect(() => {
    if (headerType !== "TEXT") setValue("header", "");

    if (headerType !== "IMAGE") setValue("headerImage", null);

    if (headerType !== "VIDEO") setValue("headerVideo", null);

    if (headerType !== "DOCUMENT") setValue("headerDocument", null);
  }, [headerType]);

  const getNextVariable = (text) => {
    const matches = text.match(/{{\d+}}/g) || [];
    return matches.length + 1;
  };

  const addHeaderVariable = () => {
    if (header.match(/{{\d+}}/g)?.length > 0) return;

    setValue("header", header + `{{${getNextVariable(header)}}}`);
  };

  const addBodyVariable = () => {
    setValue("body", body + ` {{${getNextVariable(body)}}}`);
  };

  return (
    <div className="bg-app-surface rounded-xl border border-primary/30 p-6 space-y-6">
      <h2 className="text-lg font-semibold">Template Content</h2>

      {/* Header Type */}

      <div>
        <label className="block mb-2 text-sm font-medium">Header Type</label>

        <select
          {...register("headerType")}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="NONE">None</option>
          <option value="TEXT">Text</option>
          <option value="IMAGE">Image</option>
          {/* <option value="VIDEO">Video</option>
          <option value="DOCUMENT">Document</option> */}
        </select>
      </div>

      {/* TEXT */}

      {headerType === "TEXT" && (
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Header</label>

            <button
              type="button"
              onClick={addHeaderVariable}
              className="text-primary text-sm"
            >
              + Add Variable
            </button>
          </div>

          <input
            {...register("header")}
            placeholder="Header Text"
            maxLength={60}
            className="w-full rounded-md border px-3 py-2"
          />

          <div className="flex justify-between text-xs mt-1">
            <span className="text-yellow-600">Only one variable allowed.</span>

            <span>{header.length}/60</span>
          </div>
        </div>
      )}

      {/* IMAGE */}

      {headerType === "IMAGE" && (
        <UploadCard
          icon={<FiImage size={32} />}
          accept="image/*"
          file={headerImage}
          onChange={(file) =>
            setValue("headerImage", file, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
        />
      )}

      {/* VIDEO */}

      {headerType === "VIDEO" && (
        <UploadCard
          icon={<FiVideo size={32} />}
          accept="video/*"
          file={headerVideo}
          onChange={(file) => setValue("headerVideo", file)}
        />
      )}

      {/* DOCUMENT */}

      {headerType === "DOCUMENT" && (
        <UploadCard
          icon={<FiFileText size={32} />}
          accept=".pdf,.doc,.docx"
          file={headerDocument}
          onChange={(file) => setValue("headerDocument", file)}
        />
      )}

      {/* BODY */}

      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">Body</label>

          <button
            type="button"
            onClick={addBodyVariable}
            className="text-primary text-sm"
          >
            + Add Variable
          </button>
        </div>

        <textarea
          {...register("body")}
          rows={7}
          maxLength={1024}
          className="w-full rounded-md border px-3 py-2"
        />

        <div className="flex justify-between text-xs mt-1">
          {errors.body && (
            <span className="text-red-500">{errors.body.message}</span>
          )}

          <span className="ml-auto">{body.length}/1024</span>
        </div>
      </div>

      {/* FOOTER */}

      <div>
        <label className="block mb-2 text-sm font-medium">Footer</label>

        <input
          {...register("footer")}
          maxLength={60}
          className="w-full rounded-md border px-3 py-2"
        />

        <div className="text-right text-xs mt-1">{footer.length}/60</div>
      </div>

      <VariableSamples />
    </div>
  );
};

export default TemplateContent;

const UploadCard = ({ icon, accept, file, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Upload Header Media
      </label>

      <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
        {icon}

        <p className="mt-3 text-sm">Click to upload</p>

        <input
          hidden
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0])}
        />
      </label>

      {file && (
        <div className="mt-4">
          {file.type.startsWith("image") && (
            <img
              src={URL.createObjectURL(file)}
              className="h-44 rounded-lg object-cover border"
            />
          )}

          {file.type.startsWith("video") && (
            <video controls className="h-44 rounded-lg">
              <source src={URL.createObjectURL(file)} />
            </video>
          )}

          {!file.type.startsWith("image") && !file.type.startsWith("video") && (
            <div className="rounded-lg border p-4">{file.name}</div>
          )}
        </div>
      )}
    </div>
  );
};

// import { useFormContext } from "react-hook-form";
// import VariableSamples from "./VariableSample";
// import { useToast } from "../../../../context/ToastContext";

// const TemplateContent = () => {
//   const toast = useToast();
//   const {
//     register,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useFormContext();

//   const header = watch("header") || "";
//   const body = watch("body") || "";
//   const footer = watch("footer") || "";

//   // const [totalHeaderVariables, totalBodyVariables] = [
//   //   header.match(/{{\d+}}/g)?.length || 0,
//   //   body.match(/{{\d+}}/g)?.length || 0,
//   // ];

//   const getNextVariable = (text) => {
//     const matches = text.match(/{{\d+}}/g) || [];
//     return matches.length + 1;
//   };

//   const addHeaderVariable = () => {
//     if (header.match(/{{\d+}}/g)?.length > 0) {
//       // toast.show("Only one header variable is allowed.");
//       return;
//     }

//     const next = getNextVariable(header);
//     setValue("header", header + `{{${next}}}`);
//   };

//   const addBodyVariable = () => {
//     const next = getNextVariable(body);
//     setValue("body", body + ` {{${next}}}`);
//   };

//   return (
//     <div className="bg-app-surface p-6 rounded-lg border-primary/60! space-y-6">
//       <h2 className="text-lg font-semibold">Content</h2>

//       {/* HEADER */}
//       <div>
//         <div className="flex justify-between items-center mb-1">
//           <label className="text-sm font-medium text-gray-700 dark:text-app-text-faint">
//             Header <span className="text-gray-600">(optional)</span>
//           </label>

//           <button
//             type="button"
//             onClick={addHeaderVariable}
//             className="text-sm text-primary dark:text-app-text-muted font-medium"
//           >
//             + Add variable
//           </button>
//         </div>

//         <input
//           {...register("header")}
//           placeholder="Header text"
//           maxLength={60}
//           className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
//           focus:outline-none focus:ring-1 focus:ring-primary transition"
//         />

//         <div className="text-xs text-gray-500 mt-1 text-right flex justify-between">
//           <span className="text-yellow-600">
//             Note: Only 1 header variable is allowed
//           </span>{" "}
//           {header.length}/60
//         </div>
//       </div>

//       {/* BODY */}
//       <div>
//         <div className="flex justify-between items-center mb-1">
//           <label className="text-sm font-medium text-gray-700 dark:text-app-text-faint">
//             Body
//           </label>

//           <button
//             type="button"
//             onClick={addBodyVariable}
//             className="text-sm text-primary dark:text-app-text-muted font-medium"
//           >
//             + Add variable
//           </button>
//         </div>

//         <textarea
//           {...register("body")}
//           rows={6}
//           maxLength={1024}
//           placeholder="Body text"
//           className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
//           focus:outline-none focus:ring-1 focus:ring-primary transition"
//         />

//         <div className="flex justify-between text-xs mt-1">
//           {errors.body && <p className="text-red-500">{errors.body.message}</p>}

//           <span className="text-gray-500 ml-auto">{body.length}/1024</span>
//         </div>
//       </div>

//       {/* FOOTER */}
//       <div>
//         <label className="text-sm font-medium text-gray-700 dark:text-app-text-faint">
//           Footer <span className="text-gray-600">(optional)</span>
//         </label>

//         <input
//           {...register("footer")}
//           placeholder="Footer"
//           maxLength={60}
//           className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
//           focus:outline-none focus:ring-1 focus:ring-primary transition"
//         />

//         <div className="text-xs text-gray-500 mt-1 text-right">
//           {footer.length}/60
//         </div>
//       </div>

//       <VariableSamples />
//     </div>
//   );
// };

// export default TemplateContent;
