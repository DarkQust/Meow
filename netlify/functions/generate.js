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
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'HF_TOKEN not set' }),
            };
        }

        const MODEL_URL = 'https://router.huggingface.co/hf-inference/models/cagliostrolab/animagine-xl-3.1';

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

        if (!response.ok) {
            const errorText = await response.text();
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: errorText }),
            };
        }

        const imageBuffer = await response.buffer();
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
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};