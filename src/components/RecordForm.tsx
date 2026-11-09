import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Save, 
  X, 
  RotateCcw, 
  FileText, 
  Building, 
  MapPin, 
  User, 
  Receipt, 
  Calendar,
  Wand2
} from 'lucide-react';
import { PermitRecord, RecordType, BuildingCategory } from '../types';
import { 
  getTodayString, 
  TALISAYAN_BARANGAYS, 
  generateNextPermitNo,
  generateNextOrNo
} from '../services/storage';

interface RecordFormProps {
  editingRecord: PermitRecord | null;
  existingRecords: PermitRecord[];
  onSave: (record: Omit<PermitRecord, 'id'>, id?: string) => void;
  onCancelEdit: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  editingRecord,
  existingRecords,
  onSave,
  onCancelEdit,
}) => {
  const [business, setBusiness] = useState('');
  const [owner, setOwner] = useState('');
  const [barangay, setBarangay] = useState('Poblacion');
  const [addressDetails, setAddressDetails] = useState('');
  const [type, setType] = useState<RecordType>('Building Permit');
  const [category, setCategory] = useState<BuildingCategory>('Commercial');
  const [permitNo, setPermitNo] = useState('');
  const [orNo, setOrNo] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(getTodayString());
  const [valid, setValid] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setBusiness(editingRecord.business || '');
      setOwner(editingRecord.owner || '');
      
      const addr = editingRecord.address || '';
      const foundBrgy = TALISAYAN_BARANGAYS.find(b => addr.toLowerCase().includes(b.toLowerCase()));
      if (foundBrgy) {
        setBarangay(foundBrgy);
        setAddressDetails(addr.replace(new RegExp(`brgy\\.?\\s*${foundBrgy},?\\s*`, 'i'), '').replace(/,\s*Talisayan,\s*Misamis Oriental/i, '').trim());
      } else {
        setAddressDetails(addr);
      }

      setType(editingRecord.type || 'Building Permit');
      setCategory(editingRecord.category || 'Commercial');
      setPermitNo(editingRecord.permitNo || '');
      setOrNo(editingRecord.orNo || '');
      setAmount(editingRecord.amount ? editingRecord.amount.toString() : '');
      setDate(editingRecord.date || getTodayString());
      setValid(editingRecord.valid || '');
      setRemarks(editingRecord.remarks || '');
    } else {
      resetForm();
    }
  }, [editingRecord]);

  const resetForm = () => {
    setBusiness('');
    setOwner('');
    setBarangay('Poblacion');
    setAddressDetails('');
    setType('Building Permit');
    setCategory('Commercial');
    setPermitNo('');
    setOrNo('');
    setAmount('');
    setDate(getTodayString());
    setValid('');
    setRemarks('');
  };

  const handleAutoGenerateNumbers = () => {
    setPermitNo(generateNextPermitNo(type, existingRecords));
    setOrNo(generateNextOrNo(existingRecords));
  };

  const handleSetOneYearValidity = () => {
    const baseDate = date ? new Date(date) : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    setValid(baseDate.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business.trim() || !owner.trim() || !date) {
      alert('Please fill in the required fields: Building/Project Name, Owner/Applicant, and Date.');
      return;
    }

    const fullAddress = addressDetails.trim()
      ? `Brgy. ${barangay}, ${addressDetails.trim()}, Talisayan, Misamis Oriental`
      : `Brgy. ${barangay}, Talisayan, Misamis Oriental`;

    const parsedAmount = parseFloat(amount) || 0;

    onSave(
      {
        business: business.trim(),
        owner: owner.trim(),
        address: fullAddress,
        type,
        category,
        permitNo: permitNo.trim() || generateNextPermitNo(type, existingRecords),
        orNo: orNo.trim() || generateNextOrNo(existingRecords),
        amount: parsedAmount,
        date,
        valid: valid || undefined,
        remarks: remarks.trim(),
      },
      editingRecord ? editingRecord.id : undefined
    );

    if (!editingRecord) {
      resetForm();
    }
  };

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-xs">
      
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-[#0f3d64] dark:text-sky-300 flex items-center justify-center shrink-0">
            {editingRecord ? <FileText className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-white">
              {editingRecord ? 'Edit OBO Record' : 'Add New Building Permit / Occupancy Certificate'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingRecord
                ? `Updating permit record for "${editingRecord.business}"`
                : 'Fill in the details below to register a new official record in the registry.'}
            </p>
          </div>
        </div>

        {editingRecord ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 self-start sm:self-auto">
            Editing Record #{editingRecord.permitNo || editingRecord.id}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleAutoGenerateNumbers}
            className="text-xs text-[#14527f] dark:text-sky-400 hover:underline font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            title="Auto-generate next Permit No. and Official Receipt No."
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Auto-fill Next Numbers</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          
          {/* Building / Business / Project Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Project / Building / Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={140}
              placeholder="e.g. 2-Storey Residential House"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            />
          </div>

          {/* Owner / Representative */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Owner / Applicant / Representative <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Juan Dela Cruz"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            />
          </div>

          {/* Barangay (Talisayan) */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Barangay (Talisayan, Mis. Or.) <span className="text-red-500">*</span>
            </label>
            <select
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            >
              {TALISAYAN_BARANGAYS.map((b) => (
                <option key={b} value={b}>
                  Brgy. {b}
                </option>
              ))}
            </select>
          </div>

          {/* Street / Location Details */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200">
              Street / Lot &amp; Block Address Details
            </label>
            <input
              type="text"
              placeholder="e.g. Zone 2, National Highway"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            />
          </div>

          {/* Permit / Record Type */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Permit Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RecordType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            >
              <option value="Building Permit">Building Permit</option>
              <option value="Certificate of Occupancy">Certificate of Occupancy</option>
              <option value="Business Permit / OBO Clearance">Business Permit / OBO Clearance</option>
            </select>
          </div>

          {/* Classification */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200">
              Building Classification
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BuildingCategory)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Institutional">Institutional</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Mixed-Use">Mixed-Use</option>
            </select>
          </div>

          {/* Permit / Certificate Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-200">
                Permit / Certificate No.
              </label>
              <button
                type="button"
                onClick={() => setPermitNo(generateNextPermitNo(type, existingRecords))}
                className="text-[10px] text-[#14527f] dark:text-sky-400 hover:underline font-semibold cursor-pointer"
              >
                Auto-gen
              </button>
            </div>
            <input
              type="text"
              maxLength={40}
              placeholder="e.g. BP-2026-0001"
              value={permitNo}
              onChange={(e) => setPermitNo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            />
          </div>

          {/* Official Receipt (OR) Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                Official Receipt (OR) No.
              </label>
              <button
                type="button"
                onClick={() => setOrNo(generateNextOrNo(existingRecords))}
                className="text-[10px] text-[#14527f] dark:text-sky-400 hover:underline font-semibold cursor-pointer"
              >
                Auto-gen
              </button>
            </div>
            <input
              type="text"
              maxLength={40}
              placeholder="e.g. OR-8921001"
              value={orNo}
              onChange={(e) => setOrNo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            />
          </div>

          {/* Amount Paid (₱) */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200">
              Amount Paid (₱ PHP) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            />
          </div>

          {/* Date Paid / Issued */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date Issued / Paid <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            />
          </div>

          {/* Valid Until / Annual Due */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Valid Until
              </label>
              <button
                type="button"
                onClick={handleSetOneYearValidity}
                className="text-[10px] text-[#14527f] dark:text-sky-400 hover:underline font-semibold cursor-pointer"
              >
                +1 Year
              </button>
            </div>
            <input
              type="date"
              value={valid}
              onChange={(e) => setValid(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14527f]"
            />
          </div>

        </div>

        {/* Remarks */}
        <div className="space-y-1 text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-200">
            Inspection Notes / Remarks
          </label>
          <input
            type="text"
            maxLength={250}
            placeholder="e.g. Approved and inspected by OBO Talisayan technical staff."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#14527f]"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#14527f] hover:bg-[#0f3d64] text-white text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{editingRecord ? 'Update Record' : 'Save Record'}</span>
          </button>

          {editingRecord && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel Edit</span>
            </button>
          )}

          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold transition cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>
        </div>
      </form>
    </section>
  );
};
