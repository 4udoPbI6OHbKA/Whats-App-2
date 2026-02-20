// Подключаемся к серверу
const socket = io({
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
});

let mySocketId = null;
let myUserName = null; // Имя пользователя вместо "Я"
let messageQueue = new Set();
let currentRecipient = null;

// Элементы DOM
const messagesDiv = document.getElementById('messages');
const recipientSpan = document.getElementById('recipient');
const connectionStatus = document.getElementById('connection-status');
const messageInput = document.getElementById('message-input');

// Ждем регистрации пользователя
window.addEventListener('userRegistered', function(e) {
    myUserName = e.detail.userName;
    console.log('Пользователь зарегистрирован:', myUserName);
    initChat();
});

// Инициализация чата после регистрации
function initChat() {
    // Устанавливаем получателя по умолчанию
    if (recipientSpan) {
        recipientSpan.textContent = currentRecipient || 'Все';
    }

    // Подключение к серверу
    socket.on('connect', function() {
        mySocketId = socket.id;
        console.log('Подключено к серверу. ID:', mySocketId, 'Имя:', myUserName);
        
        socket.emit('registerUser', {
            socketId: mySocketId,
            userName: myUserName
        });
        
        if (connectionStatus) {
            connectionStatus.textContent = 'Онлайн';
            connectionStatus.style.color = '#2ecc71';
        }
        
        addMessage({
            senderName: 'Система',
            text: `Добро пожаловать, ${myUserName}! Вы подключены к чату`,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        }, false);
    });

    socket.on('disconnect', function() {
        console.log('Отключено от сервера');
        if (connectionStatus) {
            connectionStatus.textContent = 'Офлайн';
            connectionStatus.style.color = '#e74c3c';
        }
    });

    socket.on('connect_error', function(error) {
        console.error('Ошибка подключения:', error);
        if (connectionStatus) {
            connectionStatus.textContent = 'Ошибка';
            connectionStatus.style.color = '#f39c12';
        }
    });

    // Получение сообщений от других пользователей
    socket.on('message', function(data) {
        console.log('Получено сообщение от сервера:', data);
        
        // Проверяем, не отправили ли мы это сообщение сами
        if (data.id && messageQueue.has(data.id)) {
            console.log('Это наше сообщение (по ID), пропускаем');
            messageQueue.delete(data.id);
            return;
        }
        
        if (data.senderId === mySocketId) {
            console.log('Это наше сообщение (по socketId), пропускаем');
            return;
        }
        
        console.log('Сообщение от другого пользователя:', data.senderName);
        addMessage(data, false);
    });

    // Получение списка пользователей (опционально)
    socket.on('userList', function(users) {
        console.log('Список пользователей:', users);
    });
}

function setRecipient(name) {
    currentRecipient = name;
    if (recipientSpan) {
        recipientSpan.textContent = name;
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    if (!messageInput || !myUserName) return;
    
    const text = messageInput.value.trim();
    
    if (!text) return;
    
    const messageId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const message = {
        id: messageId,
        senderId: mySocketId,        // ID сокета для сервера
        senderName: myUserName,      // Имя для отображения
        recipient: currentRecipient,
        text: text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    };
    
    console.log('Отправляем сообщение:', message);
    
    messageQueue.add(messageId);
    socket.emit('message', message);
    
    // Показываем локально с именем пользователя
    addMessage(message, true);
    
    messageInput.value = '';
}

window.addMessage = function(data, isOwn) {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : 'their'}`;

    // Определяем класс для длинных сообщений
    const isLongMessage = data.text.length > 50;
    
    messageDiv.innerHTML = `
        <div class="message-header-row">
            <div class="message-sender">${data.senderName}</div>
            <div class="message-time">${data.time}</div>
        </div>
        <div class="message-bubble ${isLongMessage ? 'long-message' : ''}">
            ${data.text}
        </div>
    `;

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Автопрокрутка с анимацией
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: 'smooth'
    });
};


// Подключаем обработчик Enter
if (messageInput) {
    messageInput.addEventListener('keypress', handleEnter);
}

// Для отладки
window.clearMessageQueue = function() {
    messageQueue.clear();
    console.log('Очередь сообщений очищена');
};
