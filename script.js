const ws = new WebSocket("ws://localhost:8765");
    let currentRecipient = "Друн";

    function setRecipient(name) {
        currentRecipient = name;
        document.getElementById("recipient").textContent = name;
    }

    function handleEnter(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    }

    function sendMessage() {
        const input = document.getElementById("message-input");
        const text = input.value.trim();
        if (!text) return;

        const message = {
            sender: "Ч",
            recipient: currentRecipient,
            text: text,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        // Отправляем на сервер
        ws.send(JSON.stringify(message));

        // Добавляем своё сообщение
        addMessage(message, true);

        input.value = "";
    }

    function addMessage(data, isOwn) {
        const messages = document.getElementById("messages");
        const msg = document.createElement("div");
        msg.className = `message ${isOwn ? 'own' : 'their'}`;
        msg.innerHTML = `<b>${data.sender}</b> (${data.time})<br>${data.text}`;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    // Принимаем сообщения
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        addMessage(data, false);
    };

    // Приветствие
    setTimeout(() => {
        addMessage({ sender: "Система", text: "Вы подключены к чату", time: "только что" }, false);
    }, 500);
