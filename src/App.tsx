/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  StatsCards 
} from './components/StatsCards';
import { 
  RecordForm 
} from './components/RecordForm';
import { 
  RecordTable 
} from './components/RecordTable';
import { 
  PrintCertificateModal 
} from './components/PrintCertificateModal';
import { 
  BackupModal 
} from './components/BackupModal';
import { 
  AuthScreen 
} from './components/AuthScreen';
import { 
  useOnlineStatus 
} from './hooks/useOnlineStatus';
import { 
  PermitRecord 
} from './types';
import { 
  loadRecords, 
  saveRecords, 
  getActiveSession, 
  clearActiveSession,
  getSavedLogo,
  saveLogo,
  resetLogo,
  DEFAULT_LOGO,
  getTodayString,
  getRecordStatus,
  formatPeso
} from './services/storage';
import { 
  WifiOff, 
  CheckCircle 
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [records, setRecords] = useState<PermitRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<PermitRecord | null>(null);
  const [logo, setLogo] = useState<string>(getSavedLogo());
  const [isCustomLogo, setIsCustomLogo] = useState<boolean>(false);
  
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupMode, setBackupMode] = useState<'backup' | 'restore'>('backup');
  const [printRecord, setPrintRecord] = useState<PermitRecord | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');

  // Online status hook
  const isOnline = useOnlineStatus();

  // Load records and session on mount
  useEffect(() => {
    const sessionUser = getActiveSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
    const data = loadRecords();
    setRecords(data);

    const savedLogo = getSavedLogo();
    setLogo(savedLogo);
    setIsCustomLogo(savedLogo !== DEFAULT_LOGO);
  }, []);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogoChange = (newLogoUrl: string) => {
    saveLogo(newLogoUrl);
    setLogo(newLogoUrl);
    setIsCustomLogo(true);
    showToast('Office seal logo updated successfully!');
  };

  const handleResetLogo = () => {
    resetLogo();
    setLogo(DEFAULT_LOGO);
    setIsCustomLogo(false);
    showToast('Restored official Talisayan OBO seal.');
  };

  const handleSaveRecord = (recordData: Omit<PermitRecord, 'id'>, id?: string) => {
    if (id) {
      // Update existing record
      const updated = records.map((r) =>
        r.id === id
          ? {
              ...r,
              ...recordData,
              updatedAt: new Date().toISOString(),
            }
          : r
      );
      setRecords(updated);
      saveRecords(updated);
      setEditingRecord(null);
      showToast('OBO Record updated successfully!');
    } else {
      // Create new record
      const newRecord: PermitRecord = {
        ...recordData,
        id: `obo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      const updated = [newRecord, ...records];
      setRecords(updated);
      saveRecords(updated);
      showToast('New record registered and saved!');
    }
  };

  const handleDeleteRecord = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the record for "${name}"? This cannot be undone.`
    );
    if (confirmed) {
      const updated = records.filter((r) => r.id !== id);
      setRecords(updated);
      saveRecords(updated);
      if (editingRecord?.id === id) {
        setEditingRecord(null);
      }
      showToast('Record deleted from registry.');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Project / Building Name',
      'Owner / Representative',
      'Engineer / Architect in Charge',
      'Site Address / Barangay',
      'Permit Type',
      'Classification',
      'Floor Area',
      'No. of Storeys',
      'Permit / Cert No.',
      'Official Receipt (OR) No.',
      'Amount Paid (PHP)',
      'Date Issued / Paid',
      'Valid Until / Due Date',
      'Validity Status',
      'Inspection Notes / Remarks',
    ];

    const rows = records.map((r) => [
      r.business,
      r.owner,
      r.engineer || '',
      r.address,
      r.type,
      r.category || '',
      r.floorArea || '',
      r.storeys || '',
      r.permitNo,
      r.orNo,
      typeof r.amount === 'number' ? r.amount.toFixed(2) : r.amount,
      r.date,
      r.valid || '',
      getRecordStatus(r),
      r.remarks || '',
    ]);

    // Prepend UTF-8 BOM so Excel opens accents and peso currency cleanly
    const csvContent =
      '\ufeff' +
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\r\n');

    const filename = `OBO-records-registry-${getTodayString()}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);

    showToast(`Exported ${records.length} records to CSV!`);
  };

  const handleRestoreDatabase = (newRecords: PermitRecord[]) => {
    setRecords(newRecords);
    saveRecords(newRecords);
    showToast(`Database restored with ${newRecords.length} records!`);
  };

  const handleSignOut = () => {
    clearActiveSession();
    setCurrentUser(null);
  };

  // If user is not authenticated, display login/sign-up screen
  if (!currentUser) {
    return <AuthScreen onSignedIn={(user) => setCurrentUser(user)} logo={logo} />;
  }

  return (
    <div className="min-h-screen bg-[#f2f8fb] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-sm noprint">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>
            Offline Mode Active — You can continue recording and viewing permits; data is saved safely in your gadget storage.
          </span>
        </div>
      )}

      {/* Main Official Header */}
      <Header
        currentUser={currentUser}
        logo={logo}
        onLogoChange={handleLogoChange}
        onResetLogo={handleResetLogo}
        isCustomLogo={isCustomLogo}
        onExportCsv={handleExportCsv}
        onOpenBackupModal={(mode) => {
          setBackupMode(mode);
          setIsBackupModalOpen(true);
        }}
        onPrint={() => window.print()}
        onSignOut={handleSignOut}
      />

      {/* Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">
        
        {/* Statistics & Revenue Summary Cards */}
        <StatsCards records={records} />

        {/* Record Entry & Update Form */}
        <RecordForm
          editingRecord={editingRecord}
          existingRecords={records}
          onSave={handleSaveRecord}
          onCancelEdit={() => setEditingRecord(null)}
        />

        {/* Search, Filter & Records Table */}
        <RecordTable
          records={records}
          onEdit={(record) => {
            setEditingRecord(record);
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
          onDelete={handleDeleteRecord}
          onPrintRecord={(record) => setPrintRecord(record)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 noprint">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>OBO BUILDING PERMIT &amp; CERTIFICATE OF OCCUPANCY RECORDS MANAGEMENT SYSTEM</strong> • Official LGU Registry
          </p>
          <div className="flex items-center gap-3">
            <span>Municipality of Talisayan, Misamis Oriental</span>
            <span>•</span>
            <span>Local Secure Database</span>
          </div>
        </div>
      </footer>

      {/* Print Slip / Certificate Modal */}
      <PrintCertificateModal
        record={printRecord}
        onClose={() => setPrintRecord(null)}
        logo={logo}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        initialMode={backupMode}
        records={records}
        onRestore={handleRestoreDatabase}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div 
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-[#0f3d64] text-white px-4 py-2.5 rounded-xl shadow-xl border border-sky-400/30 flex items-center gap-2.5 text-xs font-semibold animate-bounce-once"
        >
          <CheckCircle className="w-4 h-4 text-[#fcee21]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
