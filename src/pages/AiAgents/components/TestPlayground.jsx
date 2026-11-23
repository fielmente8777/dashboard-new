import { Bot, RotateCcw, SendHorizontal, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useTestAiAgentMutation } from "../../../redux/api/aiAgentsApi";
import TestReplyDetails from "./TestReplyDetails";

const SAMPLES = [
  "Do you have rooms available this weekend for 2 adults?",
  "What time is check-in and check-out?",
  "Kya aapke yahan pool hai?",
  "I want to talk to the manager",
];

const TestPlayground = ({ channel, hid, draft }) => {
  const [testAgent, { isLoading }] = useTestAiAgentMutation();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chat = useRef(null);
  const lastReply = messages.findLast((item) => item.role === "assistant")?.details;

  useEffect(() => {
    if (chat.current) chat.current.scrollTop = chat.current.scrollHeight;
  }, [messages, isLoading]);

  const send = async (value) => {
    const message = (value ?? text).trim();
    if (!message || isLoading) return;
    setText("");
    const history = messages.filter((item) => item.role !== "error").map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: "user", content: message }]);

    try {
      const result = await testAgent({ channel, hid, message, history, config: draft }).unwrap();
      setMessages((current) => [...current, { role: "assistant", content: result?.reply || "No message was generated.", details: result }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "error", content: getApiErrorMessage(error, "The test failed. Please try again.") }]);
    }
  };

  const newChat = () => {
    setMessages([]);
    setText("");
  };

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card title="Guest simulator" description="Test the settings currently on screen."
        actions={<div className="flex items-center gap-2"><Badge tone="purple">Test mode</Badge>{messages.length > 0 && <Button variant="secondary" size="sm" icon={RotateCcw} disabled={isLoading} onClick={newChat}>New chat</Button>}</div>}>
        <div ref={chat} role="log" aria-label="Test messages" aria-live="polite" className="chat-backdrop h-72 space-y-3 overflow-y-auto rounded-xl border border-app-border! p-3 lg:h-96">
          {messages.length === 0 && (
            <div className="flex min-h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-app-text-muted">Try a guest message</p>
              <div className="flex max-w-lg flex-wrap justify-center gap-2">
                {SAMPLES.map((sample) => <Button key={sample} variant="secondary" className="h-auto py-1.5 text-wrap" size="sm" onClick={() => send(sample)}>{sample}</Button>)}
              </div>
            </div>
          )}
          {messages.map((message, index) => {
            if (message.role === "error") return <p key={index} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">{message.content}</p>;
            const guest = message.role === "user";
            return (
              <div key={index} className={`flex items-start gap-2 ${guest ? "flex-row-reverse" : ""}`}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full ${guest ? "bg-app-surface-secondary text-app-text-muted" : "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white"}`}>
                  <Icon icon={guest ? UserRound : Bot} size="sm" />
                </span>
                <div className="max-w-[82%]">
                  <p className={`mb-1 text-xs text-app-text-muted ${guest ? "text-right" : ""}`}>{guest ? "Guest" : draft.persona.name}</p>
                  <p className={`whitespace-pre-wrap break-words rounded-xl border px-3 py-2 text-sm text-app-text ${guest ? "border-app-border! bg-app-surface" : "border-purple-500/25! bg-app-surface-secondary"}`}>{message.content}</p>
                </div>
              </div>
            );
          })}
          {isLoading && <p className="pl-9 text-xs text-app-text-muted">{draft.persona.name} is typing…</p>}
        </div>

        <form className="mt-3 flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a guest message" maxLength={1000} aria-label="Test message" />
          <Button type="submit" icon={SendHorizontal} disabled={!text.trim() || isLoading}>Send</Button>
        </form>
        <p className="mt-2 text-xs text-app-text-muted">Replies stay in this simulator. Booking and lead writes are simulated. Model calls may use AI credits.</p>
      </Card>
      <TestReplyDetails reply={lastReply} loading={isLoading} />
    </div>
  );
};

export default TestPlayground;
