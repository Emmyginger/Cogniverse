// Set default theme
document.body.classList.add('light-mode');

// Load chat history on page load
window.onload = function () {
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.forEach(msg => appendMessage(msg.sender, msg.message));
};

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

async function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;

    appendMessage('User', userInput);
    saveMessage('User', userInput);
    document.getElementById('user-input').value = '';

    const apiResponse = await callAIAPI(userInput);
    appendMessage('Bot', apiResponse);
    saveMessage('Bot', apiResponse);
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message ' + (sender === 'User' ? 'user-message' : 'bot-message');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveMessage(sender, message) {
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.push({ sender, message });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}
