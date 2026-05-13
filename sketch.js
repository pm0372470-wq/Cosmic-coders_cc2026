// ==========================================
// GLOBAL VARIABLES & STATE
// ==========================================
let currentPhase = 1, glowValue = 20, glowDir = 1;
let countdown = 5, clouds = [], spectatorsLeft = [], spectatorsRight = [], launchSmokeParticles = [];
let launchRocketY, propulsionActive = false, liftOffSpeed = 0;
let mode = 'sep', sepStage = 0, sepTimer = 0, sepRocketY, rVY = 1.6;
let boosters = [], flL = null, flR = null, propM = null, parkAngle = 0, sepSmoke = [];
let orbitPhase = 0, orbitAngle = 0, missionSec = 0, orbitSmokeParticles = [], stars = [];
let apogees = [45163, 51400, 61400, 71351, 127609], orbDays = [2, 4, 7, 11, 16];
let orbits = [{a: 100, b: 72}, {a: 148, b: 100}, {a: 196, b: 128}, {a: 250, b: 152}, {a: 312, b: 170}];
let moonMode = 0, moonTimer = 0, moonOrbitAngle = 0, moonOrbitCount = 0, landerY = 0, roverX = 0, roverDir = 1, moonCraters = [];

const SEP_LABELS = ["ASCENT", "BOOSTER SEP", "FAIRING SEP", "PROP MODULE SEP", "PARKING ORBIT"];
const SEP_MSGS = [
  "LVM3-M4 ascending — S200 boosters firing",
  "S200 solid boosters separating at ~45 km",
  "Payload fairing jettisoned — spacecraft exposed",
  "Propulsion module separating — spacecraft free!",
  "Chandrayaan-3 in Earth parking orbit — Jul 14, 2023"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Courier New');
  launchRocketY = height - 100;
  for (let i = 0; i < 8; i++) clouds.push({x: random(width), y: random(height * 0.1, height * 0.4), speed: random(0.2, 0.5)});
  for (let i = 0; i < 15; i++) {
    spectatorsLeft.push({x: random(20, 180), y: height - 120 + random(20)});
    spectatorsRight.push({x: width - random(20, 180), y: height - 120 + random(20)});
  }
  sepRocketY = height * 0.65;
  for (let i = 0; i < 240; i++) stars.push({x: random(width), y: random(height), s: random(0.5, 2.5), sp: random(0.02, 0.06)});
}

