import io from 'socket.io-client';

let socket;
const connectSocket = (user_id) => {
    if (!socket) { // Prevent multiple connections
        socket = io("http://localhost:3000", {
          query: { user_id },
          reconnection: true,
        });
    }
}

export { connectSocket, socket }; 