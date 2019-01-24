/*
|=================================================================
|   +  Including all the requires here --
|=================================================================
|      1-   download-file
|      2-   selenium-webdriver
|      3-   express
|      4-   socket.io
|=================================================================
*/
// const Downloader = require("filedownloader");
const download = require('download-file');
const Webdriver = require("selenium-webdriver");
const By = Webdriver.By;
const until = Webdriver.until;
const fs = require("fs");
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');


const port  = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'example/test.html');

/*
|=================================================================
|   +  constants to be set each time Vampire is teased --
|=================================================================
|      1-   mobile_number
|      2-   type
|      3-   caption (if required)
|=================================================================
*/
var mobile_number;
var type;
var caption;

/*
|=================================================================
|   +  Initialize socket here --
|=================================================================
*/
const server = express()
  .use(express.static(path.join(__dirname, 'example')))
  .get('/' ,(req, res) => res.sendFile(INDEX) )
  .listen(port, () => console.log(`VampireWhatsApp listening on port ${ port }`));

const io = socketIO(server);

/*
|=================================================================
|   +  Listening to any connection & activity on socket IO --
|=================================================================
*/
io.on('connection', socket => {
    /*
    |-------------------------------------------------------------
    |   ~  event to send text message
    |-------------------------------------------------------------
    */
    socket.on('send_text_message', msg => {
        message = msg.message;
        type = 'text';
        mobile_number = msg.mobile_number;
        decisionMaker(type, message, mobile_number);
    });

    /*
    |-------------------------------------------------------------
    |   ~  event to send files
    |-------------------------------------------------------------
    */
    socket.on('send_file_message', msg => {
        message = msg.file_link;
        type = msg.type;
        mobile_number = msg.mobile_number;
        caption = msg.caption;
        decisionMaker(type, message, mobile_number);
    });

    /*
    |-------------------------------------------------------------
    |   ~  event to get all unread messages
    |-------------------------------------------------------------
    */
    socket.on('get_unread_replies', msg => {
        var unreadReplies = getUnreadReplies(data => {
            io.emit('get_unread_response', data);
        });
    });

    /*
    |-------------------------------------------------------------
    |   ~  to send seen reply to unseen message
    |-------------------------------------------------------------
    */
    socket.on('send_seen_reply', msg => {
        sendSeenNotification(msg);
    });

    /*
    |-------------------------------------------------------------
    |   ~  to get QR code
    |-------------------------------------------------------------
    */
    socket.on('get_QR_code', () => {
        getQRCode(data => {
            io.emit('get_QR_code_response', data);
        });
    });

    /*
    |-------------------------------------------------------------
    |   ~  to get login status
    |-------------------------------------------------------------
    */
   socket.on('get_login_status', () => {
    isLoggedIn(data => {
        io.emit('is_logged_in_response', data);
    });
});
});

/*
|=================================================================
|   +  Initializing selenium webdriver
|      -  Redirecting to web whatsapp
|=================================================================
*/
var driver = new Webdriver.Builder().forBrowser("chrome").build();
driver.get("https://web.whatsapp.com");
console.log("Welcome To Vampire WhatsApp");
    /*
    |-------------------------------------------------------------
    |   ~  injecting automation code to browser console
    |-------------------------------------------------------------
    */
fs.open('./assets/whatsapp.js', 'r', function(err, fileToRead) {
    fs.readFile(fileToRead, {
        encoding: "utf-8"
    }, (err, data) => {
        var scriptToEcecute = data;
        driver.executeScript(scriptToEcecute);
    })
});

/*
|=================================================================
|   +  Deciding the function call based on text or file message
|=================================================================
*/
function decisionMaker(type, message, mobile_number) {
    if (type === 'text')
        sendText(message, mobile_number);
    else
        sendFile(message, mobile_number, type);
}

/*
|=================================================================
|   +  Sending text message
|=================================================================
*/
function sendText(message, mobile_number) {
    var scriptToSendText = "var callback = arguments[arguments.length - 1];window.WAPI.sendMessageToID('" + mobile_number + "@c.us', '" + message.replaceAll('BREAK_LINE', '\\n') + "',function(data){callback(data);})";
    var r = driver.executeScript(scriptToSendText);
}

