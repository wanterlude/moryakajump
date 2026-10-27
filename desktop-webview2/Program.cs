using System;
using System.Windows.Forms;

namespace MoryakaJump
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Без WebView2 окно игры открыть нечем, поэтому сначала компонент:
            // окно с прогрессом скачивания и установки, затем предложение запуска.
            // --force-runtime-check прогоняет окно установки даже при готовом
            // рантайме — так проверяется сам интерфейс.
            bool force = Array.IndexOf(args, "--force-runtime-check") >= 0;
            if (force || !WebView2Runtime.IsInstalled)
            {
                bool ready = force ? WebView2Runtime.ShowInstaller() : WebView2Runtime.EnsureInstalled();
                if (!ready)
                {
                    MessageBox.Show(
                        "Игра не запущена: не установлен Microsoft WebView2 Runtime.\n\n" +
                        "Скачайте его с https://developer.microsoft.com/microsoft-edge/webview2/ " +
                        "и запустите игру снова.",
                        "Moryaka Jump",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning);
                    return;
                }
            }

            Application.Run(new MainForm());
        }
    }
}
