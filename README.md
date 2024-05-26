# Sound Scheduler

Sound Schedulerは、指定された曜日と時間に音源を再生する時報システムです。ブラウザを介して簡単に設定を変更でき、複数の設定を管理することができます。

## 機能

- ブラウザで設定を変更可能
- 設定した曜日と時間に音源を再生
- 複数の設定を管理
- 音源データのアップロード対応
- 毎週指定された時間に再生

## 動作環境

- Python 3.6以上
- Windows環境

## ライブラリ

- Flask
- pygame

## インストール

### 仮想環境の作成

まず、Pythonがインストールされていることを確認してください。次に、プロジェクトのディレクトリに移動し、以下のコマンドを実行して仮想環境を作成します。

### Windows
```bash
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors pygame
flask run --host=0.0.0.0
```

### Mac
```bash
python -m venv venv
source venv/bin/activate
pip install flask flask-cors pygame
flask run --host=0.0.0.0
```
http://<サーバーのIPアドレス>:5000
 - 設定画面で音源再生のスケジュールを設定します。
 - 曜日: 音源を再生する曜日を選択します。
 - 再生時間: 音源を再生する時間を設定します（秒は00に固定されます）。
 - 再生音源: アップロードされた音源ファイルを選択します。
 - 設定を追加し、「更新」ボタンをクリックして設定を保存します。

## 開発者情報
このプロジェクトは、OpenAIのChatGPTを使用して開発されました。質問やフィードバックがある場合は、GitHubのIssueを通じてお知らせください。

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。詳細については、LICENSEファイルを参照してください。
