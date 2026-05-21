# Release Workflow Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chrome Web Store自動公開関連を削除し、GitHub Releasesへzip/xpiを置いて人手でストアへ反映する運用に合わせる

**Architecture:** `.github/workflows/release.yml`をrelease jobのみの単純な構成へ戻し、Chrome Web Store publish jobと専用scriptを削除する。自動公開導入時に追加したspecとplanも削除し、ReleaseへChrome ZIPとFirefox XPIを添付する既存フローだけを残す。

**Tech Stack:** GitHub Actions、Node.js20、WXT、web-ext、Git

---

## File Structure

- Modify: `.github/workflows/release.yml`
  - Release作成に必要なbuild、Firefox署名、GitHub Release作成だけを残す
- Delete: `.github/scripts/publish-chrome-web-store.mjs`
  - Chrome Web Store publish API用の不要scriptを削除する
- Delete: `docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md`
  - 廃止した自動公開方針の設計書を削除する
- Delete: `docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md`
  - 廃止した自動公開方針の実装計画を削除する
- Keep: `README.md`
  - 現状は自動公開前提の記述がないため変更しない
- Keep: `package.json`
  - `web-ext`はFirefox署名に必要なため残す

### Task 1: release workflowからChrome Web Store自動公開jobを削除する

**Files:**
- Modify: `.github/workflows/release.yml`

- [ ] **Step 1: 削除対象jobが存在することを確認する**

Run: `rg -n "chrome_web_store_publish|Upload Chrome ZIP artifact|Publish to Chrome Web Store|CHROME_CLIENT_ID" .github/workflows/release.yml`
Expected: `chrome_web_store_publish`とChrome Web Store関連stepの行が表示される

