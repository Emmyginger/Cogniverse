async function callAIAPI(prompt) {
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = 'API_KEY'; 
    const model = 'openai/gpt-5-chat'; 

    const payload = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
    };
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, there was an error processing your request.';
    }
}
