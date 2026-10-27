using System;
using System.Windows.Forms;

namespace MoryakaJump
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Без этого компонента окно игры открыть нечем, поэтому проверяем до
            // создания формы и предлагаем поставить недостающее сразу.
            if (!WebView2Runtime.EnsureInstalled(null))
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
