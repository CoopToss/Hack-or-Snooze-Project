"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  try {
    // Attempt to log in the user
    currentUser = await User.login(username, password);
    
    // Reset the login form
    $loginForm.trigger("reset");

    // Save user credentials in local storage
    saveUserCredentialsInLocalStorage();

    // Update UI for logged-in user
    updateUIOnUserLogin();
  } catch (error) {
    // Handle login error
    if (error.response.status === 401) {
      // Unauthorized: Incorrect credentials
      alert("Incorrect username or password. Please try again.");
    } else {
      // Other errors
      console.error("Login failed:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  }
}


$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  try {
    // Attempt to sign up the user
    currentUser = await User.signup(username, password, name);

    // Save user credentials in local storage
    saveUserCredentialsInLocalStorage();

    // Update UI for logged-in user
    updateUIOnUserLogin();

    // Reset the signup form
    $signupForm.trigger("reset");
  } catch (error) {
    // Handle signup error
    if (error.response.status === 409) {
      // Conflict: Username already exists
      alert("The username is already taken. Please choose a different one.");
    } else {
      // Other errors
      console.error("Signup failed:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  }
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users & profiles
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

async function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents();

  // re-display stories (so that "favorite" stars can appear)
  putStoriesOnPage();
  $allStoriesList.show();

  updateNavOnLogin();
  generateUserProfile();
  $storiesContainer.show()
}

/** Show a "user profile" part of page built from the current user's info. */

function generateUserProfile() {
  console.debug("generateUserProfile");

  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}
