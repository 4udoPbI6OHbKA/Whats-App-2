import asyncio
import websockets

async def client():
    async with websockets.connect("ws://localhost:8765") as websocket:
        await websocket.send("Привет!")
        response = await websocket.recv()
        print(f"Ответ: {response}")

asyncio.run(client())
