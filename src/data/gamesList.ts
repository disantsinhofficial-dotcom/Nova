import { RomGame } from '../types';

/**
 * Default verified starter homebrew ROMs.
 * Inbuilt fake/AI games have been completely removed as requested.
 * All imported Nintendo DS (.nds) and Nintendo Wii (.iso / .wbfs) ROMs
 * are dynamically parsed and persisted in the user's library.
 */
export const STARTER_HOMEBREW_ROMS: RomGame[] = [
  {
    id: 'homebrew_wii_gecko',
    system: 'WII',
    title: 'Wii Homebrew Launcher & Gecko OS',
    hindiTitle: 'वि होमब्रू लॉन्चर और गेको ओएस',
    gameCode: 'HAXX01',
    fileName: 'homebrew_launcher.dol',
    fileSize: '18.4 MB',
    region: 'GLOBAL',
    genre: 'System Utility / Homebrew',
    releaseYear: 2026,
    description: 'Clean Wii Homebrew environment. Import your downloaded Wii .ISO or .WBFS ROMs to boot full 60 FPS HD titles with zero lag.',
    hindiDescription: 'ओरिजिनल होमब्रू वातावरण। अपनी वि .ISO या .WBFS फाइलें इम्पोर्ट करें और 60 FPS पर खेलें।',
    bannerColor: 'from-sky-700 via-blue-800 to-indigo-950',
    isHomebrew: true,
    dateAdded: 'Pre-installed',
  },
  {
    id: 'homebrew_nds_menu',
    system: 'NDS',
    title: 'Nintendo DS Homebrew Menu v0.9',
    hindiTitle: 'निनटेंडो डीएस होमब्रू मेनू',
    gameCode: 'NTR-HB01',
    fileName: 'nds_hbmenu.nds',
    fileSize: '4.2 MB',
    region: 'GLOBAL',
    genre: 'DS Dual-Screen Homebrew',
    releaseYear: 2026,
    description: 'Nintendo DS Dual-Screen execution core. Import any .nds ROM to play on dual screens with touch stylus and responsive controls.',
    hindiDescription: 'निनटेंडो डीएस ड्यूल स्क्रीन इंजन। अपनी .nds गेम फाइल लोड करें और टच स्क्रीन के साथ खेलें।',
    bannerColor: 'from-amber-600 via-orange-700 to-slate-900',
    isHomebrew: true,
    dateAdded: 'Pre-installed',
  }
];
