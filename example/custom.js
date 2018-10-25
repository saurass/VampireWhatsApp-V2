const socket = io('http://localhost:3000');

function sendTextMessage(){
	socket.emit("send_text_message", {
		message: document.getElementById('msg').value,
		mobile_number: document.getElementById('mn').value,
		type: "text"
	});
}

function sendFileMessage(){
	socket.emit("send_file_message", {
		file_link: document.getElementById('link').value,
		mobile_number: document.getElementById('mnf').value,
		type: document.getElementById('type').value,
		caption: document.getElementById('caption').value
	});	
}

function getUnreadReplies(){
	socket.emit("get_unread_replies", {
		payload: 'NOT REQUIRED'
	});
}

function sendSeenRep(payload) {
	socket.emit('send_seen_reply', {
		msg_id: payload
	});
}

function displayUnread(data){
	var html = '';
	data.forEach(chat => {
		var payload = chat.messages[0].from;
		var str = '<h3>Chat -- ' + chat.chat + '<br><button onclick="sendSeenRep(\'' + payload + '\')">Send Seen</button></h3>';
		var msgs = '';
		chat.messages.forEach(msg => {
			msgs = msgs + 'contact -- ' + msg.contact + '<br>from -- ' + msg.from + '<br>message -- ' + msg.message + '<br><br>';
		});
		str = str + msgs;
		html = html + str + '<hr>';
	});
	document.getElementById('msgss').innerHTML = html;
}

socket.on("get_unread_response", (data) => {
	displayUnread(data);
});

setInterval(() => {
	getUnreadReplies();
}, 1000);