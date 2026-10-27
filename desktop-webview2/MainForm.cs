using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace MoryakaJump
{
    /// <summary>
    /// Окно игры: WebView2 на весь клиент, игра грузится с виртуального хоста
    /// https://game.local — так localStorage с рекордами живёт как на обычном сайте
    /// и переживает перезапуск (в отличие от file://, где origin считается непрозрачным).
    /// </summary>
    sealed class MainForm : Form
    {
        const string VirtualHost = "game.local";

        readonly WebView2 view;
        readonly Label error;

        public MainForm()
        {
            Text = "Moryaka Jump";
            ClientSize = new Size(1080, 900);
            MinimumSize = new Size(560, 640);
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(16, 26, 53);
            DoubleBuffered = true;

            try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); }
            catch (Exception) { }

            view = new WebView2();
            view.Dock = DockStyle.Fill;
            Controls.Add(view);

            error = new Label();
            error.Dock = DockStyle.Fill;
            error.TextAlign = ContentAlignment.MiddleCenter;
            error.ForeColor = Color.FromArgb(226, 238, 248);
            error.Font = new Font("Segoe UI", 11f);
            error.Visible = false;
            Controls.Add(error);

            Load += OnLoad;
        }

        async void OnLoad(object sender, EventArgs e)
        {
            string html = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "index.html");
            if (!File.Exists(html))
            {
                ShowError("Рядом с программой нет index.html.\nПоложите файл игры в ту же папку.");
                return;
            }

            try
            {
                string dataFolder = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "MoryakaJump", "WebView2");
                Directory.CreateDirectory(dataFolder);

                CoreWebView2Environment environment = await CoreWebView2Environment.CreateAsync(null, dataFolder);
                await view.EnsureCoreWebView2Async(environment);

                CoreWebView2 core = view.CoreWebView2;
                core.Settings.AreDefaultContextMenusEnabled = false;
                core.Settings.AreDevToolsEnabled = false;
                core.Settings.IsStatusBarEnabled = false;
                core.Settings.IsZoomControlEnabled = false;
                core.Settings.IsSwipeNavigationEnabled = false;
                core.Settings.IsPasswordAutosaveEnabled = false;
                core.Settings.IsGeneralAutofillEnabled = false;

                // Страница всегда переполняется на пару пикселей, и в окне появляется
                // полоса прокрутки. В приложении она лишняя.
                await core.AddScriptToExecuteOnDocumentCreatedAsync(
                    "document.addEventListener('DOMContentLoaded',function(){" +
                    "document.documentElement.style.overflow='hidden';" +
                    "document.body.style.overflow='hidden';});");

                // Отдаём папку с игрой как обычный https-хост.
                core.SetVirtualHostNameToFolderMapping(
                    VirtualHost,
                    AppDomain.CurrentDomain.BaseDirectory,
                    CoreWebView2HostResourceAccessKind.Allow);

                core.Navigate("https://" + VirtualHost + "/index.html");
            }
            catch (Exception failure)
            {
                ShowError("Не удалось открыть игру:\n" + failure.Message);
            }
        }

        void ShowError(string message)
        {
            view.Visible = false;
            error.Text = message;
            error.Visible = true;
        }
    }
}
