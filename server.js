const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.render('index');
});

let connectedUsers = 0;

io.on('connection', (socket) => {
    connectedUsers++;
    console.log(`User connected with ID: ${socket.id}. Total users: ${connectedUsers}`);

    // Notify the user of their unique ID
    socket.emit('userId', socket.id);

    // Notify all clients about the connection status
    io.emit('status', connectedUsers === 2 ? 'connected' : 'connecting');

    // Handle incoming messages
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', { id: socket.id, text: msg });
    });

    socket.on('disconnect', () => {
        connectedUsers--;
        console.log(`User disconnected with ID: ${socket.id}. Total users: ${connectedUsers}`);
        io.emit('status', connectedUsers === 2 ? 'connected' : 'connecting');
    });
});

server.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});
