// API Configuration
const API_CONFIG = {
    baseURL: 'https://api.openai.com/v1', // Replace with your API endpoint
    apiKey: 'your-api-key-here', // Replace with your actual API key
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000 // 30 seconds
};

// API Response cache for better performance
const responseCache = new Map();
const MAX_CACHE_SIZE = 100;

/**
 * Main API call function - Replace this with your actual AI API integration
 * @param {string} userMessage - The user's input message
 * @returns {Promise<string>} - The AI response
 */
async function callAIAPI(userMessage) {
    try {
        // Show loading state
        showLoading('Thinking...');
        
        // Check cache first
        const cacheKey = userMessage.toLowerCase().trim();
        if (responseCache.has(cacheKey)) {
            hideLoading();
            return responseCache.get(cacheKey);
        }
        
        // Simulate API delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        
        // Demo responses - Replace this entire section with actual API call
        const demoResponse = generateDemoResponse(userMessage);
        
        // Cache the response
        cacheResponse(cacheKey, demoResponse);
        
        hideLoading();
        return demoResponse;
        
        /* 
        // UNCOMMENT AND MODIFY THIS SECTION FOR ACTUAL API INTEGRATION
        
        const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are Cogniverse, a helpful and intelligent AI assistant. Provide helpful, accurate, and engaging responses.'
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: API_CONFIG.maxTokens,
                temperature: API_CONFIG.temperature,
                stream: false
            }),
            signal: AbortSignal.timeout(API_CONFIG.timeout)
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
        
        // Cache the response
        cacheResponse(cacheKey, aiResponse);
        
        hideLoading();
        return aiResponse;
        */
        
    } catch (error) {
        hideLoading();
        console.error('API Error:', error);
        
        if (error.name === 'AbortError') {
            return 'Request timed out. Please try again.';
        }
        
        return getErrorResponse(error);
    }
}

/**
 * Main API call function using OpenRouter
 * @param {string} userMessage - The user's input message
 * @returns {Promise<string>} - The AI response
 */
async function callAIAPI(userMessage) {
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
    const model = 'openai/gpt-4'; // Updated to a more reliable model

    try {
        // Show loading state
        showLoading('AI is thinking...');
        
        // Check cache first
        const cacheKey = userMessage.toLowerCase().trim();
        if (responseCache.has(cacheKey)) {
            hideLoading();
            return responseCache.get(cacheKey);
        }

        // Build conversation context from current chat
        const messages = buildConversationContext(userMessage);

        const payload = {
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Cogniverse Chat App'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
        
        // Cache the response
        cacheResponse(cacheKey, aiResponse);
        
        hideLoading();
        return aiResponse;

    } catch (error) {
        hideLoading();
        console.error('API Error:', error);
        return getErrorResponse(error);
    }
}

/**
 * Build conversation context from current chat history
 * @param {string} currentMessage 
 * @returns {Array}
 */
function buildConversationContext(currentMessage) {
    const messages = [
        {
            role: 'system',
            content: 'You are Cogniverse, a helpful, intelligent, and friendly AI assistant. Provide clear, accurate, and engaging responses. Be conversational but informative.'
        }
    ];

    // Add recent chat history for context (last 10 messages)
    if (chats[currentChatId] && chats[currentChatId].length > 0) {
        const recentMessages = chats[currentChatId].slice(-10);
        
        recentMessages.forEach(msg => {
            if (msg.type === 'text') {
                messages.push({
                    role: msg.sender === 'User' ? 'user' : 'assistant',
                    content: msg.message
                });
            }
        });
    }

    // Add current message
    messages.push({
        role: 'user',
        content: currentMessage
    });

    return messages;
}

/**
 * Cache API responses to improve performance
 * @param {string} key 
 * @param {string} response 
 */
function cacheResponse(key, response) {
    if (responseCache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entry
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
    }
    responseCache.set(key, response);
}

/**
 * Generate appropriate error responses
 * @param {Error} error 
 * @returns {string}
 */
function getErrorResponse(error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return 'I\'m having trouble connecting to the AI service. Please check your internet connection and try again.';
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('403') || errorMessage.includes('401')) {
        return 'Authentication error. Please check your API key configuration.';
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return 'I\'m receiving too many requests right now. Please wait a moment and try again.';
    }
    
    if (errorMessage.includes('timeout')) {
        return 'The request took too long to process. Please try again with a shorter message.';
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        return 'The AI service is temporarily unavailable. Please try again in a few moments.';
    }
    
    return 'I encountered an unexpected error. Please try rephrasing your message or contact support if the problem persists.';
}

