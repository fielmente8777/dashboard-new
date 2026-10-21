
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  AlertCircle,
  Mic,
  MicOff,
} from "lucide-react";

import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import { transcribeAudio } from "../../services/chatbot.service";
import { authHeaders, getTenantContext } from "../../utils/dashboardApi";
import {
  RULES_ENDPOINT,
  CATEGORIES,
  CategoryBadge,
  Toggle,
} from "./shared";

const MAX_VOICE_SECONDS = 29;
const MIN_AUDIO_BYTES = 1024;

function RuleRow({ rule, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [ruleText, setRuleText] = useState(rule.ruleText);
  const [category, setCategory] = useState(rule.category || "other");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (nextEnabled) => {
    setToggling(true);
    try {
      await onSave(rule._id, { enabled: nextEnabled });
    } finally {
      setToggling(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!ruleText.trim() || saving) return;

    setSaving(true);
    try {
      await onSave(rule._id, {
        ruleText: ruleText.trim(),
        category,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-blue-600/40 bg-[#0d1017] p-4">
        <div className="mb-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none"
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={ruleText}
          onChange={(e) => setRuleText(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
        />

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setRuleText(rule.ruleText);
              setCategory(rule.category || "other");
              setEditing(false);
            }}
            className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200"
          >
            <X size={16} />
          </button>

          <button
            type="button"
            disabled={saving || !ruleText.trim()}
            onClick={handleSaveEdit}
            className="flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-[#1f242e] bg-[#0d1017] p-4 ${
        !rule.enabled ? "opacity-50" : ""
      }`}
    >
      <div className="pt-0.5">
        <Toggle
          checked={rule.enabled}
          onChange={handleToggle}
          disabled={toggling}
        />
      </div>

      <CategoryBadge value={rule.category} />

      <p className="flex-1 text-sm text-gray-200">
        {rule.ruleText}
      </p>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
        title="Edit"
      >
        <Pencil size={15} />
      </button>

      <button
        type="button"
        onClick={() => onDelete(rule._id)}
        className="rounded-md p-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-400"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function AddRuleForm({ onAdd, channel }) {
  const [ruleText, setRuleText] = useState("");
  const [category, setCategory] = useState("other");
  const [adding, setAdding] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const controllerRef = useRef(null);
  const lastBlobRef = useRef(null);
  const voice = useVoiceRecorder({
    maxSeconds: MAX_VOICE_SECONDS,
  });

  useEffect(() => {
    if (
      voice.status !== "stopped" ||
      !voice.blob ||
      lastBlobRef.current === voice.blob
    ) {
      return;
    }

    const blob = voice.blob;
    lastBlobRef.current = blob;

    if (blob.size < MIN_AUDIO_BYTES) {
      setSpeechError(
        "Recording is too short. Please speak a little longer."
      );
      voice.reset();
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    let cancelled = false;
    setTranscribing(true);
    setSpeechError("");

    const transcribe = async () => {
      try {
        const response = await transcribeAudio(blob, {
          signal: controller.signal,
        });

        if (cancelled) return;

        const transcript = String(
          response?.text ?? response?.data?.text ?? ""
        ).trim();

        if (!transcript) {
          setSpeechError(
            "No speech was detected. Please try again."
          );
          return;
        }

        setRuleText((previous) =>
          `${previous}${previous ? " " : ""}${transcript}`.trim()
        );
      } catch (error) {
        if (
          !cancelled &&
          error?.name !== "AbortError" &&
          error?.code !== "ERR_CANCELED"
        ) {
          setSpeechError(
            error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              "Could not transcribe audio. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          if (controllerRef.current === controller) {
            controllerRef.current = null;
          }
          setTranscribing(false);
          voice.reset();
        }
      }
    };

    transcribe();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [voice.status, voice.blob]);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const handleMicClick = async () => {
    setSpeechError("");

    if (voice.status === "recording") {
      voice.stop();
      return;
    }

    if (transcribing || adding) return;

    if (!voice.isSupported) {
      setSpeechError(
        "Audio recording is not supported in this browser."
      );
      return;
    }

    lastBlobRef.current = null;

    try {
      await voice.start();
    } catch (error) {
      setSpeechError(
        error?.message ||
          "Could not access the microphone. Please check browser permissions."
      );
    }
  };

  const handleAdd = async () => {
    const text = ruleText.trim();

    if (
      !text ||
      adding ||
      transcribing ||
      voice.status === "recording"
    ) {
      return;
    }

    setAdding(true);

    try {
      await onAdd({
        ruleText: text,
        category,
        enabled: true,
        channel,
      });

      setRuleText("");
      setCategory("other");
      setSpeechError("");
    } finally {
      setAdding(false);
    }
  };

  const isRecording = voice.status === "recording";

  return (
    <div className="rounded-xl border border-dashed border-[#2a3040] bg-[#0a0c10] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Plus size={15} className="text-blue-400" />
        <span className="text-sm font-medium text-gray-300">
          Add Rule
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 sm:w-48"
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            value={ruleText}
            onChange={(e) => setRuleText(e.target.value)}
            placeholder={
              transcribing
                ? "Transcribing your speech..."
                : "Enter a rule or use the microphone..."
            }
            className="flex-1 rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
          />
        </div>

        <div className="rounded-lg border border-[#232836] bg-[#0d1017] p-3">
          <p className="mb-2 text-xs text-gray-400">
            Click the microphone, speak your rule, then stop recording.
            Your speech will be converted to text for review.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleMicClick}
              disabled={transcribing || adding}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                isRecording
                  ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                  : "border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
              }`}
            >
              {transcribing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : isRecording ? (
                <MicOff size={15} />
              ) : (
                <Mic size={15} />
              )}

              {transcribing
                ? "Transcribing..."
                : isRecording
                  ? `Stop recording (${voice.seconds || 0}s)`
                  : "Speak rule"}
            </button>

            {isRecording && (
              <span className="text-xs text-red-400">
                Recording in progress...
              </span>
            )}
          </div>

          {(speechError || voice.error) && (
            <p className="mt-2 text-xs text-red-400" role="alert">
              {speechError || voice.error}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={
            adding ||
            transcribing ||
            isRecording ||
            !ruleText.trim()
          }
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
        >
          {adding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add
        </button>
      </div>
    </div>
  );
}

export default function CustomRulesTab({
  channel = "whatsapp",
}) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isVoice = channel === "voice";

  const loadRules = async () => {
    setLoading(true);
    setError("");

    try {
      const { hid, ndid } = getTenantContext();

      const res = await axios.get(RULES_ENDPOINT, {
        headers: authHeaders(),
        params: { hid, ndid, channel },
      });

      setRules(res.data?.items || []);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Could not load rules."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  const handleAdd = async (payload) => {
    const { hid, ndid } = getTenantContext();

    const res = await axios.post(
      RULES_ENDPOINT,
      { ...payload, hid, ndid, channel },
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      }
    );

    const created = res.data?.rule;

    if (created) {
      setRules((previous) => [created, ...previous]);
    }
  };

  const handleSave = async (id, patch) => {
    const { hid, ndid } = getTenantContext();

    const res = await axios.put(
      `${RULES_ENDPOINT}/${id}`,
      { ...patch, hid, ndid, channel },
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      }
    );

    const updated = res.data?.rule;

    setRules((previous) =>
      previous.map((rule) =>
        rule._id === id
          ? { ...rule, ...(updated || patch) }
          : rule
      )
    );
  };

  const handleDelete = async (id) => {
    const { hid, ndid } = getTenantContext();

    await axios.delete(`${RULES_ENDPOINT}/${id}`, {
      headers: authHeaders(),
      params: { hid, ndid, channel },
    });

    setRules((previous) =>
      previous.filter((rule) => rule._id !== id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        Loading {isVoice ? "voice" : "WhatsApp"} rules...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 bg-red-500/5 p-4">
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle size={14} />
          {error}
        </p>

        <button
          type="button"
          onClick={loadRules}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Rules that shape how your AI responds on{" "}
        <span className="font-medium text-gray-300">
          {isVoice ? "Voice AI" : "WhatsApp"}
        </span>
        {" "}— tone, policy, language, and what not to say.
        Turned-off rules stay saved but don't apply.
      </p>

      {rules.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2a3040] p-8 text-center text-sm text-gray-500">
          No custom rules for {isVoice ? "Voice AI" : "WhatsApp"} yet.
        </div>
      )}

      {rules.map((rule) => (
        <RuleRow
          key={rule._id}
          rule={rule}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      ))}

      <AddRuleForm
        key={channel}
        channel={channel}
        onAdd={handleAdd}
      />
    </div>
  );
}
