"use strict";

window.onload = function() {

    // for better performance - to avoid searching in DOM
    var content = document.getElementById('content');
    var input = document.getElementById('input');
    var status = document.getElementById('status');

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.innerHTML = '<p>Sorry, but your browser doesn\'t  support WebSockets.</p>';
        input.style.display = 'none';
        document.querySelector('span').style.display = 'none';
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.disabled = false;
        input.focus();
        var txt = document.createTextNode('Choose name:');
        status.removeChild(status.firstChild);
        status.appendChild(txt);
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.innerHTML = 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.';
    };

    connection.onmessage = function (message) {

        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            var txt = document.createTextNode(myName + ': ');
            status.removeChild(status.firstChild);
            status.appendChild(txt);
            status.style.color = myColor
            input.disabled = false;
            input.focus();

        } else if (json.type === 'history') { // entire message history
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                           json.data[i].color, new Date(json.data[i].time));
            }
            
        } else if (json.type === 'message') { // it's a single message
            input.disabled = false;  // let the user write another message
            addMessage(json.data.author, json.data.text,
                       json.data.color, new Date(json.data.time));
            input.focus();
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.addEventListener("keydown", function(e) {
        if (e.keyCode === 13) {
            var msg = input.value;
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            input.value = '';
            // disable the input field to make the user wait until server
            // sends back response
            input.disabled = true;

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            var txt = document.createTextNode('Error');
            status.removeChild(status.firstChild);
            status.appendChild(txt);
            input.disabled = true;
            input.value = 'Unable to comminucate with the WebSocket server.';
        }
    }, 3000);

    /**
     * Add message to the chat window
     */
    function addMessage(author, message, color, dt) {
        content.innerHTML += '<p><span style="color:' + color + '">' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>';
    };
    
};