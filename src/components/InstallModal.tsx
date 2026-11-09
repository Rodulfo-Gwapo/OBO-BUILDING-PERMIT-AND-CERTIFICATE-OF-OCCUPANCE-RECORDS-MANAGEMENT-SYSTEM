import React, { useState } from 'react';
import { 
  Download, 
  Monitor, 
  Apple, 
  Smartphone, 
  Laptop, 
  CheckCircle, 
  Share2, 
  PlusSquare, 
  ExternalLink,
  ShieldCheck,
  Zap,
  HardDriveDownload,
  X
} from 'lucide-react';
import { PlatformType } from '../types';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: PlatformType;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallClick: () => Promise<boolean>;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  platform,
  isInstallable,
  isInstalled,
  onInstallClick,
}) => {
  const [activeTab, setActiveTab] = useState<PlatformType>(
    platform !== 'other' ? platform : 'windows'
  );
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await onInstallClick();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
        setInstallSuccess(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        role="dialog" 
        aria-modal="true" 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden transition-all my-8"
      >
        {/* Header with official gold & navy styling */}
        <div className="bg-gradient-to-r from-[#0f3d64] via-[#14527f] to-[#0f3d64] text-white p-6 border-b-4 border-[#fcee21]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1 shadow-inner shrink-0">
                <img 
                  src="/assets/aistudio/Talisayan_Building_Official_Seal_5dc37e23.png" 
                  alt="Talisayan OBO Official Seal" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-[#fcee21] text-[#0f3d64] rounded-sm mb-1">
                  Cross-Platform Progressive Web App
                </span>
                <h2 className="text-xl font-bold font-serif tracking-tight leading-tight text-white">
                  Download &amp; Install OBO System
                </h2>
                <p className="text-xs text-sky-100 mt-0.5">
                  Install as a standalone native app on Mac, Windows, Android, or iOS.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Device Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveTab('windows')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'windows'
                  ? 'bg-white text-[#0f3d64] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Windows PC
            </button>
            <button
              onClick={() => setActiveTab('mac')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'mac'
                  ? 'bg-white text-[#0f3d64] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Laptop className="w-4 h-4" />
              Apple Mac (macOS)
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'android'
                  ? 'bg-white text-[#0f3d64] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Android Phone / Tablet
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'ios'
                  ? 'bg-white text-[#0f3d64] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Apple className="w-4 h-4" />
              iPhone &amp; iPad (iOS)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-slate-800 dark:text-slate-100 space-y-6">
          {/* Direct Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Direct Option 1: Standalone Offline App File Download */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0f3d64] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Download className="w-4 h-4 text-[#fcee21]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0f3d64] dark:text-amber-300">
                      Direct File Download (.html)
                    </h3>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">
                      Offline Desktop &amp; USB Edition
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Download a self-contained offline application file directly to your <strong>Downloads</strong> folder. Works completely offline on any Mac, Windows PC, or flash drive.
                </p>
              </div>
              <a
                href="/OBO_Building_Permit_System_Offline.html"
                download="OBO_Building_Permit_System_Offline.html"
                className="w-full py-2.5 px-3 rounded-lg bg-[#0f3d64] hover:bg-[#14527f] text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-center no-underline cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#fcee21]" />
                <span>Download Offline File (.html)</span>
              </a>
            </div>

            {/* Direct Option 2: Open Direct URL to Install App */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-transparent border border-blue-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300">
                      Open Direct Full App Window
                    </h3>
                    <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold uppercase">
                      Native Browser Installation
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Opens the full standalone URL outside this preview frame, triggering the browser's native <strong>"Install"</strong> button in Chrome, Edge, or Safari address bar.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Full Tab</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Direct App URL copied to clipboard! Paste it into Chrome, Edge, or Safari to install.');
                  }}
                  className="py-2.5 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Copy Direct App URL"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Install Banner if browser directly supports one-click install */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <HardDriveDownload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                    Instant 1-Click Install Ready
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Your current browser supports direct one-click installation to your desktop or device launcher.
                  </p>
                </div>
              </div>
              <button
                onClick={handleNativeInstall}
                disabled={installSuccess}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {installSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Installed!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Install Now
                  </>
                )}
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>App is already installed!</strong> You are currently running the OBO Records Management System in standalone app mode.
              </p>
            </div>
          )}

          {/* Tab Specific Instructions */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-[#0f3d64] dark:text-sky-400 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  How to Install on Windows 10 &amp; 11 (PC / Laptop)
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Chrome or Microsoft Edge
                </span>
              </div>
              <div className="grid gap-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-[#0f3d64] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Click the "Install" icon in your browser address bar</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      In Google Chrome or Microsoft Edge, look at the right end of the address bar for the <span className="font-semibold text-slate-800 dark:text-slate-200">"Install app"</span> (computer icon with down arrow) or click the <span className="font-semibold text-slate-800 dark:text-slate-200">"Install Now"</span> button above.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-[#0f3d64] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Confirm "Install"</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      A prompt titled <span className="font-semibold">"Install OBO BUILDING PERMIT..."</span> will appear. Click <span className="font-bold text-emerald-600 dark:text-emerald-400">Install</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-[#0f3d64] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Pin to Taskbar &amp; Start Menu</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Windows will open the app in its own window without browser tabs. You can right-click the taskbar icon and select <span className="font-semibold">"Pin to taskbar"</span> for fast daily access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mac' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-[#0f3d64] dark:text-sky-400 flex items-center gap-2">
                  <Laptop className="w-4 h-4" />
                  How to Install on macOS (MacBook, iMac, Mac mini)
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Safari, Chrome, or Edge
                </span>
              </div>
              <div className="grid gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                  <h4 className="font-bold text-sky-900 dark:text-sky-300 mb-1 flex items-center gap-2">
                    <Apple className="w-4 h-4" />
                    Option A: Apple Safari (macOS Sonoma 14+)
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    Turn this web app into a real Mac desktop app in seconds:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-1">
                    <li>In Safari's top menu bar, click <strong>File</strong>.</li>
                    <li>Select <strong>Add to Dock...</strong></li>
                    <li>Click <strong>Add</strong>. The OBO icon will be added to your Mac Dock and Applications folder!</li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    Option B: Google Chrome / Microsoft Edge on Mac
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 ml-1">
                    <li>Click the <strong>Install</strong> icon in the address bar (or click "Install Now" above).</li>
                    <li>Click <strong>Install</strong> in the dialog.</li>
                    <li>The app opens immediately in its own clean Mac window and is added to Launchpad.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-[#0f3d64] dark:text-sky-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  How to Install on Android (Samsung, Xiaomi, Pixel, Vivo, Oppo)
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Google Chrome or Samsung Internet
                </span>
              </div>
              <div className="grid gap-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-[#0f3d64] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Tap the 3 dots menu (⋮)</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      In Chrome or Samsung Internet, tap the top-right three vertical dots.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-[#0f3d64] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Select "Install app" or "Add to Home screen"</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Android will generate a high-res app icon with splash screen, launching directly from your app drawer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-[#0f3d64] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Launch anytime offline</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      All your OBO records stay stored in your device storage and load instantly even when there is no internet connection in the field!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-[#0f3d64] dark:text-sky-400 flex items-center gap-2">
                  <Apple className="w-4 h-4" />
                  How to Install on iPhone &amp; iPad (iOS)
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Safari Browser
                </span>
              </div>
              <div className="grid gap-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Step 1: Tap the Share button in Safari</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Look at the bottom toolbar of your iPhone (or top toolbar on iPad) and tap the <strong>Share</strong> icon (the square with an arrow pointing up).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Step 2: Scroll down &amp; tap "Add to Home Screen"</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      In the share sheet list of actions, scroll down and tap <span className="font-bold">"Add to Home Screen"</span> (plus icon).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Step 3: Tap "Add" at the top right</strong>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Confirm the app title "OBO Records" and tap <strong>Add</strong>. It will now appear on your home screen like any native App Store app!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advantages of PWA Installation */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Offline field access</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Secure local database</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <HardDriveDownload className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Zero App Store downloads</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
