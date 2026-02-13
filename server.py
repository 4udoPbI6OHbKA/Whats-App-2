import asyncio
import websockets
import json

clients = set()

async def chat_handler(websocket):
    clients.add(websocket)
    print("Новый пользователь подключился")

    try:
        async for message in websocket:
            data = json.loads(message)
            # Отправляем всем остальным клиентам
            for client in clients.copy():  # Используем copy() для безопасности
                if client != websocket:
                    await client.send(json.dumps(data))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clients.discard(websocket)  # discard() не вызывает ошибку если нет в множестве

async def main():
    async with websockets.serve(chat_handler, "localhost", 8765):
        print("Сервер запущен на ws://localhost:8765")
        await asyncio.Future()  # Бесконечное ожидание

if __name__ == "__main__":
    asyncio.run(main())
