import { AlertCircle, CheckCircle2, Play, RotateCcw, Send } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import Drawer from "../../../components/ui/Drawer";
import { inputClassName } from "../../../components/ui/Field";
import { useConfirm } from "../../../context/ConfirmContext";
import { useTestAiAgentActionMutation } from "../../../redux/api/aiAgentsApi";
import { GuestChat } from "./SimpleSidePanel";
import { answerType, askFirstLocked, friendlyProblem, parseAnswer, sampleChat } from "./simpleModel";
import { fill } from "./simpleCopy";

// "Try it": the hotel plays the guest. The assistant asks the chosen
// questions (scripted here: no AI credits), then the action runs as a
// practice run on the server and we show, in plain words, what WOULD happen.

const field = `${inputClassName} min-h-11 text-[15px]!`;
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus";

// What the assistant asks, in order: [{ key, ask, type, required }]
const questionsFor = (config, copy) => {
  if (config.next.kind === "feature") {
    if (config.next.feature === "check_rooms") {
      return [
        { key: "checkIn", ask: copy.tryIt.checkIn, type: "date", required: true },
        { key: "checkOut", ask: copy.tryIt.checkOut, type: "date", required: true },
      ];
    }
    return [];
  }
  return config.questions.map((q) => ({ key: q.key, ask: q.preset === "custom" ? q.text : copy.chat.ask[q.preset], type: answerType(q), required: q.required }));
};

