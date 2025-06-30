const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

app.post('/generate-thumbnail', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        // Use Stability AI to generate image
        const stabilityResponse = await axios.post(
            'https://api.stability.ai/v2beta/stable-image/generate/sd3',
            {
                prompt: prompt,
                output_format: 'png',
                model: 'sd3',
                aspect_ratio: '16:9',
            },
            {
                headers: {
                    'Authorization': `Bearer ${STABILITY_API_KEY}`,
                    'Accept': 'application/json',
                }
            }
        );

        const imageData = stabilityResponse.data.image; // adjust as per API response
        res.json({ image: imageData });
    } catch (error) {
        console.error('Error generating thumbnail:', error.message);
        res.status(500).json({ error: 'Failed to generate thumbnail' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
