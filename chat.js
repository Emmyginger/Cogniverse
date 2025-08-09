// Initialize app
document.body.classList.add('light-mode');

// Application state
let currentChatId = Date.now();
let chats = {};
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let isTyping = false;
let autoScroll = true;

// Theme and settings
let currentTheme = localStorage.getItem('cogniverse-theme') || 'light';
let fontSize = localStorage.getItem('cogniverse-font-size') || 'medium';

// Initialize when page loads
window.addEventListener('load', function() {
    initializeApp();
});

function initializeApp() {
    loadSettings();
    loadChats();
    loadLibrary();
    setupEventListeners();
    showWelcomeMessage();
    
    // Load last active chat if exists
    const lastChatId = localStorage.getItem('cogniverse-last-chat');
    if (lastChatId && chats[lastChatId]) {
        loadChat(lastChatId);
    }
}

function loadSettings() {
    // Apply saved theme
    setTheme(currentTheme);
    
    // Apply saved font size
    document.body.className = document.body.className.replace(/font-(small|medium|large)/, '');
    document.body.classList.add(`font-${fontSize}`);
    
    // Load auto-scroll preference
    const autoScrollSetting = localStorage.getItem('cogniverse-auto-scroll');
    if (autoScrollSetting !== null) {
        autoScroll = autoScrollSetting === 'true';
        document.getElementById('auto-scroll').checked = autoScroll;
    }
}

function loadChats() {
    try {
        const savedChats = localStorage.getItem('cogniverseChats');
        chats = savedChats ? JSON.parse(savedChats) : {};
    } catch (error) {
        console.error('Error loading chats:', error);
        chats = {};
    }
}

function setupEventListeners() {
    // Enter key for sending messages
    document.getElementById('user-input').addEventListener('keypress', handleKeyPress);
    
    // Auto-scroll checkbox
    document.getElementById('auto-scroll').addEventListener('change', function() {
        autoScroll = this.checked;
        localStorage.setItem('cogniverse-auto-scroll', autoScroll.toString());
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('settings-modal');
        if (e.target === modal) {
            toggleSettings();
        }
    });
    
    // Prevent body scroll when sidebar is open on mobile
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function showWelcomeMessage() {
    const chatBox = document.getElementById('chat-box');
    if (chatBox.children.length === 1) { // Only welcome message exists
        chatBox.innerHTML = `
            <div class="welcome-message fade-in">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h2>Welcome to Cogniverse</h2>
                <p>Your intelligent AI assistant is ready to help. Start a conversation by typing a message below!</p>
            </div>
        `;
    }
}

// Theme management
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${theme}-mode`);
    
    // Update theme toggle icon
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Update theme option buttons
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeThemeBtn = document.querySelector(`.theme-option[onclick="setTheme('${theme}')"]`);
    if (activeThemeBtn) {
        activeThemeBtn.classList.add('active');
    }
    
    localStorage.setItem('cogniverse-theme', theme);
}

// Font size management
function adjustFontSize(size) {
    fontSize = size;
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
    
    // Update active button
    document.querySelectorAll('.font-size-controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.font-size-controls button[onclick="adjustFontSize('${size}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    localStorage.setItem('cogniverse-font-size', size);
}

// Sidebar management
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// Settings modal
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('show');
    
    if (modal.classList.contains('show')) {
        // Update current settings in UI
        setTheme(currentTheme);
        adjustFontSize(fontSize);
    }
}

// Chat management
function newChat() {
    currentChatId = Date.now();
    document.getElementById('chat-box').innerHTML = '';
    chats[currentChatId] = [];
    saveChats();
    loadLibrary();
    showWelcomeMessage();
    updateChatTitle('New Chat');
    localStorage.setItem('cogniverse-last-chat', currentChatId);
    closeSidebar();
}

function updateChatTitle(title) {
    document.getElementById('chat-title').textContent = title;
}

// Message sending
async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message || isTyping) return;
    
    // Clear welcome message
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Add user message
    appendMessage('User', message, 'text');
    saveMessage('User', message, 'text');
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Simulate API call (replace with actual API call)
        const response = await callAIAPI(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add bot response
        appendMessage('Bot', response, 'text');
        saveMessage('Bot', response, 'text');
        
        // Update chat title if it's the first message
        if (chats[currentChatId].length === 2) {
            const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
            updateChatTitle(title);
            loadLibrary();
        }
        
    } catch (error) {
        hideTypingIndicator();
        appendMessage('Bot', 'Sorry, I encountered an error. Please try again.', 'text', true);
        console.error('API Error:', error);
    }
}

function showTypingIndicator() {
    isTyping = true;
    const indicator = document.getElementById('typing-indicator');
    indicator.classList.add('show');
    
    // Disable send button
    const sendBtn = document.querySelector('.send-btn');
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.6';
}

function hideTypingIndicator() {
    isTyping = false;
    const indicator = document.getElementById('typing-indicator');
    indicator.classList.remove('show');
    
    // Enable send button
    const sendBtn = document.querySelector('.send-btn');
    sendBtn.disabled = false;
    sendBtn.style.opacity = '1';
}

// File handling
function sendFile(file) {
    if (!file) return;
    
    // Clear welcome message
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const fileURL = URL.createObjectURL(file);
    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    
    appendMessage('User', fileURL, 'file', false, fileName, fileSize);
    saveMessage('User', fileURL, 'file', fileName);
    
    closeSidebar();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Audio recording
function toggleRecording() {
    const recordBtn = document.getElementById('record-btn');
    
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            isRecording = true;
            
            const recordBtn = document.getElementById('record-btn');
            recordBtn.classList.add('recording');
            recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
            recordBtn.title = 'Stop Recording';
            
            mediaRecorder.start();
            
            mediaRecorder.addEventListener('dataavailable', e => {
                audioChunks.push(e.data);
            });
            
            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                const audioURL = URL.createObjectURL(audioBlob);
                
                // Clear welcome message
                const welcomeMsg = document.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.remove();
                }
                
                appendMessage('User', audioURL, 'audio');
                saveMessage('User', audioURL, 'audio');
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            });
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check your permissions.');
        });
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        const recordBtn = document.getElementById('record-btn');
        recordBtn.classList.remove('recording');
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        recordBtn.title = 'Voice Message';
    }
}

// Message display
function appendMessage(sender, content, type, isError = false, fileName = '', fileSize = '') {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender === 'User' ? 'user-message' : 'bot-message'}`;
    
    if (isError) {
        messageElement.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        messageElement.style.color = 'white';
    }
    
    let messageHTML = '';
    
    switch (type) {
        case 'file':
            const fileIcon = getFileIcon(fileName);
            messageHTML = `
                <div class="file-message">
                    <i class="${fileIcon}"></i>
                    <div class="file-info">
                        <div class="file-name">${fileName}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                    <a href="${content}" download="${fileName}">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `;
            break;
            
        case 'audio':
            messageHTML = `
                <div class="audio-message">
                    <audio controls src="${content}">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            `;
            break;
            
        default:
            messageHTML = content.replace(/\n/g, '<br>');
    }
    
    messageElement.innerHTML = messageHTML;
    chatBox.appendChild(messageElement);
    
    if (autoScroll) {
        scrollToBottom();
    }
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'mp3': 'fas fa-file-audio',
        'wav': 'fas fa-file-audio',
        'mp4': 'fas fa-file-video',
        'avi': 'fas fa-file-video',
        'txt': 'fas fa-file-alt',
    };
    
    return iconMap[extension] || 'fas fa-file';
}

