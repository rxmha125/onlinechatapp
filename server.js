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

    socket.emit('userId', socket.id);

    io.emit('status', connectedUsers === 2 ? 'connected' : 'connecting');

    socket.on('message', (msg) => {
        const messageData = { ...msg, senderId: socket.id };
        console.log('Message received:', messageData); // Debugging
        socket.broadcast.emit('message', messageData);
    });

    socket.on('replyMessage', (data) => {
        console.log('Reply received:', data); // Debugging
        io.to(data.originalSenderId).emit('replyMessage', {
            replyText: data.replyText,
            originalMessageId: data.originalMessageId,
            senderId: socket.id,
        });
    });

    socket.on('messageSeen', (data) => {
        console.log('messageSeen received:', data); // Debugging
        io.to(data.senderId).emit('messageSeen', { messageId: data.messageId });
    });

    socket.on('disconnect', () => {
        connectedUsers--;
        console.log(`User disconnected with ID: ${socket.id}. Total users: ${connectedUsers}`);
        io.emit('status', connectedUsers === 2 ? 'connected' : 'connecting');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
