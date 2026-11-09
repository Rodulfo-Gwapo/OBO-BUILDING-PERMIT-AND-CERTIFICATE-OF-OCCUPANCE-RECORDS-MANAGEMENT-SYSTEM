import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Edit3, 
  Trash2, 
  Printer, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Building,
  Award,
  Store,
  Layers,
  MapPin,
  Clock,
  HardHat
} from 'lucide-react';
import { PermitRecord, RecordType } from '../types';
import { formatPeso, getRecordStatus, getTodayString } from '../services/storage';

interface RecordTableProps {
  records: PermitRecord[];
  onEdit: (record: PermitRecord) => void;
  onDelete: (id: string, name: string) => void;
  onPrintRecord: (record: PermitRecord) => void;
}

type SortField = 'business' | 'type' | 'orNo' | 'date' | 'valid' | 'amount';

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  onEdit,
  onDelete,
  onPrintRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Available years from records
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    records.forEach((r) => {
      if (r.date && r.date.length >= 4) {
        years.add(r.date.slice(0, 4));
      }
    });
    return Array.from(years).sort().reverse();
  }, [records]);

  // Handle Quick Date Ranges
  const setQuickRange = (range: 'today' | 'month' | 'year' | 'clear') => {
    const today = getTodayString();
    if (range === 'today') {
      setDateFrom(today);
      setDateTo(today);
    } else if (range === 'month') {
      setDateFrom(today.slice(0, 8) + '01');
      setDateTo(today);
    } else if (range === 'year') {
      setDateFrom(today.slice(0, 4) + '-01-01');
      setDateTo(today);
    } else {
      setDateFrom('');
      setDateTo('');
    }
  };

  // Sorting helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return records
      .filter((r) => {
        // Permit type
        if (typeFilter && r.type !== typeFilter) return false;

        // Validity status
        if (statusFilter && getRecordStatus(r) !== statusFilter) return false;

        // Year filter
        if (yearFilter && (!r.date || !r.date.startsWith(yearFilter))) return false;

        // Date range
        if (dateFrom && r.date < dateFrom) return false;
        if (dateTo && r.date > dateTo) return false;

        // Search text
        if (!q) return true;
        const searchCorpus = [
          r.business,
          r.owner,
          r.engineer,
          r.address,
          r.permitNo,
          r.orNo,
          r.type,
          r.category,
          r.remarks,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchCorpus.includes(q);
      })
      .sort((a, b) => {
        let valA: string | number = a[sortField] || '';
        let valB: string | number = b[sortField] || '';

        if (sortField === 'amount') {
          valA = typeof a.amount === 'number' ? a.amount : parseFloat(a.amount) || 0;
          valB = typeof b.amount === 'number' ? b.amount : parseFloat(b.amount) || 0;
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    records,
    searchTerm,
    typeFilter,
    statusFilter,
    yearFilter,
    dateFrom,
    dateTo,
    sortField,
    sortDirection,
  ]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#14527f] inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#14527f] inline ml-1" />
    );
  };

  const expiringCount = records.filter(r => getRecordStatus(r) === 'Expiring soon').length;
  const buildingCount = records.filter(r => r.type === 'Building Permit').length;
  const occupancyCount = records.filter(r => r.type === 'Certificate of Occupancy').length;

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-xs">
      
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
            <span>Official OBO Registry Records</span>
            {expiringCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                {expiringCount} Due for Inspection
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredRecords.length} of {records.length} total registered records
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto noprint">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Print the complete registry ledger"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Registry Ledger</span>
          </button>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 noprint no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => {
            setTypeFilter('');
            setStatusFilter('');
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
            !typeFilter && !statusFilter
              ? 'bg-[#14527f] text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Records ({records.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setTypeFilter('Building Permit');
            setStatusFilter('');
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
            typeFilter === 'Building Permit'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
          }`}
        >
          Building Permits ({buildingCount})
        </button>

        <button
          type="button"
          onClick={() => {
            setTypeFilter('Certificate of Occupancy');
            setStatusFilter('');
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
            typeFilter === 'Certificate of Occupancy'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
          }`}
        >
          Occupancy Certs ({occupancyCount})
        </button>

        {expiringCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('Expiring soon');
              setTypeFilter('');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              statusFilter === 'Expiring soon'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Expiring Soon ({expiringCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tools */}
      <div className="space-y-3 mb-4 noprint">
        {/* Row 1: Search & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="search"
              placeholder="Search building, owner, permit #, OR #, engineer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1d6fa8]"
            />
          </div>

          {/* Permit Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1d6fa8]"
            >
              <option value="">All Permit Types</option>
              <option value="Building Permit">Building Permit</option>
              <option value="Certificate of Occupancy">Certificate of Occupancy</option>
              <option value="Business Permit / OBO Clearance">Business Permit / Clearance</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1d6fa8]"
            >
              <option value="">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Validity Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1d6fa8]"
            >
              <option value="">All Status / Validity</option>
              <option value="Active">Active / Compliant</option>
              <option value="Expiring soon">Expiring Soon (within 30 days)</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Range Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Date from:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">to:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="flex items-center gap-1 ml-auto flex-wrap">
            <button
              type="button"
              onClick={() => setQuickRange('today')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium transition cursor-pointer text-[11px]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('month')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium transition cursor-pointer text-[11px]"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('year')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium transition cursor-pointer text-[11px]"
            >
              This Year
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('clear')}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-medium transition cursor-pointer text-[11px]"
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-lg">
        <table className="w-full text-left text-xs border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none">
              <th 
                onClick={() => handleSort('business')}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Project / Building / Applicant {renderSortIcon('business')}
              </th>
              <th 
                onClick={() => handleSort('type')}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Permit Type / Specs {renderSortIcon('type')}
              </th>
              <th 
                onClick={() => handleSort('orNo')}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Permit &amp; OR No. {renderSortIcon('orNo')}
              </th>
              <th 
                onClick={() => handleSort('date')}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Date Issued / Paid {renderSortIcon('date')}
              </th>
              <th 
                onClick={() => handleSort('valid')}
                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Validity / Status {renderSortIcon('valid')}
              </th>
              <th 
                onClick={() => handleSort('amount')}
                className="p-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Amount Paid {renderSortIcon('amount')}
              </th>
              <th className="p-3 text-center noprint">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-400 dark:text-slate-500">
                  <div className="max-w-md mx-auto space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                      {records.length === 0 
                        ? 'No records in the registry yet.' 
                        : 'No records match your search or filter.'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {records.length === 0 
                        ? 'Fill in the form above and click "Save Record" to register your first Building Permit or Certificate of Occupancy.' 
                        : 'Try clearing the search box or selecting "All Permit Types".'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const status = getRecordStatus(r);
                return (
                  <tr 
                    key={r.id} 
                    className="hover:bg-sky-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* Project / Building */}
                    <td className="p-3 align-top">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {r.business}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 space-y-0.5">
                        <div className="flex items-center gap-1 font-medium">
                          <span className="text-slate-500">Owner:</span> {r.owner}
                        </div>
                        {r.engineer && (
                          <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                            <HardHat className="w-3 h-3 shrink-0" />
                            <span>{r.engineer}</span>
                          </div>
                        )}
                        {r.address && (
                          <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{r.address}</span>
                          </div>
                        )}
                        {r.remarks && (
                          <div className="text-slate-500 italic text-[10px] mt-1 line-clamp-2">
                            "{r.remarks}"
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Permit Type & Category */}
                    <td className="p-3 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.type === 'Building Permit'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : r.type === 'Certificate of Occupancy'
                              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300'
                          }`}
                        >
                          {r.type}
                        </span>
                        {r.category && (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            {r.category}
                          </span>
                        )}
                      </div>
                      {(r.floorArea || r.storeys) && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          {[r.floorArea, r.storeys].filter(Boolean).join(' • ')}
                        </div>
                      )}
                    </td>

                    {/* Permit & OR No. */}
                    <td className="p-3 align-top font-mono text-[11px] whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {r.permitNo || '—'}
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        OR: {r.orNo || '—'}
                      </div>
                    </td>

                    {/* Date Issued */}
                    <td className="p-3 align-top whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {r.date}
                    </td>

                    {/* Valid Until & Status */}
                    <td className="p-3 align-top whitespace-nowrap">
                      <div>{r.valid || '—'}</div>
                      {status && (
                        <div className="mt-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                              status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                : status === 'Expiring soon'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 animate-pulse'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-3 align-top text-right font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums whitespace-nowrap">
                      {formatPeso(r.amount)}
                    </td>

                    {/* Row Actions */}
                    <td className="p-3 align-top text-center noprint whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPrintRecord(r)}
                          title="Print official clearance / slip"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-[#14527f] dark:text-sky-300 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(r)}
                          title="Edit this record"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(r.id, r.business)}
                          title="Delete record"
                          className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
