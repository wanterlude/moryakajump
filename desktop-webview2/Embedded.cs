using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using Microsoft.Web.WebView2.Core;

namespace MoryakaJump
{
    /// <summary>
    /// Всё, что раньше лежало рядом с exe, теперь внутри него: сборки WebView2,
    /// нативный загрузчик и файлы игры. exe можно носить одним файлом.
    /// </summary>
    static class Embedded
    {
        const string LibPrefix = "lib/";
        const string AssetPrefix = "assets/";
        const string LoaderResource = "native/WebView2Loader.dll";

        static readonly Dictionary<string, string> assets =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        static readonly Dictionary<string, bool> gzipped =
            new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase);

        static bool prepared;

        /// <summary>Подключает разбор встроенных сборок. Звать до первого касания WebView2.</summary>
        public static void InstallAssemblyResolver()
        {
            if (prepared) return;
            prepared = true;
            AppDomain.CurrentDomain.AssemblyResolve += OnResolve;
        }

        static Assembly OnResolve(object sender, ResolveEventArgs args)
        {
            string simple = new AssemblyName(args.Name).Name;
            string resource = LibPrefix + simple + ".dll";
            using (Stream stream = typeof(Embedded).Assembly.GetManifestResourceStream(resource))
            {
                if (stream == null) return null;
                byte[] bytes = new byte[stream.Length];
                int read = 0;
                while (read < bytes.Length)
                {
                    int step = stream.Read(bytes, read, bytes.Length - read);
                    if (step <= 0) break;
                    read += step;
                }
                return Assembly.Load(bytes);
            }
        }

        /// <summary>
        /// Достаёт WebView2Loader.dll во временную папку и указывает её движку.
        /// Нативную библиотеку нельзя держать в памяти — её грузит Windows.
        /// </summary>
        public static void PrepareNativeLoader()
        {
            string folder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "MoryakaJump", "bin");
            Directory.CreateDirectory(folder);

            string target = Path.Combine(folder, "WebView2Loader.dll");
            byte[] payload = ReadResource(LoaderResource);
            if (payload == null) throw new InvalidOperationException("В сборке нет WebView2Loader.dll");

            bool write = true;
            if (File.Exists(target))
            {
                try { write = new FileInfo(target).Length != payload.Length; }
                catch (Exception) { write = true; }
            }
            if (write) File.WriteAllBytes(target, payload);

            CoreWebView2Environment.SetLoaderDllFolderPath(folder);
        }

        static byte[] ReadResource(string name)
        {
            using (Stream stream = typeof(Embedded).Assembly.GetManifestResourceStream(name))
            {
                if (stream == null) return null;
                using (MemoryStream memory = new MemoryStream())
                {
                    stream.CopyTo(memory);
                    return memory.ToArray();
                }
            }
        }

        static void LoadManifest()
        {
            if (assets.Count > 0) return;
            byte[] raw = ReadResource(AssetPrefix + "manifest.txt");
            if (raw == null) return;
            string text = System.Text.Encoding.UTF8.GetString(raw);
            foreach (string line in text.Split('\n'))
            {
                string trimmed = line.Trim();
                if (trimmed.Length == 0) continue;
                string[] parts = trimmed.Split('|');
                if (parts.Length < 2) continue;
                string name = parts[0];
                assets[name] = AssetPrefix + name;
                gzipped[name] = parts[1] == "gz";
            }
        }

        /// <summary>Содержимое файла игры по имени ("index.html", "5.jpg"), либо null.</summary>
        public static byte[] GetAsset(string name, out bool compressed)
        {
            LoadManifest();
            compressed = false;
            string resource;
            if (!assets.TryGetValue(name, out resource)) return null;
            byte[] bytes = ReadResource(resource);
            if (bytes == null) return null;
            compressed = gzipped.ContainsKey(name) && gzipped[name];
            if (!compressed) return bytes;

            using (MemoryStream input = new MemoryStream(bytes))
            using (GZipStream gzip = new GZipStream(input, CompressionMode.Decompress))
            using (MemoryStream output = new MemoryStream())
            {
                gzip.CopyTo(output);
                return output.ToArray();
            }
        }

        public static string ContentType(string name)
        {
            string lower = name.ToLowerInvariant();
            if (lower.EndsWith(".html") || lower.EndsWith(".htm")) return "text/html; charset=utf-8";
            if (lower.EndsWith(".jpg") || lower.EndsWith(".jpeg")) return "image/jpeg";
            if (lower.EndsWith(".png")) return "image/png";
            if (lower.EndsWith(".ico")) return "image/x-icon";
            if (lower.EndsWith(".css")) return "text/css; charset=utf-8";
            if (lower.EndsWith(".js")) return "application/javascript; charset=utf-8";
            return "application/octet-stream";
        }
    }
}
