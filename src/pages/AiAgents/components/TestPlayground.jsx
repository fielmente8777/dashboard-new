import { Bot, RotateCcw, SendHorizontal, UserRound, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useTestAiAgentMutation } from "../../../redux/api/aiAgentsApi";

const SAMPLES = [
  "Hi! Do you have rooms available this weekend for 2 adults?",
  "What time is check-in and check-out?",
  "Kya aapke yahan pool hai?",
  "I want to talk to the manager",
];

const TOOL_LABELS = {
  check_room_availability: "Checked availability",
  create_booking: "Booking (simulated)",
  save_lead_details: "Saved lead details (simulated)",
  handoff_to_human: "Handed over to team",
};

// Chat with the agent using the settings on screen (saved or not). Nothing is
// sent to Instagram; bookings and lead updates are only simulated. Each reply
// uses AI credits like a real one.
const TestPlayground = ({ channel, hid, draft }) => {
  const [testAgent, { isLoading }] = useTestAiAgentMutation();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const send = async (value) => {
    const message = (value ?? text).trim();
    if (!message || isLoading) return;
    setText("");
    const history = messages
      .filter((item) => item.role === "user" || item.role === "assistant")
      .map(({ role, content }) => ({ role, content }));
    setMessages((list) => [...list, { role: "user", content: message }]);

    try {
      const result = await testAgent({ channel, hid, message, history, config: draft }).unwrap();
      setMessages((list) => [
        ...list,
        {
          role: "assistant",
          content: result?.reply || "(no reply)",
          meta: result,
        },
      ]);
    } catch (err) {
      setMessages((list) => [
        ...list,
        { role: "error", content: getApiErrorMessage(err, "The test failed. Please try again.") },
      ]);
    }
  };

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Bot className="size-4 text-app-text-muted" /> Test your agent
        </span>
      }
      description="Chat as a guest would. Uses the settings on this page, even before you save. Nothing is sent to Instagram, and bookings / lead updates are only simulated. Each reply uses AI credits."
      actions={
        messages.length > 0 && (
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={() => setMessages([])}>
            New chat
          </Button>
        )
      }
    >
      <div className="chat-backdrop h-[26rem] space-y-3 overflow-y-auto rounded-xl border border-app-border! p-3">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-app-text-muted">Try one of these, or type your own:</p>
            <div className="flex max-w-lg flex-wrap justify-center gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => send(sample)}
                  className="rounded-full border border-app-border! bg-app-surface px-3 py-1.5 text-xs text-app-text transition hover:border-pink-500!"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          if (message.role === "error") {
            return (
              <p key={index} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {message.content}
              </p>
            );
          }
          const guest = message.role === "user";
          return (
            <div key={index} className={`flex gap-2 ${guest ? "justify-end" : "justify-start"}`}>
              {!guest && (
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white">
                  <Icon icon={Bot} size="sm" />
                </span>
              )}
              <div className="max-w-[80%]">
                <div
                  className={`whitespace-pre-wrap break-words rounded-2xl border px-3 py-2 text-sm ${
                    guest
                      ? "rounded-br-md border-app-border! bg-app-surface text-app-text"
                      : "rounded-bl-md border-purple-200! bg-purple-50 text-app-text dark:border-purple-800! dark:bg-[#2d1f3d]"
                  }`}
                >
                  {message.content}
                </div>
                {message.meta && (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-app-text-faint">
                    {message.meta.toolsUsed?.map((tool, i) => (
                      <Badge key={`${tool}-${i}`} tone="purple" className="text-[10px]!">
                        <Icon icon={Wrench} size="xs" className="mr-1" />
                        {TOOL_LABELS[tool] || tool}
                      </Badge>
                    ))}
                    {message.meta.handoff && (
                      <Badge tone="amber" className="text-[10px]!">
                        Handover: {message.meta.handoffReason}
                      </Badge>
                    )}
                    <span>{(message.meta.latencyMs / 1000).toFixed(1)}s</span>
                  </div>
                )}
              </div>
              {guest && (
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-app-surface-secondary text-app-text-muted">
                  <Icon icon={UserRound} size="sm" />
                </span>
              )}
            </div>
          );
        })}

        {isLoading && (
          <p className="pl-9 text-xs text-app-text-muted">
            {draft?.persona?.name || "The agent"} is typing…
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write as a guest…"
          maxLength={1000}
          aria-label="Test message"
          className="min-w-0 flex-1 rounded-full border border-app-border! bg-app-surface px-4 py-2 text-sm text-app-text outline-none focus:border-pink-500! focus:ring-1 focus:ring-pink-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          aria-label="Send test message"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white transition hover:opacity-90 disabled:opacity-40"
        >
          <Icon icon={SendHorizontal} size="lg" />
        </button>
      </form>
    </Card>
  );
};

export default TestPlayground;
