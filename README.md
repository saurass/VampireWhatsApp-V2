<p align="center">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSpkzb6HDiERinGs5C5RjWMYMndyHh0ZrUml7PwIHDaxdRxgdK">
</p>

# VampireWhatsApp-V2
Web WhatsApp automation tool -- using Selenium-webdriver over Socket IO -- lightining fast messaging over WhatsApp.

## What's New
Earlier I made a project using pusher and selenium-webdriver to automate whatsapp web for sending messages over whatsapp.
But it had flaws in it -
1. For sending each new message you got to refresh the whole page again and again, which implies a lot a time to send each whatsapp message or file.
2. the code highly depended upon css of the DOM, which rapidly keeps changing.
3. Most important of all it didn't have proper error handling etc.

Now in the new release following features have been added -
1. Lightining speed text and file sending.
2. No dependency on DOM of web whatsapp.
3. can send to any new mobile number  without even refresh.
4. you can send seen to any message.
5. get all unread messages.
6. Use of Socket IO, which makes it's integration with any tech very simple.
7. send any file from internet, just by giving link of the file.

## Installing
1.  Download and Install [NodeJS](https://nodejs.org/en/download/).
2.  Download [Chrome Driver](http://chromedriver.chromium.org/downloads) latest version as per your system. (Mac/Linux/Windows)
3.  Place the downloaded driver in ChromeDriver Folder in Project.
4.  Set global path variable for this folder (ChromeDriver folder) in your system.
5.  Run 'npm install' in root directory of the project.

## Getting Started
1.  The socket client must send data in following format which contains following parameters as json --
    a) To send text messages (country code to be added in start)
    ```
    EVENT: 'send_text_message'
    {
      message: 'YOUR MESSAGE HERE',
      mobile_number: '91XXXXXXXXXX'
    }
    ```

    b) To send files (country code to be added in start)
    ```
    EVENT: 'send_file_message'
    {
      message: 'YOUR MESSAGE HERE',
      mobile_number: '91XXXXXXXXXX',
      type: 'FILE MIME TYPE',
      caption: 'FILE CAPTION (ONLY IN CASE OF IMAGES and VIDEOS)'
    }
    ```
          
    c) To get all unread messages
    ```
    EVENT: 'get_unread_replies'
    {
      payload: 'not required'
    }
    RESPONSE EVENT: 'get_unread_response'
    ```
    
    d) To send seen (country code to be added in start)
    ```
    EVENT: 'send_seen_reply'
    {
      msg_id: 'msg id you get form the response of the event "get_unread_response"'
    }
    ```
2.  run 'node index.js' in cmd in root directory of the project.
3.  For the first time you need to scan QR code from your mobile.
4.  Now as the request is sent through socket the driver will start executing as per server command.
5.  Wooolaaah....!!! You are done now.
6.  Go to `localhost:3000` in your browser and send bulk messages.


## Note
1.  Donot close the chrome instance else you will have to rescan the QR code.
2.  In case of ubuntu provide proper permission to files directory in project.
3.  Do not leave any entries blank, else it may crash server

## Contributing
  Please contribute to this repo and also feel free to raise issues.
  Merge request will be accepted only after proper testing.
    
## Author
SAURASS (Saurabh Srivastava)
