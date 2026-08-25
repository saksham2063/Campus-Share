import { SearchX, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpenPostModal: () => void;
}

export function EmptyState({
  hasFilters,
  onClearFilters,
  onOpenPostModal,
}: EmptyStateProps) {
  return (
    <div
      id="empty-state-view"
      className="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-xl mx-auto my-8 shadow-xs"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {hasFilters ? 'No matching campus items found' : 'No listings available yet'}
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
        {hasFilters
          ? 'Try adjusting your search terms, changing the category tab, or resetting active filters.'
          : 'Be the first student to share a resource, offer a service, or create an opportunity!'}
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {hasFilters && (
          <button
            id="empty-clear-filters-btn"
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        )}
        <button
          id="empty-post-btn"
          onClick={onOpenPostModal}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post an Item</span>
        </button>
      </div>
    </div>
  );
}
