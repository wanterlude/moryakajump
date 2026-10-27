using System;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
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
        // С этого CSS-размера страница показывает боковые панели (рейтинг и настройки).
        const int SidePanelsMinWidth = 1180;
        const string Origin = "https://" + VirtualHost + "/";

        readonly WebView2 view;
        readonly Label error;

        public MainForm()
        {
            Text = "Moryaka Jump";
            // Стартовый размер с запасом; после загрузки подгоняем по факту.
            ClientSize = new Size(1260, 920);
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

                core.NavigationCompleted += async delegate
                {
                    try { await FitWidthForSidePanelsAsync(); }
                    catch (Exception) { }
                };

                core.Navigate(Origin + "index.html");
            }
            catch (Exception failure)
            {
                ShowError("Не удалось открыть игру:\n" + failure.Message);
            }
        }

        /// <summary>
        /// Если окно уже страницы, где появляются боковые панели, расширяем его.
        /// Считаем по фактическому масштабу DPI: CSS-пиксели не равны оконным.
        /// </summary>
        async Task FitWidthForSidePanelsAsync()
        {
            CoreWebView2 core = view.CoreWebView2;
            if (core == null) return;
            string json = await core.ExecuteScriptAsync("window.innerWidth");
            int inner;
            if (!int.TryParse(json, out inner) || inner <= 0) return;
            if (inner >= SidePanelsMinWidth) return;

            double scale = view.ClientSize.Width > 0 ? (double)view.ClientSize.Width / inner : 1.0;
            int extra = (int)Math.Ceiling((SidePanelsMinWidth - inner) * scale) + 8;
            ClientSize = new Size(ClientSize.Width + extra, ClientSize.Height);
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