function draw() {
  if (currentPhase === 1) drawPhase1();
  else if (currentPhase === 2) drawPhase2();
  else if (currentPhase === 3) drawPhase3();
  else drawPhase4();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function mousePressed() {
  // Updated hit box for the new prominent Launch Button
  if (currentPhase === 1 && abs(mouseX - width / 2) < 100 && abs(mouseY - height * 0.75) < 25) currentPhase = 2;
}

// ==========================================
// PHASE 1: MISSION BRIEFING
// ==========================================
function drawPhase1() {
  background(2, 5, 10);
  drawVignette();
  glowValue += 0.5 * glowDir;
  if (glowValue > 30 || glowValue < 15) glowDir *= -1;

  drawISROLogo(width / 2 - 180, height * 0.15);
  fill(200, 200, 200, 200); textAlign(LEFT, CENTER); noStroke(); textSize(12);
  text("INDIAN SPACE RESEARCH ORGANISATION", width / 2 - 110, height * 0.145);
  text("भारतीय अंतरिक्ष अनुसंधान संगठन", width / 2 - 110, height * 0.17);

  textAlign(CENTER, CENTER); fill(255, 140, 0);
  drawingContext.shadowBlur = glowValue; drawingContext.shadowColor = color(255, 100, 0);
  textSize(48); textStyle(BOLD); text("CHANDRAYAAN - 3", width / 2, height * 0.32);
  textSize(36); text("THE  COMPLETE  JOURNEY", width / 2, height * 0.42);
  drawingContext.shadowBlur = 0; textStyle(NORMAL);

  fill(100, 150, 200, 220); textSize(13);
  let timeline = ["Jul 14  →  Launch from Sriharikota", "5× Earth Orbit Manoeuvres  →  Lunar Transfer Trajectory", "5× Moon Orbit Insertions  →  Vikram Separation", "Powered Descent  →  Pragyan Rover Deployment"];
  timeline.forEach((line, i) => text(line, width / 2, height * 0.53 + i * 22));
  fill(150, 180, 220); text("South Pole  ·  23 August 2023  ·  17:20 IST", width / 2, height * 0.53 + 99);
  
  drawLaunchButton(width / 2, height * 0.75);
  
  fill(80, 100, 120); textSize(10); text("🔊 AUDIO ENABLED   ·   JAI HIND   ·   जय हिंद", width / 2, height * 0.85);
}

function drawISROLogo(x, y) {
  push(); translate(x, y); noFill(); stroke(255, 140, 0); strokeWeight(1.5);
  ellipse(0, 0, 50, 25); fill(255, 140, 0); ellipse(0, 0, 8, 8);
  noFill(); arc(0, 0, 35, 45, PI, TWO_PI); pop();
}

function drawLaunchButton(x, y) {
  push(); rectMode(CENTER);
  let isHover = abs(mouseX - x) < 100 && abs(mouseY - y) < 25;
  
  // Fill color changes on hover
  fill(isHover ? color(255, 160, 0) : color(220, 100, 0));
  stroke(255, 200, 0); strokeWeight(2);
  
  drawingContext.shadowBlur = isHover ? 25 : 15; 
  drawingContext.shadowColor = color(255, 120, 0);
  rect(x, y, 200, 50, 8); // Rounded rectangle
  drawingContext.shadowBlur = 0;
  
  fill(255); noStroke(); textSize(20); textStyle(BOLD); textAlign(CENTER, CENTER);
  text("LAUNCH", x, y); 
  pop();
}

function drawVignette() {
  let grad = drawingContext.createRadialGradient(width/2, height/2, 0, width/2, height/2, width*0.8);
  grad.addColorStop(0, 'rgba(10, 20, 40, 0)'); grad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
  drawingContext.fillStyle = grad; rect(0, 0, width, height);
}

// ==========================================
// PHASE 2: LAUNCH SITE
// ==========================================
function drawPhase2() {
  background(7, 24, 60);
  drawStylizedClouds(); drawLegacyTicker(); drawTopHUD();
  fill(15, 30, 20); noStroke(); rect(0, height - 100, width, 100);
  for (let i = 0; i < width; i += 25) triangle(i, height - 100, i + 12, height - 135, i + 25, height - 100);
  drawCrowd(spectatorsLeft); drawCrowd(spectatorsRight);
  drawInfrastructure(); drawElectricPillars(); drawIndiaFlag(width / 2 + 220, height - 240);
  handleRocketMovement(); handleCountdown();
  if (launchRocketY < -200) currentPhase = 3;
}

function handleRocketMovement() {
  if (countdown <= 0) {
    propulsionActive = true; liftOffSpeed += 0.04; launchRocketY -= liftOffSpeed;
    translate(random(-1, 1) * min(liftOffSpeed, 4), random(-1, 1) * min(liftOffSpeed, 4));
    for (let i = 0; i < 6; i++) launchSmokeParticles.push(new LaunchSmokeParticle(width / 2, launchRocketY + 80));
  }
  launchSmokeParticles = launchSmokeParticles.filter(p => { p.update(); p.display(); return !p.isDead(); });
  drawAdvancedRocket(width / 2, launchRocketY);
}

function drawAdvancedRocket(x, y) {
  push(); translate(x, y); stroke(150); fill(230); rect(-55, -80, 30, 160, 5); rect(25, -80, 30, 160, 5);
  fill(200, 50, 0); triangle(-55, -80, -25, -80, -40, -110); triangle(25, -80, 55, -80, 40, -110);
  fill(255); beginShape(); vertex(0, -220); bezierVertex(15, -220, 25, -180, 25, -160); vertex(-25, -160); 
  bezierVertex(-25, -180, -15, -220, 0, -220); endShape(CLOSE); rect(-25, -160, 50, 240);
  noStroke(); fill(0, 50, 150); textSize(8); textAlign(CENTER); text("ISRO", 0, -120);
  fill(255, 100, 0); rect(-25, -30, 50, 10); fill(40); rect(-45, 80, 10, 12); rect(35, 80, 10, 12); rect(-15, 80, 30, 18); pop();
}

class LaunchSmokeParticle {
  constructor(x, y) {
    this.x = x + random(-25, 25); this.y = y; this.vx = random(-1.5, 1.5); this.vy = random(2, 6);
    this.alpha = 255; this.size = random(15, 35); this.color = lerpColor(color(255, 160, 0), color(120), random(0.3, 0.8));
  }
  update() { this.x += this.vx; this.y += this.vy; this.alpha -= 3.5; this.size += 1.2; }
  display() { noStroke(); fill(red(this.color), green(this.color), blue(this.color), this.alpha); ellipse(this.x, this.y, this.size); }
  isDead() { return this.alpha <= 0; }
}

function drawLegacyTicker() {
  fill(0, 0, 0, 180); rect(0, 100, width, 140);
  fill(255, 180, 0); textSize(13); textAlign(LEFT); text("✦ ISRO LEGACY", 20, 125);
  fill(200); textSize(11);
  let leg = ["1963 - First rocket parts on bicycle & bullock cart to Thumba site", "1980 - SLV-3 places Rohini in orbit; India enters space independently", "1994 - PSLV debut: World's most reliable launcher with 50+ successes"];
  leg.forEach((l, i) => text("✦ " + l, 20, 155 + i * 30));
}

function drawTopHUD() {
  fill(255, 150, 0); textSize(12); textAlign(LEFT); text("🚀 CHANDRAYAAN - 3", 20, 35);
  fill(100, 150, 255); text("LAUNCH COUNTDOWN", 20, 55); textAlign(RIGHT);
  text("T + 00:00:0" + max(0, 5 - countdown), width - 20, 35);
}

function handleCountdown() {
  if (frameCount % 60 === 0 && countdown > 0) countdown--;
  if (countdown > 0) { fill(255, 180, 0); textAlign(CENTER); textSize(100); text(countdown, width / 2, height / 2); }
}

function drawInfrastructure() {
  let rx = width / 2; [rx - 140, rx + 140].forEach(x => {
    for (let i = 0; i < 10; i++) { fill(i % 2 === 0 ? color(220, 0, 0) : 255); rect(x - 15, height - 100 - (i + 1) * 40, 30, 40); }
    fill(255, 0, 0); if (frameCount % 40 < 20) ellipse(x, height - 510, 10, 10);
  });
  let gap = propulsionActive ? map(liftOffSpeed, 0, 10, 0, 180) : 0;
  stroke(100); strokeWeight(5); line(rx-140, height-300, rx-25-gap, height-300); line(rx+140, height-300, rx+25+gap, height-300); noStroke();
}

function drawCrowd(people) {
  people.forEach(p => {
    fill(240, 200, 160); ellipse(p.x, p.y, 8, 8); stroke(240, 200, 160); line(p.x, p.y + 4, p.x, p.y + 15);
    if (propulsionActive) line(p.x, p.y + 6, p.x + sin(frameCount * 0.2) * 10, p.y - 5);
    noStroke(); fill(255, 153, 51); rect(p.x + 5, p.y - 15, 10, 3); fill(19, 136, 8); rect(p.x + 5, p.y - 9, 10, 3);
  });
}

function drawStylizedClouds() {
  fill(255, 255, 255, 80);
  clouds.forEach(c => {
    for (let j = 0; j < 8; j++) ellipse(c.x + (j * 18), c.y, 45, 45);
    c.x = (c.x + c.speed > width) ? -200 : c.x + c.speed;
  });
}

function drawIndiaFlag(x, y) {
  push(); translate(x, y); stroke(180); strokeWeight(4); line(0, -70, 0, 40); noStroke();
  let wave = sin(frameCount * 0.08) * 6;
  [[255, 153, 51, -70, -48], [255, 255, 255, -48, -26], [19, 136, 8, -26, -4]].forEach(c => {
    fill(c[0], c[1], c[2]); beginShape(); vertex(0, c[3]); vertex(70 + wave, c[3] + 5); vertex(70 + wave, c[4] + 5); vertex(0, c[4]); endShape(CLOSE);
  });
  stroke(0, 0, 150); strokeWeight(1.5); noFill(); ellipse(35, -36, 10, 10); pop();
}

function drawElectricPillars() {
  drawElectricTower(width / 2 - 320, height - 100, 180); drawElectricTower(width / 2 - 460, height - 100, 150); drawElectricTower(width / 2 + 350, height - 100, 190);
  stroke(80); strokeWeight(1.5); noFill();
  [[width/2-460, width/2-320, -250, -280], [width/2-460, width/2-320, -235, -265], [width/2+350, width, -290, -240]].forEach(w => {
    beginShape(); for (let t = 0; t <= 1; t += 0.05) vertex(lerp(w[0], w[1], t), height + lerp(w[2], w[3], t) + sin(t * PI) * 15); endShape();
  }); noStroke();
}

function drawElectricTower(x, groundY, h) {
  push(); translate(x, groundY); stroke(160, 160, 180); strokeWeight(2); line(-10, 0, -5, -h); line(10, 0, 5, -h);
  let steps = floor(h / 30);
  for (let i = 0; i <= steps; i++) {
    let y1 = -i * 30, sp = map(i, 0, steps, 10, 5); line(-sp, y1, sp, y1);
    if (i < steps) { line(-sp, y1, sp, y1 - 30); line(sp, y1, -sp, y1 - 30); }
  }
  let ty = -h; strokeWeight(2.5); line(-20, ty, 20, ty); line(-15, ty+5, -15, ty-8); line(0, ty+5, 0, ty-8); line(15, ty+5, 15, ty-8);
  noStroke(); fill(frameCount % 50 < 25 ? color(255, 30, 30) : color(100, 0, 0)); ellipse(0, ty - 10, 6, 6); pop();
}

// ==========================================
// PHASE 3: SEPARATION & ORBIT
// ==========================================
function drawPhase3() {
  background(3, 8, 22); drawStars(); drawSun();
  if (mode === 'sep') drawSep(); else drawOrbits();
}

function drawSep() {
  let cx = width / 2; sepTimer++;
  if (sepStage === 0) {
    rVY += 0.02; sepRocketY -= rVY; spawnSepSmoke(cx, sepRocketY + 90, 6, true); drawRocketFull(cx, sepRocketY);
    if (sepRocketY < height * 0.38) nextSep();
  } else if (sepStage === 1) {
    sepRocketY -= rVY * 0.6; spawnSepSmoke(cx, sepRocketY + 60, 3, false);
    if (boosters.length === 0) { boosters.push({x:cx-42,y:sepRocketY+30,vx:-2.2,vy:1,rot:0,rs:0.05},{x:cx+42,y:sepRocketY+30,vx:2.2,vy:1,rot:0,rs:-0.05}); }
    boosters.forEach(b => {
      b.x+=b.vx; b.y+=b.vy; b.vy+=0.04; b.rot+=b.rs; spawnSepSmoke(b.x, b.y+10, 1, false);
      push(); translate(b.x,b.y); rotate(b.rot); fill(180,180,200); stroke(120); rect(-10,-40,20,80,3); fill(200,60,60); noStroke(); triangle(-10,-40,10,-40,0,-62); pop();
    }); drawRocketCore(cx, sepRocketY); if (sepTimer > 90) { boosters=[]; nextSep(); }
  } else if (sepStage === 2) {
    sepRocketY -= rVY * 0.4; spawnSepSmoke(cx, sepRocketY + 50, 2, false);
    if (!flL) { flL = {x:cx-15, y:sepRocketY-60, vx:-2.2, vy:-1.2, rot:0}; flR = {x:cx+15, y:sepRocketY-60, vx: 2.2, vy:-1.2, rot:0}; }
    [flL, flR].forEach((f, i) => {
      f.x+=f.vx; f.y+=f.vy; f.rot += (i?0.04:-0.04);
      push(); translate(f.x,f.y); rotate(f.rot); fill(220,215,200); stroke(140);
      beginShape(); vertex(0,26); vertex(i?20:-20,26); vertex(i?20:-20,-26); vertex(i?4:-4,-56); vertex(0,-56); endShape(CLOSE); pop();
    }); drawRocketCore(cx, sepRocketY); if (sepTimer > 88) { flL=flR=null; nextSep(); }
  } else if (sepStage === 3) {
    sepRocketY -= rVY * 0.25; if (!propM) propM = {x:cx, y:sepRocketY+46, vx:0.5, vy:2.2};
    propM.x+=propM.vx; propM.y+=propM.vy; propM.vy+=0.03; spawnSepSmoke(propM.x, propM.y+16, 2, false);
    push(); translate(propM.x, propM.y); fill(150,140,120); stroke(110); rect(-20,-13,40,30,4); fill(25,65,155); noStroke(); rect(-44,-6,22,12,2); rect(22,-6,22,12,2); fill(75); ellipse(0,20,18,8); drawFlame(0,22); pop();
    drawSatOnly(cx, sepRocketY); if (sepTimer > 110) { propM=null; nextSep(); }
  } else {
    parkAngle += 0.016; let oa=width*0.25, ob=height*0.18, tilt=-0.18, ocx=width/2, ocy=height*0.52;
    noFill(); stroke(255,220,80,50); push(); translate(ocx,ocy); rotate(tilt); ellipse(0,0,oa*2,ob*2); pop();
    let sx = ocx + oa*cos(parkAngle)*cos(tilt) - ob*sin(parkAngle)*sin(tilt);
    let sy = ocy + oa*cos(parkAngle)*sin(tilt) + ob*sin(parkAngle)*cos(tilt);
    spawnSepSmoke(sx, sy, 1, false); drawSatOnly(sx, sy); drawEarth(width/2, height*0.52);
    if (parkAngle > TWO_PI*2) { mode='orbit'; sepSmoke=[]; }
  }
  updateSepSmoke(); drawSepHUD();
}

function nextSep() { sepStage++; sepTimer=0; sepSmoke=[]; }

function drawOrbits() {
  let cx = width/2 - 30, cy = height/2 + 40;
  push(); translate(cx,cy); rotate(-0.28); noFill();
  orbits.forEach((o, i) => {
    stroke(i < orbitPhase ? [255,120,30,160] : (i === orbitPhase ? [255,40,40,220] : [200,200,60,60]));
    strokeWeight(i===orbitPhase ? 2 : 1.2); ellipse(0,0,o.a*2,o.b*2);
  }); pop();
  drawEarth(cx, cy);
  let o = orbits[min(orbitPhase,4)], spd = map(orbitPhase,0,4,0.009,0.004); orbitAngle += spd;
  let rx = o.a*cos(orbitAngle), ry2 = o.b*sin(orbitAngle), sx = cx + rx*cos(-0.28) - ry2*sin(-0.28), sy = cy + rx*sin(-0.28) + ry2*cos(-0.28);
  drawSatellite(sx, sy, orbitAngle);
  if (orbitAngle>PI*0.85 && orbitAngle<PI*1.15) for(let i=0;i<2;i++) orbitSmokeParticles.push(new OrbitSmokeParticle(sx,sy));
  orbitSmokeParticles = orbitSmokeParticles.filter(p => { p.update(); p.display(); return !p.isDead(); });
  if (orbitAngle >= TWO_PI) { orbitAngle = 0; if (orbitPhase < 4) orbitPhase++; else { currentPhase = 4; initPhase4(); } }
  if (frameCount%60===0) missionSec++;
  fill(255,200,0); textSize(13); textAlign(LEFT); text("🚀 CHANDRAYAAN-3", 18, 32);
  fill(80,255,80); textAlign(RIGHT); text("T+"+nf(floor(missionSec/60),2)+":"+nf(missionSec%60,2), width-18, 32);
  drawOrbitPanel(orbitPhase, missionSec); drawOrbitBottomBar(orbitPhase);
}

function drawOrbitPanel(phase, sec) {
  fill(0,190); noStroke(); rect(width-290,60,270,155,6); stroke(255,200,0); noFill(); rect(width-290,60,270,155,6);
  fill(255,200,0); textSize(11); textAlign(LEFT); noStroke(); text("◆ EARTH-BOUND MANOEUVRES", width-276, 82);
  fill(180,220,180); textSize(10); text("Orbit: "+(phase+1)+" / 5", width-276, 104); text("Days elapsed: ~"+floor(sec/60)+" of "+orbDays[phase], width-276, 120);
  fill(80,255,80); textSize(11); text("OVER "+orbDays[phase]+" DAYS", width-276, 158);
}

function drawOrbitBottomBar(phase) {
  fill(0,200); rect(width/2-280,height-50,560,36,6); stroke(255,200,0); noFill(); rect(width/2-280,height-50,560,36,6);
  fill(255,220,120); textAlign(CENTER); noStroke(); text("Perigee burn "+min(phase+1,5)+"/5 complete! Orbit "+(phase+1)+" — Apogee: "+apogees[phase].toLocaleString()+" km", width/2, height-27);
}

function drawRocketFull(x, y) { push(); translate(x,y); fill(175,175,195); stroke(110); rect(-56,-35,22,85,3); rect(34,-35,22,85,3); fill(200,55,55); noStroke(); triangle(-56,-35,-34,-35,-45,-60); triangle(34,-35,56,-35,45,-60); drawCore(); pop(); }
function drawRocketCore(x, y) { push(); translate(x,y); drawCore(); pop(); }
function drawCore() { fill(218,218,232); stroke(138); rect(-22,-78,44,156,4); fill(255,95,0); noStroke(); triangle(-22,-78,22,-78,0,-126); rect(-22,-28,44,10); fill(50); rect(-18,78,36,18,3); drawFlame(0,96); }
function drawSatOnly(x, y) { push(); translate(x,y); fill(198,192,170); stroke(128); rect(-18,-18,36,36,4); fill(28,72,178); noStroke(); rect(-44,-10,24,18,2); rect(20,-10,24,18,2); pop(); }

function drawSatellite(x, y, a) { 
  push(); translate(x,y); rotate(a+HALF_PI); 
  // Central Body
  fill(220,220,240); stroke(150); rect(-7,-10,14,20,2); 
  // Solar Panels
  fill(30,80,180); stroke(100); 
  rect(-26,-6,19,12,1); // Left panel
  rect(7,-6,19,12,1);   // Right panel
  // Communication dish
  fill(200); noStroke(); ellipse(0, -12, 6, 6);
  pop(); 
}

function drawEarth(cx, cy) {
  // Better Earth glow
  for (let r=115;r>85;r-=5) { fill(30,80,200,map(r,85,115,40,0)); ellipse(cx,cy,r*2); }
  // Better Earth shape & landmasses
  fill(20,80,200); ellipse(cx,cy,170); 
  fill(30,140,30); 
  ellipse(cx-15,cy-15,60,40); 
  ellipse(cx+25,cy+15,40,30);
  ellipse(cx-20,cy+25,30,20);
}

function drawSun() {
  // Changed to fixed small sun far away in the top right corner
  let sx = width - 80, sy = 80, sr = 35; 
  noStroke();
  for (let r=sr+40;r>sr;r-=5) { fill(180,130,0,map(r,sr,sr+40,40,0)); ellipse(sx,sy,r*2); }
  fill(240,190,40); ellipse(sx,sy,sr*2);
}

function drawStars() { stars.forEach(s => { fill(255, constrain(150+80*sin(frameCount*s.sp+s.x*0.01), 60, 255)); ellipse(s.x,s.y,s.s); }); }
function drawFlame(x, y) { push(); translate(x,y); let h=15+sin(frameCount*.5)*6; fill(255,75,0,175); ellipse(0,h*.4,12,h); fill(255,255,190); ellipse(0,h*.08,3,h*.36); pop(); }

function spawnSepSmoke(x,y,n,big) {
  for (let i=0;i<n;i++) sepSmoke.push({x:x+random(-8,8), y:y, vx:random(-1.2,1.2), vy:random(.8,big?4.5:3), a:big?220:185, r:big?random(10,25):random(3,10), da:big?3:5.5, c:lerpColor(color(255,155,0),color(115),random(.2,.85))});
}

function updateSepSmoke() {
  sepSmoke = sepSmoke.filter(p => { p.x+=p.vx; p.y+=p.vy; p.a-=p.da; p.r+=0.9; fill(red(p.c),green(p.c),blue(p.c),p.a); ellipse(p.x,p.y,p.r); return p.a>0; });
}

class OrbitSmokeParticle {
  constructor(x,y){ this.x=x+random(-6,6); this.y=y; this.vx=random(-1,1); this.vy=random(-2,2); this.alpha=200; this.size=random(4,10); this.color=lerpColor(color(255,160,0),color(255,80,0),random()); }
  update(){this.x+=this.vx;this.y+=this.vy;this.alpha-=6;this.size+=0.8;}
  display(){noStroke();fill(red(this.color),green(this.color),blue(this.color),this.alpha);ellipse(this.x,this.y,this.size);}
  isDead(){return this.alpha<=0;}
}

function drawSepHUD() {
  fill(255,200,0); textAlign(LEFT); text("🚀 CHANDRAYAAN-3", 18, 32);
  fill(0,160); rect(width/2-175,10,350,28,6); fill(78,255,175); textAlign(CENTER); text("▶ "+SEP_LABELS[min(sepStage,4)], width/2, 28);
  fill(0,185); rect(width/2-280,height-46,560,32,6); stroke(255,200,0); noFill(); rect(width/2-280,height-46,560,32,6);
  fill(255,218,115); noStroke(); text(SEP_MSGS[min(sepStage,4)], width/2, height-24);
}

// ==========================================
// PHASE 4: LUNAR TRANSFER, ORBIT & LANDING
// ==========================================
function initPhase4() {
  moonMode=0; moonTimer=0; moonOrbitAngle=0; moonOrbitCount=0;
  for (let i=0;i<15;i++) moonCraters.push({x:random(width), y:random(height*0.75,height-10), r:random(5,26)});
  landerY=height*0.14; roverX=width/2+30;
}

function drawPhase4() {
  background(3,8,22); drawStars(); moonTimer++;
  if (moonMode===0) drawTransfer(); else if (moonMode===1) drawMoonOrbit(); else if (moonMode===2) drawLanding(); else drawRoverScene();
  fill(255,200,0); textAlign(LEFT); text("🚀 CHANDRAYAAN-3",18,32);
  let lb=["TRANS-LUNAR INJECTION","LUNAR ORBIT INSERTION","POWERED DESCENT","PRAGYAN DEPLOYED"];
  fill(200,160,255); textSize(10); text(lb[moonMode],18,50);
}

function drawTransfer() {
  let ex=width*0.12, ey=height*0.62, mx=width*0.82, my=height*0.32, t=constrain(moonTimer/300,0,1);
  drawSmallEarth(ex,ey,44); drawMoonBody(mx,my,64);
  stroke(255,200,80,110); noFill(); beginShape(); for(let i=0;i<=40;i++){ let tt=i/40; vertex(lerp(ex,mx,tt), lerp(ey,my,tt)-sin(tt*PI)*height*0.4); } endShape();
  let sx=lerp(ex,mx,t), sy=lerp(ey,my,t)-sin(t*PI)*height*0.4;
  drawSatellite(sx,sy,atan2(sy-sy,sx-sx)-HALF_PI); spawnSepSmoke(sx,sy,1,false); updateSepSmoke();
  drawMoonBar("TRANS-LUNAR INJECTION — Spacecraft escaping Earth gravity field");
  if (moonTimer>320){ moonMode=1; moonTimer=0; }
}

function drawMoonOrbit() {
  let mx=width/2, my=height*0.44;
  for(let i=0;i<3;i++){ stroke(200,180,255,i<moonOrbitCount?130:40); noFill(); ellipse(mx,my,(185-i*9)*2,(128-i*6)*2); }
  drawMoonBody(mx,my,90); moonOrbitAngle+=0.013;
  let sx=mx+185*cos(moonOrbitAngle), sy=my+128*sin(moonOrbitAngle);
  drawSatellite(sx,sy,moonOrbitAngle); spawnSepSmoke(sx,sy,1,false); updateSepSmoke();
  if (moonOrbitAngle>=TWO_PI){ moonOrbitAngle=0; moonOrbitCount++; if(moonOrbitCount>=3) moonMode=2; }
  drawMoonBar("LUNAR ORBIT INSERTION — "+moonOrbitCount+" of 3 orbits complete");
}

function drawLanding() {
  drawMoonSurface(); if (landerY<height*0.655) landerY+=1.6; else if (moonTimer>100) moonMode=3;
  if (landerY<height*0.655){ drawFlame(width/2,landerY+30); spawnSepSmoke(width/2,landerY+36,2,false); updateSepSmoke(); }
  drawLander(width/2,landerY); drawMoonBar("POWERED DESCENT — Vikram lander braking engines firing");
}

function drawRoverScene() {
  drawMoonSurface(); drawLander(width/2,height*0.655);
  if (moonTimer>65){ roverX+=roverDir*0.75; if(roverX>width*0.78||roverX<width*0.22) roverDir*=-1; }
  if (moonTimer<78){ stroke(152); line(width/2+14,height*0.682,roverX,height*0.732); }
  drawRoverSprite(roverX,height*0.731); drawMoonBar("PRAGYAN ROVER — Analysing lunar regolith  🌙");
  if (moonTimer>140){ fill(255,215,0); textSize(20); textAlign(CENTER); text("INDIA ON THE MOON  •  23 AUG 2023  🇮🇳",width/2,height*0.22); }
}

function drawSmallEarth(cx,cy,er) { 
  noStroke();
  fill(20,80,200); ellipse(cx,cy,er*2); 
  fill(30,140,30); 
  ellipse(cx-er*0.15,cy-er*0.15,er*0.6,er*0.4); 
  ellipse(cx+er*0.2,cy+er*0.1,er*0.5,er*0.3);
}

function drawMoonBody(cx,cy,r) { 
  noStroke();
  fill(200, 198, 190); ellipse(cx,cy,r*2); 
  fill(170, 168, 160); 
  ellipse(cx-r*0.25,cy-r*0.15,r*0.35,r*0.35);
  ellipse(cx+r*0.3,cy+r*0.2,r*0.4,r*0.3);
  ellipse(cx-r*0.1,cy+r*0.3,r*0.25,r*0.2);
}

function drawMoonSurface() { 
  fill(155,148,132); rect(0,height*0.72,width,height*0.28); 
  moonCraters.forEach(c=>{fill(130); ellipse(c.x,c.y,c.r*2,c.r*0.6);}); 
}

function drawLander(x,y) { 
  push(); translate(x,y); 
  
  // Deployment Stands/Legs
  stroke(180); strokeWeight(2);
  line(-12, 12, -22, 28); // Left outer leg
  line(12, 12, 22, 28);   // Right outer leg
  line(-12, 12, -10, 28); // Left inner brace
  line(12, 12, 10, 28);   // Right inner brace
  fill(150); noStroke();
  ellipse(-22, 28, 10, 4); // Left outer footpad
  ellipse(22, 28, 10, 4);  // Right outer footpad
  ellipse(-10, 28, 6, 3);  // Left inner footpad
  ellipse(10, 28, 6, 3);   // Right inner footpad
  
  // Lander Body (Gold Foil Box)
  fill(215, 185, 80); 
  rect(-16,-18,32,30,3); 
  
  // Central core/door
  fill(40); rect(-8, -10, 16, 20, 2); 
  pop(); 
}

function drawRoverSprite(x,y) { push(); translate(x,y); fill(52); ellipse(-20,10,14,14); ellipse(20,10,14,14); fill(180); rect(-22,-8,44,18,3); pop(); }
function drawMoonBar(msg) { fill(0,185); rect(width/2-315,height-46,630,32,6); fill(240); textAlign(CENTER); text(msg,width/2,height-24); }