/*
|=================================================================
|   +  Sending file message -- requires various function call
|=================================================================
*/
function sendFile(fileLink) {
    downloadFile(fileLink);
}
/*
|-----------------------------------------------------------------
|   ~  Download file from link given -- link with file's extension
|-----------------------------------------------------------------
*/
function downloadFile(fileLink) {
    var base64enc;
    var fileUrl = fileLink;
    var fileSavePath = __dirname + "/files/";
    var option = {
        directory: fileSavePath
    };
    download(fileUrl, option, err => {
        if(err)
            console.log(err);
        else
            base64enc = base64_encode(fileLink, type, mobile_number);
    });
}

/*
|-----------------------------------------------------------------
|   ~  Base64 conversion function
|-----------------------------------------------------------------
*/
function base64_encode(fileLink) {
    var file_name = fileLink.substring(fileLink.lastIndexOf("/") + 1);
    var bitmap = fs.readFileSync('./files/' + file_name);
    var buf_base64 = new Buffer(bitmap).toString('base64');
    send_file(buf_base64, file_name);
}

/*
|-----------------------------------------------------------------
|   ~  Trigger send file on browser console with base64 encode
|-----------------------------------------------------------------
*/
function send_file(buf_base64, file_name) {
    var scriptToSendText = "var callback = arguments[arguments.length - 1];window.WAPI.sendImage('data:" + type + ";base64," + buf_base64 + "', '" + mobile_number + "@c.us', '" + file_name + "', '" + caption.replaceAll('BREAK_LINE', '\\n') + "', function(data){callback(data);})";
    driver.executeScript(scriptToSendText);
}

/*
|=================================================================
|   +  To get all unread message as 'get_unread_response' event
|=================================================================
*/
function getUnreadReplies(done) {
    var scriptToSendText = "var callback = arguments[arguments.length - 1];window.WAPI.getUnreadMessages2(function(data){callback(data);})";
    var unread_data = [];
    driver.executeAsyncScript(scriptToSendText).then(data => {
        data.forEach(single_chat_data => {

            var chat = single_chat_data.formattedName;
            var isGroup = single_chat_data.isGroup;
            var msgs = [];
            single_chat_data.messages.forEach(each_msg => {
                var msg_load = each_msg.body;
                var contact = each_msg.contact;
                var obs = {
                    contact: contact,
                    message: msg_load,
                    from: each_msg.from
                };
                msgs.push(obs);
            });

            var obj = {
                chat: chat,
                isGroup: isGroup,
                messages: msgs
            };
            unread_data.push(obj);
        });
        if (done !== undefined)
            done(unread_data);
        else
            return unread_data;
    });
}

/*
|=================================================================
|   +  To get QR code 'get_QR_code_response' event
|=================================================================
*/
function getQRCode(done) {
    if(!isLoggedIn()) {
        var scriptToGetQRcode = "var callback = arguments[arguments.length - 1];window.WAPI.getQRcodesrc(function(data){callback(data);})";
        var r = driver.executeAsyncScript(scriptToGetQRcode).then(data => {
            done(data);
        });
    } else {
        done(false);
    }
}

/*
|=================================================================
|   +  To get login status 'is_logged_in_response' event
|=================================================================
*/
function isLoggedIn(done) {
    var scriptToGetLoginStatus = "var callback = arguments[arguments.length - 1];window.WAPI.isLoggedIn(function(data){callback(data);})";
    var r = driver.executeAsyncScript(scriptToGetLoginStatus).then(data => {
        if(done !== undefined)
            done(data);
        else
            return data;
    });
}

/*
|=================================================================
|   +  To send seen to messages - you require message ID
|       - message ID can be found in 'from' param from
|         'get_unread_response' event on Socket IO
|=================================================================
*/
function sendSeenNotification(msg) {
    var chat_to_see = msg.msg_id;
    var scriptToSendSeen = "var callback = arguments[arguments.length - 1];window.WAPI.sendSeen('" + chat_to_see + "', function(data){callback(data);})";
    driver.executeScript(scriptToSendSeen);
}

/*
|=================================================================
|   +  Utils here !!!
|=================================================================
*/
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};