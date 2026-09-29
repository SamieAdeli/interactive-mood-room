const layers = [
  { selector: ".window", speed: 0.02 },
  { selector: ".lamp", speed: 0.04 },
  { selector: ".record-player", speed: 0.06 },
  { selector: ".plant", speed: 0.08 }
];

const elements = layers.map(layer => ({
  el: document.querySelector(layer.selector),
  speed: layer.speed
}));

document.addEventListener("mousemove", (e) => {
  const x = e.clientX / window.innerWidth - 0.5;
  const y = e.clientY / window.innerHeight - 0.5;

  elements.forEach(({ el, speed }) => {
    el.style.transform =
      `translate(${x * speed * 100}px, ${y * speed * 100}px)`;
  });
});
const lamp = document.querySelector("#lamp");
const room = document.querySelector(".room");

let lampOn = true;

lamp.addEventListener("click", () => {
  lampOn = !lampOn;

  room.classList.toggle("lamp-off", !lampOn);

  // Simple click sound using Web Audio
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = lampOn ? 600 : 350;

  gain.gain.setValueAtTime(0.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.15
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
});

const recordPlayer = document.querySelector("#recordPlayer");
const music = document.querySelector("#music");
const canvas = document.querySelector("#visualizer");
const ctx = canvas.getContext("2d");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();

analyser.fftSize = 64;

const source = audioContext.createMediaElementSource(music);
source.connect(analyser);
analyser.connect(audioContext.destination);

const dataArray = new Uint8Array(analyser.frequencyBinCount);

recordPlayer.addEventListener("click", async () => {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  if (music.paused) {
    music.play();
    recordPlayer.classList.add("playing");
    drawVisualizer();
  } else {
    music.pause();
    recordPlayer.classList.remove("playing");
  }
});

function drawVisualizer() {
  if (music.paused) return;

  requestAnimationFrame(drawVisualizer);

  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / dataArray.length;

  dataArray.forEach((value, i) => {
    const barHeight = (value / 255) * canvas.height;

    ctx.fillStyle = "#d8b77a";

    ctx.fillRect(
      i * barWidth,
      canvas.height - barHeight,
      barWidth - 2,
      barHeight
    );
  });
}

const windowEl = document.querySelector("#window");
const rain = document.querySelector(".rain");
const rainSound = document.querySelector("#rainSound");

// Create rain particles
for (let i = 0; i < 70; i++) {
  const drop = document.createElement("span");

  drop.className = "raindrop";
  drop.style.left = `${Math.random() * 100}%`;
  drop.style.animationDuration = `${0.5 + Math.random() * 0.8}s`;
  drop.style.animationDelay = `${Math.random() * 2}s`;

  rain.appendChild(drop);
}

// Window reacts to mouse position
document.addEventListener("mousemove", (e) => {
  const rect = windowEl.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;

  windowEl.style.transform = `
    translate(${x * 10}px, ${y * 10}px)
  `;
});

// Start rain sound when entering the window
windowEl.addEventListener("mouseenter", () => {
  rainSound.volume = 0.25;
  rainSound.play().catch(() => {});
});

windowEl.addEventListener("mouseleave", () => {
  rainSound.pause();
});
const lightning = document.querySelector(".lightning");
const thunderSound = document.querySelector("#thunderSound");

function lightningStrike() {
  lightning.classList.remove("flash");
  void lightning.offsetWidth;
  lightning.classList.add("flash");

  thunderSound.currentTime = 0;
  thunderSound.volume = 0.5;
  thunderSound.play().catch(() => {});
}

setInterval(() => {
  if (!rainSound.paused) {
    lightningStrike();
  }
}, 6000);


const door = document.querySelector("#door");
const visitor = document.querySelector("#visitor");
const visitorImg = visitor.querySelector("img");

const knockSound = document.querySelector("#knockSound");
const footstepsSound = document.querySelector("#footstepsSound");

let visitorSequenceStarted = false;

door.addEventListener("click", () => {
  if (visitorSequenceStarted) return;
  visitorSequenceStarted = true;

  // Knock
  knockSound.currentTime = 0;
  knockSound.volume = 0.7;
  knockSound.play().catch(() => {});

  const tl = gsap.timeline();

  // Open door
  tl.to(door, {
    rotationY: -65,
    duration: 1.4,
    ease: "power3.inOut"
  })

  // Character appears
  .set(visitor, {
    opacity: 1
  })

  // Start footsteps
  .add(() => {
    footstepsSound.currentTime = 0;
    footstepsSound.volume = 0.45;
    footstepsSound.play().catch(() => {});
  })

  // Standing pose
  .set(visitorImg, {
    attr: { src: "assets/visitor-standing.png" }
  })

  // Walk frame 1
  .set(visitorImg, {
    attr: { src: "assets/visitor-walk1.png" }
  })

  // Move toward chair
  .to(visitor, {
  x: -380,
  duration: 9.5,
  ease: "linear"
}, "walk")

  // Walking animation
  .to(visitorImg, {
    onStart: () => {
      let frame = 1;

      visitor.walkInterval = setInterval(() => {
        frame = frame === 1 ? 2 : 1;

        visitorImg.src =
          `assets/visitor-walk${frame}.png`;
      }, 450);
    },
    onComplete: () => {
      clearInterval(visitor.walkInterval);
    }
  }, "walk")

  // Switch to sitting pose
  .set(visitorImg, {
    attr: { src: "assets/visitor-sitting.png" }
  })

  // Small settling motion
 .to(visitor, {
  y: 65,
  duration: 0.8,
  ease: "power2.out"
});
});