- [ ] **Step 2: release workflowをrelease jobのみの構成へ書き換える**

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Chrome ZIP
        run: npm run zip

      - name: Ensure single Chrome ZIP exists
        id: chrome_zip
        run: |
          CHROME_ZIP_PATH=$(python - <<'PY'
          from pathlib import Path

          matches = sorted(Path('.output').glob('*-chrome.zip'))
          if len(matches) != 1:
              raise SystemExit(f'Expected exactly one Chrome ZIP, found {len(matches)}: {[p.as_posix() for p in matches]}')
          print(matches[0].as_posix())
          PY
          )
          echo "path=$CHROME_ZIP_PATH" >> "$GITHUB_OUTPUT"

      - name: Build Firefox
        run: npm run build:firefox

      - name: Sign Firefox extension (unlisted)
        run: |
          npx web-ext sign \
            --source-dir=.output/firefox-mv2 \
            --api-key=${{ secrets.MOZILLA_API_KEY }} \
            --api-secret=${{ secrets.MOZILLA_API_SECRET }} \
            --channel=unlisted

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            ${{ steps.chrome_zip.outputs.path }}
            web-ext-artifacts/*.xpi
          generate_release_notes: true
```

- [ ] **Step 3: 削除対象が消えたことを確認する**

Run: `rg -n "chrome_web_store_publish|Upload Chrome ZIP artifact|Publish to Chrome Web Store|CHROME_CLIENT_ID|CHROME_REFRESH_TOKEN" .github/workflows/release.yml`
Expected: no output

- [ ] **Step 4: workflow YAMLの構文を確認する**

Run: `python - <<'PY'
from pathlib import Path
import yaml
with Path('.github/workflows/release.yml').open() as f:
    yaml.safe_load(f)
print('YAML OK')
PY`
Expected: `YAML OK`

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "chore: remove chrome web store publish job"
```

### Task 2: Chrome Web Store自動公開scriptを削除する

**Files:**
- Delete: `.github/scripts/publish-chrome-web-store.mjs`

- [ ] **Step 1: 削除対象scriptが存在することを確認する**

Run: `ls .github/scripts/publish-chrome-web-store.mjs`
Expected: `.github/scripts/publish-chrome-web-store.mjs`

- [ ] **Step 2: 不要scriptを削除する**

```bash
rm .github/scripts/publish-chrome-web-store.mjs
```

- [ ] **Step 3: scriptが消えたことを確認する**

Run: `ls .github/scripts`
Expected: `publish-chrome-web-store.mjs`が一覧に含まれない

- [ ] **Step 4: workflow側にscript参照が残っていないことを確認する**

Run: `rg -n "publish-chrome-web-store\.mjs" .`
Expected: `docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md`と`docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md`だけが表示される

- [ ] **Step 5: Commit**

```bash
git add .github/scripts/publish-chrome-web-store.mjs
git commit -m "chore: remove chrome publish script"
```

### Task 3: 廃止した自動公開方針のspecとplanを削除する

**Files:**
- Delete: `docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md`
- Delete: `docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md`
- Keep: `docs/superpowers/specs/2026-05-22-release-workflow-cleanup-design.md`

- [ ] **Step 1: 廃止対象ドキュメントが存在することを確認する**

Run: `ls docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md docs/superpowers/specs/2026-05-22-release-workflow-cleanup-design.md`
Expected: 3つのファイルパスが表示される

- [ ] **Step 2: 廃止したspecとplanを削除する**

```bash
rm docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md
rm docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md
```

- [ ] **Step 3: cleanup用設計書は残り、旧文書だけ消えたことを確認する**

Run: `ls docs/superpowers/specs docs/superpowers/plans`
Expected: `docs/superpowers/specs/2026-05-22-release-workflow-cleanup-design.md`は残り、削除した2ファイルは表示されない

- [ ] **Step 4: Chrome Web Store自動公開関連の文書参照が消えたことを確認する**

Run: `rg -n "Chrome Web Store公開自動化|Chrome Web Store Publish Implementation Plan|publish-chrome-web-store" docs .github`
Expected: 残存一致は`docs/superpowers/specs/2026-05-22-release-workflow-cleanup-design.md`と`docs/superpowers/plans/2026-05-22-release-workflow-cleanup.md`内のみ

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md docs/superpowers/specs/2026-05-22-release-workflow-cleanup-design.md
git commit -m "docs: remove obsolete chrome publish docs"
```

### Task 4: 変更全体を検証する

**Files:**
- Modify: `.github/workflows/release.yml`
- Delete: `.github/scripts/publish-chrome-web-store.mjs`
- Delete: `docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md`
- Delete: `docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md`
- Keep: `package.json`

- [ ] **Step 1: Chrome Web Store関連のSecrets参照が残っていないことを確認する**

Run: `rg -n "CHROME_EXTENSION_ID|CHROME_PUBLISHER_ID|CHROME_CLIENT_ID|CHROME_CLIENT_SECRET|CHROME_REFRESH_TOKEN" .github package.json README.md docs`
Expected: `docs/superpowers/specs/2026-05-22-release-workflow-cleanup-design.md`以外に一致しない

- [ ] **Step 2: Firefox署名に必要な依存は残っていることを確認する**

Run: `rg -n '"web-ext"' package.json`
Expected: `"web-ext": "^10.1.0"`が表示される

- [ ] **Step 3: 既存型チェックを実行する**

Run: `npm run typecheck`
Expected: exit code 0

- [ ] **Step 4: 変更差分を確認する**

Run: `git diff -- .github/workflows/release.yml .github/scripts/publish-chrome-web-store.mjs docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md docs/superpowers/specs/2026-05-22-release-workflow-cleanup-design.md`
Expected: Chrome Web Store自動公開関連の削除とcleanup設計書追加だけが表示される

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/release.yml .github/scripts/publish-chrome-web-store.mjs docs/superpowers/specs/2026-05-21-github-actions-chrome-web-store-design.md docs/superpowers/plans/2026-05-21-chrome-web-store-publish.md docs/superpowers/specs/2026-05-22-release-workflow-cleanup-design.md
git commit -m "chore: clean up release automation"
```