/**
 * Stream API responses for real-time typing effect (Optional Enhancement)
 * @param {string} userMessage 
 * @param {Function} onChunk - Callback for each response chunk
 * @returns {Promise<string>}
 */
async function callAIAPIStream(userMessage, onChunk) {
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = 'YOUR_API_KEY_HERE';
    const model = 'openai/gpt-4';

    try {
        showLoading('AI is thinking...');
        
        const messages = buildConversationContext(userMessage);
        
        const payload = {
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
            stream: true // Enable streaming
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Cogniverse Chat App'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        hideLoading();
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const data = line.trim().slice(6);
                    
                    if (data === '[DONE]') {
                        continue;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content || '';
                        
                        if (content) {
                            fullResponse += content;
                            onChunk(content);
                        }
                    } catch (e) {
                        // Skip invalid JSON lines
                        continue;
                    }
                }
            }
        }

        return fullResponse;

    } catch (error) {
        hideLoading();
        console.error('Streaming API Error:', error);
        return getErrorResponse(error);
    }
}

/**
 * Validate API configuration
 * @returns {boolean}
 */
function validateAPIConfig() {
    if (!API_CONFIG.apiKey || API_CONFIG.apiKey === 'your-api-key-here') {
        console.warn('API key not configured. Using demo mode.');
        return false;
    }
    
    if (!API_CONFIG.baseURL) {
        console.error('API base URL not configured.');
        return false;
    }
    
    return true;
}

/**
 * Test API connection
 * @returns {Promise<boolean>}
 */
async function testAPIConnection() {
    try {
        showLoading('Testing API connection...');
        
        const testResponse = await callAIAPI('Hello, this is a connection test.');
        
        hideLoading();
        
        if (testResponse && !testResponse.includes('error')) {
            return true;
        }
        
        return false;
        
    } catch (error) {
        hideLoading();
        console.error('API connection test failed:', error);
        return false;
    }
}

/**
 * Get API usage statistics (if supported by your API)
 * @returns {Promise<Object>}
 */
async function getAPIUsage() {
    try {
        // This would depend on your specific API provider
        // OpenRouter example:
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            headers: {
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            }
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching API usage:', error);
        return null;
    }
}

/**
 * Handle file uploads to AI (if supported)
 * @param {File} file 
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
async function sendFileToAI(file, prompt = 'Please analyze this file.') {
    try {
        showLoading('Analyzing file...');
        
        // For text files, read content and send as text
        if (file.type.startsWith('text/')) {
            const text = await file.text();
            const fullPrompt = `${prompt}\n\nFile content:\n${text}`;
            return await callAIAPI(fullPrompt);
        }
        
        // For images, convert to base64 (if API supports vision)
        if (file.type.startsWith('image/')) {
            const base64 = await fileToBase64(file);
            // This would require vision-capable model
            return await callAIAPI(`${prompt}\n\n[Image uploaded: ${file.name}]`);
        }
        
        // For other file types
        return await callAIAPI(`${prompt}\n\n[File uploaded: ${file.name} (${formatFileSize(file.size)})]`);
        
    } catch (error) {
        hideLoading();
        console.error('Error processing file:', error);
        return 'Sorry, I had trouble processing that file. Please try again.';
    }
}

/**
 * Convert file to base64
 * @param {File} file 
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Export chat history
 * @param {string} chatId 
 * @param {string} format - 'json', 'txt', or 'html'
 */
function exportChat(chatId, format = 'txt') {
    if (!chats[chatId]) return;
    
    const chat = chats[chatId];
    let content = '';
    let filename = `cogniverse-chat-${chatId}`;
    let mimeType = 'text/plain';
    
    switch (format) {
        case 'json':
            content = JSON.stringify(chat, null, 2);
            filename += '.json';
            mimeType = 'application/json';
            break;
            
        case 'html':
            content = generateHTMLExport(chat);
            filename += '.html';
            mimeType = 'text/html';
            break;
            
        default: // txt
            content = chat.map(msg => 
                `${msg.sender}: ${msg.message} ${msg.timestamp ? `(${new Date(msg.timestamp).toLocaleString()})` : ''}`
            ).join('\n\n');
            filename += '.txt';
    }
    
    downloadFile(content, filename, mimeType);
}

