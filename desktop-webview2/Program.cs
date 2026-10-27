using System;
using System.Runtime.CompilerServices;
using System.Windows.Forms;

namespace MoryakaJump
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            // Порядок важен: сначала подключаем разбор встроенных сборок, и только
            // потом касаемся типов WebView2 — иначе CLR попробует найти их на диске,
            // где их больше нет.
            Embedded.InstallAssemblyResolver();
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Start(args);
        }

        /// <summary>
        /// Отдельный метод без инлайна: его JIT уже может ссылаться на сборки WebView2,
        /// а к этому моменту подписка AssemblyResolve установлена.
        /// </summary>
        [MethodImpl(MethodImplOptions.NoInlining)]
        static void Start(string[] args)
        {
            Embedded.PrepareNativeLoader();

            // Без WebView2 окно игры открыть нечем, поэтому сначала компонент:
            // окно с прогрессом скачивания и установки, затем предложение запуска.
            // --force-runtime-check прогоняет окно установки даже при готовом
            // рантайме — так проверяется сам интерфейс.
            bool force = Array.IndexOf(args, "--force-runtime-check") >= 0;
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

            Application.Run(new MainForm());
        }
    }
}
