document
  .getElementById("subjectForm")
  .addEventListener("submit", function (event) {
    let selectedSubject = document.getElementById("subject").value;
    let formAction = selectedSubject + ".html";
    this.action = formAction;
  });
