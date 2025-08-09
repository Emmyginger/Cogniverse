document.body.classList.add('light-mode');

let currentChatId = Date.now();
let chats = JSON.parse(localStorage.getItem('cogniverseChats')) || {};
let mediaRecorder;
let audioChunks = [];

// Load last chat
window.onload = function () {
    loadLibrary();
    if (chats[currentChatId]) {
        chats[currentChatId].forEach(msg => appendMessage(msg.sender, msg.message, msg.type));
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

    appendMessage('User', userInput, 'text');
    saveMessage('User', userInput, 'text');
    document.getElementById('user-input').value = '';

    const apiResponse = await callAIAPI(userInput);
    appendMessage('Bot', apiResponse, 'text');
    saveMessage('Bot', apiResponse, 'text');
}

function sendFile(file) {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    appendMessage('User', fileURL, 'file', file.name);
    saveMessage('User', fileURL, 'file', file.name);
}

function toggleRecording() {
    const recordBtn = document.getElementById('record-btn');
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.start();
            recordBtn.textContent = "⏹"; // Stop icon

            mediaRecorder.addEventListener("dataavailable", e => {
                audioChunks.push(e.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                const audioURL = URL.createObjectURL(audioBlob);
                appendMessage('User', audioURL, 'audio');
                saveMessage('User', audioURL, 'audio');
                recordBtn.textContent = "🎤";
            });
        });
    } else {
        mediaRecorder.stop();
    }
}

function appendMessage(sender, content, type, fileName = "") {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message ' + (sender === 'User' ? 'user-message' : 'bot-message');

    if (type === 'file') {
        messageElement.innerHTML = `<a href="${content}" download="${fileName}" class="file-message">${fileName}</a>`;
    } else if (type === 'audio') {
        messageElement.innerHTML = `<div class="audio-message"><audio controls src="${content}"></audio></div>`;
    } else {
        messageElement.textContent = content;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveMessage(sender, content, type, fileName = "") {
    if (!chats[currentChatId]) chats[currentChatId] = [];
    chats[currentChatId].push({ sender, message: content, type, fileName });
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
    chats[id].forEach(msg => appendMessage(msg.sender, msg.message, msg.type, msg.fileName));
}

function searchChats() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const library = document.getElementById('chat-library');
    library.innerHTML = "";
    Object.keys(chats).forEach(id => {
        if (chats[id].some(msg => (msg.message || "").toLowerCase().includes(searchTerm))) {
            let li = document.createElement('li');
            li.textContent = `Chat ${id}`;
            li.onclick = () => loadChat(id);
            library.appendChild(li);
        }
    });
}
