const express = require('express'); 
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const port = 5000;

// Serve static files and set view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Data structures to track user locations and mobile numbers
const userLocations = {}; // Stores mobileNumber -> { latitude, longitude, socketId }

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle location updates
    socket.on("send-location", ({ mobileNumber, latitude, longitude }) => {
        userLocations[mobileNumber] = { latitude, longitude, socketId: socket.id };
        io.emit("receive-location", { mobileNumber, latitude, longitude });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        const mobileNumber = Object.keys(userLocations).find(
            (key) => userLocations[key].socketId === socket.id
        );
        if (mobileNumber) {
            delete userLocations[mobileNumber];
            io.emit("user-disconnected", mobileNumber);
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Render the main page
app.get("/", (req, res) => {
    res.render("index");
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
