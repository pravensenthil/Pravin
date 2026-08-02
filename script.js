

// Smart Drainage Robotic System - Full Script with 3-Times Repeating Voice

// Voice function - Repeats 3 times
function speakStatus(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop previous speech
    
    // 3 முறை பேசுவதற்கான லூப் (Loop)
    for (let i = 0; i < 3; i++) {
      let speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'en-US';
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    }
  }
}

// DOM Elements
const connectBtn = document.getElementById('connectBtn');
const testDemoBtn = document.getElementById('testDemoBtn');
const airStatus = document.getElementById('airStatus');
const drainageStatus = document.getElementById('drainageStatus');

// Test Demo Button Click Event
if (testDemoBtn) {
  testDemoBtn.addEventListener('click', () => {
    // Toggle status for demo
    airStatus.innerText = "TOXIC GAS DETECTED!";
    airStatus.style.color = "#ff4d4d";
    
    drainageStatus.innerText = "BLOCKAGE DETECTED!";
    drainageStatus.style.color = "#ff4d4d";
    
    // Speak out the alert 3 times
    speakStatus("Warning! Toxic gas and drainage blockage detected!");
  });
}

// Web Serial Connection setup (For Arduino)
let port;
let reader;

if (connectBtn) {
  connectBtn.addEventListener('click', async () => {
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      speakStatus("Arduino connected successfully");
      alert("Arduino Connected!");

      while (port.readable) {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              let data = value.trim();
              if (data === "BLOCKED") {
                drainageStatus.innerText = "BLOCKAGE DETECTED!";
                drainageStatus.style.color = "#ff4d4d";
                speakStatus("Blockage detected in drainage!");
              } else if (data === "CLEAN") {
                drainageStatus.innerText = "Clean";
                drainageStatus.style.color = "#4cd137";
              }
            }
          }
        } catch (error) {
          console.error("Read error:", error);
        }
      }
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Serial Connection Failed or Not Supported on this device.");
    }
  });
}
