document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settings-form');
    const settingsContainer = document.getElementById('settings-container');
    const addSettingBtn = document.getElementById('add-setting-btn');

    function createSettingItem(setting = {}) {
        const settingItem = document.createElement('div');
        settingItem.className = 'setting-item';

        // Pythonのweekday()メソッドの値に合わせる（日曜日を6から0に変更）
        const daysOptions = ['月', '火', '水', '木', '金', '土', '日']
            .map((day, index) => `<option value="${index}" ${setting.days && setting.days.includes(index) ? 'selected' : ''}>${day}</option>`)
            .join('');

        settingItem.innerHTML = `
            <label>
                曜日:
                <select name="days" multiple>
                    ${daysOptions}
                </select>
            </label>
            <label>
                再生時間:
                <input type="time" name="time" value="${setting.time || ''}">
            </label>
            <label>
                再生音源:
                <select name="file" id="file-select-${Date.now()}">
                </select>
                <input type="file" name="upload-file">
            </label>
            <button type="button" class="delete-btn">設定削除</button>
        `;

        settingItem.querySelector('.delete-btn').addEventListener('click', () => {
            settingItem.remove();
        });

        settingsContainer.appendChild(settingItem);
        loadFileOptions(settingItem.querySelector(`select[name="file"]`), setting.file);
    }

    function loadSettings() {
        fetch('/settings')
            .then(response => response.json())
            .then(settings => {
                settings.forEach(createSettingItem);
            });
    }

    function loadFileOptions(selectElement, selectedFile) {
        fetch('/files')
            .then(response => response.json())
            .then(files => {
                selectElement.innerHTML = files.map(file => `<option value="${file}" ${file === selectedFile ? 'selected' : ''}>${file}</option>`).join('');
            });
    }

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = [];
        settingsContainer.querySelectorAll('.setting-item').forEach(item => {
            const days = Array.from(item.querySelector('select[name="days"]').selectedOptions).map(option => parseInt(option.value));
            const time = item.querySelector('input[name="time"]').value;
            const file = item.querySelector('input[name="upload-file"]').files[0] || item.querySelector('select[name="file"]').value;

            settings.push({ days, time, file: file.name || file });

            if (item.querySelector('input[name="upload-file"]').files[0]) {
                const formData = new FormData();
                formData.append('file', item.querySelector('input[name="upload-file"]').files[0]);

                fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });
            }
        });

        fetch('/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('設定が保存されました');
            }
        });
    });

    addSettingBtn.addEventListener('click', () => {
        createSettingItem();
    });

    loadSettings();
});
