import { supabase } from "../supabase.js";
import { toastMsg } from "../components/toast.js";
import { setButtonLoading } from "../utils/button.js";

//login funtion
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toastMsg(error.message, "error");
    return false;
  }

  return true;
}

//Login form
export function loginFuntion() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("userLoginEmailInput").value.trim();
      const password = document
        .getElementById("userLoginPasswordInput")
        .value.trim();

      if (!password || !email) {
        toastMsg("All fields must not be empty", "error");
        return;
      }

      const button = document.getElementById("loginBtn");
      setButtonLoading(button, true);

      try {
        const success = await login(email, password);

        if (success) {
          // After successful login/signup:
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get("redirect");

          if (redirectTo) {
            // Send them back to the invite page with the token
            window.location.href = decodeURIComponent(redirectTo);
          } else {
            // Default behavior
            window.location.href = "../";
          }
        }
      } finally {
        setButtonLoading(button, false);
      }
    });
  }
}
loginFuntion();

//signout
async function signout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }
  toastMsg("Logged out successfully!", "success");

  setTimeout(() => {
    window.location.href = "/auth/";
  }, 3000);
}

export function attachSignoutEvents() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#logoutBtn");

    if (btn) {
      signout();
    }
  });
}
