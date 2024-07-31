document.addEventListener("DOMContentLoaded", () => {
  const gradeBoundaries = {
    2023: { "a*": 223, a: 196, b: 163, c: 129, d: 96, e: 63, u: 0 },
    2022: { "a*": 209, a: 181, b: 149, c: 117, d: 85, e: 54, u: 0 },
    2021: { "a*": 191, a: 165, b: 135, c: 105, d: 75, e: 45, u: 0 },
    2020: { "a*": 202, a: 171, b: 136, c: 107, d: 76, e: 45, u: 0 },
    2019: { "a*": 222, a: 195, b: 165, c: 134, d: 104, e: 74, u: 0 },
    2018: { "a*": 213, a: 183, b: 155, c: 127, d: 99, e: 71, u: 0 },
    2017: { "a*": 221, a: 191, b: 161, c: 131, d: 101, e: 71, u: 0 },
  };

  let savedScores = JSON.parse(localStorage.getItem("examScores")) || {
    2023: { 1: null, 2: null },
    2022: { 1: null, 2: null },
    2021: { 1: null, 2: null },
    2020: { 1: null, 2: null },
    2019: { 1: null, 2: null },
    2018: { 1: null, 2: null },
    2017: { 1: null, 2: null },
  };

  let savedTopics = JSON.parse(localStorage.getItem("topics")) || [];

  function initializeScores() {
    const inputs = document.querySelectorAll(".score");
    inputs.forEach((input) => {
      const year = input.dataset.year;
      const paper = input.dataset.paper;
      const savedValue = savedScores[year][paper];

      if (savedValue !== null) {
        input.value = savedValue;
        updateColor(input, savedValue);
      } else {
        input.value = "";
      }

      input.addEventListener("input", function () {
        let value = parseInt(this.value) || 0;
        if (value > 140) {
          value = 140;
          this.value = 140;
        }
        savedScores[year][paper] = value;
        localStorage.setItem("examScores", JSON.stringify(savedScores));
        updateColor(this, value);
        calculateAverages();
        calculateGrades();
      });

      input.addEventListener("input", function () {
        // Limit input to 3 digits
        this.value = this.value.slice(0, 3);
        // Call the existing input handler
        let value = parseInt(this.value) || 0;
        if (value > 140) {
          value = 140;
          this.value = 140;
        }
        savedScores[year][paper] = value;
        localStorage.setItem("examScores", JSON.stringify(savedScores));
        updateColor(this, value);
        calculateAverages();
        calculateGrades();
      });
    });
  }

  function initializeTopics() {
    const topicList = document.getElementById("topicList");
    savedTopics.forEach((topic) => {
      const li = createTopicElement(topic.text, topic.highlighted);
      topicList.appendChild(li);
    });

    const form = document.getElementById("topics");
    const topicInput = document.getElementById("topicInput");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const topicText = topicInput.value.trim();

      if (topicText === "") {
        const alertBox = document.getElementById("topicAlert");
        alertBox.style.display = "flex";
        return;
      }

      const li = createTopicElement(topicText, false);
      topicList.appendChild(li);

      savedTopics.push({ text: topicText, highlighted: false });
      localStorage.setItem("topics", JSON.stringify(savedTopics));

      topicInput.value = "";
    });
  }

  function resetData() {
    const savedScores = {
      2023: { 1: null, 2: null },
      2022: { 1: null, 2: null },
      2021: { 1: null, 2: null },
      2020: { 1: null, 2: null },
      2019: { 1: null, 2: null },
      2018: { 1: null, 2: null },
      2017: { 1: null, 2: null },
    };
    localStorage.setItem("examScores", JSON.stringify(savedScores));

    const savedTopics = [];
    localStorage.setItem("topics", JSON.stringify(savedTopics));

    const inputs = document.querySelectorAll(".score");
    inputs.forEach((input) => {
      input.value = "";
      input.className = "score";
    });

    const topicList = document.getElementById("topicList");
    topicList.innerHTML = "";

    initializeScores();
    initializeTopics();

    calculateAverages();
    calculateGrades();
  }

  function updateColor(input, value) {
    value = parseInt(value);
    if (value >= 105) {
      input.className = "score darkGreen";
    } else if (value >= 90) {
      input.className = "score lightGreen";
    } else if (value >= 75) {
      input.className = "score yellow";
    } else if (value >= 60) {
      input.className = "score lightOrange";
    } else if (value >= 45) {
      input.className = "score darkOrange";
    } else if (value >= 30) {
      input.className = "score lightRed";
    } else {
      input.className = "score darkRed";
    }
  }

  function calculateAverages() {
    const rows = document.querySelectorAll("tr[data-paper]");
    let hasInput = false;
    rows.forEach((row) => {
      let sum = 0;
      let count = 0;
      const inputs = row.querySelectorAll(".score");
      inputs.forEach((input) => {
        const value = parseInt(input.value) || 0;
        if (value > 0) hasInput = true;
        sum += value;
        count++;
      });
      const average = count > 0 ? Math.round(sum / count) : 0;
      const averageCell = row.querySelector(".average");
      averageCell.textContent = hasInput ? average : "";
    });
    calculateAverageGrade();
  }

  function calculateGrades() {
    const years = ["2023", "2022", "2021", "2020", "2019", "2018", "2017"];
    years.forEach((year) => {
      const paper1Score = savedScores[year]["1"] || 0;
      const paper2Score = savedScores[year]["2"] || 0;
      const totalScore = paper1Score + paper2Score;
      const gradeCell = document.querySelector(`.grade[data-year="${year}"]`);

      const boundaries = gradeBoundaries[year];
      let grade = "";
      if (totalScore >= boundaries["a*"]) {
        grade = "A*";
      } else if (totalScore >= boundaries["a"]) {
        grade = "A";
      } else if (totalScore >= boundaries["b"]) {
        grade = "B";
      } else if (totalScore >= boundaries["c"]) {
        grade = "C";
      } else if (totalScore >= boundaries["d"]) {
        grade = "D";
      } else if (totalScore >= boundaries["e"]) {
        grade = "E";
      } else if (totalScore > 0) {
        grade = "U";
      }

      gradeCell.textContent = grade;
    });
  }

  function calculateAverageGrade() {
    const paper1Avg =
      parseFloat(
        document.querySelector('tr[data-paper="1"] .average').textContent,
      ) || 0;
    const paper2Avg =
      parseFloat(
        document.querySelector('tr[data-paper="2"] .average').textContent,
      ) || 0;
    const totalAvgScore = paper1Avg + paper2Avg;

    const avgBoundaries = {
      "a*": Math.round((223 + 209 + 191 + 202 + 222 + 213 + 221) / 7),
      a: Math.round((196 + 181 + 165 + 171 + 195 + 183 + 191) / 7),
      b: Math.round((163 + 149 + 135 + 136 + 165 + 155 + 161) / 7),
      c: Math.round((129 + 117 + 105 + 107 + 134 + 127 + 131) / 7),
      d: Math.round((96 + 85 + 75 + 76 + 104 + 99 + 101) / 7),
      e: Math.round((63 + 54 + 45 + 45 + 74 + 71 + 71) / 7),
      u: 0,
    };

    let avgGrade = "";
    if (totalAvgScore >= avgBoundaries["a*"]) {
      avgGrade = "A*";
    } else if (totalAvgScore >= avgBoundaries["a"]) {
      avgGrade = "A";
    } else if (totalAvgScore >= avgBoundaries["b"]) {
      avgGrade = "B";
    } else if (totalAvgScore >= avgBoundaries["c"]) {
      avgGrade = "C";
    } else if (totalAvgScore >= avgBoundaries["d"]) {
      avgGrade = "D";
    } else if (totalAvgScore >= avgBoundaries["e"]) {
      avgGrade = "E";
    } else if (totalAvgScore > 0) {
      avgGrade = "U";
    }

    document.querySelector(".average-grade").textContent = avgGrade;
  }

  function createTopicElement(topicText, highlighted) {
    const li = document.createElement("li");
    li.textContent = topicText;

    if (highlighted) {
      li.classList.add("highlighted");
    }

    li.addEventListener("click", function () {
      this.classList.toggle("highlighted");
      updateTopicHighlight(topicText, this.classList.contains("highlighted"));
    });

    return li;
  }

  function updateTopicHighlight(topicText, highlighted) {
    savedTopics.forEach((topic) => {
      if (topic.text === topicText) {
        topic.highlighted = highlighted;
      }
    });
    localStorage.setItem("topics", JSON.stringify(savedTopics));
  }

  initializeScores();
  initializeTopics();
  calculateAverages();
  calculateGrades();

  document.getElementById('resetDataButton').addEventListener('click', function() {
    showresetConfirm();
  });

  document.getElementById('confirmYes').addEventListener('click', function() {
    hideresetConfirm();
    resetData();
  });

  document.getElementById('confirmNo').addEventListener('click', function() {
    hideresetConfirm();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.top-nav a');

  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(navLink => navLink.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

function toggleDropdown() {
  const changeSubject = document.querySelector('.changeSubjectContent');
  changeSubject.classList.toggle('active');
}

function showresetConfirm() {
  document.getElementById('resetConfirm').style.display = 'flex';
}

function hideresetConfirm() {
  document.getElementById("resetConfirm").style.display = 'none';
}

function hideTopicConfirm() {
  document.getElementById('topicAlert').style.display = 'none';
}

document.getElementById('confirmClose').addEventListener('click', function() {
  hideTopicConfirm();
});
