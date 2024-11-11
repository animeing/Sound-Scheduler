from flask import Flask, request, jsonify, send_from_directory
import json
import os
import pygame
from datetime import datetime, timedelta
import threading
import time
from mutagen.mp3 import MP3
from mutagen.wave import WAVE
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# アップロードフォルダの作成
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# pygameの初期化
pygame.mixer.init()

# 設定の読み込み
def load_settings():
    if os.path.exists('settings.json'):
        with open('settings.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# 設定の保存
def save_settings(settings):
    with open('settings.json', 'w', encoding='utf-8') as f:
        json.dump(settings, f, indent=4, ensure_ascii=False)

# 音源の長さを取得
def get_audio_duration(file_path):
    try:
        if file_path.lower().endswith('.mp3'):
            audio = MP3(file_path)
        elif file_path.lower().endswith('.wav'):
            audio = WAVE(file_path)
        else:
            return 0
        return audio.info.length
    except Exception as e:
        print(f"音源の長さ取得エラー: {e}")
        return 0

# 音源の再生
def play_audio(file_path):
    try:
        if not os.path.exists(file_path):
            print(f"音源ファイルが見つかりません: {file_path}")
            return
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
        print(f"再生完了: {file_path}")
    except Exception as e:
        print(f"音源再生エラー: {e}")

# 再生のチェックと実行
def check_and_play():
    last_played_times = {}  # 設定IDをキー、最終再生時刻を値とする辞書
    while True:
        now = datetime.now()
        settings = load_settings()
        for setting in settings:
            try:
                setting_id = setting.get('id')
                if not setting_id:
                    continue

                if not setting.get('enabled', True):
                    continue  # 無効な設定はスキップ

                if now.weekday() not in setting['days']:
                    continue  # 選択された曜日でない場合はスキップ

                # 設定された時刻
                setting_time = datetime.strptime(setting['time'], "%H:%M").time()
                setting_datetime = datetime.combine(now.date(), setting_time)

                # 音源ファイルのパス
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], setting['audio_file'])

                # 再生タイミングの計算
                if setting['time_mode'] == 'start':
                    playback_time = setting_datetime
                elif setting['time_mode'] == 'end':
                    duration = get_audio_duration(file_path)
                    if duration == 0:
                        print(f"音源の長さが取得できません: {file_path}")
                        continue
                    playback_time = setting_datetime - timedelta(seconds=duration)
                else:
                    continue  # 無効なtime_mode

                # 再生時間のチェック
                time_difference = (now - playback_time).total_seconds()
                if 0 <= time_difference < 1:
                    last_play_time = last_played_times.get(setting_id)
                    if last_play_time == playback_time:
                        continue  # 既に再生済み
                    if os.path.exists(file_path):
                        print(f"再生ファイル: {file_path}, 時刻: {now}")
                        play_audio(file_path)
                        last_played_times[setting_id] = playback_time
                    else:
                        print(f"ファイルが見つかりません: {file_path}")
            except Exception as e:
                print(f"設定処理エラー: {e}")
        time.sleep(1)  # 1秒ごとにチェック

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/settings', methods=['GET', 'POST'])
def settings_route():
    if request.method == 'POST':
        settings = request.json
        # IDの付与または保持
        for setting in settings:
            if 'id' not in setting or not setting['id']:
                setting['id'] = str(uuid.uuid4())
        save_settings(settings)
        return jsonify({"status": "success"})
    else:
        return jsonify(load_settings())

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "ファイルが選択されていません"})
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "ファイル名が空です"})
    if file:
        # ファイル名をユニークにする
        original_filename = file.filename
        extension = os.path.splitext(original_filename)[1]
        unique_filename = f"{uuid.uuid4()}{extension}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        return jsonify({
            "status": "success",
            "file_name": unique_filename,
            "original_name": original_filename
        })
    return jsonify({"status": "error", "message": "ファイルがアップロードされていません"})

@app.route('/files', methods=['GET'])
def list_files():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    return jsonify(files)

if __name__ == '__main__':
    threading.Thread(target=check_and_play, daemon=True).start()
    app.run(debug=True, host='0.0.0.0', use_reloader=False)