const TryItSheet = ({ open, onClose, copy, config, buildPayload, actionId, canRunLive, liveBlocked, channel, hid, onTried }) => {
  const id = useId();
  const { confirm } = useConfirm();
  const [testAction] = useTestAiAgentActionMutation();
  const [phase, setPhase] = useState("start");
  const [opening, setOpening] = useState("");
  const [lines, setLines] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState("");
  const [live, setLive] = useState(false);
  const [result, setResult] = useState(null);
  const answerRef = useRef(null);

  const questions = questionsFor(config, copy);
  const askFirst = config.askFirst || askFirstLocked(config.next);

  const reset = () => {
    const chat = sampleChat(config, copy);
    setOpening(chat[0]?.text || copy.tryIt.sampleGuest);
    setPhase("start");
    setLines([]);
    setIndex(0);
    setAnswers({});
    setText("");
    setInvalid("");
    setLive(false);
    setResult(null);
  };

  // a fresh conversation each time it opens
  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (phase === "asking") answerRef.current?.focus();
  }, [phase, index]);

  const say = (...more) => setLines((current) => [...current, ...more]);

  const run = async (values) => {
    setPhase("running");
    const feature = config.next.kind === "feature" ? config.next.feature : null;
    // bookings and hand-overs are never run from here: describe them
    if (feature === "make_booking" || feature === "handoff") {
      setResult({ ok: true, wouldDo: feature === "make_booking" ? copy.tryIt.wouldBooking : copy.tryIt.wouldHandoff });
      say({ from: "bot", text: sampleChat(config, copy).at(-1).text });
      setPhase("done");
      onTried();
      return;
    }
    try {
      const report = await testAction({ channel, hid, id: actionId || undefined, input: values, live: live && canRunLive, action: buildPayload() }).unwrap();
      if (report.error) {
        setResult({ ok: false, ...friendlyProblem(report, copy) });
      } else {
        const wouldDo = report.response?.wouldDo || (feature === "check_rooms" ? fill(copy.tryIt.wouldRooms, { from: values.checkIn, to: values.checkOut }) : "");
        setResult({ ok: true, real: !report.dryRun, wouldDo });
        say({ from: "bot", text: report.response?.message && config.next.kind === "reply" ? report.response.message : sampleChat(config, copy).at(-1).text });
        onTried();
      }
    } catch (error) {
      setResult({ ok: false, ...friendlyProblem(error, copy) });
    }
    setPhase("done");
  };

  const askNext = (nextIndex, values) => {
    if (nextIndex < questions.length) {
      setIndex(nextIndex);
      say({ from: "bot", text: questions[nextIndex].ask });
      setPhase("asking");
    } else if (askFirst) {
      say({ from: "bot", text: copy.chat.confirm });
      setPhase("confirm");
    } else {
      run(values);
    }
  };

  const start = (e) => {
    e.preventDefault();
    setLines([{ from: "guest", text: opening.trim() || copy.tryIt.sampleGuest }]);
    askNext(0, {});
  };

  const answer = (e) => {
    e.preventDefault();
    const q = questions[index];
    const parsed = parseAnswer(q.type, text);
    if (!parsed.ok) return setInvalid(copy.tryIt.invalid[q.type] || copy.tryIt.invalid.text);
    setInvalid("");
    const values = { ...answers, [q.key]: parsed.value };
    setAnswers(values);
    say({ from: "guest", text: text.trim() });
    setText("");
    askNext(index + 1, values);
  };

  const skip = () => {
    say({ from: "guest", text: "—" });
    setText("");
    setInvalid("");
    askNext(index + 1, answers);
  };

  const decide = (yes) => {
    say({ from: "guest", text: yes ? copy.tryIt.yes : copy.tryIt.no });
    if (!yes) {
      setResult({ ok: true, wouldDo: copy.tryIt.stopped });
      setPhase("done");
      return;
    }
    run(answers);
  };

  const q = questions[index];
  return (
    <Drawer open={open} onClose={onClose} title={copy.tryIt.title} description={copy.tryIt.desc}>
      <div className="space-y-4">
        {phase === "start" ? (
          <form onSubmit={start} className="space-y-3">
            <label htmlFor={`${id}-open`} className="block text-[15px] font-medium text-app-text">{copy.tryIt.startLabel}</label>
            <textarea id={`${id}-open`} autoFocus rows={2} value={opening} onChange={(e) => setOpening(e.target.value)} className={`${field} resize-y`} />
            <Button type="submit" size="lg" icon={Play} className="text-[15px]!">{copy.tryIt.start}</Button>
          </form>
        ) : (
          <GuestChat lines={lines} copy={copy} />
        )}

        {phase === "asking" && q && (
          <form onSubmit={answer} className="space-y-2">
            <label htmlFor={`${id}-ans`} className="block text-[15px] font-medium text-app-text">{copy.tryIt.answerLabel}</label>
            <div className="flex gap-2">
              <input id={`${id}-ans`} ref={answerRef} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={Boolean(invalid)} aria-describedby={invalid ? `${id}-bad` : undefined} className={field} />
              <Button type="submit" size="lg" icon={Send} className="text-[15px]!">{copy.tryIt.send}</Button>
            </div>
            {invalid && <p id={`${id}-bad`} className="flex items-start gap-1.5 text-sm text-app-danger"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{invalid}</p>}
            {!q.required && <Button variant="ghost" size="lg" onClick={skip} className="text-[15px]!">{copy.tryIt.skip}</Button>}
          </form>
        )}

        {phase === "confirm" && (
          <div className="flex gap-2">
            <Button size="lg" onClick={() => decide(true)} className="text-[15px]!">{copy.tryIt.yes}</Button>
            <Button size="lg" variant="secondary" onClick={() => decide(false)} className="text-[15px]!">{copy.tryIt.no}</Button>
          </div>
        )}

        {phase === "running" && <p role="status" className="text-[15px] text-app-text-muted">{copy.tryIt.working}</p>}

        {phase === "done" && result && (
          <div role={result.ok ? "status" : "alert"} className={`rounded-xl p-4 ${result.ok ? "bg-app-success-soft" : "bg-app-danger-soft"}`}>
            {result.ok ? (
              <>
                <p className="flex items-center gap-2 text-[15px] font-semibold text-app-text"><CheckCircle2 className="size-5 text-app-success" aria-hidden="true" />{result.real ? copy.tryIt.doneReal : copy.tryIt.would}</p>
                {result.wouldDo && <p className="mt-1 break-words text-[15px] text-app-text">{result.wouldDo}</p>}
              </>
            ) : (
              <>
                <p className="flex items-start gap-2 text-[15px] font-semibold text-app-text"><AlertCircle className="mt-0.5 size-5 shrink-0 text-app-danger" aria-hidden="true" />{result.text}</p>
                <p className="mt-1 text-[15px] text-app-text"><span className="font-medium">{copy.tryIt.fixHint}</span> {result.hint}</p>
              </>
            )}
          </div>
        )}

        {phase !== "start" && (
          <Button variant="secondary" size="lg" icon={RotateCcw} onClick={reset} className="text-[15px]!">{copy.tryIt.reset}</Button>
        )}

        <div className="rounded-xl border border-app-border! p-4">
          <label className={`flex min-h-11 items-start gap-3 text-[15px] text-app-text ${canRunLive ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}>
            <input type="checkbox" className={`mt-0.5 size-5 accent-app-danger ${focusRing}`} checked={live && canRunLive} disabled={!canRunLive || phase === "running"} onChange={async (e) => { const on = e.target.checked; if (!on) return setLive(false); if (await confirm(copy.tryIt.realConfirm, { title: copy.tryIt.realOnce, confirmText: copy.tryIt.realYes, variant: "danger" })) setLive(true); }} />
            <span>
              <span className="font-semibold">{copy.tryIt.realOnce}</span>
              <span className="block text-sm text-app-text-muted">{canRunLive ? copy.tryIt.realHelp : liveBlocked === "save" ? copy.tryIt.realNeedsSave : copy.tryIt.realNotAllowed}</span>
            </span>
          </label>
        </div>
      </div>
    </Drawer>
  );
};

export default TryItSheet;
