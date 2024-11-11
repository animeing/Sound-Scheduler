# サウンドスケジューラ（Sound Scheduler）

サウンドスケジューラは、指定した曜日と時間に音源ファイルを再生するスケジューリングシステムです。使いやすいウェブインターフェースを通じて複数のスケジュールを管理し、音源ファイルのアップロードにも対応しています。

## 特徴

- **ウェブベースの設定管理**：ブラウザ上で簡単にスケジュールを設定できます。
- **カスタマイズ可能なスケジュール**：再生したい曜日と時間を自由に設定可能。
- **複数スケジュールの管理**：複数のスケジュールを作成・編集・削除できます。
- **音源ファイルのアップロード**：再生したい音源ファイルをアップロードして使用できます。
- **柔軟な再生オプション**：再生開始時刻や終了時刻を選択してスケジューリング可能。

## 動作環境

- **オペレーティングシステム**：Windows または macOS
- **Python**：バージョン 3.6 以上

## 必要なライブラリ

- **Flask**：サーバーのウェブフレームワーク
- **Pygame**：音源の再生に使用
- **Mutagen**：音源ファイルのメタデータ処理

## インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/sound-scheduler.git
cd sound-scheduler
```
### 2. 仮想環境の作成

#### Windowsの場合

```bash
python -m venv venv
venv\Scripts\activate
```

#### macOSの場合

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. ライブラリのインストール

```bash
pip install flask pygame mutagen
```

### 4. アプリケーションの起動

```bash
python app.py
```

サーバーが `http://localhost:5000` で起動します。

## 使い方

### ウェブインターフェースにアクセス

ブラウザで `http://localhost:5000` にアクセスしてください。

### スケジュールの設定

- **新しいスケジュールの追加**：「追加」ボタンをクリックして新しいスケジュールを作成します。
- **曜日の設定**：音源を再生したい曜日を選択します。
- **時間の設定**：再生したい時間を指定します。
- **再生モードの選択**：
  - **再生開始時刻**：指定した時間に再生が開始されます。
  - **再生終了時刻**：指定した時間に再生が終了するようにスケジュールされます。
- **音源ファイルの選択**：新しい音源ファイルをアップロードするか、既存のファイルから選択します。
- **有効・無効の切り替え**：スケジュールを有効または無効に設定できます。
- **設定の保存**：「更新」ボタンをクリックしてすべてのスケジュールを保存します。

### 対応している音源ファイル形式

- MP3
- WAV

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

---

**開発者**：ChatGPT o1-preview


**ChatGPTコミュニケーション**：
[ChatGPT共有](https://chatgpt.com/share/67320012-4c68-8000-a6a9-e300b033e20c)