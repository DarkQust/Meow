const fetch = require('node-fetch');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { prompt } = req.body;
        const HF_TOKEN = process.env.HF_TOKEN;

        if (!HF_TOKEN) {
            console.error('HF_TOKEN not set');
            res.status(500).json({ error: 'HF_TOKEN not set' });
            return;
        }

        // РАБОЧАЯ МОДЕЛЬ — Stable Diffusion 1.5
        const MODEL_URL = 'https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5';

        console.log('MODEL_URL:', MODEL_URL);
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

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face error:', response.status, errorText);
            res.status(response.status).json({ error: errorText });
            return;
        }

        const imageBuffer = await response.buffer();
        const base64Image = imageBuffer.toString('base64');
        res.status(200).json({ image: base64Image });
    } catch (error) {
        console.error('Function error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
};