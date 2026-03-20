const ConversationsCard = ({ chats }) => {
  if (!chats || chats.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border max-h-80 overflow-auto">
      <div className="border-b border-gray-200 p-3">
        <h2 className="text-md font-semibold text-gray-900 flex items-center">
          <i className="fas fa-comments text-blue-600"></i>
          Conversations
        </h2>
      </div>

      <div className="p-3 h-full">
        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hidden">
          {!chats || chats?.length === 0 ? (
            <div>No conversation found</div>
          ) : (
            chats?.map((t, idx) => (
              <div
                key={idx}
                className={`flex ${
                  t.senderType === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-90 ${
                    t.speaker === "bot"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-900"
                  } rounded-lg px-4 py-2`}
                >
                  <div className="flex items-center mb-1">
                    {t.senderType === "bot" ? (
                      <>
                        <i className="fas fa-robot mr-2 text-blue-600"></i>
                        <span className="text-xs font-semibold text-blue-600">
                          AI Agent
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user mr-2 text-gray-600"></i>
                        <span className="text-xs font-semibold text-gray-600">
                          Customer
                        </span>
                      </>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(t.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: t.message }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsCard;
