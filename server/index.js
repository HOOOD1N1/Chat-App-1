const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//socket.io code below

io.on('connection', (socket) => {
	console.log('We have a new connection!!');
	socket.on('join', ( {name, room}, callback ) => {
		const { error, user} = addUser({id: socket.id, name, room});
		if(error) return callback(error);
		//if there is no error, then we connect the new user and we emit an admin message
		socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the room ${user.room}` });
		socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name}, has joined`}); // broadcasts(sends message to all besides the specific user)  

		socket.join(user.room); // if there is no error, a new user will join, and the room is passed as a parameter 
		
		io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
		//const error = true;

		//if(error) {
		//	callback({error: 'error'});//error handling to Chatjs
		//}
	callback();
	});

	//events for user-generated messages
	socket.on('sendMessage', (message, callback) => {
		const user= getUser(socket.id);

		io.to(user.room).emit('message', { user: user.name, text: message});
		io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
		callback();
	}); 

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if(user) {
			io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left.`})
		}
	});
});



//socket.io code above
app.use(router);

server.listen(process.env.PORT || 5000, () => console.log(`Server has started on port ${PORT}`));