import React, { useState, useEffect } from 'react';
import { audioEngine } from '../engine/audioEngine';
import { downloadProjectZip } from '../utils/exportProject';
import {
  Download,
  Github,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Flame,
  FileArchive,
  Copy,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHindi?: boolean;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  isHindi = true,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedGit, setCopiedGit] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPwaApk = async () => {
    audioEngine.playWiimoteClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions for Android / ColorOS 13
      alert(
        isHindi
          ? 'ColorOS 13 / Chrome में: ऊपर 3 डॉट्स (⋮) पर क्लिक करें और "Install App" या "Add to Home Screen" चुनें। यह सीधा APK की तरह आपके फोन में इंस्टॉल हो जाएगा!'
          : 'In Chrome / ColorOS 13 browser: Tap the 3 dots menu (⋮) and tap "Install App" or "Add to Home screen" to install as a full Android WebAPK!'
      );
    }
  };

  const handleDownloadZip = async () => {
    audioEngine.playWiimoteClick();
    setIsDownloadingZip(true);
    try {
      await downloadProjectZip();
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const gitCommands = `git init
git add .
git commit -m "NovaWii HD ColorOS 13 Emulator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/NovaWii-HD.git
git push -u origin main`;

  const copyGitCommands = () => {
    audioEngine.playWiimoteClick();
    navigator.clipboard.writeText(gitCommands);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gray-950 border border-white/10 p-6 text-white shadow-2xl space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-gray-950 font-black shadow-lg">
              <Smartphone size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{isHindi ? 'डायरेक्ट APK डाउनलोड और GitHub लिंक्स' : 'Direct APK Download & GitHub Repository'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ColorOS 13
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {isHindi ? 'अपने Android फ़ोन पर वि एम्युलेटर को APK की तरह इंस्टॉल करें' : 'Install NovaWii HD on your device or access GitHub APK releases'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Direct ColorOS 13 One-Click APK Install */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 via-gray-900 to-emerald-950/40 p-5 border border-emerald-500/30 shadow-xl space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-gray-950 font-bold text-xs">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{isHindi ? 'डायरेक्ट Android APK इंस्टॉल (ColorOS 13)' : 'Instant Android WebAPK Direct Install'}</span>
                  <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded uppercase font-bold">
                    RECOMMENDED
                  </span>
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  {isHindi
                    ? 'बिना किसी परेशानी के सीधे अपने फोन के होम स्क्रीन पर नेटिव APK ऐप की तरह इंस्टॉल करें (फुल स्क्रीन 60 FPS + ऑफलाइन काम करेगा)।'
                    : 'Installs as a standalone native app via Android WebAPK system with custom splash screen and 60 FPS performance.'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleInstallPwaApk}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-gray-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition"
          >
            <Download size={18} />
            <span>{isInstalled ? (isHindi ? 'ऐप पहले से इंस्टॉल है! ✓' : 'App Already Installed! ✓') : (isHindi ? 'डायरेक्ट फोन में APK इंस्टॉल करें' : 'Install APK on Android Device')}</span>
          </button>
        </div>

        {/* 2. Official Dolphin Android GitHub Releases APK Link */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-950/60 via-gray-900 to-sky-950/40 p-5 border border-sky-500/30 shadow-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-gray-950 font-bold text-xs">
              2
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isHindi ? 'ऑफिशियल डॉल्फ़िन वि एम्युलेटर GitHub APK' : 'Official Dolphin Wii Emulator GitHub APK'}</span>
                <Github size={16} className="text-sky-400" />
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                {isHindi
                  ? 'GitHub Releases से ऑफिशियल Dolphin Android APK (Dolphin-x.x-xxxx.apk) डाउनलोड लिंक:'
                  : 'Direct GitHub link to download the compiled Dolphin Android release APK:'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href="https://github.com/dolphin-emu/dolphin/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 py-2.5 px-4 text-xs font-bold text-white hover:from-sky-500 hover:to-blue-500 transition shadow-md"
            >
              <Github size={15} />
              <span>{isHindi ? 'GitHub Releases (Dolphin APK)' : 'GitHub Releases (APK)'}</span>
              <ExternalLink size={13} />
            </a>

            <a
              href="https://dolphin-emu.org/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 px-4 text-xs font-bold text-gray-200 hover:bg-white/20 transition border border-white/10"
            >
              <Download size={15} />
              <span>{isHindi ? 'डायरेक्ट APK डाउनलोड पेज' : 'Direct APK Download Page'}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* 3. GitHub Ready Source Code ZIP with APK Workflow */}
        <div className="rounded-2xl bg-gray-900/80 p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-gray-950 font-bold text-xs">
              3
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isHindi ? 'GitHub रिपॉजिटरी और सोर्स कोड (.ZIP)' : 'GitHub Repository & Full Source Code (.ZIP)'}
              </h3>
              <p className="text-xs text-gray-400">
                {isHindi
                  ? 'पूरा कोड डाउनलोड करके अपनी GitHub रिपॉजिटरी में पुश करें। इसमें ऑटोमैटिक APK बिल्ड वर्कफ़्लो शामिल है।'
                  : 'Download ready-to-push bundle with GitHub Actions workflow to build Android APK on commit.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-bold text-white border border-white/15 transition active:scale-95"
          >
            <FileArchive size={16} className="text-amber-400" />
            <span>{isDownloadingZip ? 'Zipping Project...' : isHindi ? 'GitHub रेडी सोर्स कोड (.ZIP) डाउनलोड करें' : 'Download Project ZIP for GitHub'}</span>
          </button>

          {/* Quick Terminal Commands for GitHub */}
          <div className="rounded-xl bg-black/60 p-3 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-mono">GitHub Terminal Push Commands:</span>
              <button
                onClick={copyGitCommands}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
              >
                {copiedGit ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedGit ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>
        </div>

        {/* ColorOS 13 Installation Tips */}
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 p-3.5 border border-amber-500/20 text-xs text-amber-200">
          <AlertCircle size={17} className="shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            {isHindi
              ? 'ColorOS 13 टिप: अगर आप थर्ड-पार्टी APK फाइल इंस्टॉल करते हैं, तो Settings > Security > "Unknown Source Installation" को Allow करें। या फिर ऊपर बटन "1" दबाकर डायरेक्ट बिना किसी परमिशन के तुरंत अपने फोन में इंस्टॉल कर लें!'
              : 'ColorOS 13 Tip: If installing external APK files, allow "Unknown Source Installation" in Settings > Security. Or click option 1 above to install instantly via WebAPK!'}
          </p>
        </div>
      </div>
    </div>
  );
};
