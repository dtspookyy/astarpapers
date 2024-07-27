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
    2023: { 1: 0, 2: 0 },
    2022: { 1: 0, 2: 0 },
    2021: { 1: 0, 2: 0 },
    2020: { 1: 0, 2: 0 },
    2019: { 1: 0, 2: 0 },
    2018: { 1: 0, 2: 0 },
    2017: { 1: 0, 2: 0 },
  };

  let savedTopics = JSON.parse(localStorage.getItem("topics")) || [];

  function initializeScores() {
    const inputs = document.querySelectorAll(".score");
    inputs.forEach((input) => {
      const year = input.dataset.year;
      const paper = input.dataset.paper;
      const savedValue = savedScores[year][paper];

      if (savedValue !== undefined) {
        input.value = savedValue;
        updateColor(input, savedValue);
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
        alert("Please enter a topic.");
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
    if (
      confirm(
        "Are you sure you want to reset all data? This action cannot be undone.",
      )
    ) {
      savedScores = {
        2023: { 1: 0, 2: 0 },
        2022: { 1: 0, 2: 0 },
        2021: { 1: 0, 2: 0 },
        2020: { 1: 0, 2: 0 },
        2019: { 1: 0, 2: 0 },
        2018: { 1: 0, 2: 0 },
        2017: { 1: 0, 2: 0 },
      };
      localStorage.setItem("examScores", JSON.stringify(savedScores));

      savedTopics = [];
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

      alert("Data has been reset.");
    }
  }

  calculateAverages();
  calculateGrades();
  initializeScores();
  initializeTopics();

  const resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", resetData);

  function updateColor(input, value) {
    value = parseInt(value);
    if (value >= 120) {
      input.className = "score green";
    } else if (value >= 100) {
      input.className = "score yellow";
    } else {
      input.className = "score red";
    }
  }

  function calculateAverages() {
    const rows = document.querySelectorAll("tr[data-paper]");
    rows.forEach((row) => {
      let sum = 0;
      let count = 0;
      const inputs = row.querySelectorAll(".score");
      inputs.forEach((input) => {
        const value = parseInt(input.value) || 0;
        sum += value;
        count++;
      });
      const average = count > 0 ? Math.round(sum / count) : 0;
      row.querySelector(".average").textContent = average;
    });
    calculateAverageGrade();
  }

  function calculateGrades() {
    const years = ["2023", "2022", "2021", "2020", "2019", "2018", "2017"];
    years.forEach((year) => {
      const paper1Score = savedScores[year]["1"];
      const paper2Score = savedScores[year]["2"];
      const totalScore = paper1Score + paper2Score;
      const gradeCell = document.querySelector(`.grade[data-year="${year}"]`);

      const boundaries = gradeBoundaries[year];
      let grade = "U";
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

    let avgGrade = "U";
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
});
