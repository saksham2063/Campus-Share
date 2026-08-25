import { 
  SlidersHorizontal
} from 'lucide-react';
import { PillarCategory, ListingType } from '../types';

interface SearchBarAndFiltersProps {
  activeCategory: PillarCategory | 'all';
  onCategoryChange: (cat: PillarCategory | 'all') => void;
  activeType: ListingType | 'all';
  onTypeChange: (type: ListingType | 'all') => void;
  categoryCounts: {
    all: number;
    resources: number;
    services: number;
    opportunities: number;
  };
  typeCounts: {
    all: number;
    offering: number;
    looking_for: number;
  };
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  popularTags: string[];
  searchQuery: string;
  onClearFilters: () => void;
}

export function SearchBarAndFilters({
  activeCategory,
  onCategoryChange,
  activeType,
  onTypeChange,
  categoryCounts,
  typeCounts,
  selectedTag,
  onTagSelect,
  popularTags,
  searchQuery,
  onClearFilters,
}: SearchBarAndFiltersProps) {
  const tabs = [
    {
      id: 'all' as const,
      label: 'All Explore',
      count: categoryCounts.all,
    },
    {
      id: 'resources' as const,
      label: '📦 Resources',
      count: categoryCounts.resources,
    },
    {
      id: 'services' as const,
      label: '🛠️ Services',
      count: categoryCounts.services,
    },
    {
      id: 'opportunities' as const,
      label: '🎯 Opportunities',
      count: categoryCounts.opportunities,
    },
  ];

  const hasActiveFilters =
    Boolean(searchQuery) ||
    activeCategory !== 'all' ||
    activeType !== 'all' ||
    selectedTag !== null;

  return (
    <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6 shadow-2xs">
      {/* High Density Horizontal Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {/* Pillar Tabs Bar */}
        <nav className="h-13 sm:h-14 flex items-center gap-4 sm:gap-8 shrink-0 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-pillar-${tab.id}`}
                onClick={() => onCategoryChange(tab.id)}
                className={`tab-btn h-full px-1.5 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-indigo-600 border-indigo-600 font-bold'
                    : 'text-slate-500 hover:text-indigo-600 border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Offering / Looking For Controls */}
        <div className="flex items-center gap-2 py-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              id="filter-type-all"
              onClick={() => onTypeChange('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({typeCounts.all})
            </button>
            <button
              id="filter-type-offering"
              onClick={() => onTypeChange('offering')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeType === 'offering'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Offering ({typeCounts.offering})
            </button>
            <button
              id="filter-type-looking-for"
              onClick={() => onTypeChange('looking_for')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeType === 'looking_for'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Looking For ({typeCounts.looking_for})
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tag Pills in Sub-Bar */}
      {popularTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap py-2.5 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
            <SlidersHorizontal className="w-3 h-3" /> Quick Tags:
          </span>
          {popularTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                id={`tag-filter-${tag}`}
                onClick={() => onTagSelect(isSelected ? null : tag)}
                className={`px-2 py-0.5 rounded-md text-xs transition-all font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                #{tag}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              id="reset-all-filters-btn"
              onClick={onClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold ml-2 underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

