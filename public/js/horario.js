function openkanban(number) {
  sessionStorage.setItem("kanban", number);
  window.location.href = "/kanbanView.html";
}
