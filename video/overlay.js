// overlay.js

// Get references to the video and canvas elements
const video = document.getElementById('video-element');
const canvas = document.getElementById('overlay-canvas');
const context = canvas.getContext('2d');

// Variables for storing video dimensions
let videoWidth, videoHeight;

// Load the polygon data
let polygonData = {};

fetch('video_polygons.json')
  .then(response => response.json())
  .then(data => {
    polygonData = data.frames;
    initializeOverlay();
  })
  .catch(error => {
    console.error('Error loading polygon data:', error);
  });

function initializeOverlay() {
  // Ensure the video metadata is loaded
  video.addEventListener('loadedmetadata', () => {
    // Get video dimensions
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;

    // Set canvas dimensions to match the video
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Style the canvas to match the video display size
    resizeCanvas();

    // Start the frame rendering loop
    video.requestVideoFrameCallback(renderFrame);

    // Adjust canvas size when the window is resized
    window.addEventListener('resize', resizeCanvas);
  });
}

function resizeCanvas() {
  const videoDisplayWidth = video.clientWidth;
  const videoDisplayHeight = video.clientHeight;
  canvas.style.width = videoDisplayWidth + 'px';
  canvas.style.height = videoDisplayHeight + 'px';
}

function renderFrame(now, metadata) {
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Get the current frame number
  const frameNumber = metadata.presentedFrames;

  // Get the polygons for the current frame
  const framePolygons = polygonData[frameNumber.toString()];

  if (framePolygons) {
    // Calculate scaling factors
    const scaleX = canvas.width / videoWidth;
    const scaleY = canvas.height / videoHeight;

    framePolygons.forEach(obj => {
      // Scale and draw the polygon
      context.beginPath();
      const scaledPoints = obj.points.map(point => ({
        x: point[0] * scaleX,
        y: point[1] * scaleY
      }));

      context.moveTo(scaledPoints[0].x, scaledPoints[0].y);
      for (let i = 1; i < scaledPoints.length; i++) {
        context.lineTo(scaledPoints[i].x, scaledPoints[i].y);
      }
      context.closePath();

      // Set styles
      context.fillStyle = 'rgba(0, 255, 0, 0.3)';
      context.strokeStyle = 'green';
      context.lineWidth = 2;

      // Draw the polygon
      context.fill();
      context.stroke();

      // Draw the class label
      const centroid = calculateCentroid(scaledPoints);
      context.fillStyle = 'red';
      context.font = '14px Arial';
      context.fillText(obj.class_name, centroid.x, centroid.y);
    });
  }

  // Request the next frame
  video.requestVideoFrameCallback(renderFrame);
}

function calculateCentroid(points) {
  let x = 0, y = 0;
  points.forEach(point => {
    x += point.x;
    y += point.y;
  });
  return { x: x / points.length, y: y / points.length };
}
