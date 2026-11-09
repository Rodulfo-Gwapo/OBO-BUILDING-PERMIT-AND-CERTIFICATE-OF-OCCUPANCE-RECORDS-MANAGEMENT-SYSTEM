import React, { useRef } from 'react';
import { 
  FileSpreadsheet, 
  Database, 
  Printer, 
  LogOut, 
  UserCheck, 
  Building2, 
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  currentUser: string;
  logo: string;
  onLogoChange: (dataUrl: string) => void;
  onResetLogo: () => void;
  isCustomLogo: boolean;
  onExportCsv: () => void;
  onOpenBackupModal: (mode: 'backup' | 'restore') => void;
  onPrint: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  logo,
  onLogoChange,
  onResetLogo,
  isCustomLogo,
  onExportCsv,
  onOpenBackupModal,
  onPrint,
  onSignOut,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      alert('Please select an image file (PNG, JPG, SVG).');
      return;
    }
    if (file.size > 800 * 1024) {
      alert('Logo file size is too large. Please use an image under 800 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLogoChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <header className="bg-[#fcee21] text-[#17232b] border-b-6 border-[#14527f] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand & Office Titles */}
        <div className="flex items-center gap-4 text-center sm:text-left w-full lg:w-auto justify-center sm:justify-start">
          {/* Official Seals: Municipal Seal & OBO Seal */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Municipal Seal */}
            <div 
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border-2 border-amber-300 shadow-md p-1 flex items-center justify-center overflow-hidden shrink-0"
              title="Municipality of Talisayan (Est. 1854) - Misamis Oriental"
            >
              <img 
                src="/assets/aistudio/Talisayan_logo_de080e16.jpg" 
                alt="Municipality of Talisayan Seal" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* OBO Seal (Primary / Uploadable) */}
            <div className="relative group shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                title="Office of the Building Official (Talisayan) Seal - Click to change"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border-3 border-emerald-700 shadow-md p-1 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden"
              >
                <img 
                  src={logo} 
                  alt="Office of the Building Official Seal" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />

              {isCustomLogo && (
                <button
                  type="button"
                  onClick={onResetLogo}
                  title="Restore default OBO seal"
                  className="absolute -bottom-1 -right-1 p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-full shadow border border-slate-300 text-[10px] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="text-[11px] font-extrabold tracking-widest uppercase bg-[#0f3d64] text-white px-2 py-0.5 rounded-xs">
                OFFICE OF THE BUILDING OFFICIAL • TALISAYAN
              </span>
              <span className="text-[11px] font-bold text-[#4a4200] hidden sm:inline">
                Province of Misamis Oriental
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black font-serif tracking-tight leading-tight text-[#0f3d64] mt-1">
              OBO BUILDING PERMIT &amp; CERTIFICATE OF OCCUPANCY RECORDS MANAGEMENT SYSTEM
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#4a4200] mt-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
              <Building2 className="w-3.5 h-3.5 inline text-[#0f3d64]" />
              Official registry for Building Permits, Occupancy Certificates, Clearance assessments &amp; Official Receipts (OR)
            </p>
          </div>
        </div>

        {/* Action Buttons & Installation */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 text-xs font-semibold w-full lg:w-auto">
          {/* User Status */}
          <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-[#c9a800]/40 text-[#0f3d64] shadow-xs">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span className="truncate max-w-[140px]" title={currentUser}>
              {currentUser}
            </span>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 text-[#0f3d64] px-2.5 py-1.5 rounded-lg border border-[#c9a800] shadow-xs transition cursor-pointer"
            title="Export all records to Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          {/* Backup / Restore */}
          <div className="flex rounded-lg shadow-xs overflow-hidden border border-[#c9a800]">
            <button
              type="button"
              onClick={() => onOpenBackupModal('backup')}
              className="flex items-center gap-1 bg-white hover:bg-slate-50 text-[#0f3d64] px-2.5 py-1.5 border-r border-[#c9a800] transition cursor-pointer"
              title="Save full JSON backup"
            >
              <Database className="w-3.5 h-3.5 text-blue-700" />
              <span>Backup</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBackupModal('restore')}
              className="bg-white hover:bg-slate-50 text-[#0f3d64] px-2 py-1.5 transition cursor-pointer"
              title="Restore from JSON backup"
            >
              <span>Restore</span>
            </button>
          </div>

          {/* Print */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 text-[#0f3d64] px-2.5 py-1.5 rounded-lg border border-[#c9a800] shadow-xs transition cursor-pointer"
            title="Print OBO Registry Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-1 bg-[#b3302a] hover:bg-[#8e2420] text-white px-2.5 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
            title="Sign out of registry"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
};
