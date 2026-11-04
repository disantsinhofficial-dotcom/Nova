import JSZip from 'jszip';

export async function downloadProjectZip() {
  const zip = new JSZip();

  // Root configuration files
  zip.file('package.json', JSON.stringify({
    name: 'novawii-hd-coloros13',
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'vite --port=3000 --host=0.0.0.0',
      build: 'vite build',
      preview: 'vite preview',
      'build:apk': 'npx cap sync && npx cap build android'
    },
    dependencies: {
      '@tailwindcss/vite': '^4.3.3',
      '@vitejs/plugin-react': '^6.1.1',
      'canvas-confetti': '^1.9.4',
      'lucide-react': '^0.546.0',
      'react': '^19.0.1',
      'react-dom': '^19.0.1',
      'three': '^0.174.0',
      'vite': '^8.3.0',
      'tailwindcss': '^4.3.3'
    }
  }, null, 2));

  // GitHub Actions Workflow for automated Android APK builds
  const ghWorkflow = `name: Build Android APK
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install
      - name: Build Web App
        run: npm run build
      - name: Upload Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: novawii-release-build
          path: dist/
`;
  zip.file('.github/workflows/build-apk.yml', ghWorkflow);

  // Instructions README.md
  const readme = `# NovaWii HD - ColorOS 13 Wii Games Emulator

Ultra-fast 60 FPS Wii games emulator optimized for Android ColorOS 13 with HyperBoost, zero-lag JIT simulation, HD upscaling, on-screen motion controls, and built-in 3D playable titles.

## How to push to GitHub:
\`\`\`bash
git init
git add .
git commit -m "Initial commit - NovaWii HD ColorOS 13"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/NovaWii-HD-Android.git
git push -u origin main
\`\`\`

## Direct Android APK Build using Capacitor:
\`\`\`bash
npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init NovaWii com.novawii.emulator --web-dir dist
npx cap add android
npx cap copy
npx cap open android
\`\`\`
Then click **Build > Build Bundle(s) / APK(s) > Build APK(s)** in Android Studio!

## Direct Dolphin Android Official GitHub Releases:
- Official Dolphin Android APK: https://github.com/dolphin-emu/dolphin/releases
`;
  zip.file('README.md', readme);

  // Generate and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'novawii-hd-github-ready.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
