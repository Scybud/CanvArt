import { supabase } from "../supabase.js";
import { toastMsg } from "../components/toast.js";
import { loadComponent } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { setButtonLoading } from "../utils/button.js";

async function isUsernameTaken(username) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error(error);
    return;
  }
  return !!data; // true if exists
}

//Signup funtion
async function signup(username, name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        name: name,
      },
    },
  });

  if (error) {
    toastMsg(error.message, "error");
    return false;
  }

  toastMsg("Account created successfully!", "success");
  return true;
}

//Signup form
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document
      .getElementById("signupUsernameInput")
      .value.trim()
      .toLowerCase();
    const name = document.getElementById("signupNameInput").value.trim();
    const email = document.getElementById("userSignupEmailInput").value.trim();
    const password = document
      .getElementById("userSignupPasswordInput")
      .value.trim();
    const confirmPassword = document
      .getElementById("userSignupConfirmPasswordInput")
      .value.trim();

    const usernameRegex = /^[a-z0-9_]{3,20}$/;

    if (!username || !name || !password || !email || !confirmPassword) {
      toastMsg("All fields must not be empty", "error");
      return;
    } else if (!usernameRegex.test(username)) {
      toastMsg(
        "Username must be 3-20 characters and contain only letters, numbers, or underscores.",
        "error",
      );
      return;
    } else if (await isUsernameTaken(username)) {
      const usernameFeedback = document.getElementById("usernameFeedback");
      usernameFeedback.textContent = "Username already taken";
      usernameFeedback.classList.add("error");

      toastMsg("Username already taken", "error");
      return;
    } else if (!email.includes("@")) {
      toastMsg("Please enter a valid email", "error");
      return;
    } else if (password != confirmPassword) {
      toastMsg("Passwords do not match", "error");
      return;
    } else if (password.length < 6) {
      toastMsg("Password must be at least 6 characters", "error");
      return;
    }

    //disable button
    const button = signupForm.querySelector("button");
    setButtonLoading(button, true);

    try {
      const success = await signup(username, name, email, password);

      if (success) {
        // After successful login/signup:
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirect");

        if (redirectTo) {
          // Send them back to the invite page with the token
          window.location.href = decodeURIComponent(redirectTo);
        } else {
          // Default behavior
          window.location.href = "../explore";
        }
      }
    } finally {
      setButtonLoading(button, false);
    }
  });
}
