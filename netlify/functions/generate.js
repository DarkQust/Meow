const fetch = require('node-fetch');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // GET-запрос для проверки работоспособности функции
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: 'Function is alive' }),
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const HF_TOKEN = process.env.HF_TOKEN;

        if (!HF_TOKEN) {
            console.error('HF_TOKEN not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'HF_TOKEN not set' }),
            };
        }

        // Попробуем несколько вариантов URL (раскомментируйте нужный)
        // Вариант 1: router с /models/ (рекомендуется)
        const MODEL_URL = 'https://router.huggingface.co/models/cagliostrolab/animagine-xl-3.1';
        
        // Вариант 2: старый api-inference (может ещё работать)
        // const MODEL_URL = 'https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1';
        
        // Вариант 3: router с /hf-inference/ (как у вас было)
        // const MODEL_URL = 'https://router.huggingface.co/hf-inference/models/cagliostrolab/animagine-xl-3.1';

        console.log('Sending request to Hugging Face with URL:', MODEL_URL);
        console.log('Prompt:', prompt);

        const response = await fetch(MODEL_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    negative_prompt: 'low quality, blurry, ugly',
                    width: 512,
                    height: 512,
                    num_inference_steps: 25,
                    guidance_scale: 7.5,
                }
            }),
        });

        console.log('Hugging Face response status:', response.status);
        
        // Читаем тело ответа как текст (для диагностики)
        const responseText = await response.text();
        console.log('Hugging Face response body (first 500 chars):', responseText.substring(0, 500));

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: responseText }),
            };
        }

        // Если ответ успешный, предполагаем, что это изображение
        // Преобразуем текст обратно в буфер (так как мы прочитали как text, нужно конвертировать)
        const imageBuffer = Buffer.from(responseText, 'binary');
        
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'image/png',
            },
            body: imageBuffer.toString('base64'),
            isBase64Encoded: true,
        };
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error: ' + error.message }),
        };
    }
};