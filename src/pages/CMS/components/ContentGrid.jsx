import { EmptyState, Skeleton } from "../../../components/ui/States";

// The list of content cards on a CMS page, with its loading and empty states.
const ContentGrid = ({ isLoading, isEmpty, emptyIcon, emptyTitle, children }) => {
  if (!isLoading && isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description="Add the first one with the form below."
      />
    );
  }

  return (
    <div className="anim-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {isLoading
        ? Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-64" />
          ))
        : children}
    </div>
  );
};

export default ContentGrid;
