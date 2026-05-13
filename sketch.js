/**
 * CHANDRAYAAN-3: THE COMPLETE JOURNEY
 * Phase 1: Mission Briefing Interface (Recreation of image_9b188b.jpg)
 */

let missionFont;
let glowValue = 20;
let glowDir = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Using a monospaced font to match the telemetry aesthetic
  textFont('Courier New'); 
}

function draw() {
  background(2, 5, 10); // Deep velvety cosmic black
  
  // Subtle vignette effect
  drawVignette();

  // Pulsing Glow Effect for the titles
  glowValue += 0.5 * glowDir;
  if (glowValue > 30 || glowValue < 15) glowDir *= -1;

  // 1. ISRO LOGO & HEADER TEXT
  drawISROLogo(width / 2 - 180, height * 0.15);
  
  textAlign(LEFT, CENTER);
  noStroke();
  fill(200, 200, 200, 200);
  textSize(12);
  let headerX = width / 2 - 110;
  text("INDIAN SPACE RESEARCH ORGANISATION", headerX, height * 0.145);
  text("भारतीय अंतरिक्ष अनुसंधान संगठन", headerX, height * 0.17);

  // 2. MAIN TITLES (With Glow)
  textAlign(CENTER, CENTER);
  fill(255, 140, 0); // ISRO Orange
  
  // Apply Neon Glow
  drawingContext.shadowBlur = glowValue;
  drawingContext.shadowColor = color(255, 100, 0);
  
  textSize(48);
  textStyle(BOLD);
  text("CHANDRAYAAN - 3", width / 2, height * 0.32);
  
  textSize(36);
  text("THE  COMPLETE  JOURNEY", width / 2, height * 0.42);
  
  // Reset Glow for smaller text
  drawingContext.shadowBlur = 0;
  textStyle(NORMAL);

  // 3. MISSION TIMELINE BITS (The technical list)
  fill(100, 150, 200, 220); // Muted blue-grey
  textSize(13);
  let lineH = 22;
  let timelineY = height * 0.53;
  
  text("Jul 14  →  Launch from Sriharikota", width / 2, timelineY);
  text("5× Earth Orbit Manoeuvres  →  Lunar Transfer Trajectory", width / 2, timelineY + lineH);
  text("5× Moon Orbit Insertions  →  Vikram Separation", width / 2, timelineY + lineH * 2);
  text("Powered Descent  →  Pragyan Rover Deployment", width / 2, timelineY + lineH * 3);
  
  fill(150, 180, 220);
  text("South Pole  ·  23 August 2023  ·  17:20 IST", width / 2, timelineY + lineH * 4.5);

  // 4. INITIATE MISSION BUTTON
  drawLaunchButton(width / 2, height * 0.75);

  // 5. FOOTER
  fill(80, 100, 120);
  textSize(10);
  text("🔊 AUDIO ENABLED   ·   JAI HIND   ·   जय हिंद", width / 2, height * 0.85);
}

function drawISROLogo(x, y) {
  push();
  translate(x, y);
  noFill();
  stroke(255, 140, 0);
  strokeWeight(1.5);
  
  // The Orbit
  ellipse(0, 0, 50, 25);
  
  // The "Eye"/Dot
  fill(255, 140, 0);
  ellipse(0, 0, 8, 8);
  
  // Small arcs
  noFill();
  arc(0, 0, 35, 45, PI, TWO_PI);
  pop();
}

function drawLaunchButton(x, y) {
  let btnW = 300;
  let btnH = 50;
  
  push();
  rectMode(CENTER);
  
  // Outer Border with glow
  noFill();
  stroke(255, 140, 0, 150);
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(255, 100, 0);
  rect(x, y, btnW, btnH);
  
  // Button Text
  drawingContext.shadowBlur = 0;
  fill(255, 140, 0);
  noStroke();
  textSize(16);
  // Play symbol
  triangle(x - 65, y - 6, x - 65, y + 6, x - 55, y);
  text("INITIATE MISSION", x + 10, y);
  pop();
}

function drawVignette() {
  let gradient = drawingContext.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width * 0.8
  );
  gradient.addColorStop(0, 'rgba(10, 20, 40, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
  drawingContext.fillStyle = gradient;
  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
/**
 * CHANDRAYAAN-3 — PHASE 2: LAUNCH SITE
 */

let countdown = 5;
let clouds = [], spectatorsLeft = [], spectatorsRight = [], smokeParticles = [];
let rocketY, propulsionActive = false, liftOffSpeed = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Courier New');
  rocketY = height - 100;
  for (let i = 0; i < 8; i++)
    clouds.push({x:random(width), y:random(height*0.1,height*0.4), speed:random(0.2,0.5)});
  for (let i = 0; i < 15; i++) {
    spectatorsLeft.push({x:random(20,180),   y:height-120+random(20)});
    spectatorsRight.push({x:width-random(20,180), y:height-120+random(20)});
  }
}

function draw() {
  background(7, 24, 60);
  drawStylizedClouds();
  drawLegacyTicker();
  drawTopHUD();

  fill(15,30,20); noStroke();
  rect(0, height-100, width, 100);
  drawStylizedGrass();

  drawCrowd(spectatorsLeft);
  drawCrowd(spectatorsRight);
  drawInfrastructure();
  drawElectricPillars();
  drawIndiaFlag(width/2+220, height-240);

  handleRocketMovement();
  handleCountdown();
}