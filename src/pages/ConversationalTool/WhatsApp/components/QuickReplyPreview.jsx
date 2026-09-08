export const QuickReplyPreview = ({ reply }) => {
  const items = reply?.items || [];

  const textItems = items.filter((item) => item.type === "text");

  const mediaItems = items.filter((item) => item.type !== "text");

  return (
    <div className="flex flex-col justify-center max-w-7xl w-full">
      <div
        className="
          w-full
          rounded-2xl
          shadow-sm
        "
      >
        {/* Media */}
        {mediaItems.map((item, index) => {
          if (!item.media || item.media.length === 0) {
            return null;
          }

          return item.media.map((media, mediaIndex) => {
            const mediaUrl =
              typeof media === "string"
                ? media
                : media?.url || media?.src || media?.link;

            if (!mediaUrl) return null;

            {
              /* IMAGE */
            }
            if (item.type === "image") {
              return (
                <img
                  key={`${index}-${mediaIndex}`}
                  src={mediaUrl}
                  alt=""
                  className="
                    w-full
                    max-h-[350px]
                    object-cover
                  "
                />
              );
            }

            {
              /* VIDEO */
            }
            if (item.type === "video") {
              return (
                <video
                  key={`${index}-${mediaIndex}`}
                  src={mediaUrl}
                  controls
                  className="
                    w-full
                    max-h-[350px]
                    object-contain
                    bg-black
                  "
                />
              );
            }

            {
              /* DOCUMENT */
            }
            if (item.type === "document") {
              return (
                <div
                  key={`${index}-${mediaIndex}`}
                  className="
                    flex
                    items-center
                    gap-3
                    p-4
                    bg-white/60
                    dark:bg-black/20
                  "
                >
                  <div className="text-2xl">📄</div>

                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {media?.name || "Document"}
                    </div>

                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open document
                    </a>
                  </div>
                </div>
              );
            }

            return null;
          });
        })}

        {/* Text */}
        {textItems.map((item, index) => (
          <div
            key={index}
            className="
              px-3
              py-2
              text-sm
              whitespace-pre-wrap
              break-words
              text-gray-800
              dark:text-white
            "
          >
            {item.text}
          </div>
        ))}

        {/* WhatsApp-style time */}
        <div
          className="
            px-3
            pb-2
            text-[10px]
            text-gray-500
            dark:text-gray-300
            text-right
          "
        >
          10:30 AM
        </div>
      </div>
    </div>
  );
};
