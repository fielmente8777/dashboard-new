import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FiUploadCloud, FiFileText, FiImage, FiVideo } from "react-icons/fi";
import VariableSamples from "./VariableSample";

const FIELD =
  "w-full min-w-0 rounded-[var(--r-sm)] border border-app-border bg-app-surface px-[var(--sp-3)] py-[var(--sp-2)] text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";
const LABEL =
  "block mb-2 text-[length:var(--fs-sm)] font-medium text-gray-700 dark:text-app-text-muted";

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
    <div className="bg-app-surface rounded-[var(--r-lg)] border border-primary/30 p-[var(--sp-5)] space-y-[var(--sp-5)]">
      <h2 className="text-[length:var(--fs-lg)] font-semibold text-app-text">
        Template Content
      </h2>

      {/* Header Type */}

      <div>
        <label className={LABEL}>Header Type</label>

        <select {...register("headerType")} className={`${FIELD} cursor-pointer`}>
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
          <div className="flex flex-wrap justify-between gap-2 mb-2">
            <label className="text-[length:var(--fs-sm)] font-medium text-gray-700 dark:text-app-text-muted">
              Header
            </label>

            <button
              type="button"
              onClick={addHeaderVariable}
              className="text-primary dark:text-app-text-muted text-[length:var(--fs-sm)] hover:underline"
            >
              + Add Variable
            </button>
          </div>

          <input
            {...register("header")}
            placeholder="Header Text"
            maxLength={60}
            className={FIELD}
          />

          <div className="flex flex-wrap justify-between gap-2 text-[length:var(--fs-xs)] mt-1">
            <span className="text-yellow-600 dark:text-yellow-400">
              Only one variable allowed.
            </span>

            <span className="text-gray-500 dark:text-app-text-faint">
              {header.length}/60
            </span>
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
        <div className="flex flex-wrap justify-between gap-2 mb-2">
          <label className="text-[length:var(--fs-sm)] font-medium text-gray-700 dark:text-app-text-muted">
            Body
          </label>

          <button
            type="button"
            onClick={addBodyVariable}
            className="text-primary dark:text-app-text-muted text-[length:var(--fs-sm)] hover:underline"
          >
            + Add Variable
          </button>
        </div>

        <textarea
          {...register("body")}
          rows={7}
          maxLength={1024}
          className={`${FIELD} resize-y`}
        />

        <div className="flex flex-wrap justify-between gap-2 text-[length:var(--fs-xs)] mt-1">
          {errors.body && (
            <span className="text-red-500">{errors.body.message}</span>
          )}

          <span className="ml-auto text-gray-500 dark:text-app-text-faint">
            {body.length}/1024
          </span>
        </div>
      </div>

      {/* FOOTER */}

      <div>
        <label className={LABEL}>Footer</label>

        <input {...register("footer")} maxLength={60} className={FIELD} />

        <div className="text-right text-[length:var(--fs-xs)] text-gray-500 dark:text-app-text-faint mt-1">
          {footer.length}/60
        </div>
      </div>

      <VariableSamples />
    </div>
  );
};

export default TemplateContent;

const UploadCard = ({ icon, accept, file, onChange }) => {
  return (
    <div>
      <label className={LABEL}>Upload Header Media</label>

      <label className="border-2 border-dashed border-app-border rounded-[var(--r-md)] p-[var(--sp-6)] flex flex-col items-center justify-center cursor-pointer text-app-text hover:border-primary hover:text-primary transition-colors">
        {icon}

        <p className="mt-3 text-[length:var(--fs-sm)]">Click to upload</p>

        <input
          hidden
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0])}
        />
      </label>

      {file && (
        <div className="mt-[var(--sp-4)]">
          {file?.type?.startsWith("image") && (
            <img
              src={URL.createObjectURL(file)}
              className="h-44 w-full max-w-xs rounded-[var(--r-md)] object-cover border border-app-border"
            />
          )}

          {file?.type?.startsWith("video") && (
            <video controls className="h-44 w-full max-w-xs rounded-[var(--r-md)]">
              <source src={URL.createObjectURL(file)} />
            </video>
          )}

          {!file?.type?.startsWith("image") &&
            !file?.type?.startsWith("video") && (
              <div className="rounded-[var(--r-md)] border border-app-border bg-app-surface-secondary p-[var(--sp-4)] text-[length:var(--fs-sm)] text-app-text break-words">
                {file.name}
              </div>
            )}
        </div>
      )}
    </div>
  );
};