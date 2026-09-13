const fs = require('fs');
const path = 'd:/Kemerya-Itinerary-Generator/src/app/dashboard/page.tsx';
const content = fs.readFileSync(path, 'utf8');
const oldText = 'if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }';
const newText = 'setSelectedLanguage(null);\n    setTranslatedData(null);\n    setTranslationError(null);\n    if (mode === "view") { setShowPDF(true); } else { setPendingDownload(config); }';

if (!content.includes(oldText)) {
  console.log('Pattern not found');
  process.exit(0);
}

const updated = content.replace(oldText, newText);

// Approach: Use .NET FileStream with shared read/write/delete access
try {
  const dotnet = require('child_process');
  const psScript = `
    Add-Type -TypeDefinition @"
    using System;
    using System.IO;
    using System.Runtime.InteropServices;
    public class ForceWriter {
        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern IntPtr CreateFile(string filename, int access, int share, IntPtr security, int mode, int attrs, IntPtr template);
        public static bool WriteAllText(string path, string content) {
            IntPtr handle = CreateFile(path, 0x40000000, 7, IntPtr.Zero, 3, 4, IntPtr.Zero);
            if (handle == new IntPtr(-1) || handle == IntPtr.Zero) return false;
            try {
                var fs = new FileStream(handle, FileAccess.Write);
                fs.SetLength(0);
                var bytes = System.Text.Encoding.UTF8.GetBytes(content);
                fs.Write(bytes, 0, bytes.Length);
                fs.Close();
                return true;
            } catch { return false; }
        }
    }
"@
    [ForceWriter]::WriteAllText('${path}', '${updated.replace(/'/g, "''").replace(/\n/g, '; ')}' -replace '; ', "`'n")
    Write-Host "DONE"
  `;
  fs.writeFileSync('d:/Kemerya-Itinerary-Generator/scripts/ps-force-fix.ps1', psScript);
  const result = dotnet.execSync('powershell -NoProfile -ExecutionPolicy Bypass -File d:/Kemerya-Itinerary-Generator/scripts/ps-force-fix.ps1', {encoding: 'utf8'});
  console.log(result);
} catch(e) { console.log('PS approach failed:', e.message); }

// Approach 2: Write to temp file and try robocopy
const tmpPath = path + '.new';
fs.writeFileSync(tmpPath, updated, 'utf8');
console.log('Temp file created at:', tmpPath, 'size:', fs.statSync(tmpPath).size);
console.log('Original file size:', fs.statSync(path).size);
