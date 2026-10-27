using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;

namespace MoryakaJump
{
    /// <summary>
    /// Проверка и установка WebView2 Runtime. Компонент бесплатный, ставится один
    /// раз на пользователя/машину; без него окно игры открыть нечем.
    /// </summary>
    static class WebView2Runtime
    {
        // Официальный бутстраппер Evergreen Runtime (≈2 МБ).
        const string BootstrapperUrl = "https://go.microsoft.com/fwlink/p/?LinkId=2124703";

        public static string Version
        {
            get
            {
                try { return CoreWebView2Environment.GetAvailableBrowserVersionString(); }
                catch (Exception) { return null; }
            }
        }

        public static bool IsInstalled
        {
            get { return !string.IsNullOrWhiteSpace(Version); }
        }

        /// <summary>Возвращает true, если рантайм есть (или успешно установлен).</summary>
        public static bool EnsureInstalled(IWin32Window owner)
        {
            if (IsInstalled) return true;

            DialogResult answer = MessageBox.Show(
                owner,
                "Для запуска игры нужен компонент Microsoft WebView2 Runtime.\n\n" +
                "Он бесплатный, весит около 2 МБ и ставится один раз.\n" +
                "Скачать и установить его сейчас?",
                "Moryaka Jump",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question);

            if (answer != DialogResult.Yes) return false;

            using (InstallForm form = new InstallForm())
            {
                form.ShowDialog(owner);
                return form.Success;
            }
        }

        static void Download(string url, string target)
        {
            using (WebClient client = new WebClient())
            {
                client.Headers.Add("User-Agent", "MoryakaJump");
                client.DownloadFile(url, target);
            }
        }

        static void Install(string bootstrapper)
        {
            ProcessStartInfo info = new ProcessStartInfo(bootstrapper, "/silent /install");
            info.UseShellExecute = true;
            info.Verb = "runas"; // установка требует прав администратора
            using (Process process = Process.Start(info))
            {
                if (process == null) throw new InvalidOperationException("Не удалось запустить установщик.");
                process.WaitForExit();
            }
        }

        sealed class InstallForm : Form
        {
            readonly Label status;
            readonly ProgressBar bar;

            public bool Success { get; private set; }

            public InstallForm()
            {
                Text = "Moryaka Jump — установка компонента";
                FormBorderStyle = FormBorderStyle.FixedDialog;
                StartPosition = FormStartPosition.CenterScreen;
                MaximizeBox = false;
                MinimizeBox = false;
                ClientSize = new Size(420, 120);
                BackColor = Color.FromArgb(236, 246, 252);

                status = new Label();
                status.Text = "Проверяю WebView2 Runtime…";
                status.AutoSize = false;
                status.SetBounds(16, 16, 388, 40);
                status.Font = new Font("Segoe UI", 9.5f);

                bar = new ProgressBar();
                bar.SetBounds(16, 64, 388, 18);
                bar.Style = ProgressBarStyle.Marquee;
                bar.MarqueeAnimationSpeed = 30;

                Controls.Add(status);
                Controls.Add(bar);
                Load += OnLoad;
            }

            async void OnLoad(object sender, EventArgs e)
            {
                string bootstrapper = Path.Combine(Path.GetTempPath(), "MicrosoftEdgeWebview2Setup.exe");
                try
                {
                    status.Text = "Скачиваю WebView2 Runtime…";
                    await Task.Run(() => Download(BootstrapperUrl, bootstrapper));

                    status.Text = "Устанавливаю… Подтвердите запрос Windows.";
                    await Task.Run(() => Install(bootstrapper));

                    if (WebView2Runtime.IsInstalled)
                    {
                        Success = true;
                        DialogResult = DialogResult.OK;
                        Close();
                        return;
                    }

                    status.Text = "Установка не завершилась. Попробуйте установить вручную.";
                }
                catch (Win32Exception error)
                {
                    // 1223 — пользователь отменил запрос администратора.
                    status.Text = error.NativeErrorCode == 1223
                        ? "Установка отменена. Без WebView2 Runtime игра не запустится."
                        : "Ошибка установки: " + error.Message;
                }
                catch (Exception error)
                {
                    status.Text = "Не удалось установить компонент: " + error.Message;
                }

                bar.Style = ProgressBarStyle.Continuous;
                bar.Value = 0;
                Button close = new Button();
                close.Text = "Закрыть";
                close.SetBounds(316, 88, 88, 24);
                close.Click += delegate { DialogResult = DialogResult.Cancel; Close(); };
                Controls.Add(close);
            }
        }
    }
}
