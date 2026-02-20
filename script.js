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
    
    // Проверяем длину для длинных сообщений
    const isLongMessage = data.text.length > 60;
    
    messageDiv.innerHTML = `
        <div class="message-header-row">
            <span class="message-sender">${data.senderName}</span>
            <span class="message-time">${data.time}</span>
        </div>
        <div class="message-bubble ${isLongMessage ? 'long-message' : ''}">
            ${data.text}
        </div>
    `;

    messagesDiv.appendChild(messageDiv);
    
    // Плавная прокрутка вниз
    setTimeout(() => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 10);
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










class ChatAuth {
    constructor() {
        this.userName = localStorage.getItem('chatUserName') || null;
        this.isRegistered = this.userName !== null;
        this.init();
    }

    init() {
        if (!this.isRegistered) {
            this.showRegistrationModal();
        }
    }

    showRegistrationModal() {
        const modalHTML = `
            <div id="auth-modal" class="auth-modal-overlay" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
                align-items: center; justify-content: center;">
                
                <div style="
                    background: white; padding: 30px; border-radius: 10px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 400px; 
                    width: 90%;">
                    
                    <h2 style="margin-top: 0; color: #333;">Регистрация в чате</h2>
                    <p>Введите ваше имя для чата (не более 20 символов):</p>
                    
                    <input type="text" id="username-input" 
                           placeholder="Ваше имя" maxlength="20" 
                           style="width: 100%; padding: 12px; font-size: 16px; 
                           border: 2px solid #ddd; border-radius: 5px; box-sizing: border-box;"
                           value="${this.userName || ''}">
                    
                    <div style="margin-top: 20px;">
                        <button id="register-btn" style="
                            background: #3498db; color: white; padding: 12px 24px; 
                            border: none; border-radius: 5px; font-size: 16px; 
                            cursor: pointer; margin-right: 10px;">
                            Войти в чат
                        </button>
                        
                        <button id="cancel-btn" style="
                            background: #95a5a6; color: white; padding: 12px 24px; 
                            border: none; border-radius: 5px; font-size: 16px; 
                            cursor: pointer;">
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const usernameInput = document.getElementById('username-input');
        const registerBtn = document.getElementById('register-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const modal = document.getElementById('auth-modal');

        // Фокус на поле ввода
        usernameInput.focus();

        registerBtn.onclick = () => {
            const name = usernameInput.value.trim();
            if (name && name.length >= 2) {
                this.register(name);
            } else {
                alert('Имя должно содержать минимум 2 символа');
                usernameInput.focus();
            }
        };

        cancelBtn.onclick = () => {
            modal.remove();
        };

        // Enter для регистрации
        usernameInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                registerBtn.click();
            }
        };

        // Закрытие по клику вне модалки
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }

    register(name) {
        this.userName = name;
        localStorage.setItem('chatUserName', name);
        this.isRegistered = true;
        
        const modal = document.getElementById('auth-modal');
        if (modal) modal.remove();
        
        // Уведомляем основной скрипт о регистрации
        window.dispatchEvent(new CustomEvent('userRegistered', {
            detail: { userName: name }
        }));
        
        console.log('Пользователь зарегистрирован:', name);
    }

    getUserName() {
        return this.userName;
    }

    logout() {
        localStorage.removeItem('chatUserName');
        this.userName = null;
        this.isRegistered = false;
        location.reload();
    }
}

// Инициализация при загрузке
const chatAuth = new ChatAuth();
window.chatAuth = chatAuth; // Делаем доступным глобально
