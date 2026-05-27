const ConversationsCard = ({ chats }) => {
  if (!chats || chats.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-[#2d3748] max-h-80 overflow-auto shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
      <div className="border-b border-gray-200 dark:border-[#2d3748] p-3">
        <h2 className="text-md font-semibold text-gray-900 dark:text-[#e8eaed] flex items-center gap-2">
          <i className="fas fa-comments text-blue-600 dark:text-blue-400"></i>
          Conversations
        </h2>
      </div>

      <div className="p-3 h-full">
        <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hidden">
          {!chats || chats?.length === 0 ? (
            <div className="text-gray-500 dark:text-[#9ca3af]">
              No conversation found
            </div>
          ) : (
            chats?.map((t, idx) => (
              <div
                key={idx}
                className={`flex ${
                  t.senderType === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-90 rounded-lg px-4 py-2 ${
                    t.senderType === "bot"
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
                      : "bg-gray-100 text-gray-900 dark:bg-[#242b3d] dark:text-[#e8eaed]"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {t.senderType === "bot" ? (
                      <>
                        <i className="fas fa-robot mr-2 text-blue-600 dark:text-blue-400"></i>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          AI Agent
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user mr-2 text-gray-600 dark:text-[#9ca3af]"></i>
                        <span className="text-xs font-semibold text-gray-600 dark:text-[#9ca3af]">
                          Customer
                        </span>
                      </>
                    )}
                    <span className="text-xs text-gray-500 dark:text-[#6b7280] ml-auto">
                      {new Date(t.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <div
                    className="text-sm text-inherit"
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