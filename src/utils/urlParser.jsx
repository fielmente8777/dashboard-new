export const renderMessageWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-words"
        >
          {part}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
};