document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('video-title').value;
        const description = document.getElementById('video-desc').value;
        const videoFile = document.getElementById('video-file').files[0];
        const thumbnailFile = document.getElementById('thumbnail').files[0];
        
        if (!title || !videoFile) {
            uploadStatus.innerHTML = '<p class="error">Пожалуйста, заполните все обязательные поля.</p>';
            return;
        }
        
        uploadStatus.innerHTML = '<p>Загрузка видео...</p>';
        
        // Генерируем уникальный ID для видео
        const videoId = 'vid_' + Math.random().toString(36).substr(2, 9);
        const fileName = videoId + '.' + videoFile.name.split('.').pop();
        
        // Читаем файл как Data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const videoData = e.target.result;
            
            // Загружаем существующие метаданные
            fetch('videos/metadata.json')
                .then(response => response.json())
                .then(metadata => {
                    // Добавляем новое видео
                    const newVideo = {
                        id: videoId,
                        title: title,
                        description: description,
                        fileName: fileName,
                        uploadDate: new Date().toLocaleDateString(),
                        views: 0
                    };
                    
                    if (thumbnailFile) {
                        const thumbnailReader = new FileReader();
                        thumbnailReader.onload = function(e) {
                            newVideo.thumbnail = e.target.result;
                            metadata.push(newVideo);
                            updateMetadata(metadata, videoData, fileName);
                        };
                        thumbnailReader.readAsDataURL(thumbnailFile);
                    } else {
                        metadata.push(newVideo);
                        updateMetadata(metadata, videoData, fileName);
                    }
                })
                .catch(() => {
                    // Если файла metadata.json нет, создаем новый
                    const metadata = [{
                        id: videoId,
                        title: title,
                        description: description,
                        fileName: fileName,
                        uploadDate: new Date().toLocaleDateString(),
                        views: 0
                    }];
                    
                    if (thumbnailFile) {
                        const thumbnailReader = new FileReader();
                        thumbnailReader.onload = function(e) {
                            metadata[0].thumbnail = e.target.result;
                            updateMetadata(metadata, videoData, fileName);
                        };
                        thumbnailReader.readAsDataURL(thumbnailFile);
                    } else {
                        updateMetadata(metadata, videoData, fileName);
                    }
                });
        };
        reader.readAsDataURL(videoFile);
    });
});

function updateMetadata(metadata, videoData, fileName) {
    // В реальном приложении здесь был бы запрос к серверу
    // Для GitHub Pages мы эмулируем сохранение в localStorage
    
    // Сохраняем метаданные
    localStorage.setItem('deepTubeMetadata', JSON.stringify(metadata));
    
    // Сохраняем видео (в реальности это невозможно на GitHub Pages)
    localStorage.setItem(`deepTubeVideo_${fileName}`, videoData);
    
    // Обновляем статус
    document.getElementById('upload-status').innerHTML = `
        <p class="success">Видео успешно загружено!</p>
        <p>Через 3 секунды вы будете перенаправлены на главную страницу...</p>
    `;
    
    // Перенаправляем на главную через 3 секунды
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 3000);
}