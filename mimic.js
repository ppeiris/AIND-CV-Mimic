// Mimic Me!
// Fun game where you need to express emojis being displayed

// --- Affectiva setup ---

// The affdex SDK Needs to create video and canvas elements in the DOM
var divRoot = $("#camera")[0];  // div node where we want to add these elements
var width = 640, height = 480;  // camera image size
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;  // face mode parameter
var intervalID = 0;
var numberof_impressions = 0;
var numberof_correct_impressions = 0;
// Initialize an Affectiva CameraDetector object

var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();



// --- Utility values and functions ---

// Unicode values for all emojis Affectiva can detect
var emojis = [ 128528, 9786, 128515, 128524, 128527, 128521, 128535, 128539, 128540, 128542, 128545, 128563, 128561 ];

// Update target emoji being displayed by supplying a unicode value
function setTargetEmoji(code) {
  $("#target").html("&#" + code + ";");
}

// Convert a special character to its unicode value (can be 1 or 2 units long)
function toUnicode(c) {
  if(c.length == 1)
    return c.charCodeAt(0);
  return ((((c.charCodeAt(0) - 0xD800) * 0x400) + (c.charCodeAt(1) - 0xDC00) + 0x10000));
}

// Update score being displayed
function setScore(correct, total) {
  $("#score").html("Score: " + correct + " / " + total);
}


/**
 * Increase the correct number of detect value increase by one
 *
 */
function increaseScore_Correct() {
    $("#score_correct").html(parseInt($("#score_correct").html()) + 1);
}

/**
 * Increase the total number of imporessions are presented to user by one
 *
 */
function increaseScore_Total() {
    $("#score_total").html(parseInt($("#score_total").html()) + 1);
}

// Display log messages and tracking results
function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

// --- Callback functions ---

// Start button
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");  // clear out previous log
    detector.start();  // start detector
    setTimer();
  }
  log('#logs', "Start button pressed");
}

// Stop button
function onStop() {
  log('#logs', "Stop button pressed");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();  // stop detector
    clearInterval(intervalID);
  }
};

// Reset button
function onReset() {
  log('#logs', "Reset button pressed");
  if (detector && detector.isRunning) {
    detector.reset();
  }
  $('#results').html("");  // clear out results
  $("#logs").html("");  // clear out previous log

  // TODO(optional): You can restart the game as well
  // <your code here>
};

// Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

// Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

// Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html(emojis[0]);
});

// Add a callback to notify when the detector is initialized and ready for running
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");

  // TODO(optional): Call a function to initialize the game, if needed
  // <your code here>

});

// Add a callback to receive the results from processing an image
// NOTE: The faces object contains a list of the faces detected in the image,
//   probabilities for different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  var canvas = $('#face_video_canvas')[0];
  if (!canvas)
    return;

  // Report how many faces were found
  $('#results').html("");
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);
  if (faces.length > 0) {
    // Report desired metrics
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);

    // Call functions to draw feature points and dominant emoji (for the first face only)
    drawFeaturePoints(canvas, image, faces[0]);
    drawEmoji(canvas, image, faces[0]);
    mimicme(canvas, image, faces[0]);
    // TODO: Call your function to run the game (define it first!)
    // <your code here>

  }
});


// --- Custom functions ---

// Draw the detected facial feature points on the image
function drawFeaturePoints(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#00f';
  // Loop over each feature point in the face
  for (var id in face.featurePoints) {
    var featurePoint = face.featurePoints[id];

    ctx.beginPath();
    ctx.arc(featurePoint.x, featurePoint.y, 1, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

// Draw the dominant emoji on the image
function drawEmoji(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');
  ctx.font = "48px serif";
  ctx.fillText(face.emojis.dominantEmoji, face.featurePoints[0].x-75, face.featurePoints[0].y-200);
}

/**
 * Set the timer for 10 seconds.
 * This method reset existing timer and reset that to start from zero
 */
function setTimer() {
    clearInterval(intervalID);
    intervalID = setInterval(function(){changeMimicEmoji();}, 10000);
}

/**
 * Pick a random emoji icon from the list and display on the web page.
 * User suppose to mimic this impression
 * Everytime this method call and provide the a new imporession to the user
 * the total number of number increase by one via increaseScore_Total method.
 */
function changeMimicEmoji() {
    var i = Math.floor((Math.random() * 13) + 0);
    setTargetEmoji(emojis[i]);
    increaseScore_Total();
}

/**
 * This method check if the user has mimic the correct imporession to match what
 * we pick randomly from using changeMimicEmoji method. When user correctly mimic
 * the impression we increase the correct count using increaseScore_Correct method
 *
 */
function mimicme(canvas, img, face) {
    if (toUnicode(face.emojis.dominantEmoji) == toUnicode($("#target").html())) {
        $("#target").html('Nice Job');
        setTimer();
        increaseScore_Correct();
    }
}
