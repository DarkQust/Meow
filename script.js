// script.js — финальная версия
document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt');
    const generateBtn = document.getElementById('generateBtn');
    const loadingDiv = document.getElementById('loading');
    const resultArea = document.getElementById('resultArea');
    const generatedImage = document.getElementById('generatedImage');
    const errorDiv = document.getElementById('error');
    const saveBtn = document.getElementById('saveBtn');
    const shareBtn = document.getElementById('shareBtn');

    // Проверка, что все элементы найдены
    console.log('Elements loaded:', { promptInput, generateBtn, loadingDiv, resultArea, generatedImage, errorDiv });

    // Простой тест: проверяем доступность функции при загрузке страницы
    async function testFunction() {
        try {
            const testResponse = await fetch(`${window.location.origin}/.netlify/functions/generate`);
            const testData = await testResponse.json();
            console.log('Function test:', testData);
        } catch (e) {
            console.error('Function not reachable:', e);
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = '<p>❌ Функция генерации недоступна. Проверь настройки сервера.</p>';
        }
    }
    testFunction();

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
            const response = await fetch(`${window.location.origin}/.netlify/functions/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка сервера (${response.status}): ${errorText}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            generatedImage.src = imageUrl;
            resultArea.style.display = 'flex';
            loadingDiv.style.display = 'none';

        } catch (error) {
            console.error('Generation error:', error);
            loadingDiv.style.display = 'none';
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = `<p>❌ ${error.message}</p>`;
        }
    });

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