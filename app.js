const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

// Function to enhance prompt using Gemini
async function enhancePromptWithGemini(userPrompt) {
    try {
        // Replace with the actual Gemini API endpoint and payload structure
        const geminiResponse = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Rewrite this prompt for an AI image generator to create a professional, eye-catching YouTube thumbnail: "${userPrompt}". Focus on clarity, vivid imagery, and concise instructions.`
                            }
                        ]
                    }
                ]
            }
        );
        // Extract the enhanced prompt from the Gemini response
        const enhancedPrompt = geminiResponse.data.candidates[0].content.parts[0].text;
        return enhancedPrompt;
    } catch (error) {
        console.error('Error enhancing prompt with Gemini:', error.message);
        // Fallback to the original prompt if Gemini fails
        return userPrompt;
    }
}

app.post('/generate-thumbnail', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        // Step 1: Enhance prompt using Gemini
        const enhancedPrompt = await enhancePromptWithGemini(prompt);

        // Step 2: Generate image with Stability AI
        const stabilityResponse = await axios.post(
            'https://api.stability.ai/v2beta/stable-image/generate/sd3',
            {
                prompt: enhancedPrompt,
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

        // Adjust this according to Stability AI's actual API response
        const imageData = stabilityResponse.data.image;
        res.json({ image: imageData, prompt: enhancedPrompt });
    } catch (error) {
        console.error('Error generating thumbnail:', error.message);
        res.status(500).json({ error: 'Failed to generate thumbnail' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
