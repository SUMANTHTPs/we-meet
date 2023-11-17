import io from "socket.io-client"; // Add this
let socket;
const connectSocket = (user_id) => {
  socket = io("http://localhost:5000", {
    query: `userId=${window.localStorage.getItem("userId")}`,
  });
}; // Add this -- our server will run on port 4000, so we connect to it from here

export { socket, connectSocket };
