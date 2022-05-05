var kanban = (function () {
  var module = kanbanApi;
  var stompClient = null;
  var holding = false;
  var holder = null;

  class Packet {
    constructor(
      idtask,
      action,
      idcolumn,
      username,
      idcustomer,
      ipublic,
      description,
      kanban
    ) {
      this.idtask = idtask;
      this.idcustomer = idcustomer;
      this.ipublic = ipublic;
      this.description = description;
      this.action = action;
      this.idcolumn = idcolumn;
      this.username = username;
      this.kanban = kanban;
    }
  }

  function connectTopic() {
    console.info("Connecting to WS...");
    var socket = new SockJS("/stompendpoint");
    stompClient = Stomp.over(socket);
    //subscribe to /topic/newpoint when connections succeed
    stompClient.connect({}, function (frame) {
      console.log("Connected: " + frame);
      stompClient.subscribe(
        "/topic/kanban." + sessionStorage.getItem("kanban"),
        function (eventbody) {
          var packet = JSON.parse(eventbody.body);
          var newPacket = new Packet(
            packet.idtask,
            packet.action,
            packet.idcolumn,
            packet.username,
            packet.idcustomer,
            packet.ipublic,
            packet.description,
            sessionStorage.getItem("kanban")
          );
          verificarEvento(newPacket);
        }
      );
    });
  }

  function getKanbanData() {
    module.getKanban();
    loadEventListeners();
  }

  function insertItem(element) {
    var newItem = parseHtml(
      '<div id="item' +
        module.getTaskCont() +
        '" class="kanban-item">' +
        '<div id="t' +
        module.getTaskCont() +
        '" class="item-input" draggable="true" columnId="' +
        element.getAttribute("columnId") +
        '" taskId=""></div>' +
        '<div class="dropzone"></div>' +
        "</div>"
    );
    module.sumToCont();
    element.append(newItem);
  }

  function parseHtml(html) {
    var t = document.createElement("template");
    t.innerHTML = html;
    return t.content;
  }

  function creacionTask(task) {
    if (!holding) {
      holding = true;
      holder = document.querySelector(
        '[taskId="' + task.idtask + '"]'
      ).parentElement;
      localStorage.setItem("descriptioactualitem", "");
      var popUp = window.open(
        "/task.html",
        "liveMatches",
        "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=650,height=400"
      );
      popUp.onbeforeunload = function () {
        var info;
        if (localStorage.getItem("guardado")) {
          info = localStorage.getItem("descriptioactualitem");
          localStorage.removeItem("descriptioactualitem");
        } else {
          info = "Texto por defecto";
        }
        localStorage.removeItem("guardado");
        var taskid = task.idtask;
        holder.firstChild.innerHTML = info;
        var newPacket = new Packet(
          taskid,
          "C",
          holder.parentElement.getAttribute("columnid"),
          sessionStorage.getItem("User"),
          sessionStorage.getItem("userId"),
          true,
          info,
          sessionStorage.getItem("kanban")
        );
        $.ajax({
          type: "POST",
          url: "/api/kanban",
          data: JSON.stringify(newPacket),
          dataType: "json",
          contentType: "application/json; charset=utf-8",
        });
        console.log("NUMERO KANBAN: " + sessionStorage.getItem("kanban"));
        // stompClient.send("/app/kanban." + sessionStorage.getItem("kanban"), {}, JSON.stringify(newPacket));
        holding = false;
        holder = null;
        sessionStorage.removeItem("descriptioactualitem");
      };
    }
  }

  function loadEventListeners() {
    connectTopic();
    $(document).ready(function () {
      // Add button + click eventListener CREATE
      $(".kanban-column").on("click", ".add-item", function (event) {
        $.ajax({
          type: "POST",
          url:
            "/api/task/create?idcus=" +
            sessionStorage.getItem("userId") +
            "&idcolum=" +
            event.target.previousSibling.getAttribute("columnid"),
          success: function (data) {
            module.create(data);
            creacionTask(data);
          },
        });
      });
      // Add double click eventListeners UPDATE
      $(".items").on("dblclick", ".item-input", function (event) {
        // verificar isPublic en task
        if (event.target.getAttribute("draggable") == "true") {
          event.target.style.backgroundColor = "red";
          if (!holding) {
            holding = true;
            holder = event.target.parentElement;
            var taskid = event.target.getAttribute("taskId");
            var newPacket = new Packet(
              taskid,
              "M",
              event.target.getAttribute("columnId"),
              sessionStorage.getItem("User"),
              sessionStorage.getItem("userId"),
              false,
              event.target.innerHTML,
              sessionStorage.getItem("kanban")
            );
            $.ajax({
              type: "POST",
              url: "/api/kanban",
              data: JSON.stringify(newPacket),
              dataType: "json",
              contentType: "application/json; charset=utf-8",
            });
            console.log("NUMERO KANBAN: " + sessionStorage.getItem("kanban"));
            // stompClient.send("/app/kanban." + sessionStorage.getItem("kanban"), {}, JSON.stringify(newPacket));
            localStorage.setItem(
              "descriptioactualitem",
              event.target.innerHTML
            );
            var popUp = window.open(
              "/task.html",
              "liveMatches",
              "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=650,height=400"
            );
            popUp.onbeforeunload = function () {
              var info;
              if (localStorage.getItem("guardado")) {
                info = localStorage.getItem("descriptioactualitem");
                localStorage.removeItem("descriptioactualitem");
              } else {
                info = holder.firstChild.innerHTML;
              }
              localStorage.removeItem("guardado");
              var taskid = holder.firstChild.getAttribute("taskId");
              holder.firstChild.innerHTML = info;
              var newPacket = new Packet(
                taskid,
                "U",
                holder.parentElement.getAttribute("columnid"),
                sessionStorage.getItem("User"),
                sessionStorage.getItem("userId"),
                true,
                info,
                sessionStorage.getItem("kanban")
              );
              $.ajax({
                type: "POST",
                url: "/api/kanban",
                data: JSON.stringify(newPacket),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
              });
              console.log("NUMERO KANBAN: " + sessionStorage.getItem("kanban"));
              // stompClient.send("/app/kanban." + sessionStorage.getItem("kanban"), {}, JSON.stringify(newPacket));
              holding = false;
              holder = null;
              sessionStorage.removeItem("descriptioactualitem");
            };
          }
          event.target.removeAttribute("style");
        }
      });
      // Add dragstart eventListeners
      $(".items").on("dragstart", ".kanban-item", function (event) {
        if (event.target.getAttribute("draggable") == "true") {
          // To solve jquery dataTransfer issue
          $.event.addProp("dataTransfer");
          event.target.style.backgroundColor = "red";
          event.dataTransfer.setData(
            "text/plain",
            event.target.parentElement.id
          );
          if (!holding) {
            holding = true;
            holder = event.target.parentElement;
            var taskid = event.target.getAttribute("taskId");
            var newPacket = new Packet(
              taskid,
              "M",
              event.target.getAttribute("columnId"),
              sessionStorage.getItem("User"),
              sessionStorage.getItem("userId"),
              false,
              event.target.innerHTML,
              sessionStorage.getItem("kanban")
            );
            $.ajax({
              type: "POST",
              url: "/api/kanban",
              data: JSON.stringify(newPacket),
              dataType: "json",
              contentType: "application/json; charset=utf-8",
            });
            console.log("NUMERO KANBAN: " + sessionStorage.getItem("kanban"));
            // stompClient.send("/app/kanban." + sessionStorage.getItem("kanban"), {}, JSON.stringify(newPacket));
          }
        }
      });
      // Add dragstart eventListeners
      $(".items").on("dragleave", ".kanban-item", function (event) {
        // To solve jquery dataTransfer issue
        event.target.parentElement.firstChild.removeAttribute("style");
      });
      // Add dragover eventListeners
      $(".items").on("dragover", ".dropzone", function (event) {
        event.preventDefault();
        event.target.classList.add("dropzone-active");
      });
      $(".items").on("dragover", ".delete-dropzone", function (event) {
        event.preventDefault();
        event.target.classList.add("delete-dropzone-active");
      });
      // Add dragLeave event to remove the dropzone-active class
      $(".items").on("dragleave", ".dropzone", function (event) {
        event.preventDefault();
        event.target.classList.remove("dropzone-active");
      });
      $(".items").on("dragleave", ".delete-dropzone", function (event) {
        event.preventDefault();
        event.target.classList.remove("delete-dropzone-active");
      });
      // Add drop eventListeners
      $(".items").on("drop", ".dropzone", function (event) {
        event.preventDefault();
        event.target.classList.remove("dropzone-active");
        // Get the element to insert after
        const insertAfter = event.target.parentElement.classList.contains(
          "kanban-item"
        )
          ? event.target.parentElement
          : event.target;
        // Get the dropped element and append
        const droppedElementId = event.dataTransfer.getData("text/plain");
        const droppedElement = document.getElementById(droppedElementId);
        insertAfter.after(droppedElement);
        var taskid = holder.firstChild.getAttribute("taskId");
        holder.firstChild.removeAttribute("style");
        var newPacket = new Packet(
          taskid,
          "M",
          holder.parentElement.getAttribute("columnid"),
          sessionStorage.getItem("User"),
          sessionStorage.getItem("userId"),
          true,
          holder.firstChild.innerHTML,
          sessionStorage.getItem("kanban")
        );
        $.ajax({
          type: "POST",
          url: "/api/kanban",
          data: JSON.stringify(newPacket),
          dataType: "json",
          contentType: "application/json; charset=utf-8",
        });
        console.log("NUMERO KANBAN: " + sessionStorage.getItem("kanban"));
        // stompClient.send("/app/kanban." + sessionStorage.getItem("kanban"), {}, JSON.stringify(newPacket));
        holding = false;
        holder = null;
      });
      // Add drop delete eventListeners
      $(".items").on("drop", ".delete-dropzone", function (event) {
        event.preventDefault();
        event.target.classList.remove("delete-dropzone-active");
        // Get the dropped element and append
        const droppedElementId = event.dataTransfer.getData("text/plain");
        const droppedElement = document.getElementById(droppedElementId);
        var taskid = document
          .getElementById(event.dataTransfer.getData("text/plain"))
          .firstChild.getAttribute("taskId");
        var newPacket = new Packet(
          taskid,
          "D",
          holder.parentElement.getAttribute("columnId"),
          sessionStorage.getItem("User"),
          sessionStorage.getItem("userId"),
          false,
          holder.firstChild.innerHTML,
          sessionStorage.getItem("kanban")
        );
        $.ajax({
          type: "POST",
          url: "/api/kanban",
          data: JSON.stringify(newPacket),
          dataType: "json",
          contentType: "application/json; charset=utf-8",
        });
        console.log("NUMERO KANBAN: " + sessionStorage.getItem("kanban"));
        // stompClient.send("/app/kanban." + sessionStorage.getItem("kanban"), {}, JSON.stringify(newPacket));
        droppedElement.remove();
        holding = false;
        holder = null;
      });
    });
  }

  function verificarEvento(packet) {
    if (sessionStorage.getItem("User") != packet.username) {
      if (packet.action == "D") {
        var deleteItem = document.querySelector(
          '[taskId="' + packet.idtask + '"]'
        );
        deleteItem.remove();
      } else if (packet.action == "C") {
        if (
          document.querySelector('[taskId="' + packet.idtask + '"]') == null
        ) {
          module.create(packet);
        }
      } else if (packet.action == "U") {
        var item = document.querySelector('[taskId="' + packet.idtask + '"]');
        if (item.innerHTML != packet.description) {
          item.innerHTML = packet.description;
        }
        item.removeAttribute("style");
        item.setAttribute("draggable", true);
      } else if (!packet.ipublic) {
        var item = document.querySelector('[taskId="' + packet.idtask + '"]');
        item.style.backgroundColor = "red";
        item.setAttribute("draggable", false);
      } else {
        var item = document.getElementById("item" + packet.idtask);
        item.remove();
        var temp = Array.from(document.getElementsByClassName("items"));
        temp.forEach((e) => {
          if (e.getAttribute("columnid") == packet.idcolumn) {
            e.appendChild(item);
          }
        });
        var item2 = document.getElementById("t" + packet.idtask);
        item2.setAttribute("columnid", packet.idcolumn);
        item2.removeAttribute("style");
        item2.setAttribute("draggable", true);
      }
    }
  }

  return {
    read: getKanbanData,
    addItem: insertItem,
    loadlisteners: loadEventListeners,
  };
})();
