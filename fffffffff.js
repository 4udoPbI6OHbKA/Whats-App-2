// Замените 'ВАШ_СЕРВЕР_IP' на реальный IP-адрес машины, где запущен сервер
const ws = new WebSocket("ws://ВАШ_СЕРВЕР_IP:8765");

ws.onopen = () => {
    console.log("Соединение установлено.");
    
    // 1. Отправляем имя при подключении (согласно Улучшению 1)
    ws.send(JSON.stringify({ type: "join", username: "Client_A_Browser" }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Получено:", data);
};

ws.onclose = () => {
    console.log("Соединение закрыто.");
};

// Функция для отправки сообщений (вызывать в консоли)
function sendMessage(text) {
    ws.send(JSON.stringify({ 
        type: "message", 
        text: text 
    }));
}

// Пример вызова: sendMessage("Привет всем!");