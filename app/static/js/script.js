document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("draw-canvas"); // Changed to 'draw-canvas-predict'
  const ctx = canvas.getContext("2d");
  // Set the background color
  clearCanvas(canvas);

  let drawing = false;

  function startDrawing(e) {
    drawing = true;
    draw(e); // To start drawing immediately
  }

  function endDrawing() {
    drawing = false;
    ctx.beginPath(); // Begin a new path to start a new stroke
  }

  function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = 20; // Line width
    ctx.lineCap = "round"; // Line cap style

    // Adjust for the offset of the canvas
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); // Move to mouse position
    ctx.stroke();
    ctx.beginPath(); // Begin a new path
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); // Move to mouse position
  }

  // Event listeners for mouse actions
  if (canvas) {
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mousemove", draw);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("draw-canvas-predict"); // Changed to 'draw-canvas-predict'
  const ctx = canvas.getContext("2d");
  // Set the background color
  clearCanvas(canvas);

  let drawing = false;

  function startDrawing(e) {
    drawing = true;
    draw(e); // To start drawing immediately
  }

  function endDrawing() {
    drawing = false;
    ctx.beginPath(); // Begin a new path to start a new stroke
  }

  function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = 20; // Line width
    ctx.lineCap = "round"; // Line cap style

    // Adjust for the offset of the canvas
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); // Move to mouse position
    ctx.stroke();
    ctx.beginPath(); // Begin a new path
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); // Move to mouse position
  }

  // Event listeners for mouse actions
  if (canvas) {
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mousemove", draw);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  updateTrainState();
});

function updateTrainState() {
  const trainModelButton = document.getElementById("trainModel");
  const canvasPredict = document.getElementById("draw-canvas-predict");
  const predictButton = document.getElementById("predictButton");
  const predictionResult = document.getElementById("predictionResult");
  const clearCanvasButton = document.getElementById("clearCanvasPred");

  if (drawingCount < 10) {
    trainModelButton.style.backgroundColor = "grey";
    canvasPredict.style.backgroundColor = "grey";
    predictButton.style.backgroundColor = "grey";
    predictButton.disabled = true;
    predictionResult.style.backgroundColor = "grey";
    clearCanvasButton.style.backgroundColor = "grey";
    clearCanvasButton.disabled = true;
  } else {
    trainModelButton.style.backgroundColor = "white";
    canvasPredict.style.backgroundColor = "white";
    predictButton.style.backgroundColor = "white";
    predictButton.disabled = false;
    predictionResult.style.backgroundColor = "white";
    clearCanvasButton.style.backgroundColor = "white";
    clearCanvasButton.disabled = false;
    clearCanvas(canvasPredict);
  }
}

function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = 255;
    imageData.data[i + 1] = 255;
    imageData.data[i + 2] = 255;
    imageData.data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

function isCanvasWhite(canvas) {
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const red = imageData.data[i];
    const green = imageData.data[i + 1];
    const blue = imageData.data[i + 2];
    const alpha = imageData.data[i + 3];
    if (red !== 255 || green !== 255 || blue !== 255 || alpha !== 255) {
      return false;
    }
  }
  return true;
}

const predictButton = document.getElementById("predictButton");
if (predictButton) {
  predictButton.addEventListener("click", function () {
    const canvas = document.getElementById("draw-canvas-predict");
    const drawnImageData = canvas.toDataURL();
    if (isCanvasWhite(canvas)) {
      alert("Can not save a blank canvas. Please draw something.");
      return;
    }
    fetch("/make-prediction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ drawn_image_data: drawnImageData }),
    })
      .then((response) => response.json())
      .then((data) => {
        const predictionResultElement =
          document.getElementById("predictionResult");
        if (predictionResultElement) {
          predictionResultElement.textContent = data.predicted_number;
        }
        let chartPredictions = data.predictions[0];
        chartPredictions.forEach((value, index, arr) => {
          arr[index] = (Math.round(value * 100) / 100) * 100;
        });
        const minValue = Math.min(...chartPredictions);
        const maxValue = Math.max(...chartPredictions);
        let mappedChartPredictions = chartPredictions.map((value) => {
          const mappedValue = ((value - minValue) / (maxValue - minValue)) * 6;
          return mappedValue;
        });
        mappedChartPredictions.forEach((value, index, arr) => {
          if (value === 0) {
            arr[index] = 0.5;
          }
        });
        const num0 = document.getElementById("num0");
        const num1 = document.getElementById("num1");
        const num2 = document.getElementById("num2");
        const num3 = document.getElementById("num3");
        const num4 = document.getElementById("num4");
        const num5 = document.getElementById("num5");
        const num6 = document.getElementById("num6");
        const num7 = document.getElementById("num7");
        const num8 = document.getElementById("num8");
        const num9 = document.getElementById("num9");
        num0.style.height = `${mappedChartPredictions[0]}rem`;
        num1.style.height = `${mappedChartPredictions[1]}rem`;
        num2.style.height = `${mappedChartPredictions[2]}rem`;
        num3.style.height = `${mappedChartPredictions[3]}rem`;
        num4.style.height = `${mappedChartPredictions[4]}rem`;
        num5.style.height = `${mappedChartPredictions[5]}rem`;
        num6.style.height = `${mappedChartPredictions[6]}rem`;
        num7.style.height = `${mappedChartPredictions[7]}rem`;
        num8.style.height = `${mappedChartPredictions[8]}rem`;
        num9.style.height = `${mappedChartPredictions[9]}rem`;
      })
      .catch((error) => {
        console.error("Error making prediction:", error);
      });
  });
}

