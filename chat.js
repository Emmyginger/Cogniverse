document.body.classList.add('light-mode');

let currentChatId = Date.now();
let chats = JSON.parse(localStorage.getItem('cogniverseChats')) || {};

// Load last chat
window.onload = function () {
    loadLibrary();
    if (chats[currentChatId]) {
        chats[currentChatId].forEach(msg => appendMessage(msg.sender, msg.message));
    }
};

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

function newChat() {
    currentChatId = Date.now();
    document.getElementById('chat-box').innerHTML = "";
    chats[currentChatId] = [];
    saveChats();
    loadLibrary();
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
    if (!chats[currentChatId]) chats[currentChatId] = [];
    chats[currentChatId].push({ sender, message });
    saveChats();
}

function saveChats() {
    localStorage.setItem('cogniverseChats', JSON.stringify(chats));
}

function loadLibrary() {
    const library = document.getElementById('chat-library');
    library.innerHTML = "";
    Object.keys(chats).forEach(id => {
        let li = document.createElement('li');
        li.textContent = `Chat ${id}`;
        li.onclick = () => loadChat(id);
        library.appendChild(li);
    });
}

function loadChat(id) {
    currentChatId = id;
    document.getElementById('chat-box').innerHTML = "";
    chats[id].forEach(msg => appendMessage(msg.sender, msg.message));
}

function searchChats() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const library = document.getElementById('chat-library');
    library.innerHTML = "";
    Object.keys(chats).forEach(id => {
        if (chats[id].some(msg => msg.message.toLowerCase().includes(searchTerm))) {
            let li = document.createElement('li');
            li.textContent = `Chat ${id}`;
            li.onclick = () => loadChat(id);
            library.appendChild(li);
        }
    });
}
