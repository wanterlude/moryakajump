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
    /// Проверка и установка WebView2 Runtime: отдельное окно с реальным прогрессом
    /// скачивания, ожиданием установки и предложением запустить игру в конце.
    /// </summary>
    static class WebView2Runtime
    {
        // Официальный бутстраппер Evergreen Runtime (≈1.9 МБ).
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

        /// <summary>Ждёт появления рантайма после установки (регистрация не мгновенная).</summary>
        public static bool WaitUntilInstalled(int attempts, int delayMs)
        {
            for (int i = 0; i < attempts; i++)
            {
                if (IsInstalled) return true;
                System.Threading.Thread.Sleep(delayMs);
            }
            return IsInstalled;
        }

        /// <summary>
        /// true — рантайм есть или успешно установлен и игрок нажал «Запустить игру».
        /// false — отказ, отмена или ошибка установки.
        /// </summary>
        public static bool EnsureInstalled(IWin32Window owner = null)
        {
            if (IsInstalled) return true;
            return ShowInstaller(owner);
        }

        /// <summary>Показывает окно установки, не проверяя текущее состояние.</summary>
        public static bool ShowInstaller(IWin32Window owner = null)
        {
            using (InstallerForm form = new InstallerForm())
            {
                return form.ShowDialog(owner) == DialogResult.OK;
            }
        }
    }

    /// <summary>
    /// Окно установки: скачивание бутстраппера с процентом и объёмом, затем
    /// «Устанавливаю…» без точного прогресса (установщик молчит), затем итог
    /// с кнопкой «Запустить игру».
    /// </summary>
    sealed class InstallerForm : Form
    {
        enum Phase { Download, Install, Done, Failed }

        const string BootstrapperUrl = "https://go.microsoft.com/fwlink/p/?LinkId=2124703";

        readonly Label title;
        readonly Label detail;
        readonly ProgressBar bar;
        readonly Button primary;
        readonly Button secondary;

        Phase phase = Phase.Download;
        WebClient client;
        Process installer;
        bool cancelled;

        public InstallerForm()
        {
            FormBorderStyle = FormBorderStyle.FixedDialog;
            StartPosition = FormStartPosition.CenterScreen;
            MaximizeBox = false;
            MinimizeBox = false;
            ClientSize = new Size(470, 210);
            BackColor = Color.FromArgb(236, 246, 252);
            Font = new Font("Segoe UI", 9.5f);
            Text = "Moryaka Jump — компонент WebView2";

            title = new Label();
            title.Font = new Font("Segoe UI Semibold", 12f);
            title.ForeColor = Color.FromArgb(15, 61, 92);
            title.Text = "Нужен компонент WebView2 Runtime";
            title.SetBounds(20, 16, 430, 26);

            detail = new Label();
            detail.ForeColor = Color.FromArgb(46, 92, 122);
            detail.Text = "Он бесплатный и ставится один раз.";
            detail.SetBounds(20, 46, 430, 40);

            bar = new ProgressBar();
            bar.SetBounds(20, 92, 430, 20);
            bar.Minimum = 0;
            bar.Maximum = 100;
            bar.Value = 0;
            bar.Style = ProgressBarStyle.Continuous;

            primary = new Button();
            primary.Text = "Установить";
            primary.SetBounds(262, 160, 188, 34);
            primary.FlatStyle = FlatStyle.System;
            primary.Click += delegate { OnPrimary(); };

            secondary = new Button();
            secondary.Text = "Отмена";
            secondary.SetBounds(166, 160, 88, 34);
            secondary.FlatStyle = FlatStyle.System;
            secondary.Click += delegate { OnSecondary(); };

            Controls.Add(title);
            Controls.Add(detail);
            Controls.Add(bar);
            Controls.Add(primary);
            Controls.Add(secondary);

            Load += OnLoad;
            FormClosing += OnClosing;
        }

        async void OnLoad(object sender, EventArgs e)
        {
            // Скачивание запускаем сразу: окно открылось — игрок видит прогресс.
            await StartAsync();
        }

        async Task StartAsync()
        {
            SetPhase(Phase.Download);
            title.Text = "Скачиваю WebView2 Runtime";
            detail.Text = "Подготовка…";
            bar.Style = ProgressBarStyle.Continuous;
            bar.Value = 0;
            primary.Visible = false;
            secondary.Text = "Отмена";

            string target = Path.Combine(Path.GetTempPath(), "MicrosoftEdgeWebview2Setup.exe");

            try
            {
                client = new WebClient();
                client.Headers.Add("User-Agent", "MoryakaJump");
                client.DownloadProgressChanged += OnDownloadProgress;
                await client.DownloadFileTaskAsync(new Uri(BootstrapperUrl), target);
                client.Dispose();
                client = null;
            }
            catch (Exception error)
            {
                if (client != null) { client.Dispose(); client = null; }
                if (cancelled) return;
                Fail("Не удалось скачать компонент.\n" + error.Message);
                return;
            }

            if (cancelled) return;
            bar.Value = 100;
            await InstallAsync(target);
        }

        void OnDownloadProgress(object sender, DownloadProgressChangedEventArgs e)
        {
            if (cancelled) return;
            bar.Value = Math.Max(0, Math.Min(100, e.ProgressPercentage));
            if (e.TotalBytesToReceive > 0)
            {
                detail.Text = string.Format(
                    "Скачано {0:0.0} из {1:0.0} МБ ({2}%)",
                    e.BytesReceived / 1048576.0,
                    e.TotalBytesToReceive / 1048576.0,
                    e.ProgressPercentage);
            }
            else
            {
                detail.Text = string.Format("Скачано {0:0.0} МБ", e.BytesReceived / 1048576.0);
            }
        }

        async Task InstallAsync(string bootstrapper)
        {
            SetPhase(Phase.Install);
            title.Text = "Устанавливаю WebView2 Runtime";
            detail.Text = "Подтвердите запрос Windows и подождите — установка идёт без прогресса.";
            bar.Style = ProgressBarStyle.Marquee;
            bar.MarqueeAnimationSpeed = 25;
            DateTime startedAt = DateTime.UtcNow;
            Timer ticker = new Timer();
            ticker.Interval = 1000;
            ticker.Tick += delegate
            {
                if (phase != Phase.Install) { ticker.Stop(); ticker.Dispose(); return; }
                detail.Text = string.Format(
                    "Подтвердите запрос Windows и подождите — идёт {0:0} с (установка без прогресса).",
                    (DateTime.UtcNow - startedAt).TotalSeconds);
            };
            ticker.Start();

            bool ok = false;
            string failure = null;

            try
            {
                ok = await Task.Run(delegate
                {
                    ProcessStartInfo info = new ProcessStartInfo(bootstrapper, "/silent /install");
                    info.UseShellExecute = true;
                    info.Verb = "runas"; // установка требует прав администратора
                    installer = Process.Start(info);
                    if (installer == null) throw new InvalidOperationException("установщик не запустился");
                    installer.WaitForExit();
                    return installer.ExitCode == 0;
                });
            }
            catch (Win32Exception error)
            {
                failure = error.NativeErrorCode == 1223
                    ? "Установка отменена в запросе администратора."
                    : "Не удалось запустить установщик: " + error.Message;
            }
            catch (Exception error)
            {
                failure = "Ошибка установки: " + error.Message;
            }
            finally
            {
                if (installer != null) { installer.Dispose(); installer = null; }
            }

            if (cancelled) return;

            // Даже при нулевом коде выхода проверяем результат: установщик может
            // вернуть 0, а рантайм зарегистрироваться с задержкой.
            bool installed = await Task.Run(() => WebView2Runtime.WaitUntilInstalled(6, 700));

            if (installed)
            {
                Done();
                return;
            }

            Fail(failure ?? "Компонент не появился после установки. Попробуйте установить вручную с developer.microsoft.com/microsoft-edge/webview2/");
        }

        void SetPhase(Phase next)
        {
            phase = next;
        }

        void Done()
        {
            SetPhase(Phase.Done);
            bar.Style = ProgressBarStyle.Continuous;
            bar.Value = 100;
            title.Text = "Готово";
            detail.Text = "WebView2 Runtime установлен (" + (WebView2Runtime.Version ?? "версия неизвестна") + ").";
            primary.Text = "Запустить игру";
            primary.Visible = true;
            primary.Enabled = true;
            secondary.Text = "Закрыть";
        }

        void Fail(string message)
        {
            SetPhase(Phase.Failed);
            bar.Style = ProgressBarStyle.Continuous;
            bar.Value = 0;
            title.Text = "Установить не удалось";
            detail.Text = message;
            primary.Text = "Повторить";
            primary.Visible = true;
            primary.Enabled = true;
            secondary.Text = "Закрыть";
        }

        void OnPrimary()
        {
            switch (phase)
            {
                case Phase.Done:
                    DialogResult = DialogResult.OK;
                    Close();
                    break;
                case Phase.Failed:
                    cancelled = false;
                    primary.Visible = false;
                    // Перезапуск установки: задачу не ждём, окно живёт своей жизнью.
                    Task retry = StartAsync();
                    break;
                default:
                    break;
            }
        }

        void OnSecondary()
        {
            if (phase == Phase.Download || phase == Phase.Install)
            {
                Cancel();
                DialogResult = DialogResult.Cancel;
                Close();
                return;
            }
            DialogResult = DialogResult.Cancel;
            Close();
        }

        void Cancel()
        {
            cancelled = true;
            if (client != null)
            {
                try { client.CancelAsync(); } catch (Exception) { }
                client.Dispose();
                client = null;
            }
            if (installer != null)
            {
                try { installer.Kill(); } catch (Exception) { }
            }
        }

        void OnClosing(object sender, FormClosingEventArgs e)
        {
            if (phase == Phase.Download || phase == Phase.Install) Cancel();
        }
    }
}
