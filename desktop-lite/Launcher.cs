// Тонкий лаунчер Moryaka Jump: открывает игру в отдельном окне Edge (режим --app),
// вместо того чтобы везти с собой весь Chromium.
//
// Компилируется штатным csc из .NET Framework — без WinForms и без NuGet,
// поэтому на выходе десятки килобайт, а не сотни.

using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;

static class Launcher
{
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern int MessageBoxW(IntPtr owner, string text, string caption, uint type);

    const uint MB_OK = 0x0;
    const uint MB_ICONWARNING = 0x30;
    const uint MB_ICONERROR = 0x10;

    static void Say(string text, uint icon)
    {
        MessageBoxW(IntPtr.Zero, text, "Moryaka Jump", MB_OK | icon);
    }

    static readonly string[] EdgePaths =
    {
        @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        @"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    };

    static string FindEdge()
    {
        foreach (string path in EdgePaths)
            if (File.Exists(path)) return path;

        try
        {
            using (var key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(
                @"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"))
            {
                if (key != null)
                {
                    var value = key.GetValue(null) as string;
                    if (!string.IsNullOrEmpty(value) && File.Exists(value)) return value;
                }
            }
        }
        catch { }

        return null;
    }

    // Диагностика: если задан MORYAKA_DEBUG, шаги пишутся в лог рядом с профилем.
    static void Log(string line)
    {
        if (Environment.GetEnvironmentVariable("MORYAKA_DEBUG") == null) return;
        try
        {
            string dir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MoryakaJump");
            Directory.CreateDirectory(dir);
            File.AppendAllText(Path.Combine(dir, "launcher.log"), line + Environment.NewLine);
        }
        catch { }
    }

    [STAThread]
    static int Main(string[] args)
    {
        Log("start: " + AppDomain.CurrentDomain.BaseDirectory);
        string dir = AppDomain.CurrentDomain.BaseDirectory;
        string html = Path.Combine(dir, "index.html");
        Log("html exists: " + File.Exists(html) + " -> " + html);
        if (!File.Exists(html))
        {
            Say("Рядом с программой нет index.html.\nПоложите файл игры в ту же папку.", MB_ICONWARNING);
            return 1;
        }

        // Отдельный профиль на пользователя: localStorage (рекорды, рамки) переживает
        // перезапуск, а основной профиль браузера остаётся нетронутым.
        string profile = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "MoryakaJump", "Profile");
        try { Directory.CreateDirectory(profile); } catch { }

        string arguments = string.Format(
            "--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1000,780 --disable-extensions --no-first-run --no-default-browser-check",
            new Uri(html).AbsoluteUri, profile);

        string edge = FindEdge();
        Log("edge: " + (edge == null ? "не найден" : edge));
        if (edge != null)
        {
            try
            {
                Process.Start(new ProcessStartInfo(edge, arguments) { UseShellExecute = false });
                Log("edge запущен");
                return 0;
            }
            catch { }
        }

        // Edge не найден — открываем игру в браузере по умолчанию.
        try
        {
            Process.Start(new ProcessStartInfo(html) { UseShellExecute = true });
            return 0;
        }
        catch (Exception error)
        {
            Say("Не удалось открыть игру: " + error.Message, MB_ICONERROR);
            return 1;
        }
    }
}
