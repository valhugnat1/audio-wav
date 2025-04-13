// public/script.js
document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  const statusDiv = document.getElementById("status");

  let mediaRecorder;
  let audioChunks = [];

  // Start recording function
  const startRecording = async () => {
    // Reset audio chunks
    audioChunks = [];

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create media recorder
      mediaRecorder = new MediaRecorder(stream);

      // Listen for data available event
      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      // Start recording
      mediaRecorder.start();

      // Update UI
      startButton.style.display = "none";
      stopButton.style.display = "inline-block";
      statusDiv.textContent = "Recording in progress...";
    } catch (error) {
      console.error("Error accessing microphone:", error);
      statusDiv.textContent = "Error: Could not access microphone.";
    }
  };

  // Stop recording function
  const stopRecording = () => {
    // Stop only if we're recording
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      // Stop the recorder
      mediaRecorder.stop();

      // Listen for the stop event to process the recording
      mediaRecorder.addEventListener("stop", () => {
        // Create a blob from the audio chunks
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

        // Create a FormData object and append the blob
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        // Update status
        statusDiv.textContent = "Processing recording...";

        // Send the audio to the server
        fetch("/audio", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            statusDiv.textContent = `Recording saved with ID: ${data.id}`;
            console.log("Success:", data);

            // Stop all tracks to release the microphone
            mediaRecorder.stream.getTracks().forEach((track) => track.stop());
          })
          .catch((error) => {
            statusDiv.textContent = "Error: Failed to upload recording.";
            console.error("Error:", error);
          });

        // Reset UI
        startButton.style.display = "inline-block";
        stopButton.style.display = "none";
      });
    }
  };

  // Add event listeners to buttons
  startButton.addEventListener("click", startRecording);
  stopButton.addEventListener("click", stopRecording);
});
