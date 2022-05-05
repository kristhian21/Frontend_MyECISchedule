localStorage.setItem("guardado", false);
var des = localStorage.getItem("descriptioactualitem");
document.getElementById("task").innerHTML = des;

function save() {
  localStorage.setItem(
    "descriptioactualitem",
    document.getElementById("task").value
  );
  localStorage.setItem("guardado", true);
  window.close();
}
