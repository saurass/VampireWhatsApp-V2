const socket = io('http://localhost:3000');

function getQRcode(){
	socket.emit("get_QR_code", {
		payload: "NOT REQUIRED"
	});
}

function isLoggedIn(){
	socket.emit("get_login_status", {
		payload: "NOT REQUIRED"
	});
}

function sendTextMessage(){
	var count = document.getElementById('count').value;
	while(count--) {
		socket.emit("send_text_message", {
			message: document.getElementById('msg').value,
			mobile_number: document.getElementById('mn').value,
			type: "text"
		});
	}
}

function sendFileMessage(){
	var count_file = document.getElementById('count_file').value;
	while(count_file--) {
		socket.emit("send_file_message", {
			file_link: document.getElementById('link').value,
			mobile_number: document.getElementById('mnf').value,
			type: document.getElementById('type').value,
			caption: document.getElementById('caption').value
		});
	}	
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
		var payload = chat.messages;
		if(!payload.length) {
			var str = '<h3>Chat -- ' + chat.chat + '</h3><p style="color: red">You have turned this contact silent</p>'
		} else {
			var str = '<h3>Chat -- ' + chat.chat + '<br><button onclick="sendSeenRep(\'' + payload[0].from + '\')">Send Seen</button></h3>';
		}
		var msgs = '';
		chat.messages.forEach(msg => {
			msgs = msgs + 'contact -- ' + msg.contact + '<br>from -- ' + msg.from + '<br>message -- ' + msg.message + '<br><br>';
		});
		str = str + msgs;
		html = html + str + '<hr>';
	});
	document.getElementById('msgss').innerHTML = html;
}

function displayQRcode(data) {
	var img_ele = document.createElement('IMG');
	img_ele.src = data;
	var qr_img = document.getElementById('qr_img');
	if(!qr_img.hasChildNodes())
		qr_img.appendChild(img_ele);
	else
		qr_img.replaceChild(img_ele ,qr_img.childNodes[0]);
}

socket.on("get_unread_response", (data) => {
	displayUnread(data);
});

socket.on("get_QR_code_response", (data) => {
	if(data != false)
		displayQRcode(data);
	else
		document.getElementById('qr_img').innerHTML = '<h3>Logged In</h3>';
})

socket.on("is_logged_in_response", (data) => {
	alert(data);
})

setInterval(() => {
	getUnreadReplies();
	getQRcode();
}, 1000);