import { Package, Wrench, Target, ArrowRight } from 'lucide-react';
import { PillarCategory } from '../types';

interface SmartMatchingBannerProps {
  onSelectCategory: (cat: PillarCategory) => void;
  activeCount: number;
}

export function SmartMatchingBanner({
  onSelectCategory,
  activeCount,
}: SmartMatchingBannerProps) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Campus Marketplace • {activeCount} Listings Online
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            Borrow resources, request peer skills, or find partners
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified campus community. No commissions, direct student-to-student exchange.
          </p>
        </div>

        {/* 3 Pillar Quick Shortcuts */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <button
            onClick={() => onSelectCategory('resources')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50/80 hover:bg-green-100/80 border border-green-200 text-green-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-green-600" />
            <span>Resources</span>
            <ArrowRight className="w-3 h-3 text-green-600 hidden sm:inline" />
          </button>

          <button
            onClick={() => onSelectCategory('services')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Services</span>
            <ArrowRight className="w-3 h-3 text-amber-600 hidden sm:inline" />
          </button>

          <button
            onClick={() => onSelectCategory('opportunities')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 text-xs font-bold transition-all cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Opportunities</span>
            <ArrowRight className="w-3 h-3 text-indigo-600 hidden sm:inline" />
          </button>
        </div>
      </div>
    </section>
  );
}

