import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  MapPin,
  Sparkles,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  FileText,
  Zap,
  MessageSquare,
  Settings,
  ExternalLink,
  ThumbsUp,
  AlertCircle,
  Send,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Eye,
  Globe,
  Bot,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

const MOCK_LOCATIONS = [
  { locationId: "accounts/123/locations/001", locationName: "Eazotel Delhi — Connaught Place", averageRating: 4.6, totalReviewCount: 312, isVerified: true },
  { locationId: "accounts/123/locations/002", locationName: "Eazotel Mumbai — Bandra West", averageRating: 4.4, totalReviewCount: 198, isVerified: true },
];

const MOCK_REVIEWS = [
  {
    reviewId: "rev_001", reviewerDisplayName: "Arjun Mehta", starRating: "FIVE",
    comment: "Absolutely stunning property. The rooftop view of Connaught Place at night was magical. Staff went above and beyond — they arranged a surprise anniversary dinner for us without being asked. Will definitely return.",
    createTime: "2025-05-28T14:22:00Z", hasReply: false, replyStatus: "none", aiReplyDraft: null,
    reviewerPhotoUrl: null, isAutoReplied: false,
  },
  {
    reviewId: "rev_002", reviewerDisplayName: "Priya Sharma", starRating: "FOUR",
    comment: "Great location and very clean rooms. The breakfast spread was excellent. Only minor issue was the elevator was slow during peak hours but overall a wonderful stay.",
    createTime: "2025-05-26T09:15:00Z", hasReply: true, replyStatus: "posted",
    replyComment: "Thank you so much, Priya! We're thrilled you enjoyed the breakfast and our location. The elevator feedback is noted — we're working on it. Hope to host you again soon!",
    reviewerPhotoUrl: null, isAutoReplied: false,
  },
  {
    reviewId: "rev_003", reviewerDisplayName: "Rahul Gupta", starRating: "TWO",
    comment: "Room was smaller than advertised. Air conditioning was not working properly despite multiple complaints to the front desk. Expected much better for the price.",
    createTime: "2025-05-24T18:40:00Z", hasReply: false, replyStatus: "none", aiReplyDraft: null,
    reviewerPhotoUrl: null, isAutoReplied: false,
  },
  {
    reviewId: "rev_004", reviewerDisplayName: "Sneha Patel", starRating: "FIVE",
    comment: "Perfect staycation! The spa service was world-class and the pool area is a hidden gem. Room service was prompt. 10/10 would recommend.",
    createTime: "2025-05-22T11:05:00Z", hasReply: false, replyStatus: "none", aiReplyDraft: null,
    reviewerPhotoUrl: null, isAutoReplied: true,
  },
  {
    reviewId: "rev_005", reviewerDisplayName: "Vikram Singh", starRating: "THREE",
    comment: "Average experience. Location is great but the hotel needs renovation. Food quality was inconsistent — some dishes were excellent, others were disappointing.",
    createTime: "2025-05-20T16:30:00Z", hasReply: false, replyStatus: "none", aiReplyDraft: null,
    reviewerPhotoUrl: null, isAutoReplied: false,
  },
];

const MOCK_POSTS = [
  {
    _id: "post_001", topicType: "OFFER", summary: "🎉 Summer Escape Package: Book any 2 nights and get complimentary breakfast for two + late checkout. Valid through June 2025.",
    state: "LIVE", createTime: "2025-05-15T10:00:00Z", callToAction: { actionType: "BOOK", url: "https://eazotel.com/book" },
    mediaUrls: [],
  },
  {
    _id: "post_002", topicType: "EVENT", summary: "Join us for our exclusive Rooftop Jazz Evening every Friday — 7 PM onwards. Complimentary welcome drink for hotel guests.",
    state: "LIVE", createTime: "2025-05-10T08:00:00Z", eventTitle: "Rooftop Jazz Evening",
    callToAction: { actionType: "LEARN_MORE", url: "https://eazotel.com/events" }, mediaUrls: [],
  },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const STAR_VALUE : Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

const StarDisplay = ({ rating, size = 14 }: { rating: string; size?: number }) => {
  const val = STAR_VALUE[rating] || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= val ? "text-amber-400 fill-amber-400" : "text-slate-300 fill-slate-100"}
        />
      ))}
    </div>
  );
};

