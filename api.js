async function callAIAPI(prompt) {
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = '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'; 
    const model = 'openai/gpt-5-chat'; 

    const payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 200
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