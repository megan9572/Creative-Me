var user = firebase.auth().currentUser;

firebase.auth().onAuthStateChanged(function(user) {

	var user = firebase.auth().currentUser;
	
	//display chatroom messages
	var chatSort = (document.getElementById("chatHeader").innerHTML) + "_chatroom";
	firebase.database().ref(chatSort).on('value', function(snapshot){
		var data = snapshot.val();
		build = "";
		for(var key in data){
			build += "<p style='display: inline;'><b>" + data[key].user + "</b>: " + data[key].msg +
			"<p style='color: grey; float: right; font-size: 10px;'>" + data[key].time + "</p></p>";
		}
	document.getElementById("divChat").innerHTML = build;
	});
	
	if(user) {
		document.getElementById("message").disabled = false;
		document.getElementById("message").placeholder = "Enter message";
		document.getElementById("btnChat").disabled = false;
	}
	else {
		document.getElementById("message").disabled = true;
		document.getElementById("message").placeholder = "Sign in to write here";
		document.getElementById("btnChat").disabled = true;
	}
	
});

//CHATROOM
function submitChatText(){
	
	var user = firebase.auth().currentUser;
	var username;
	var chatSort = (document.getElementById("chatHeader").innerHTML) + "_chatroom";
	
	firebase.database().ref("users/" + user.uid + "/username").on("value", function(snapshot) {
		username = snapshot.val();
	});
	
	var message = document.getElementById("message").value;
	
	firebase.database().ref().child(chatSort).push(
		{
			"user": username,
			"msg": message,
			"time": new Date().toLocaleString()
		}
	)
}