function logout() {
  sessionStorage.removeItem("User");
  window.location.href = "/";
}
