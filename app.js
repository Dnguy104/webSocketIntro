window.onload = function() {

	// Get references to elements on the page.
	var form = document.getElementById('message-form');
	var messageField = document.getElementById('message');
	var messagesList = document.getElementById('messages');
	var socketStatus = document.getElementById('status');
	var closeBtn = document.getElementById('close');

	var socket = new WebSocket('ws://echo.websocket.org');
	
	socket.onopen = function(event) {
		socketStatus.innerHTML = 'Connected to: ' + event.currentTarget.url;
		socketStatus.className = 'open';
	};
	
	socket.onerror = function(error) {
		console.log('WebSocket Error: ' + error);
	};

	form.onsubmit = function(e) {
		e.preventDefault();
		var message = messageField.value;
		socket.send(message);
		return false;
	};
	
	socket.onmessage = function(event) {
		var message = event.data;
		
	};
	
	socket.onclose = function(event) {
		
	};
	
	closeBtn.onclick = function(e) {
		e.preventDefault;
		
		socket.close();
		
		return false;	
	};
	

};