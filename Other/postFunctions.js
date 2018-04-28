var user = firebase.auth().currentUser;

firebase.auth().onAuthStateChanged(function(user) {
	
	var user = firebase.auth().currentUser;
	var dbRef = firebase.database().ref();
	
	if (user) {
		// User is signed in.
		document.getElementById("btnUpload").disabled = false;
		document.getElementById("projectTitle").disabled = false;
		document.getElementById("projectTitle").placeholder = "Title of work";
		document.getElementById("projectDescription").disabled = false;
		document.getElementById("projectDescription").placeholder = "Description";
	}
	else {
		// No user is signed in.
		document.getElementById("btnUpload").disabled = true;
		document.getElementById("projectTitle").disabled = true;
		document.getElementById("projectDescription").disabled = true;
		document.getElementById("projectDescription").placeholder = "Sign in post projects";
	}
	
});

//STORING IMG INTO DATABASE AND STORAGE
function uploadFile(){
	
	var user = firebase.auth().currentUser;
	var uploader = document.getElementById("uploader");
	var fileButton = document.getElementById("fileButton");
	var projectTitle = document.getElementById("projectTitle").value;
	var projectDescription = document.getElementById("projectDescription").value;
	var projectCount = 0;
	
	var dbRef = firebase.database().ref();
	var storageRef = firebase.storage().ref();
	var file = document.getElementById("fileButton").files[0];
	
	var form = document.getElementById("categoryType");
	var category;
	for(var i = 0; i < form.length; i++) {
		if(form[i].checked && !(projectTitle === "") && !(file === undefined)) {
			category = form[i].value;
			dbRef.child("mediaCount/" + category + "/project_count").on("value", function(numSnapshot) {
				if(numSnapshot.val() != null) {
					projectCount = numSnapshot.val();
				}
			});
			var imgRef = storageRef.child(user.uid + "/" + category + "/" + file.name);
			var task = imgRef.put(file);
			task.on('state_changed', function progress(snapshot){
				var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				document.getElementById("myBar").style.width = parseInt(percentage) + '%'; 
				document.getElementById("myBar").innerHTML = parseInt(percentage)+'%';
			});
			task.then(function(){
				dbRef.child('users/' + user.uid + "/media").push({
					imgPath: file.name,
					type: category,
					title: projectTitle,
					description: projectDescription,
					numLikes: 0,
					numID: projectCount
				});
				alert("File successfully loaded: " + file.name);
				projectCount++;
				dbRef.child("mediaCount/" + category).set ({
					project_count: projectCount
				});
			});
			break;
		}
		else if(i == form.length - 1) {
			alert("ERROR: Choose a category, name file, and/or no file chosen");
		}
	}
	
}