/**
 * Generate HTML export of chat
 * @param {Array} chat 
 * @returns {string}
 */
function generateHTMLExport(chat) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Cogniverse Chat Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .chat { max-width: 800px; margin: 0 auto; }
        .message { margin: 10px 0; padding: 15px; border-radius: 12px; }
        .user { background: #007BFF; color: white; margin-left: 20%; }
        .bot { background: white; border: 1px solid #ddd; margin-right: 20%; }
        .timestamp { font-size: 12px; opacity: 0.7; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="chat">
        <h1>Cogniverse Chat Export</h1>
        ${chat.map(msg => `
            <div class="message ${msg.sender.toLowerCase()}">
                <strong>${msg.sender}:</strong> ${msg.message}
                ${msg.timestamp ? `<div class="timestamp">${new Date(msg.timestamp).toLocaleString()}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
}

/**
 * Download file helper
 * @param {string} content 
 * @param {string} filename 
 * @param {string} mimeType 
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Import chat history from file
 * @param {File} file 
 */
async function importChat(file) {
    try {
        showLoading('Importing chat...');
        
        const content = await file.text();
        const importedChats = JSON.parse(content);
        
        // Merge with existing chats
        Object.assign(chats, importedChats);
        saveChats();
        loadLibrary();
        
        hideLoading();
        alert('Chat history imported successfully!');
        
    } catch (error) {
        hideLoading();
        console.error('Import error:', error);
        alert('Error importing chat history. Please check the file format.');
    }
}

/**
 * Clear all chat history
 */
function clearAllChats() {
    if (confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
        chats = {};
        currentChatId = Date.now();
        localStorage.removeItem('cogniverseChats');
        localStorage.removeItem('cogniverse-last-chat');
        
        document.getElementById('chat-box').innerHTML = '';
        loadLibrary();
        showWelcomeMessage();
        updateChatTitle('New Chat');
        
        alert('All chat history has been cleared.');
    }
}

/**
 * Get conversation statistics
 * @returns {Object}
 */
function getConversationStats() {
    const totalChats = Object.keys(chats).length;
    let totalMessages = 0;
    let userMessages = 0;
    let botMessages = 0;
    
    Object.values(chats).forEach(chat => {
        totalMessages += chat.length;
        chat.forEach(msg => {
            if (msg.sender === 'User') userMessages++;
            else botMessages++;
        });
    });
    
    return {
        totalChats,
        totalMessages,
        userMessages,
        botMessages,
        averageMessagesPerChat: totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : 0
    };
}

/**
 * Demo response generator for testing (fallback)
 * @param {string} userMessage 
 * @returns {string}
 */
function generateDemoResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return 'Hello! I\'m Cogniverse, your AI assistant. How can I help you today?';
    }
    
    // Question responses
    if (message.includes('how are you')) {
        return 'I\'m doing well, thank you for asking! I\'m here and ready to assist you with any questions or tasks you have.';
    }
    
    // Help responses
    if (message.includes('help') || message.includes('what can you do')) {
        return 'I can help you with a wide variety of tasks including:\n\n• Answering questions and providing information\n• Writing and editing text\n• Solving problems and offering suggestions\n• Creative tasks like storytelling\n• Technical assistance and coding help\n• And much more!\n\nWhat would you like help with today?';
    }
    
    // Default responses
    const responses = [
        'That\'s an interesting question! Let me think about that for you.',
        'I understand what you\'re asking. Here\'s my perspective on that.',
        'Thanks for sharing that with me. I\'d be happy to help you explore this topic.',
        'That\'s a great point! Let me provide you with some insights.',
        'I appreciate you bringing this up. Here\'s what I think about it.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + '\n\n' + 
           'Note: This is a demo response. Please configure your API key for full functionality.';
}

// Initialize API configuration check
window.addEventListener('load', function() {
    if (!validateAPIConfig()) {
        console.warn('Running in demo mode. Configure API_CONFIG for full functionality.');
    }
});

// Export functions for use in other files
window.API = {
    callAIAPI,
    testAPIConnection,
    getAPIUsage,
    exportChat,
    importChat,
    clearAllChats,
    getConversationStats
};