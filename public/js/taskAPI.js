var taskApi = (function () {
  function getData() {
    $.ajax({
      type: "GET",
      url: "http://localhost:8080/api/schedule",
    }).then(function (data) {});
  }

  return {
    read: function (asignatura) {
      const json = localStorage.getItem("kanban-data");

      if (!json) {
        return [
          {
            name: "Pendiente",
            items: [],
          },
          {
            name: "En Progreso",
            items: [],
          },
          {
            name: "Terminado",
            items: [],
          },
        ];
      }

      return JSON.parse(json);
    },
  };
})();
