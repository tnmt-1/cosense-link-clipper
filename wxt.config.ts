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
    name: "Cosense Link Clipper",
    description: "現在のWebページをCosense（Scrapbox）にクリップします",
    version: "1.0.0",
    permissions: ["activeTab", "storage", "tabs"],
  },

  vite: () => ({
    // Tailwind CSS v4のViteプラグインを追加
    plugins: [tailwindcss()],
  }),
});
