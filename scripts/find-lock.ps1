Add-Type -TypeDefinition @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
public class HandleFinder {
    [DllImport("kernel32.dll")]
    public static extern IntPtr GetCurrentProcess();
    [DllImport("kernel32.dll")]
    public static extern bool CloseHandle(IntPtr handle);
}
"@
$processes = Get-Process
foreach ($p in $processes) {
    try {
        $modules = $p.Modules
        foreach ($m in $modules) {
            if ($m.FileName -like "*code*" -or $m.FileName -like "*node*") {
                Write-Host "PID $($p.Id) - $($p.ProcessName) - $($m.FileName)"
            }
        }
    } catch {}
}