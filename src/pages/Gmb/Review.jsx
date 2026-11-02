import {
  Bot,
  ChevronLeft,
  ChevronRight,
  MessageSquareReply,
  RefreshCw,
  Sparkles,
  Star,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Drawer from "../../components/ui/Drawer";
import { Field, Input } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import SelectMenu from "../../components/ui/SelectMenu";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import Switch from "../../components/ui/Switch";
import { useApiAction } from "../../hooks/useApiAction";
import {
  STARS,
  useGenerateGbpReplyMutation,
  useGetGbpAutopilotQuery,
  useGetGbpLocationsQuery,
  useGetGbpReviewsQuery,
  usePostGbpReplyMutation,
  useSyncGbpReviewsMutation,
  useUpdateGbpAutopilotMutation,
} from "../../redux/api/gbpApi";
import { integrationPath } from "../../routes/paths";
import { timeAgo } from "../../utils/relativeTime";

const FILTERS = [
  { value: "unreplied", label: "Needs reply" },
  { value: "all", label: "All" },
  { value: "negative", label: "1 to 3 stars" },
  { value: "positive", label: "4 and 5 stars" },
  { value: "replied", label: "Replied" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "luxury", label: "Luxury" },
];

const STAR_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n} star${n > 1 ? "s" : ""}` }));

const chipClassName = (active) =>
  `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-colors ${
    active
      ? "border-primary! bg-primary text-white dark:border-blue-600! dark:bg-blue-600"
      : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
  }`;

const Stars = ({ value, size = 14 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-app-text-faint/40"}
      />
    ))}
  </span>
);

// One review: what the guest wrote, and the reply (posted, or a draft to
// write with AI and edit before posting).
const ReviewCard = ({ review }) => {
  const run = useApiAction();
  const [generate, { isLoading: drafting }] = useGenerateGbpReplyMutation();
  const [post, { isLoading: posting }] = usePostGbpReplyMutation();
  const [draft, setDraft] = useState(review.hasReply ? null : review.aiReplyDraft || null);
  const stars = STARS[review.starRating] || 0;
  const name = review.reviewerDisplayName || "Google user";

  const writeWithAi = async () => {
    const text = await run(generate(review.reviewId), { error: "Could not write a reply." });
    if (typeof text === "string" && text) setDraft(text);
  };

  const publish = async () => {
    const done = await run(post({ reviewId: review.reviewId, replyText: draft.trim() }), {
      success: "Reply posted on Google",
      error: "Could not post the reply.",
    });
    if (done) setDraft(null);
  };

  return (
    <article className="rounded-xl border border-app-border! bg-app-surface p-4">
      <header className="flex items-start gap-3">
        {review.reviewerPhotoUrl ? (
          <img src={review.reviewerPhotoUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-app-surface-secondary text-sm font-semibold text-app-text-muted">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-app-text">{name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-app-text-faint">
            <Stars value={stars} size={13} />
            {timeAgo(review.createTime, Date.now())}
          </p>
        </div>
        {!review.hasReply && stars <= 3 && <Badge tone="red">Needs care</Badge>}
      </header>

      {review.comment ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-app-text">{review.comment}</p>
      ) : (
        <p className="mt-3 text-sm italic text-app-text-faint">Rating only, no comment.</p>
      )}

      {review.hasReply ? (
        <div className="mt-3 rounded-lg border-l-2 border-blue-500! bg-app-bg px-3 py-2.5">
          <p className="flex items-center gap-2 text-xs font-medium text-app-text-muted">
            Your reply
            {review.isAutoReplied && <Badge tone="purple">Autopilot</Badge>}
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-app-text">{review.replyComment}</p>
        </div>
      ) : draft !== null ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Write your reply…"
            className="w-full resize-y rounded-lg border border-app-border! bg-app-bg px-3 py-2 text-sm text-app-text outline-none focus:border-blue-500! focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)} disabled={posting}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" icon={Sparkles} loading={drafting} onClick={writeWithAi} disabled={posting}>
              Rewrite with AI
            </Button>
            <Button size="sm" loading={posting} disabled={!draft.trim()} onClick={publish}>
              Post on Google
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" icon={Sparkles} loading={drafting} onClick={writeWithAi}>
            Write reply with AI
          </Button>
          <Button size="sm" variant="ghost" icon={MessageSquareReply} onClick={() => setDraft("")}>
            Write myself
          </Button>
        </div>
      )}
    </article>
  );
};

// What the AI does on its own: replies to new reviews with enough stars.
// (gian also stores low-rating alert and weekly report settings, but nothing
// sends those yet, so they are not offered here.)
const AutopilotDrawer = ({ open, onClose, location }) => {
  const run = useApiAction();
  const config = useGetGbpAutopilotQuery(location?.locationId, { skip: !open || !location });
  const [update] = useUpdateGbpAutopilotMutation();
  const [signature, setSignature] = useState("");

  useEffect(() => {
    if (config.data) setSignature(config.data.autoReplySignature || "");
  }, [config.data]);

  const save = (changes) =>
    run(update({ locationId: location.locationId, ...changes }), { error: "Could not save the setting." });
  const c = config.data || {};

  return (
    <Drawer open={open} onClose={onClose} title="Review autopilot" description={location?.locationName}>
      {!config.data ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-app-text">Reply automatically</p>
                <p className="mt-0.5 text-xs text-app-text-muted">
                  The AI posts a reply to new reviews with at least the stars below. Lower ratings wait for you.
                </p>
              </div>
              <Switch label="Reply automatically" checked={Boolean(c.autoReplyEnabled)} onChange={(on) => save({ autoReplyEnabled: on })} />
            </div>
            <Field as="div" label="Only for reviews with at least">
              <SelectMenu
                label="Minimum stars for auto replies"
                options={STAR_OPTIONS}
                value={c.autoReplyMinStars ?? 4}
                onChange={(value) => save({ autoReplyMinStars: Number(value) })}
                className="w-full"
              />
            </Field>
            <Field as="div" label="Tone of AI replies" hint="Also used when you press Write reply with AI.">
              <SelectMenu
                label="Tone"
                options={TONES}
                value={c.autoReplyTone || "professional"}
                onChange={(value) => save({ autoReplyTone: value })}
                className="w-full"
              />
            </Field>
            <Field label="Sign replies as" hint="e.g. Team Corbett The Grand">
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                onBlur={() => signature !== (c.autoReplySignature || "") && save({ autoReplySignature: signature.trim() })}
                placeholder="Optional"
              />
            </Field>
          </section>

        </div>
      )}
    </Drawer>
  );
};

// Google reviews of the hotel's Business Profile listing(s): read, reply
// (written by AI, edited by you), and set what the AI does on its own.
const Review = () => {
  const run = useApiAction();
  const locations = useGetGbpLocationsQuery();
  const [locationId, setLocationId] = useState("");
  const [filter, setFilter] = useState("unreplied");
  const [page, setPage] = useState(1);
  const [autopilotOpen, setAutopilotOpen] = useState(false);
  const [syncReviews, { isLoading: syncing }] = useSyncGbpReviewsMutation();

  const list = locations.data || [];
  const location = list.find((l) => l.locationId === locationId) || list[0];
  const activeId = location?.locationId;

  const reviews = useGetGbpReviewsQuery({ locationId: activeId, filter, page }, { skip: !activeId });
  const unreplied = useGetGbpReviewsQuery({ locationId: activeId, filter: "unreplied", page: 1, limit: 1 }, { skip: !activeId });

  const pickFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const connectLink = (
    <Link to={integrationPath("google-business-profile")}>
      <Button icon={Store}>Connect Google Business Profile</Button>
    </Link>
  );

  let body;
  if (locations.isLoading) {
    body = <Skeleton className="h-96 rounded-xl" />;
  } else if (locations.isError && locations.error?.status !== 404) {
    body = <ErrorState message="Couldn't load your Google listings." onRetry={locations.refetch} />;
  } else if (!list.length) {
    body = (
      <Card>
        <EmptyState
          icon={Store}
          title="Connect your Google listing"
          description="See every Google review in one place, reply with AI in seconds, and let autopilot answer the happy guests."
          action={connectLink}
        />
      </Card>
    );
  } else {
    const data = reviews.data;
    body = (
      <>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-xl border border-app-border! bg-app-surface p-3 sm:p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-muted">Rating</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xl font-semibold tabular-nums text-app-text sm:text-2xl">
              {location.averageRating ? location.averageRating.toFixed(1) : "–"}
              <span className="hidden sm:inline">
                <Stars value={location.averageRating || 0} />
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-app-border! bg-app-surface p-3 sm:p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-muted">Reviews</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-app-text sm:text-2xl">{location.totalReviewCount ?? "–"}</p>
          </div>
          <div className="rounded-xl border border-app-border! bg-app-surface p-3 sm:p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-muted">Need reply</p>
            <p
              className={`mt-1 text-xl font-semibold tabular-nums sm:text-2xl ${
                unreplied.data?.total ? "text-amber-600 dark:text-amber-400" : "text-app-text"
              }`}
            >
              {unreplied.data?.total ?? "–"}
            </p>
          </div>
        </div>

        <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => pickFilter(f.value)} className={chipClassName(filter === f.value)}>
              {f.label}
              {f.value === "unreplied" && unreplied.data?.total > 0 && (
                <span className={`rounded-full px-1.5 text-[10px] ${filter === f.value ? "bg-white/20" : "bg-amber-500/15 text-amber-600"}`}>
                  {unreplied.data.total}
                </span>
              )}
            </button>
          ))}
        </div>

        {reviews.isError ? (
          <ErrorState message="Couldn't load reviews." onRetry={reviews.refetch} />
        ) : !data ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : data.reviews.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessageSquareReply}
              title={filter === "unreplied" ? "Every review has a reply" : "No reviews here"}
              description={filter === "unreplied" ? "Nice work. New reviews show up after a sync." : "Press Sync to fetch the newest reviews from Google."}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {data.reviews.map((review) => (
              <ReviewCard key={review.reviewId} review={review} />
            ))}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button variant="ghost" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Newer
                </Button>
                <span className="text-xs text-app-text-muted">
                  Page {page} of {data.totalPages}
                </span>
                <Button variant="ghost" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
                  Older <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <PageShell
      title="Google reviews"
      description="Reply to every review from one place. The AI writes the first draft."
      maxWidth="max-w-4xl"
      actions={
        list.length > 0 && (
          <>
            {list.length > 1 && (
              <SelectMenu
                label="Google listing"
                options={list.map((l) => ({ value: l.locationId, label: l.locationName }))}
                value={activeId}
                onChange={(value) => {
                  setLocationId(value);
                  setPage(1);
                }}
              />
            )}
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={syncing}
              onClick={() => run(syncReviews(activeId), { success: "Reviews are up to date", error: "Could not sync reviews." })}
            >
              Sync
            </Button>
            <Button variant="secondary" icon={Bot} onClick={() => setAutopilotOpen(true)}>
              Autopilot
            </Button>
          </>
        )
      }
    >
      {body}
      <AutopilotDrawer open={autopilotOpen} onClose={() => setAutopilotOpen(false)} location={location} />
      <div className="h-14" aria-hidden="true" />
    </PageShell>
  );
};

export default Review;
