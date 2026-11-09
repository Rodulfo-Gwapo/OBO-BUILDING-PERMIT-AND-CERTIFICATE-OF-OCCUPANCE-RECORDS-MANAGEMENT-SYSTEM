import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  Upload, 
  AlertTriangle, 
  X,
  FileText
} from 'lucide-react';
import { PermitRecord } from '../types';
import { getTodayString } from '../services/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'backup' | 'restore';
  records: PermitRecord[];
  onRestore: (newRecords: PermitRecord[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  records,
  onRestore,
}) => {
  const [mode, setMode] = useState<'backup' | 'restore'>(initialMode);
  const [copied, setCopied] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const backupJsonString = JSON.stringify(records, null, 2);

  const handleDownloadFile = () => {
    const filename = `obo-records-backup-${getTodayString()}.json`;
    const blob = new Blob([backupJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(backupJsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Could not copy automatically. Please select the text and press Ctrl+C.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRestoreText(reader.result);
        setRestoreError('');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteRestore = () => {
    setRestoreError('');
    if (!restoreText.trim()) {
      setRestoreError('Please paste the backup JSON text or choose a backup file.');
      return;
    }

    try {
      const parsed = JSON.parse(restoreText.trim());
      if (!Array.isArray(parsed)) {
        throw new Error('Backup data must be an array of records.');
      }

      // Basic validation
      const sanitized: PermitRecord[] = parsed.map((item, idx) => ({
        id: item.id || `restored-${Date.now()}-${idx}`,
        business: String(item.business || 'Unnamed Project'),
        owner: String(item.owner || 'Unnamed Owner'),
        engineer: item.engineer ? String(item.engineer) : undefined,
        address: String(item.address || ''),
        type: item.type || 'Building Permit',
        category: item.category || 'Commercial',
        floorArea: item.floorArea ? String(item.floorArea) : undefined,
        storeys: item.storeys ? String(item.storeys) : undefined,
        permitNo: String(item.permitNo || ''),
        orNo: String(item.orNo || ''),
        amount: Number(item.amount) || 0,
        date: String(item.date || getTodayString()),
        valid: item.valid ? String(item.valid) : undefined,
        remarks: item.remarks ? String(item.remarks) : undefined,
      }));

      const confirmed = window.confirm(
        `Are you sure you want to restore ${sanitized.length} records? This will replace your current registry data.`
      );

      if (confirmed) {
        onRestore(sanitized);
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid backup format';
      setRestoreError(`Invalid JSON data: ${message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-6 text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="bg-[#0f3d64] text-white p-5 flex items-center justify-between border-b-3 border-[#fcee21]">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#fcee21]" />
            <div>
              <h3 className="text-base font-bold font-serif">
                {mode === 'backup' ? 'Save System Backup' : 'Restore Registry Backup'}
              </h3>
              <p className="text-xs text-sky-200">
                {mode === 'backup'
                  ? 'Download or copy complete database backup for safe keeping.'
                  : 'Import a previously saved backup file to restore records.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => setMode('backup')}
            className={`flex-1 py-2.5 text-center transition cursor-pointer ${
              mode === 'backup'
                ? 'bg-white dark:bg-slate-900 text-[#0f3d64] dark:text-sky-400 border-b-2 border-[#0f3d64] dark:border-sky-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Save Backup ({records.length} records)
          </button>
          <button
            type="button"
            onClick={() => setMode('restore')}
            className={`flex-1 py-2.5 text-center transition cursor-pointer ${
              mode === 'restore'
                ? 'bg-white dark:bg-slate-900 text-[#0f3d64] dark:text-sky-400 border-b-2 border-[#0f3d64] dark:border-sky-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Restore Backup
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs">
          {mode === 'backup' ? (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                You can download the full database file to your computer or phone, or copy the JSON text below.
              </p>

              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={backupJsonString}
                  className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="px-4 py-2 rounded-lg bg-[#14527f] hover:bg-[#0f3d64] text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .JSON Backup</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p>
                  <strong>Warning:</strong> Restoring will replace all current registered records with the records in the backup file.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-200">
                    Paste Backup JSON text or select file:
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#14527f] dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Backup File</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <textarea
                  rows={8}
                  placeholder="Paste the full JSON content here..."
                  value={restoreText}
                  onChange={(e) => {
                    setRestoreText(e.target.value);
                    setRestoreError('');
                  }}
                  className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#14527f]"
                />
              </div>

              {restoreError && (
                <p className="text-red-600 font-semibold">{restoreError}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  className="px-5 py-2 rounded-lg bg-[#b3302a] hover:bg-[#8e2420] text-white font-bold transition shadow-xs cursor-pointer"
                >
                  Restore Database
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