const RatingBadge = ({ rating }: { rating: string }) => {
  const val = STAR_VALUE[rating] || 0;
  const colors: Record<number, string> = {
    1: "bg-red-50 text-red-600 border-red-200",
    2: "bg-orange-50 text-orange-600 border-orange-200",
    3: "bg-yellow-50 text-yellow-600 border-yellow-200",
    4: "bg-emerald-50 text-emerald-600 border-emerald-200",
    5: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[val] || "bg-slate-100 text-slate-600"}`}>
      <Star size={10} className="fill-current" />
      {val}.0
    </span>
  );
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CONNECT STATE
// ─────────────────────────────────────────────────────────────

const ConnectState = ({ onConnect }: { onConnect: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[520px] px-6 text-center">
    <div className="relative mb-8">
      <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
        <MapPin size={48} className="text-white" />
      </div>
      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
        <Star size={20} className="text-white fill-white" />
      </div>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
      Unlock Your Google Presence
    </h2>
    <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
      Connect your Google Business Profile to manage reviews, publish posts, and let AI handle replies — all from one dashboard.
    </p>
    <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-sm">
      {[
        { icon: Star, label: "AI Review Replies", color: "text-amber-500" },
        { icon: Zap, label: "Auto-Pilot Mode", color: "text-indigo-500" },
        { icon: Globe, label: "Google Posts", color: "text-emerald-500" },
      ].map(({ icon: Icon, label, color }) => (
        <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center gap-2">
          <Icon size={20} className={color} />
          <span className="text-xs text-slate-600 font-medium text-center leading-tight">{label}</span>
        </div>
      ))}
    </div>
    <button
      onClick={onConnect}
      className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm hover:bg-slate-700 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5"
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M43.6 20H24v8h11.3C33.9 32.6 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l6-6C33.9 6.5 29.2 4.5 24 4.5 13.3 4.5 4.5 13.3 4.5 24S13.3 43.5 24 43.5c10.9 0 19.5-8.6 19.5-19.5 0-1.2-.1-2.4-.4-4z"/>
        <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c2.8 0 5.4 1.1 7.4 2.8l6-6C33.9 6.5 29.2 4.5 24 4.5c-7.6 0-14.1 4.4-17.7 10.2z"/>
        <path fill="#FBBC05" d="M24 43.5c5.2 0 9.9-1.9 13.5-5l-6.3-5.2C29.4 35 26.8 36 24 36c-5.4 0-9.9-3.4-11.3-8H5.6c3.5 6.8 10.6 11.5 18.4 11.5z"/>
        <path fill="#EA4335" d="M43.6 20H24v8h11.3c-.7 2-2 3.8-3.8 5.1l6.3 5.2C41.4 35 43.5 30 43.5 24c0-1.2-.1-2.4-.4-4z"/>
      </svg>
      Connect Google Business Profile
    </button>
    <p className="text-xs text-slate-400 mt-4">Secure OAuth 2.0 · Your data stays private</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
// REVIEW CARD
// ─────────────────────────────────────────────────────────────

const ReviewCard = ({ review, onGenerateReply, onApprove, onRegenerate }: {
  review: any;
  onGenerateReply: (id: string) => void;
  onApprove: (id: string, text: string) => void;
  onRegenerate: (id: string) => void;
}) => {
  const [draftText, setDraftText] = useState(review.aiReplyDraft || "");
  const [generating, setGenerating] = useState(false);
  const [showDraft, setShowDraft] = useState(!!review.aiReplyDraft);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (review.aiReplyDraft) {
      setDraftText(review.aiReplyDraft);
      setShowDraft(true);
    }
  }, [review.aiReplyDraft]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    const mockReplies: Record<string, string> = {
      FIVE: `Dear ${review.reviewerDisplayName.split(" ")[0]}, your kind words have genuinely made our team's day! It was an absolute honour hosting you, and we're delighted the experience exceeded expectations. We look forward to welcoming you back — until then, warmest regards from the entire team at Eazotel.`,
      FOUR: `Thank you so much for your lovely feedback, ${review.reviewerDisplayName.split(" ")[0]}! We're so glad you enjoyed your stay. Your note about the elevator is well-taken — we're actively addressing this. We'd love to have you back again soon!`,
      THREE: `Dear ${review.reviewerDisplayName.split(" ")[0]}, thank you for taking the time to share your experience. We're sorry some aspects fell short of expectations. We take this seriously and would love the opportunity to make it right. Please reach out to us directly at care@eazotel.com.`,
      TWO: `Dear ${review.reviewerDisplayName.split(" ")[0]}, we sincerely apologise for the issues you faced during your stay. This is not the standard we hold ourselves to. We'd really like to understand what happened and make things right. Please contact our guest care team at care@eazotel.com at your convenience.`,
      ONE: `Dear ${review.reviewerDisplayName.split(" ")[0]}, we are truly sorry for this experience. Please accept our sincere apologies. Could you reach out to us at care@eazotel.com? We'd like to resolve this personally and ensure this never happens to another guest.`,
    };
    const draft = mockReplies[review.starRating] || mockReplies.THREE;
    setDraftText(draft);
    setShowDraft(true);
    setGenerating(false);
    onGenerateReply(review.reviewId);
  };

  const starVal = STAR_VALUE[review.starRating] || 3;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md ${
      review.hasReply ? "border-slate-100 shadow-sm" : "border-slate-200 shadow-sm"
    }`}>
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <Avatar name={review.reviewerDisplayName} size={42} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 text-sm">{review.reviewerDisplayName}</span>
                {review.isAutoReplied && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full text-xs font-medium">
                    <Bot size={10} /> Auto-replied
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <RatingBadge rating={review.starRating} />
                <span className="text-xs text-slate-400">{timeAgo(review.createTime)}</span>
              </div>
            </div>
            <StarDisplay rating={review.starRating} size={13} />
          </div>
        </div>

        {review.comment && (
          <p className="text-slate-600 text-sm leading-relaxed mt-3.5 pl-[54px]">
            "{review.comment}"
          </p>
        )}

        {/* Already Replied */}
        {review.hasReply && review.replyComment && (
          <div className="mt-4 ml-[54px] bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                <Check size={11} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Reply</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{review.replyComment}</p>
          </div>
        )}

        {/* AI Draft */}
        {showDraft && !review.hasReply && (
          <div className="mt-4 ml-[54px] space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={11} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Draft</span>
              <span className="text-xs text-slate-400">· Edit before sending</span>
            </div>
            <textarea
              ref={textareaRef}
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              rows={4}
              className="w-full text-sm text-slate-700 leading-relaxed bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(review.reviewId, draftText)}
                className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                <Check size={13} /> Approve & Post
              </button>
              <button
                onClick={() => { setGenerating(true); onRegenerate(review.reviewId); setTimeout(() => setGenerating(false), 1500); }}
                className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Regenerate
              </button>
              <button
                onClick={() => setShowDraft(false)}
                className="ml-auto flex items-center gap-1 text-slate-400 hover:text-slate-600 text-xs transition-colors"
              >
                <X size={13} /> Discard
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!review.hasReply && !showDraft && (
          <div className="mt-4 pl-[54px]">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:translate-y-0"
            >
              {generating ? (
                <><Loader2 size={13} className="animate-spin" /> Crafting reply…</>
              ) : (
                <><Sparkles size={13} /> Auto-Reply with AI</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// REVIEWS TAB
// ─────────────────────────────────────────────────────────────

const ReviewsTab = ({ location }: { location: any }) => {
  const [reviews, setReviews] = useState<any[]>(MOCK_REVIEWS);
  const [filter, setFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "unreplied", label: "Needs Reply" },
    { key: "positive", label: "Positive" },
    { key: "negative", label: "Critical" },
    { key: "replied", label: "Replied" },
  ];

  const filtered = reviews.filter(r => {
    if (filter === "all") return true;
    if (filter === "replied") return r.hasReply;
    if (filter === "unreplied") return !r.hasReply;
    if (filter === "positive") return STAR_VALUE[r.starRating] >= 4;
    if (filter === "negative") return STAR_VALUE[r.starRating] <= 3;
    return true;
  });

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    setSyncing(false);
  };

  const handleGenerateReply = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.reviewId === reviewId ? { ...r, aiReplyDraft: "generating..." } : r));
  };

  const handleApprove = (reviewId: string, text: string) => {
    setReviews(prev => prev.map(r =>
      r.reviewId === reviewId
        ? { ...r, hasReply: true, replyComment: text, replyStatus: "posted", aiReplyDraft: null }
        : r
    ));
  };

  const handleRegenerate = (reviewId: string) => {
    setReviews(prev => prev.map(r =>
      r.reviewId === reviewId ? { ...r, aiReplyDraft: null } : r
    ));
    setTimeout(() => {
      setReviews(prev => prev.map(r =>
        r.reviewId === reviewId
          ? { ...r, aiReplyDraft: `Thank you ${r.reviewerDisplayName.split(" ")[0]} for your feedback. We appreciate your honesty and look forward to serving you again at Eazotel.` }
          : r
      ));
    }, 1200);
  };

  const unrepliedCount = reviews.filter(r => !r.hasReply).length;

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Avg Rating", value: location.averageRating?.toFixed(1), sub: "out of 5", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Total Reviews", value: location.totalReviewCount, sub: "on Google", icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Needs Reply", value: unrepliedCount, sub: "reviews pending", icon: AlertCircle, color: unrepliedCount > 0 ? "text-red-500" : "text-emerald-500", bg: unrepliedCount > 0 ? "bg-red-50" : "bg-emerald-50" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-2xl font-bold text-slate-800 leading-none mb-0.5">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Sync Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
              {f.key === "unreplied" && unrepliedCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[9px] rounded-full px-1.5 py-0.5">{unrepliedCount}</span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="ml-auto flex items-center gap-1.5 text-slate-600 border border-slate-200 bg-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing…" : "Sync Reviews"}
        </button>
      </div>

      {/* Review Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reviews match this filter</p>
          </div>
        ) : (
          filtered.map(review => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              onGenerateReply={handleGenerateReply}
              onApprove={handleApprove}
              onRegenerate={handleRegenerate}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// AUTOMATIONS TAB
// ─────────────────────────────────────────────────────────────

const AutomationsTab = ({ location }: { location: any }) => {
  const [config, setConfig] = useState({
    autoReplyEnabled: false,
    autoReplyMinStars: 4,
    autoReplyTone: "professional",
    autoReplySignature: "Team Eazotel",
    weeklyReportEnabled: true,
    reviewAlertEnabled: true,
    reviewAlertMinStars: 2,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: string) => setConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ToggleSwitch = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${on ? "bg-indigo-500" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${on ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Auto-Reply Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-sm mb-0.5">Auto-Pilot Review Replies</div>
                <div className="text-xs text-slate-500 leading-relaxed">Automatically reply to positive reviews without any manual action</div>
              </div>
            </div>
            <ToggleSwitch on={config.autoReplyEnabled} onToggle={() => toggle("autoReplyEnabled")} />
          </div>
        </div>

        {config.autoReplyEnabled && (
          <div className="p-5 space-y-5 bg-slate-50/50">
            {/* Min Stars */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Reply to reviews with</label>
              <div className="flex gap-2">
                {[3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setConfig(prev => ({ ...prev, autoReplyMinStars: s }))}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      config.autoReplyMinStars === s
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {s}+ <Star size={11} className="fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Reply Tone</label>
              <div className="flex gap-2 flex-wrap">
                {["professional", "friendly", "luxury"].map(tone => (
                  <button
                    key={tone}
                    onClick={() => setConfig(prev => ({ ...prev, autoReplyTone: tone }))}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${
                      config.autoReplyTone === tone
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Sign-off Name</label>
              <input
                value={config.autoReplySignature}
                onChange={e => setConfig(prev => ({ ...prev, autoReplySignature: e.target.value }))}
                placeholder="e.g. Team Eazotel Delhi"
                className="w-full text-sm bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Alert Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-orange-500" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm mb-0.5">Negative Review Alerts</div>
              <div className="text-xs text-slate-500">Get notified when critical reviews need urgent attention</div>
            </div>
          </div>
          <ToggleSwitch on={config.reviewAlertEnabled} onToggle={() => toggle("reviewAlertEnabled")} />
        </div>
        {config.reviewAlertEnabled && (
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Alert for reviews with</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <button
                  key={s}
                  onClick={() => setConfig(prev => ({ ...prev, reviewAlertMinStars: s }))}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    config.reviewAlertMinStars === s
                      ? "bg-orange-500 text-white border-orange-500 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                  }`}
                >
                  ≤ {s} <Star size={11} className="fill-current" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Report */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm mb-0.5">Weekly Performance Report</div>
              <div className="text-xs text-slate-500">Get a summary of reviews, replies, and rating trends every Monday</div>
            </div>
          </div>
          <ToggleSwitch on={config.weeklyReportEnabled} onToggle={() => toggle("weeklyReportEnabled")} />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
          saved
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "bg-slate-900 text-white hover:bg-slate-700 shadow-lg shadow-slate-900/20"
        }`}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
        {saving ? "Saving…" : saved ? "Settings Saved!" : "Save Automation Settings"}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// GOOGLE POSTS TAB
// ─────────────────────────────────────────────────────────────

const GooglePostsTab = ({ location }: { location: any }) => {
  const [posts, setPosts] = useState<any[]>(MOCK_POSTS);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    topicType: "STANDARD",
    summary: "",
    callToActionType: "LEARN_MORE",
    callToActionUrl: "",
    mediaUrls: "",
  });

  const handleCreate = async () => {
    if (!form.summary.trim()) return;
    setCreating(true);
    await new Promise(r => setTimeout(r, 1500));
    const newPost = {
      _id: `post_${Date.now()}`,
      topicType: form.topicType,
      summary: form.summary,
      state: "PROCESSING",
      createTime: new Date().toISOString(),
      callToAction: form.callToActionType ? { actionType: form.callToActionType, url: form.callToActionUrl } : undefined,
      mediaUrls: form.mediaUrls ? [form.mediaUrls] : [],
    };
    setPosts(prev => [newPost, ...prev]);
    setForm({ topicType: "STANDARD", summary: "", callToActionType: "LEARN_MORE", callToActionUrl: "", mediaUrls: "" });
    setShowForm(false);
    setCreating(false);
  };

  const POST_TYPE_COLORS: Record<string, string> = {
    OFFER: "bg-amber-50 text-amber-700 border-amber-200",
    EVENT: "bg-blue-50 text-blue-700 border-blue-200",
    STANDARD: "bg-slate-50 text-slate-700 border-slate-200",
    ALERT: "bg-red-50 text-red-700 border-red-200",
  };

  const STATE_COLORS: Record<string, string> = {
    LIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
    PROCESSING: "bg-amber-50 text-amber-600 border-amber-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
    DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Google Posts</h3>
          <p className="text-xs text-slate-500 mt-0.5">Publish updates, offers & events directly to your Google Maps listing</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20"
        >
          <FileText size={13} />
          New Post
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4">
            <h4 className="text-white font-semibold text-sm">Create Google Post</h4>
            <p className="text-slate-400 text-xs mt-0.5">This will appear on your Google Maps listing</p>
          </div>
          <div className="p-5 space-y-4">
            {/* Post Type */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Post Type</label>
              <div className="flex gap-2 flex-wrap">
                {["STANDARD", "OFFER", "EVENT"].map(type => (
                  <button
                    key={type}
                    onClick={() => setForm(prev => ({ ...prev, topicType: type }))}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${
                      form.topicType === type
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {type === "STANDARD" ? "Update" : type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">
                Post Content <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.summary}
                onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                rows={4}
                placeholder="Write a compelling post that will appear on Google Maps…"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
              />
              <div className="text-right text-xs text-slate-400 mt-1">{form.summary.length}/1500</div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Call to Action</label>
                <select
                  value={form.callToActionType}
                  onChange={e => setForm(prev => ({ ...prev, callToActionType: e.target.value }))}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                >
                  <option value="LEARN_MORE">Learn More</option>
                  <option value="BOOK">Book</option>
                  <option value="ORDER">Order</option>
                  <option value="SHOP">Shop</option>
                  <option value="CALL">Call Now</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Link URL</label>
                <input
                  value={form.callToActionUrl}
                  onChange={e => setForm(prev => ({ ...prev, callToActionUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                />
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Image URL (optional)</label>
              <div className="flex gap-2">
                <input
                  value={form.mediaUrls}
                  onChange={e => setForm(prev => ({ ...prev, mediaUrls: e.target.value }))}
                  placeholder="https://your-cdn.com/image.jpg"
                  className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                />
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 flex-shrink-0">
                  <ImageIcon size={16} className="text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={creating || !form.summary.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {creating ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {creating ? "Publishing…" : "Publish to Google"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post._id} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${POST_TYPE_COLORS[post.topicType] || POST_TYPE_COLORS.STANDARD}`}>
                  {post.topicType === "STANDARD" ? "Update" : post.topicType}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATE_COLORS[post.state] || STATE_COLORS.DRAFT}`}>
                  {post.state}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-400">{timeAgo(post.createTime)}</span>
                <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors group">
                  <X size={13} className="text-slate-400 group-hover:text-red-500" />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{post.summary}</p>
            {post.callToAction?.url && (
              <a
                href={post.callToAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
              >
                <ExternalLink size={11} />
                {post.callToAction.actionType?.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN MODULE
// ─────────────────────────────────────────────────────────────

export default function LocalSeoModule() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");
  const [selectedLocation, setSelectedLocation] = useState(MOCK_LOCATIONS[0]);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const TABS = [
    { key: "reviews", label: "Reviews", icon: Star },
    { key: "automations", label: "Automations", icon: Zap },
    { key: "posts", label: "Google Posts", icon: Globe },
  ];

  if (!isConnected) {
    return <ConnectState onConnect={() => setIsConnected(true)} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-1 pb-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Connected · Google Business Profile</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Local SEO</h1>
        </div>

        {/* Location Selector */}
        <div className="relative">
          <button
            onClick={() => setLocationDropdownOpen(v => !v)}
            className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700 max-w-[180px] truncate">
              {selectedLocation.locationName.split("—")[1]?.trim() || selectedLocation.locationName}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${locationDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {locationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden">
              {MOCK_LOCATIONS.map(loc => (
                <button
                  key={loc.locationId}
                  onClick={() => { setSelectedLocation(loc); setLocationDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left ${selectedLocation.locationId === loc.locationId ? "bg-indigo-50" : ""}`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{loc.locationName.split("—")[1]?.trim() || loc.locationName}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-500">{loc.averageRating} · {loc.totalReviewCount} reviews</span>
                    </div>
                  </div>
                  {selectedLocation.locationId === loc.locationId && (
                    <Check size={15} className="text-indigo-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={14} className={activeTab === key ? "text-indigo-500" : ""} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "reviews" && <ReviewsTab location={selectedLocation} />}
        {activeTab === "automations" && <AutomationsTab location={selectedLocation} />}
        {activeTab === "posts" && <GooglePostsTab location={selectedLocation} />}
      </div>
    </div>
  );
}
