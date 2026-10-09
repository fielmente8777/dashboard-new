import { Package } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  Skeleton,
} from "../../../components/ui/States";

// The grid of package cards with its loading, error and empty states.
// `query` is the RTK Query result that loads the packages.
const PackageList = ({ query, isEmpty, emptyTitle, children }) => {
  if (query.isError) {
    return (
      <ErrorState
        message="Could not load the packages."
        onRetry={query.refetch}
      />
    );
  }

  if (!query.isLoading && isEmpty) {
    return <EmptyState icon={Package} title={emptyTitle} />;
  }

  return (
    <div className="anim-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {query.isLoading || query.isUninitialized
        ? Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-72" />
          ))
        : children}
    </div>
  );
};

export default PackageList;
