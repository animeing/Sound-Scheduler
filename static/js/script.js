document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settings-form');
    const settingsContainer = document.getElementById('settings-container');
    const addSettingBtn = document.getElementById('add-setting-btn');

    function createSettingItem(setting = {}) {
        const settingItem = document.createElement('div');
        settingItem.className = 'setting-item';

        const uniqueId = setting.id || (Date.now() + '_' + Math.random());
        settingItem.setAttribute('data-id', uniqueId);

        // 曜日の選択肢（インデックス0が月曜日、6が日曜日）
        const daysOptions = ['月', '火', '水', '木', '金', '土', '日']
            .map((day, index) => `<option value="${index}" ${setting.days && setting.days.includes(index) ? 'selected' : ''}>${day}</option>`)
            .join('');

        // 再生タイミングの選択肢
        const timeModeOptions = `
            <div class="radio-group">
                <label><input type="radio" name="time_mode_${uniqueId}" value="start" ${setting.time_mode === 'start' || !setting.time_mode ? 'checked' : ''}> 再生開始時刻</label>
                <label><input type="radio" name="time_mode_${uniqueId}" value="end" ${setting.time_mode === 'end' ? 'checked' : ''}> 再生終了時刻</label>
            </div>
        `;

        settingItem.innerHTML = `
            <label>
                曜日:
                <select name="days" multiple>
                    ${daysOptions}
                </select>
            </label>
            <label>
                再生タイミング:
                ${timeModeOptions}
            </label>
            <label>
                再生時間:
                <input type="time" name="time" value="${setting.time || ''}">
            </label>
            <label>
                再生音源:
                <select name="audio_file">
                </select>
                <input type="file" name="upload_file">
            </label>
            <label>
                設定ON/OFF:
                <input type="checkbox" name="enabled" ${setting.enabled !== false ? 'checked' : ''}>
            </label>
            <button type="button" class="delete-btn">設定削除</button>
        `;

        settingItem.querySelector('.delete-btn').addEventListener('click', () => {
            settingItem.remove();
        });

        settingsContainer.appendChild(settingItem);
        loadFileOptions(settingItem.querySelector('select[name="audio_file"]'), setting.audio_file, setting.display_file_name);
    }

    function loadSettings() {
        fetch('/settings')
            .then(response => response.json())
            .then(settings => {
                settings.forEach(createSettingItem);
            });
    }

    function loadFileOptions(selectElement, selectedFile, displayFileName = '') {
        fetch('/files')
            .then(response => response.json())
            .then(files => {
                selectElement.innerHTML = files.map(file => {
                    const isSelected = file === selectedFile ? 'selected' : '';
                    const displayName = file === selectedFile && displayFileName ? displayFileName : file;
                    return `<option value="${file}" ${isSelected}>${displayName}</option>`;
                }).join('');
            });
    }

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settingsPromises = [];

        const settingItems = settingsContainer.querySelectorAll('.setting-item');
        settingItems.forEach(item => {
            const promise = new Promise((resolve, reject) => {
                const days = Array.from(item.querySelector('select[name="days"]').selectedOptions).map(option => parseInt(option.value));
                const time = item.querySelector('input[name="time"]').value;
                const timeMode = item.querySelector(`input[name^="time_mode_"]:checked`).value;
                const enabled = item.querySelector('input[name="enabled"]').checked;
                const uploadFileInput = item.querySelector('input[name="upload_file"]');
                const selectFileInput = item.querySelector('select[name="audio_file"]');
                let audioFile = '';
                let displayFileName = '';
                const settingId = item.getAttribute('data-id') || (Date.now() + '_' + Math.random());
                item.setAttribute('data-id', settingId);

                if (uploadFileInput.files.length > 0) {
                    // ファイルをアップロード
                    const formData = new FormData();
                    const file = uploadFileInput.files[0];
                    formData.append('file', file);

                    fetch('/upload', {
                        method: 'POST',
                        body: formData,
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            audioFile = data.file_name;
                            displayFileName = data.original_name; // オリジナルのファイル名を保持
                            resolve({
                                id: settingId,
                                days: days,
                                time: time,
                                time_mode: timeMode,
                                audio_file: audioFile,
                                display_file_name: displayFileName,
                                enabled: enabled
                            });
                        } else {
                            reject('ファイルのアップロードに失敗しました');
                        }
                    })
                    .catch(error => {
                        reject('ファイルのアップロード中にエラーが発生しました: ' + error);
                    });
                } else {
                    audioFile = selectFileInput.value;
                    displayFileName = selectFileInput.options[selectFileInput.selectedIndex].text;

                    resolve({
                        id: settingId,
                        days: days,
                        time: time,
                        time_mode: timeMode,
                        audio_file: audioFile,
                        display_file_name: displayFileName,
                        enabled: enabled
                    });
                }
            });

            settingsPromises.push(promise);
        });

        Promise.all(settingsPromises)
            .then(settings => {
                fetch('/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    body: JSON.stringify(settings),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('設定が保存されました');
                        // ファイルリストを更新
                        settingsContainer.querySelectorAll('.setting-item').forEach(item => {
                            const selectElement = item.querySelector('select[name="audio_file"]');
                            const audioFile = item.querySelector('input[name="upload_file"]').files[0] ? '' : selectElement.value;
                            const displayFileName = item.querySelector('input[name="upload_file"]').files[0] ? '' : selectElement.options[selectElement.selectedIndex].text;
                            loadFileOptions(selectElement, audioFile, displayFileName);
                        });
                    } else {
                        alert('設定の保存に失敗しました');
                    }
                })
                .catch(error => {
                    alert('設定の保存中にエラーが発生しました: ' + error);
                });
            })
            .catch(error => {
                alert('エラーが発生しました: ' + error);
            });
    });

    addSettingBtn.addEventListener('click', () => {
        createSettingItem();
    });

    loadSettings();
});
