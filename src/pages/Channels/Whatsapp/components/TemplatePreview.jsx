import { ExternalLink, ImageIcon, Phone, Reply } from "lucide-react";
import { useEffect, useMemo } from "react";
import Icon from "../../../../components/ui/Icon";

const BUTTON_ICONS = { URL: ExternalLink, PHONE_NUMBER: Phone, QUICK_REPLY: Reply };

const fillVariables = (text = "", values = []) =>
  String(text).replace(/{{(\d+)}}/g, (match, n) => values[n - 1] || match);

// A local file needs an object URL to show; a string is already a URL.
const useImageUrl = (file) => {
  const url = useMemo(
    () => (file instanceof File ? URL.createObjectURL(file) : file || null),
    [file],
  );
  useEffect(() => () => file instanceof File && URL.revokeObjectURL(url), [file, url]);
  return url;
};

// How a template looks in a WhatsApp chat. `components` are Meta's template
// components; sample values replace {{1}}, {{2}}… when given.
export default function TemplatePreview({
  components = [],
  headerVariables = [],
  bodyVariables = [],
}) {
  const find = (type) => components.find((c) => c.type === type);
  const header = find("HEADER");
  const body = find("BODY");
  const footer = find("FOOTER");
  const buttons = find("BUTTONS")?.buttons || [];
  const imageUrl = useImageUrl(
    header?.format === "IMAGE" ? header.file || header.example?.header_handle?.[0] : null,
  );

  return (
    <div className="w-full max-w-sm rounded-xl bg-[#efeae2] p-3 dark:bg-[#0b141a]">
      <div className="rounded-lg rounded-tl-none bg-white p-2 text-sm text-gray-900 shadow-sm dark:bg-[#202c33] dark:text-gray-100">
        {header?.format === "IMAGE" &&
          (imageUrl ? (
            <img src={imageUrl} alt="" className="mb-2 max-h-48 w-full rounded-md object-cover" />
          ) : (
            <div className="mb-2 flex h-32 items-center justify-center rounded-md bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <Icon icon={ImageIcon} size="2xl" />
            </div>
          ))}
        {header?.format === "TEXT" && header.text && (
          <p className="mb-1 break-words font-semibold">
            {fillVariables(header.text, headerVariables)}
          </p>
        )}
        <p className="whitespace-pre-line break-words">
          {body?.text ? fillVariables(body.text, bodyVariables) : (
            <span className="text-gray-400">Your message appears here.</span>
          )}
        </p>
        {footer?.text && (
          <p className="mt-1 break-words text-xs text-gray-500 dark:text-gray-400">{footer.text}</p>
        )}
        <p className="mt-1 text-right text-[10px] text-gray-400">12:00</p>
      </div>

      {buttons.length > 0 && (
        <div className="mt-1 space-y-1">
          {buttons.map((button, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-1.5 truncate rounded-lg bg-white py-2 text-sm font-medium text-[#00a5f4] shadow-sm dark:bg-[#202c33] dark:text-[#53bdeb]"
            >
              <Icon icon={BUTTON_ICONS[button.type] || Reply} size="sm" />
              {button.text || "Button"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
