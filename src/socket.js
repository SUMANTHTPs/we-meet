import io from "socket.io-client"; // Add this

let socket = io("http://localhost:3001", {
  query: `userId=${localStorage.getItem("userId")}`,
}); // Add this -- our server will run on port 4000, so we connect to it from here
export default socket;
