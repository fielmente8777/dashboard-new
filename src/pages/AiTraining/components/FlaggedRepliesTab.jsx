import { ThumbsUp } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/ui/States";
import { useApiAction } from "../../../hooks/useApiAction";
import {
  useApproveFlaggedReplyMutation,
  useRejectFlaggedReplyMutation,
} from "../../../redux/api/aiTrainingApi";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import FlaggedReplyCard from "./FlaggedReplyCard";

// `flagged` is the getFlaggedReplies query, owned by the page so the tab
// badge and this list share one request.
const FlaggedRepliesTab = ({ tenant, flagged }) => {
  const run = useApiAction();
  const [approveReply] = useApproveFlaggedReplyMutation();
  const [rejectReply] = useRejectFlaggedReplyMutation();

  const handleApprove = (item, rule) =>
    run(approveReply({ id: item._id, ...tenant, ...rule }), {
      success: "Rule added to Custom Rules",
      error: "Could not approve the rule.",
    });

  const handleDismiss = (item) =>
    run(rejectReply({ id: item._id, ...tenant }), {
      success: "Flagged reply dismissed",
      error: "Could not dismiss the reply.",
    });

  if (flagged.isLoading || flagged.isUninitialized) {
    return <LoadingState label="Loading flagged replies..." />;
  }

  if (flagged.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          flagged.error,
          "Could not load flagged replies.",
        )}
        onRetry={flagged.refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-app-text-muted">
        Corrections flagged from real conversations. Approving one adds it
        straight to Custom Rules — nothing here goes live until you approve it.
      </p>

      {flagged.data.length === 0 && (
        <EmptyState icon={ThumbsUp} title="Nothing flagged right now" />
      )}

      {flagged.data.map((item) => (
        <FlaggedReplyCard
          key={item._id}
          item={item}
          onApprove={handleApprove}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
};

export default FlaggedRepliesTab;
