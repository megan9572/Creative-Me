var user = firebase.auth().currentUser;

//USER STATE
firebase.auth().onAuthStateChanged(function(user) {
	
	var user = firebase.auth().currentUser;

	if (user) {
		// User is signed in.
		document.getElementById("divLogout").style.display = "block";
		document.getElementById("divLogin").style.display = "none";
		
		var userDbRef = firebase.database().ref("users/" + user.uid);
		
		//display username on navbar
		userDbRef.child("username").on("value", function(snapshot) {
			document.getElementById("aUserProfile").innerHTML = "Hello: " + snapshot.val();
		});
	}
	else {
		// No user is signed in.
		document.getElementById("divLogout").style.display = "none";
		document.getElementById("divLogin").style.display = "block";
	}
	
});

//SIGN UP
function signUp() {
	
	var email = document.getElementById("txtEmail").value;
	var password = document.getElementById("txtPassword").value;
	var firstName = document.getElementById("txtFirstName").value;
	var lastName = document.getElementById("txtLastName").value;
	var username = document.getElementById("txtUsername").value;
	
	if (!email || !password) {
		alert("email and password required");
	}
	
	//Register user
	var firebaseDb = firebase.database().ref();
	firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
		alert("Created user: " + username);
		firebaseDb.child("users/" + user.uid).set({
			email: user.email,
			password: password,
			username: username,
			registered_on: new Date().toLocaleString(),
			first_name: firstName,
			last_name: lastName
		});
		location.reload();
	}).catch(function(error) {
		console.log("register error", error);
	});
	
}

//LOG IN
function login() {
	
	var email = document.getElementById("txtEmailLogin").value;
	var pass = document.getElementById("txtPasswordLogin").value;

	firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
		var errorMessage = error.message;
		alert("Error : " + errorMessage);
	});
  
}

//LOG OUT
function logout() {
	
	firebase.auth().signOut();
	alert("Logged out successfully");
	location.reload();
	
}

//PROFILE EDIT
function editDescription() {
	
	var descriptionDisplayed = document.getElementById("pDescriptionDisplay").innerHTML;
	
	document.getElementById("divEditDescription").style.display = "block";
	document.getElementById("divDisplayDescription").style.display = "none";
	
	document.getElementById("txtaDescription").innerHTML = descriptionDisplayed;
}
function submitDescription() {
	var user = firebase.auth().currentUser;
	
	var descriptionText = document.getElementById("txtaDescription").value;
	firebase.database().ref("users/" + user.uid + "/profile_page").set ({
		description: descriptionText
	});
	descriptionText = descriptionText.replace(/\r?\n/g, '<br />');
	
	document.getElementById("divEditDescription").style.display = "none";
	document.getElementById("divDisplayDescription").style.display = "block";
	document.getElementById("pDescriptionDisplay").innerHTML = descriptionText;
		
}

//DISPLAYING USER IMAGES ON TITLE PAGES
function displayEx() {

	var dbRef = firebase.database().ref();
	var storageRef = firebase.storage().ref();
	var thumbnail = document.getElementsByClassName("thumbnail");
	var projectTitle = document.getElementsByClassName("projectTitle");
	var projectCount;
	var titles = {};
	
	dbRef.on("value", function(snapshot) {
		var userData = snapshot.val().users;
		for(var key in userData) {
			dbRef.child("users/" + key).on("value", function(dataSnapshot) {
				var mediaData = dataSnapshot.val().media;
				for(var input in mediaData) {
					titles[key + "%2F" + mediaData[input].type + "%2F" + mediaData[input].imgPath.replace(/ /g,"%20")] = 
										[mediaData[input].title, input, key, userData[key].username, mediaData[input].type, mediaData[input].numID];
					storageRef.child(key + "/" + mediaData[input].type + "/" + mediaData[input].imgPath).getDownloadURL().then(function(url) {
						var test = url;
						var ending = test.indexOf('?', 75);
						var key = test.substring(75, ending);
						dbRef.child("mediaCount/" + titles[key][4] + "/project_count").on("value", function(numSnapshot) {
							projectCount = numSnapshot.val();
							var imgPos = projectCount - titles[key][5] - 1;
							if(titles[key][5] >= projectCount - 12 && document.body.id === titles[key][4]) {
								if(titles[key][4] === "Art" || titles[key][4] === "Digital_Art") {
									thumbnail[imgPos].innerHTML = "<img src=\"" + test + "\" onclick='openModal(this,\"" + 
														titles[key][1] + "\",\"" + titles[key][2] + "\",\"" + titles[key][3] + "\",\"" + titles[key][4] +"\")'/>";
								}
								else if(titles[key][4] === "Film_Video"){
									thumbnail[imgPos].innerHTML = "<video controls onclick='openModal(this,\"" + titles[key][1] + "\",\"" + titles[key][2] + 
																"\",\"" + titles[key][3] + "\",\"" + titles[key][4] + "\")'><source src=\"" + test + "\"></video>";
								}
								else if(titles[key][4] === "Writing"){
									thumbnail[imgPos].innerHTML = "<div><embed src=\"" + test + "\" type='application/pdf'><button class='btn' onclick='openModal(this,\"" + 
														titles[key][1] + "\",\"" + titles[key][2] + "\",\"" + titles[key][3] + "\",\"" + titles[key][4] + "\")'>View More</button></div>";
								}
								projectTitle[imgPos].innerHTML = titles[key][0];
								return;
							}
						});
					});
				}
			});
		}
	});
}

function editQuestion() {
	
	var descriptionDisplayed = document.getElementById("pDescriptionQuestion").innerHTML;
	
	document.getElementById("divEditQuestion").style.display = "block";
	document.getElementById("divDisplayQuestion").style.display = "none";
	
	document.getElementById("txtaQuestion").innerHTML = descriptionDisplayed;
}

function submitQuestionText(){
	var user = firebase.auth().currentUser;
	
	var descriptionText = document.getElementById("txtaQuestion").value;
	firebase.database().ref("users/" + user.uid + "/community_page").set ({
		Question: descriptionText
	});
	descriptionText = descriptionText.replace(/\r?\n/g, '<br />');
	
	document.getElementById("divEditQuestion").style.display = "none";
	document.getElementById("divDisplayQuestion").style.display = "block";
	document.getElementById("pDescriptionQuestion").innerHTML = descriptionText;
}

function submitChatQueText(){
	
	var user = firebase.auth().currentUser;
	var descriptionQuestion = document.getElementById("Question1").value;
	firebase.database().ref("users/" + user.uid + "/community_page").set ({
		Question2: descriptionQuestion
	});
	descriptionQuestion = descriptionQuestion.replace(/\r?\n/g, '<br />');
	
	
	document.getElementById("divChat").innerHTML = descriptionQuestion;
}
