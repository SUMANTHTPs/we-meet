import io from "socket.io-client"; // Add this
import { BASE_URL } from "./config";

let socket;

const connectSocket = (userId) => {
  socket = io(BASE_URL, {
    query: `userId=${userId}`,
  });
}; // Add this -- our server will run on port 4000, so we connect to it from here

export { socket, connectSocket };
