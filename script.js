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
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Ошибка сервера (${response.status}): ${errorData.error || 'Неизвестная ошибка'}`);
            }

            const data = await response.json();
            const imageUrl = `data:image/png;base64,${data.image}`;
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