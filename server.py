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
            for client in clients.copy():
                if client != websocket:
                    await client.send(json.dumps(data))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clients.discard(websocket)

async def main():
    async with websockets.serve(chat_handler, "localhost", 8765):
        print("Сервер запущен на ws://localhost:8765")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
