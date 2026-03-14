 // script.js
document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt');
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const resultArea = document.getElementById('resultArea');
    const generatedImage = document.getElementById('generatedImage');
    const errorDiv = document.getElementById('error');
    const saveBtn = document.getElementById('saveBtn');
    const shareBtn = document.getElementById('shareBtn');

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Введите описание!');
            return;
        }

        loadingDiv.style.display = 'block';
        resultArea.style.display = 'none';
        errorDiv.style.display = 'none';

        try {
            // Вызываем нашу серверную функцию
            const response = await fetch('/.netlify/functions/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка сервера');
            }

            // Ответ приходит в виде base64-строки (изображение)
            const data = await response.json(); // на самом деле мы вернули base64, но в ответе у нас isBase64Encoded, и Netlify сам декодирует?
            // Уточним: в функции мы вернули isBase64Encoded: true, body: base64. Netlify должен отдать бинарные данные.
            // Поэтому response это уже blob (изображение).
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            generatedImage.src = imageUrl;
            resultArea.style.display = 'flex';
            loadingDiv.style.display = 'none';

        } catch (error) {
            console.error('Ошибка:', error);
            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'block';
        }
    });

    // saveBtn и shareBtn остаются без изменений
    saveBtn.addEventListener('click', () => {
        if (!generatedImage.src) return;
        const link = document.createElement('a');
        link.href = generatedImage.src;
        link.download = `anime-${Date.now()}.png`;
        link.click();
    });

    shareBtn.addEventListener('click', async () => {
        if (!generatedImage.src) return;
        const blob = await fetch(generatedImage.src).then(r => r.blob());
        const file = new File([blob], 'anime.png', { type: 'image/png' });
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Мой аниме-арт',
                    text: promptInput.value,
                    files: [file]
                });
            } catch (err) {
                console.log('Пользователь отменил шаринг');
            }
        } else {
            alert('Поделиться напрямую не поддерживается. Можно сохранить и отправить вручную.');
        }
    });
});