function scrollToBottom() {
    const chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Message saving
function saveMessage(sender, content, type, fileName = '') {
    if (!chats[currentChatId]) {
        chats[currentChatId] = [];
    }
    
    chats[currentChatId].push({
        sender,
        message: content,
        type,
        fileName,
        timestamp: new Date().toISOString()
    });
    
    saveChats();
}

function saveChats() {
    try {
        localStorage.setItem('cogniverseChats', JSON.stringify(chats));
        localStorage.setItem('cogniverse-last-chat', currentChatId);
    } catch (error) {
        console.error('Error saving chats:', error);
    }
}

// Chat library
function loadLibrary() {
    const library = document.getElementById('chat-library');
    library.innerHTML = '';
    
    const sortedChats = Object.entries(chats)
        .sort(([,a], [,b]) => {
            const aTime = a[0]?.timestamp || 0;
            const bTime = b[0]?.timestamp || 0;
            return new Date(bTime) - new Date(aTime);
        });
    
    sortedChats.forEach(([id, messages]) => {
        const li = document.createElement('li');
        li.className = id === currentChatId.toString() ? 'active' : '';
        
        const firstMessage = messages.find(msg => msg.sender === 'User');
        const title = firstMessage ? 
            (firstMessage.message.length > 30 ? 
                firstMessage.message.substring(0, 30) + '...' : 
                firstMessage.message) : 
            `Chat ${id}`;
        
        li.textContent = title;
        li.onclick = () => loadChat(id);
        library.appendChild(li);
    });
}

function loadChat(id) {
    currentChatId = parseInt(id);
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '';
    
    if (chats[id] && chats[id].length > 0) {
        chats[id].forEach(msg => {
            appendMessage(msg.sender, msg.message, msg.type, false, msg.fileName);
        });
        
        const firstUserMessage = chats[id].find(msg => msg.sender === 'User');
        if (firstUserMessage) {
            const title = firstUserMessage.message.length > 30 ? 
                firstUserMessage.message.substring(0, 30) + '...' : 
                firstUserMessage.message;
            updateChatTitle(title);
        }
    } else {
        showWelcomeMessage();
        updateChatTitle('New Chat');
    }
    
    loadLibrary();
    localStorage.setItem('cogniverse-last-chat', id);
    closeSidebar();
}

// Search functionality
function searchChats() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase().trim();
    const library = document.getElementById('chat-library');
    
    if (!searchTerm) {
        loadLibrary();
        return;
    }
    
    library.innerHTML = '';
    
    Object.entries(chats).forEach(([id, messages]) => {
        const hasMatch = messages.some(msg => 
            (msg.message || '').toLowerCase().includes(searchTerm) ||
            (msg.fileName || '').toLowerCase().includes(searchTerm)
        );
        
        if (hasMatch) {
            const li = document.createElement('li');
            li.className = id === currentChatId.toString() ? 'active' : '';
            
            const firstMessage = messages.find(msg => msg.sender === 'User');
            const title = firstMessage ? 
                (firstMessage.message.length > 30 ? 
                    firstMessage.message.substring(0, 30) + '...' : 
                    firstMessage.message) : 
                `Chat ${id}`;
            
            li.textContent = title;
            li.onclick = () => loadChat(id);
            library.appendChild(li);
        }
    });
}

// Loading overlay
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loading-overlay');
    const text = overlay.querySelector('p');
    text.textContent = message;
    overlay.classList.add('show');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('show');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add debounced search
const debouncedSearch = debounce(searchChats, 300);
document.getElementById('search-bar').addEventListener('input', debouncedSearch);