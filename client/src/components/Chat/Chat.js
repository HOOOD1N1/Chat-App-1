import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import './Chat.css';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages.js';
import TextContainer from '../TextContainer/TextContainer.js';

let socket;


const Chat = ({location}) => {
	// location is a prop from 
	const [name, setName] = useState('');
	const [room, setRoom] = useState('');
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [users, setUsers] = useState('');
	const ENDPOINT = 'localhost:5000';
	
	useEffect( () => {
		const {name, room} = queryString.parse(location.search); 
		socket = io(ENDPOINT);
		setName(name);
		setRoom(room);
		
		//socket.emit('join', {name, room}, ({ error }) => {
		//	alert(error);
		//}); // ES6 for name: name, room: room

		socket.emit('join', {name, room}, () => {
			
		}); // ES6 for name: name, room: room

		return () => {
			socket.emit('disconnect');	
			socket.off(); // deletes this instance of the socket
		}

	}, [ENDPOINT, location.search]);

	// More hooks for handling messages
	// the message payload contains an user and a text
	//that can be found at index.js
	useEffect(() => {
		socket.on('message', (message) => {
			setMessages([...messages, message]);//adds all new messages to array
		});
		socket.on("roomData", ({users}) => {
		setUsers(users);
		});
	}, [messages]); // run only when in messages there is a
	//change
	
	//function for sending messages
	const sendMessage = (event) => {
		event.preventDefault();

		if(message) {
			socket.emit('sendMessage', message, () => setMessage(''));
		}
	}

	console.log(message, messages);

	return (
		<div className = "outerContainer">
			<div className = "container">
				<InfoBar room={room} />
			{/* 
			<input value={message} onChange= {(event) => setMessage(event.target.value)}
				onKeyPress={(event) => event.key === 'Enter' ? sendMessage(event) : null} />
			*/}
				<Messages messages={messages} name={name}/>
				<Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>	
			</div>
			<TextContainer users={users}/>
		</div>
	);
}

export default Chat;