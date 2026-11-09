import React from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';
import { PermitRecord } from '../types';
import { formatPeso } from '../services/storage';

interface PrintCertificateModalProps {
  record: PermitRecord | null;
  onClose: () => void;
  logo: string;
}

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  record,
  onClose,
  logo,
}) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl bg-white text-slate-900 border border-slate-300 rounded-xl shadow-2xl overflow-hidden my-6 print:m-0 print:border-none print:shadow-none"
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between noprint">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#fcee21]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Official OBO Printable Certification
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#14527f] hover:bg-[#0f3d64] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Sheet */}
        <div className="p-8 sm:p-12 relative bg-white" id="printable-certificate">
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <img src={logo} alt="Watermark" className="w-96 h-96 object-contain" />
          </div>

          {/* Official Philippines OBO Header with Dual Seals */}
          <div className="border-b-2 border-[#14527f] pb-5 mb-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <img 
                src="/assets/aistudio/Talisayan_logo_de080e16.jpg" 
                alt="Municipality of Talisayan Seal" 
                className="w-18 h-18 object-contain shrink-0 rounded-full border border-amber-300 p-0.5" 
              />
              <div className="text-center flex-1">
                <p className="text-[11px] font-serif uppercase tracking-widest text-slate-600">
                  Republic of the Philippines
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  Province of Misamis Oriental
                </p>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-serif">
                  MUNICIPALITY OF TALISAYAN
                </h3>
                <h2 className="text-base font-serif font-black tracking-tight text-[#0f3d64]">
                  OFFICE OF THE BUILDING OFFICIAL
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                  Building Permit &amp; Certificate of Occupancy Registry
                </p>
              </div>
              <img 
                src={logo} 
                alt="Office of the Building Official Seal" 
                className="w-18 h-18 object-contain shrink-0 rounded-full border border-emerald-700 p-0.5" 
              />
            </div>
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-1">
              Pursuant to Presidential Decree No. 1096 (The National Building Code of the Philippines)
            </p>
          </div>

          {/* Certificate Title Banner */}
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 bg-[#0f3d64] text-white font-serif font-bold text-xs uppercase tracking-widest rounded-xs shadow-xs">
              {record.type === 'Building Permit'
                ? 'OFFICIAL RECORD OF BUILDING PERMIT ISSUANCE'
                : record.type === 'Certificate of Occupancy'
                ? 'OFFICIAL CERTIFICATE OF OCCUPANCY REGISTRY RECORD'
                : 'OFFICIAL ANNUAL BUILDING SAFETY & CLEARANCE RECORD'}
            </span>
            <p className="text-xs text-slate-500 mt-1.5 font-mono">
              Registry Reference ID: {record.id}
            </p>
          </div>

          {/* Core Information Grid */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 bg-slate-50">
              <div className="p-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Permit / Certificate Number
                </span>
                <span className="block text-sm font-mono font-bold text-[#0f3d64] mt-0.5">
                  {record.permitNo || 'PENDING ASSIGNMENT'}
                </span>
              </div>
              <div className="p-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Official Receipt (OR) Number
                </span>
                <span className="block text-sm font-mono font-bold text-emerald-800 mt-0.5">
                  {record.orNo || 'OFFICIAL RECEIPT ATTACHED'}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-300 space-y-3">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Project / Building / Business Name
                </span>
                <span className="block text-base font-bold text-slate-900 mt-0.5">
                  {record.business}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Owner / Applicant / Representative
                  </span>
                  <span className="block font-medium text-slate-800 mt-0.5">
                    {record.owner}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Engineer / Architect in Charge
                  </span>
                  <span className="block font-medium text-slate-800 mt-0.5">
                    {record.engineer || 'N/A or Registered Professional on File'}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Project Location / Site Address
                </span>
                <span className="block text-slate-800 mt-0.5">
                  {record.address || 'Address registered under municipal tax declaration'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-200">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Use Classification
                  </span>
                  <span className="block font-medium text-slate-800 mt-0.5">
                    {record.category || 'General'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Floor Area
                  </span>
                  <span className="block font-medium text-slate-800 mt-0.5">
                    {record.floorArea || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    No. of Storeys
                  </span>
                  <span className="block font-medium text-slate-800 mt-0.5">
                    {record.storeys || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment and Dates Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 border-t border-slate-300 bg-slate-50 p-3">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Date Paid / Issued
                </span>
                <span className="block font-semibold text-slate-800 mt-0.5">
                  {record.date}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Valid Until / Due Date
                </span>
                <span className="block font-semibold text-slate-800 mt-0.5">
                  {record.valid || 'Permanent / As per NBCP'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Assessment Fee Paid
                </span>
                <span className="block font-mono font-bold text-sm text-slate-900 mt-0.5">
                  {formatPeso(record.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks & Technical Clearances */}
          {record.remarks && (
            <div className="p-3.5 rounded-lg bg-sky-50/60 border border-sky-200 text-xs text-slate-700 mb-8">
              <span className="block text-[10px] font-bold uppercase text-[#0f3d64] tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Technical Review &amp; Inspection Clearance Notes
              </span>
              <p className="italic">"{record.remarks}"</p>
            </div>
          )}

          {/* Official Signatures Block */}
          <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs text-slate-700">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900 uppercase">
                OBO Records Officer
              </div>
              <span className="text-[10px] text-slate-500">Verified &amp; Recorded</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900 uppercase">
                Technical Review Head
              </div>
              <span className="text-[10px] text-slate-500">Inspection &amp; Safety Compliance</span>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-[#0f3d64] uppercase">
                Building Official
              </div>
              <span className="text-[10px] text-slate-500">Office of the Building Official</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-8 pt-4 border-t border-slate-200">
            Printed from OBO BUILDING PERMIT &amp; CERTIFICATE OF OCCUPANCY RECORDS MANAGEMENT SYSTEM • {new Date().toLocaleDateString('en-PH', { dateStyle: 'full' })}
          </div>
        </div>
      </div>
    </div>
  );
};
