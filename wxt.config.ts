import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// WXTの設定ファイル
// Chrome/Firefoxの両ブラウザに対応したManifest V3の設定を行う
export default defineConfig({
  // ソースディレクトリをsrc/に設定
  srcDir: "src",
  // Reactモジュールを使用してJSX変換を自動設定
  modules: ["@wxt-dev/module-react"],

  manifest: {
    name: "__MSG_extensionName__",
    description: "__MSG_extensionDescription__",
    default_locale: "en",
    version: "0.0.1",
    permissions: ["activeTab", "storage", "tabs", "contextMenus"],
  },

  vite: () => ({
    base: "./",
    // Tailwind CSS v4のViteプラグインを追加
    plugins: [tailwindcss()],
  }),
});
