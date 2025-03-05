import io from 'socket.io-client';

let socket;
const connectSocket = (user_id) => {
    if (!socket) { // Prevent multiple connections
        socket = io(import.meta.env.VITE_BASE_URL, {
          query: { user_id },
          reconnection: true,
        });
    }
}

export { connectSocket, socket }; 
