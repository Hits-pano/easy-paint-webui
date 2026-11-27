<#
.SYNOPSIS
  Easy Paint · exe 图标替换

.DESCRIPTION
  用 Windows 原生 API（BeginUpdateResource / UpdateResource / EndUpdateResource）
  替换 exe 的图标资源。

  为什么不用 rcedit：它对 89 MB 的 node.exe 会卡死（实测等 120s 无响应），
  原生 API 是瞬时完成。

.EXAMPLE
  powershell -File set-icon.ps1 -Exe dist\EasyPaint.exe -Ico build-tools\EasyPaint.ico
#>

param(
  [Parameter(Mandatory = $true)][string]$Exe,
  [Parameter(Mandatory = $true)][string]$Ico
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Exe)) { throw "找不到 exe：$Exe" }
if (-not (Test-Path $Ico)) { throw "找不到 ico：$Ico" }

$src = @'
using System;
using System.IO;
using System.Runtime.InteropServices;

public class EpiIconReplacer
{
    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    static extern IntPtr BeginUpdateResource(string pFileName, bool bDeleteExistingResources);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool UpdateResource(IntPtr hUpdate, IntPtr lpType, IntPtr lpName, ushort wLanguage, byte[] lpData, uint cbData);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool EndUpdateResource(IntPtr hUpdate, bool fDiscard);

    const int RT_ICON = 3;
    const int RT_GROUP_ICON = 14;

    public static int Replace(string exePath, string icoPath)
    {
        byte[] ico = File.ReadAllBytes(icoPath);

        // ICONDIR: reserved(2) type(2) count(2)  —— 后面跟 count 个 ICONDIRENTRY(16)
        if (ico.Length < 6) { Console.WriteLine("ICO 文件太小"); return 2; }
        int count = BitConverter.ToUInt16(ico, 4);
        if (count == 0) { Console.WriteLine("ICO 里没有图像"); return 2; }

        IntPtr h = BeginUpdateResource(exePath, false);
        if (h == IntPtr.Zero)
        {
            Console.WriteLine("BeginUpdateResource 失败，错误码 " + Marshal.GetLastWin32Error());
            return 3;
        }

        try
        {
            for (int i = 0; i < count; i++)
            {
                int off = 6 + i * 16;
                int size = (int)BitConverter.ToUInt32(ico, off + 8);
                int dataOff = (int)BitConverter.ToUInt32(ico, off + 12);
                if (dataOff + size > ico.Length) throw new Exception("ICO 数据越界");

                byte[] img = new byte[size];
                Array.Copy(ico, dataOff, img, 0, size);

                // 资源 ID 从 1 开始，语言 0（中性）
                if (!UpdateResource(h, (IntPtr)RT_ICON, (IntPtr)(i + 1), 0, img, (uint)size))
                {
                    Console.WriteLine("UpdateResource(RT_ICON #" + (i + 1) + ") 失败，错误码 " + Marshal.GetLastWin32Error());
                    return 4;
                }
            }

            // 组图标：头 6 字节 + 每个图像 14 字节
            int grpSize = 6 + count * 14;
            byte[] grp = new byte[grpSize];
            grp[2] = 1; // type = icon
            grp[4] = (byte)(count & 0xFF);
            grp[5] = (byte)((count >> 8) & 0xFF);

            for (int i = 0; i < count; i++)
            {
                int s = 6 + i * 16;
                int d = 6 + i * 14;
                for (int k = 0; k < 8; k++) grp[d + k] = ico[s + k]; // w,h,colors,reserved,planes,bpp
                int sz = (int)BitConverter.ToUInt32(ico, s + 8);
                grp[d + 8] = (byte)(sz & 0xFF);
                grp[d + 9] = (byte)((sz >> 8) & 0xFF);
                grp[d + 10] = (byte)((sz >> 16) & 0xFF);
                grp[d + 11] = (byte)((sz >> 24) & 0xFF);
                grp[d + 12] = (byte)((i + 1) & 0xFF);  // 指向 RT_ICON 的 ID
                grp[d + 13] = (byte)(((i + 1) >> 8) & 0xFF);
            }

            if (!UpdateResource(h, (IntPtr)RT_GROUP_ICON, (IntPtr)1, 0, grp, (uint)grpSize))
            {
                Console.WriteLine("UpdateResource(RT_GROUP_ICON) 失败，错误码 " + Marshal.GetLastWin32Error());
                return 5;
            }

            Console.WriteLine("替换了 " + count + " 个图标图像 + 1 个组图标");
            return 0;
        }
        finally
        {
            // 成功时写回（fDiscard = false）；失败时上面已 return，这里统一按成功处理
            // 出错路径靠 finally 保证句柄释放
            EndUpdateResource(h, false);
        }
    }
}
'@

Add-Type -TypeDefinition $src -Language CSharp
$code = [EpiIconReplacer]::Replace((Resolve-Path $Exe).Path, (Resolve-Path $Ico).Path)
if ($code -ne 0) { throw "图标替换失败，返回码 $code" }
Write-Host "  图标已写入：$Exe"
