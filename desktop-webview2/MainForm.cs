using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace MoryakaJump
{
    /// <summary>
    /// Окно игры. Файлы игры лежат внутри exe, поэтому WebView2 отдаёт их из памяти
    /// через виртуальный хост https://game.local — localStorage при этом ведёт себя
    /// как на обычном сайте и рекорды переживают перезапуск.
    /// </summary>
    sealed class MainForm : Form
    {
        const string VirtualHost = "game.local";
        const string Origin = "https://" + VirtualHost + "/";

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

                // Всё содержимое приходит из ресурсов сборки.
                core.AddWebResourceRequestedFilter(Origin + "*", CoreWebView2WebResourceContext.All);
                core.WebResourceRequested += OnResourceRequested;

                await core.AddScriptToExecuteOnDocumentCreatedAsync(
                    "document.addEventListener('DOMContentLoaded',function(){" +
                    "document.documentElement.style.overflow='hidden';" +
                    "document.body.style.overflow='hidden';});");

                core.Navigate(Origin + "index.html");
            }
            catch (Exception failure)
            {
                ShowError("Не удалось открыть игру:\n" + failure.Message);
            }
        }

        void OnResourceRequested(object sender, CoreWebView2WebResourceRequestedEventArgs args)
        {
            CoreWebView2 core = view.CoreWebView2;
            string requestUri = args.Request.Uri;
            if (!requestUri.StartsWith(Origin, StringComparison.OrdinalIgnoreCase)) return;

            string name = requestUri.Substring(Origin.Length);
            int cut = name.IndexOfAny(new[] { '?', '#' });
            if (cut >= 0) name = name.Substring(0, cut);
            name = Uri.UnescapeDataString(name);
            if (string.IsNullOrEmpty(name)) name = "index.html";

            bool compressed;
            byte[] payload = Embedded.GetAsset(name, out compressed);
            if (payload == null)
            {
                args.Response = core.Environment.CreateWebResourceResponse(
                    null, 404, "Not Found", "Content-Type: text/plain; charset=utf-8");
                return;
            }

            MemoryStream body = new MemoryStream(payload, false);
            args.Response = core.Environment.CreateWebResourceResponse(
                body,
                200,
                "OK",
                "Content-Type: " + Embedded.ContentType(name) + "\r\nCache-Control: no-store");
        }

        void ShowError(string message)
        {
            view.Visible = false;
            error.Text = message;
            error.Visible = true;
        }
    }
}
