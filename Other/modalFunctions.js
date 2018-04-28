var thumbnail;
var theKey;
var theUserUID;
var user = firebase.auth().currentUser;

//OPENS MODAL & DISPLAYS PROJECT INFO
function openModal(obj, mediaKey, creatorUID, creatorName, projectType) {
	theKey = mediaKey;
	theUserUID = creatorUID;
	var dbRef = firebase.database().ref();
	var projectDescription;
	var numLikes;
	
	document.getElementById("myModal").style.display = "block";
	
	//IF PROJECT IS IMAGE
	if(projectType === "Art" || projectType === "Digital_Art") {
		document.getElementById("modalProjectDiv").innerHTML = "<img src=\"" + obj.src + "\">";
		document.getElementById("modalProjectTitle").innerHTML = obj.parentElement.nextElementSibling.innerHTML;
	}
	//IF PROJECT IS VIDEO
	else if(projectType === "Film_Video") {
		document.getElementById("modalProjectDiv").innerHTML = "<video controls><source src=\"" + obj.lastChild.src + "\"></video>";
		document.getElementById("modalProjectTitle").innerHTML = obj.parentElement.nextElementSibling.innerHTML;
	}
	//IF PROJECT IF PDF
	else if(projectType === "Writing") {
		document.getElementById("modalProjectDiv").innerHTML = "<embed src=\"" + obj.previousElementSibling.src + "\" type='application/pdf'/></object>";
		document.getElementById("modalProjectTitle").innerHTML = obj.parentElement.parentElement.nextElementSibling.innerHTML;
	}
	
	//COMMENTS
	dbRef.child("users/" + creatorUID + "/media/" + mediaKey + "/comments").on("value", function(snapshot) {
		var data = snapshot.val();
		var build = "";
		for(var input in data) {
			build += "<p style='display: inline;'><b>" + data[input].submittedBy + "</b>: " + data[input].comment +
			"<p style='color: grey; float: right; font-size: 10px;'>" + data[input].ts + "</p></p>";
		}
		document.getElementById("modalComments").innerHTML = build;
	});
	
	//DESCRIPTION
	dbRef.child("users/" + creatorUID + "/media/" + mediaKey + "/description").on("value", function(dataSnapshot) {
		projectDescription = dataSnapshot.val();
		document.getElementById("projectDescription").innerHTML = projectDescription + 
				"<span style='font-style: italic; font-size: 10px; color: grey'> &mdash;" + creatorName + "</span>";
	});
	
	//NUMBER OF LIKES
	dbRef.child("users/" + creatorUID + "/media/" + mediaKey + "/numLikes").on("value", function(valSnapshot) {
		numLikes = valSnapshot.val();
		if (numLikes >= 1000) {
			numLikes = numLikes/1000 + "k";
		}
		document.getElementById("displayLikes").innerHTML = numLikes;
	});
	
	var user = firebase.auth().currentUser;
	//DISPLAYS IF USER PREVIOUSLY LIKED PROJECT
	dbRef.child("users/" + user.uid + "/liked_projects").on("value", function(likeSnapshot) {
		if(likeSnapshot.val() != null) {
			projectList = likeSnapshot.val();
			if(projectList.includes(mediaKey)) {
				document.getElementById("displayLikes").style.color = "red";
				document.getElementById("likeBtn").style.background = "#FFB6C1";
			}
			else {
				document.getElementById("displayLikes").style.color = "";
				document.getElementById("likeBtn").style.background = "";
			}
		}
	});
	
}
firebase.auth().onAuthStateChanged(function(user) {
	
	var user = firebase.auth().currentUser;
	var dbRef = firebase.database().ref();
	var projectList = [];
	
	if (user) {
		// User is signed in.
		document.getElementById("likeBtn").disabled = false;
		document.getElementById("commentTxt").disabled = false;
		document.getElementById("commentTxt").placeholder = "Write your comment here";
		document.getElementById("btnComment").disabled = false;
	}
	else {
		// No user is signed in.
		document.getElementById("likeBtn").disabled = true;
		document.getElementById("commentTxt").disabled = true;
		document.getElementById("commentTxt").placeholder = "Sign in to comment";
		document.getElementById("btnComment").disabled = true;
	}
	
});

//CLOSES MODAL IF CLICKED OUTSIDE
window.onclick = function(event) {
	var modal = document.getElementById("myModal");
    if(event.target == modal) {
        modal.style.display = "none";
    }
}

//SUBMIT COMMENTS ON IMAGE
function submitComment(){
	
	var user = firebase.auth().currentUser;
	var dbRef = firebase.database().ref();
	var username;

	var comment = document.getElementById("commentTxt").value;
	dbRef.child("users/" + user.uid + "/username").on("value", function(snapshot) {
		username = snapshot.val();
	});
	
	dbRef.child("users/" + theUserUID + "/media/" + theKey + "/comments").push({
		submittedBy: username,
		comment: comment,
		ts : new Date().toLocaleString()
	});
	document.getElementById("commentTxt").value = "";
}

//GIVE "LIKE" OR UNDO "LIKE" & STORE LIKED PROJECTS
function likeThis(){
	
	var numLikes;
	var projectList = [];
	var user = firebase.auth().currentUser;
	var dbRef = firebase.database().ref();
	
	dbRef.child("users/" + theUserUID + "/media/" + theKey + "/numLikes").on("value", function(dataSnapshot) {
		numLikes = dataSnapshot.val();
	});
	dbRef.child("users/" + user.uid + "/liked_projects").once("value", function(snapshot) {
		if(snapshot.val() != null) {
			projectList = snapshot.val();
		}
	});
	if(projectList.includes(theKey)) {
		numLikes--;
		var index = projectList.indexOf(theKey);
		projectList.splice(index, 1);
		document.getElementById("displayLikes").style.color = "";
		document.getElementById("likeBtn").style.background = "";
	}
	else {
		numLikes++;
		projectList.push(theKey);
		document.getElementById("displayLikes").style.color = "red";
		document.getElementById("likeBtn").style.background = "#FFB6C1";
	}
	dbRef.child("users/" + user.uid + "/liked_projects/").set(projectList);
	dbRef.child("users/" + theUserUID + "/media/" + theKey).update({
		numLikes: numLikes
	});

}