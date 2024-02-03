document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("draw-canvas"); // Changed to 'draw-canvas-predict'
  const ctx = canvas.getContext("2d");
  // Set the background color
  ctx.fillStyle = "#ffffff"; // Set to white or any other color you prefer
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas

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

    ctx.lineWidth = 16; // Line width
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
  ctx.fillStyle = "#ffffff"; // Set to white or any other color you prefer
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas

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

    ctx.lineWidth = 16; // Line width
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

function updateTrainButtonState() {
  const trainModelButton = document.getElementById("trainModel");
  if (drawingCount < 10) {
    trainModelButton.style.backgroundColor = "grey"; // Make the button grey
  } else {
    trainModelButton.style.backgroundColor = "white"; // Change it back to white
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateTrainButtonState();
});

// function to check if the canvas is blank
function isCanvasBlank(canvas) {
  const blank = document.createElement("canvas"); // Create a temporary canvas
  blank.width = canvas.width;
  blank.height = canvas.height;

  const blankCtx = blank.getContext("2d");
  blankCtx.fillStyle = "#ffffff"; // Set to the same background color as your canvas
  blankCtx.fillRect(0, 0, blank.width, blank.height);

  return canvas.toDataURL() === blank.toDataURL(); // Compare data URLs
}

// after making the prediction the canvas should be cleared
const predictButton = document.getElementById("predictButton");
if (predictButton) {
  predictButton.addEventListener("click", function () {
    const canvas = document.getElementById("draw-canvas-predict");
    const drawnImageData = canvas.toDataURL(); // Specify the image format

    if (isCanvasBlank(canvas)) {
      alert("Cannot save a blank canvas. Please draw something.");
      return; // Exit the function if the canvas is blank
    }

    // Send a POST request to the /make-prediction route with the drawn image data
    fetch("/make-prediction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ drawn_image_data: drawnImageData }),
    })
      .then((response) => response.json())
      .then((data) => {
        const canvas = document.getElementById("draw-canvas-predict");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        // Set the background color
        ctx.fillStyle = "#ffffff"; // Set to white or any other color you prefer
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas
        // Display the predicted number on the page
        const predictionResultElement =
          document.getElementById("predictionResult");
        if (predictionResultElement) {
          predictionResultElement.textContent = data.predicted_number;
        }
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
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Set the background color
    ctx.fillStyle = "#ffffff"; // Set to white or any other color you prefer
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas
  });
}

// min 10 samples
let drawingCount = 0;
function incrementDrawingCount() {
  drawingCount += 1;
  updateTrainButtonState();
}

const saveDrawingButton = document.getElementById("saveDrawing");
if (saveDrawingButton) {
  saveDrawingButton.addEventListener("click", function () {
    const canvas = document.getElementById("draw-canvas");
    const imageData = canvas.toDataURL(); // Get the drawing as a data URL

    if (isCanvasBlank(canvas)) {
      alert("Cannot save a blank canvas. Please draw something.");
      return; // Exit the function if the canvas is blank
    }

    const numberToDraw = document
      .getElementById("numberToDraw")
      .textContent.replace("Draw the Number: ", "");

    // Capture the number to be drawn from the <h1> element
    const numberElement = document.getElementById("numberToDraw");
    if (numberElement) {
      const label = numberElement.textContent.match(/\d+/)[0]; // Extract the number from the text

      // Send the imageData and the label to the server
      fetch("/save-drawing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
          label: label,
          numberToDraw: numberToDraw,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // You can also clear the canvas or give some feedback to the user here
          incrementDrawingCount(); // increment the drawing count
          const canvas = document.getElementById("draw-canvas");
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
          // Set the background color
          ctx.fillStyle = "#ffffff"; // Set to white or any other color you prefer
          ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas

          // Update the displayed random number with the new one from the server
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
      // Inform the user that more drawings are needed
      alert("You need to provide at least 10 samples to train the model.");
    } else {
      // Proceed with the POST request to train the model
      fetch("/train-model", { method: "POST" })
        .then((response) => {
          if (response.ok) {
            alert("Model trained successfully!");
            // Optionally reset drawing count after training
            drawingCount = 0;
          } else {
            // Handle errors, such as not enough samples
            response.json().then((data) => {
              if (data.error) {
                alert(data.error);
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error training model:", error);
        });
    }
  });
}

// canvas resizing problem fix
function resizeCanvasToDisplaySize(canvas) {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  // Check if the canvas size is different from its display size.
  if (canvas.width !== width || canvas.height !== height) {
    // Set the internal canvas size to match the displayed size.
    canvas.width = width;
    canvas.height = height;
    return true; // The canvas was resized.
  }

  return false; // The canvas was not resized.
}

// Get your canvas element
const canvas = document.getElementById("draw-canvas");
const canvasPred = document.getElementById("draw-canvas-predict");

// Resize the canvas whenever the window is resized or initially loaded
window.addEventListener("resize", () => resizeCanvasToDisplaySize(canvas));
document.addEventListener("DOMContentLoaded", () =>
  resizeCanvasToDisplaySize(canvas)
);

window.addEventListener("resize", () => resizeCanvasToDisplaySize(canvasPred));
document.addEventListener("DOMContentLoaded", () =>
  resizeCanvasToDisplaySize(canvasPred)
);