const clearCanvasButton = document.getElementById("clearCanvas");
if (clearCanvasButton) {
  clearCanvasButton.addEventListener("click", function () {
    const canvas = document.getElementById("draw-canvas");
    clearCanvas(canvas);
  });
}

const clearCanvasButtonPred = document.getElementById("clearCanvasPred");
if (clearCanvasButton) {
  clearCanvasButtonPred.addEventListener("click", function () {
    const canvas = document.getElementById("draw-canvas-predict");
    clearCanvas(canvas);
  });
}

let drawingCount = 0;
function incrementDrawingCount() {
  drawingCount += 1;
  updateTrainState();
}

const saveDrawingButton = document.getElementById("saveDrawing");
if (saveDrawingButton) {
  saveDrawingButton.addEventListener("click", function () {
    const canvas = document.getElementById("draw-canvas");
    const imageData = canvas.toDataURL();
    if (isCanvasWhite(canvas)) {
      alert("Can not save a blank canvas. Please draw something.");
      return;
    }
    const numberElement = document.getElementById("numberToDraw");
    if (numberElement) {
      const label = numberElement.textContent.match(/\d+/)[0];
      fetch("/save-drawing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
          label: label,
          numberToDraw: label,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          incrementDrawingCount();
          clearCanvas(canvas);
          const numberElement = document.getElementById("numberToDraw");
          if (numberElement) {
            numberElement.textContent = data.new_number;
          }
        })
        .catch((error) => {
          console.error("Error saving drawing:", error);
        });
    }
  });
}

const trainModelButton = document.getElementById("trainModel");
if (trainModelButton) {
  trainModelButton.addEventListener("click", function () {
    if (drawingCount < 10) {
      alert("You need to provide at least 10 samples to train the model.");
    } else {
      fetch("/train-model", { method: "POST" })
        .then((response) => {
          if (response.ok) {
            alert("Model trained successfully!");
            const canvas = document.getElementById("draw-canvas");
            clearCanvas(canvas);
          }
        })
        .catch((error) => {
          console.error("Error training model:", error);
        });
    }
  });
}

function resizeCanvasToDisplaySize(canvas) {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

const canvas = document.getElementById("draw-canvas");
const canvasPred = document.getElementById("draw-canvas-predict");

window.addEventListener("resize", () => {
  resizeCanvasToDisplaySize(canvas);
  clearCanvas(canvas);
});

document.addEventListener("DOMContentLoaded", () => {
  resizeCanvasToDisplaySize(canvas);
  clearCanvas(canvas);
});

window.addEventListener("resize", () => {
  resizeCanvasToDisplaySize(canvasPred);
  clearCanvas(canvasPred);
});

document.addEventListener("DOMContentLoaded", () => {
  resizeCanvasToDisplaySize(canvasPred);
  clearCanvas(canvasPred);
});

document.getElementById("infoButton").addEventListener("click", function () {
  var overlay = document.getElementById("info_overlay");
  var infoButton = document.getElementById("infoButton");
  var crossButton = document.getElementById("crossButton");
  var isHidden = overlay.style.display === "none";
  if (isHidden) {
    overlay.style.display = "block";
  } else {
    overlay.style.display = "none";
  }
  infoButton.style.display = "none";
  crossButton.style.display = "inline-block";
});

document.getElementById("crossButton").addEventListener("click", function () {
  var overlay = document.getElementById("info_overlay");
  var infoButton = document.getElementById("infoButton");
  var crossButton = document.getElementById("crossButton");
  var isHidden = overlay.style.display === "none";
  if (isHidden) {
    overlay.style.display = "block";
  } else {
    overlay.style.display = "none";
  }
  crossButton.style.display = "none";
  infoButton.style.display = "inline-block";
});
