try {
  var nombre = sessionStorage.getItem("User");
  if (nombre != null) {
    fetch("navbar.html")
      .then((res) => res.text())
      .then((text) => {
        text = text.replace("customer", nombre);
        document
          .getElementById("navbar")
          .insertAdjacentHTML("afterbegin", text);
      });
  } else {
    window.location.href = "/";
  }
} catch {
  window.location.href = "/";
}
