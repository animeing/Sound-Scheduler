from flask import Flask, request, jsonify, send_from_directory
import json
import os
import pygame
from datetime import datetime, time as dt_time
import threading
import time

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# 必要なディレクトリが存在しない場合に作成
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# pygameの初期化
pygame.mixer.init()

# 設定ファイルの読み込み
def load_settings():
    if os.path.exists('settings.json'):
        with open('settings.json', 'r') as f:
            return json.load(f)
    return []

# 設定ファイルの保存
def save_settings(settings):
    with open('settings.json', 'w') as f:
        json.dump(settings, f, indent=4)

# 音源再生
def play_audio(file_path):
    try:
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
        print(f"再生中: {file_path}")
    except Exception as e:
        print(f"音源再生エラー: {e}")

# 定期的なチェックと再生
def check_and_play():
    while True:
        now = datetime.now()
        settings = load_settings()
        for setting in settings:
            try:
                # 設定時刻の秒を00に固定
                play_time = datetime.strptime(setting['time'], "%H:%M").replace(second=0).time()
                # 時間が一致し、曜日が設定に含まれている場合
                if now.weekday() in setting['days'] and now.time().hour == play_time.hour and now.time().minute == play_time.minute and now.time().second == play_time.second:
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], setting['file'])
                    if os.path.exists(file_path):
                        print(f"再生ファイル: {file_path}, 時刻: {now}")  # 再生ファイルと時刻のログ
                        play_audio(file_path)
                    else:
                        print(f"ファイルが見つかりません: {file_path}")
            except Exception as e:
                print(f"設定処理エラー: {e}")
        time.sleep(1)  # 1秒ごとにチェック

# サーバー起動時にスレッドを開始
threading.Thread(target=check_and_play, daemon=True).start()

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    if request.method == 'POST':
        settings = request.json
        save_settings(settings)
        return jsonify({"status": "success"})
    else:
        return jsonify(load_settings())

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"})
    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        return jsonify({"status": "success", "file_name": file.filename})
    return jsonify({"status": "error", "message": "No file uploaded"})

@app.route('/files', methods=['GET'])
def list_files():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    return jsonify(files)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
