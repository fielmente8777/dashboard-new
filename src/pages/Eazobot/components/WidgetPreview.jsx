import { Bot, MessageCircle, SendHorizontal, X } from "lucide-react";

const BotAvatar = ({ form, className = "size-8" }) =>
  form.avatar_url ? (
    <img src={form.avatar_url} alt="" className={`${className} shrink-0 rounded-full bg-white object-cover`} />
  ) : (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full bg-white/20`}>
      <Bot className="size-4" />
    </span>
  );

const Bubble = ({ children }) => (
  <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-xs text-gray-800 shadow-sm">
    {children}
  </p>
);

// A static picture of the website chat widget, drawn from the draft so
// colour and text changes show as they are made.
const WidgetPreview = ({ form }) => {
  const question = form.chat_flow.find((q) => q.active ?? true);
  const options = (question?.options || []).filter((o) => o.active ?? true).slice(0, 4);

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-app-border! bg-gray-100 shadow-xl">
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ backgroundColor: form.bg_color, color: form.text_color }}
        >
          <BotAvatar form={form} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{form.bot_name || "Your assistant"}</p>
            <p className="text-[11px] opacity-80">Typically replies instantly</p>
          </div>
          <X className="size-4 opacity-80" />
        </div>

        <div className="space-y-2 px-3 py-4">
          <Bubble>{form.welcome_message || "Hi! How can I help you today?"}</Bubble>
          {question && <Bubble>{question.question}</Bubble>}
          {options.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-1">
              {options.map((option, index) => (
                <span
                  key={index}
                  className="rounded-full px-3 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: form.button_color, color: form.button_text_color }}
                >
                  {option.label}
                </span>
              ))}
            </div>
          )}
          {form.show_typing_indicator && (
            <span className="inline-flex gap-1 rounded-2xl bg-white px-3 py-2.5 shadow-sm">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="size-1.5 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-200! bg-white px-3 py-2.5">
          <span className="flex-1 text-xs text-gray-400">Type your message…</span>
          <SendHorizontal className="size-4" style={{ color: form.bg_color }} />
        </div>
        {form.show_eazotel_branding && (
          <p className="bg-white pb-2 text-center text-[10px] text-gray-400">Powered by Eazotel</p>
        )}
      </div>

      <span
        className="flex size-12 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: form.bg_color, color: form.text_color }}
      >
        <MessageCircle className="size-5" />
      </span>
    </div>
  );
};

export default WidgetPreview;
