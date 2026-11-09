import React from 'react';
import { 
  Building, 
  Award, 
  Store, 
  Wallet, 
  Files
} from 'lucide-react';
import { PermitRecord } from '../types';
import { formatPeso } from '../services/storage';

interface StatsCardsProps {
  records: PermitRecord[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ records }) => {
  const counts = {
    total: records.length,
    building: 0,
    occupancy: 0,
    clearance: 0,
  };

  const totals = {
    building: 0,
    occupancy: 0,
    clearance: 0,
    grandTotal: 0,
  };

  records.forEach((r) => {
    const amt = typeof r.amount === 'number' ? r.amount : parseFloat(r.amount) || 0;
    totals.grandTotal += amt;

    if (r.type === 'Building Permit') {
      counts.building++;
      totals.building += amt;
    } else if (r.type === 'Certificate of Occupancy') {
      counts.occupancy++;
      totals.occupancy += amt;
    } else {
      counts.clearance++;
      totals.clearance += amt;
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Total Records */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 border-l-4 border-l-[#1d6fa8] shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">Registered Records</span>
          <Files className="w-4 h-4 text-[#1d6fa8]" />
        </div>
        <b className="block text-2xl font-serif font-bold text-slate-900 dark:text-white">
          {counts.total}
        </b>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex gap-2 flex-wrap">
          <span>{counts.building} Permits</span>
          <span>•</span>
          <span>{counts.occupancy} Occupancies</span>
        </div>
      </div>

      {/* Building Permit Total */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 border-l-4 border-l-[#2e7d32] shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">Building Permit Total</span>
          <Building className="w-4 h-4 text-[#2e7d32]" />
        </div>
        <b className="block text-2xl font-serif font-bold text-[#2e7d32] dark:text-emerald-400">
          {formatPeso(totals.building)}
        </b>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
          {counts.building} approved building projects
        </span>
      </div>

      {/* Certificate of Occupancy Total */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 border-l-4 border-l-[#c9a800] shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">Occupancy Cert Total</span>
          <Award className="w-4 h-4 text-[#c9a800]" />
        </div>
        <b className="block text-2xl font-serif font-bold text-[#8a6a00] dark:text-amber-400">
          {formatPeso(totals.occupancy)}
        </b>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
          {counts.occupancy} final occupancy certificates
        </span>
      </div>

      {/* Business Clearance Total */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 border-l-4 border-l-purple-600 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">OBO Clearances</span>
          <Store className="w-4 h-4 text-purple-600" />
        </div>
        <b className="block text-2xl font-serif font-bold text-purple-700 dark:text-purple-400">
          {formatPeso(totals.clearance)}
        </b>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
          {counts.clearance} annual safety clearances
        </span>
      </div>

      {/* Grand Total Revenue */}
      <div className="bg-gradient-to-br from-[#0f3d64] to-[#14527f] text-white p-4 rounded-xl border border-blue-900 shadow-sm sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-sky-200 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#fcee21]">Total OBO Revenue</span>
          <Wallet className="w-4 h-4 text-[#fcee21]" />
        </div>
        <b className="block text-2xl font-serif font-bold text-white tracking-tight">
          {formatPeso(totals.grandTotal)}
        </b>
        <span className="text-[11px] text-sky-200 mt-1 block">
          Total official collections
        </span>
      </div>
    </div>
  );
};
