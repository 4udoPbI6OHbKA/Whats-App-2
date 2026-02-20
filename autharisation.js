// auth.js - Модуль авторизации
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
