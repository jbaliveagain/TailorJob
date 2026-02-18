const workflowData = [
  ['Pattern drafting', 'Body measurements translated to templates'],
  ['Fabric spreading', 'Minimize waste with grainline alignment'],
  ['Cutting & marking', 'Precision cutting based on seam allowances'],
  ['Stitching', 'Assembly with lockstitch and overlock passes'],
  ['Pressing & finishing', 'Steam shaping + quality inspection'],
];

const inventoryData = [
  ['Premium Wool', '12 bolts · suited for formalwear'],
  ['Linen Blend', '8 bolts · breathable summer stock'],
  ['Silk Lining', '16 rolls · luxury finishing'],
  ['High-tensile Thread', '42 spools · color matched sets'],
];

const ordersData = [
  ['Business suit adjustments', 'Deadline: 14:00 · Complexity: High'],
  ['Wedding dress hemline', 'Deadline: 16:20 · Complexity: Very High'],
  ['Streetwear jacket resize', 'Deadline: 18:00 · Complexity: Medium'],
  ['Uniform trouser repairs', 'Deadline: 19:15 · Complexity: Low'],
];

const workflowSteps = document.querySelector('#workflowSteps');
const inventoryList = document.querySelector('#inventoryList');
const orderList = document.querySelector('#orderList');

for (const [name, detail] of workflowData) {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${name}</strong><span>${detail}</span>`;
  workflowSteps.append(li);
}

for (const [name, detail] of inventoryData) {
  const row = document.createElement('div');
  row.className = 'inv-row';
  row.innerHTML = `<strong>${name}</strong><small>${detail}</small>`;
  inventoryList.append(row);
}

for (const [name, detail] of ordersData) {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${name}</strong>${detail}`;
  orderList.append(li);
}

const needle = document.querySelector('#needle');
const stitchBtn = document.querySelector('#stitchBtn');
const startBtn = document.querySelector('#startBtn');
const qualityValue = document.querySelector('#qualityValue');
const completedValue = document.querySelector('#completedValue');
const comboValue = document.querySelector('#comboValue');
const profitValue = document.querySelector('#profitValue');
const repMeter = document.querySelector('#repMeter');
const repLabel = document.querySelector('#repLabel');
const sweetZone = document.querySelector('#sweetZone');

let running = false;
let needlePos = 0;
let direction = 1;
let quality = 0;
let completed = 0;
let combo = 0;
let profit = 0;
let frame;

function renderStats() {
  qualityValue.textContent = `${Math.min(100, Math.round(quality))}%`;
  completedValue.textContent = completed;
  comboValue.textContent = `${combo}x`;
  profitValue.textContent = `$${profit.toLocaleString()}`;

  const rep = Math.min(100, Math.round(20 + quality * 0.65 + combo * 2));
  repMeter.style.width = `${rep}%`;

  if (rep < 40) repLabel.textContent = 'Local Alterations Tier';
  else if (rep < 70) repLabel.textContent = 'Boutique Atelier Tier';
  else repLabel.textContent = 'Elite Tailoring House Tier';
}

function animateNeedle() {
  if (!running) return;

  needlePos += direction * 1.7;
  if (needlePos <= 0 || needlePos >= 99) direction *= -1;

  needle.style.left = `${needlePos}%`;
  frame = requestAnimationFrame(animateNeedle);
}

function stitch() {
  if (!running) return;

  const sweetStart = sweetZone.offsetLeft;
  const sweetEnd = sweetStart + sweetZone.clientWidth;
  const needleCenter = needle.offsetLeft + needle.clientWidth / 2;
  const perfectWindow = 12;

  const distanceToCenter = Math.abs(needleCenter - (sweetStart + sweetZone.clientWidth / 2));
  const isHit = needleCenter >= sweetStart && needleCenter <= sweetEnd;

  if (isHit) {
    combo += 1;
    const precisionBonus = Math.max(6, 18 - distanceToCenter / perfectWindow);
    quality += precisionBonus;
    profit += Math.round(90 + combo * 14 + precisionBonus * 2.5);

    if (combo % 4 === 0) completed += 1;
  } else {
    combo = 0;
    quality = Math.max(0, quality - 9);
    profit = Math.max(0, profit - 35);
  }

  renderStats();
}

function startShift() {
  if (running) return;
  running = true;
  needlePos = 0;
  direction = 1;
  quality = 35;
  completed = 0;
  combo = 0;
  profit = 0;
  renderStats();
  animateNeedle();
}

startBtn.addEventListener('click', startShift);
stitchBtn.addEventListener('click', stitch);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    stitch();
  }
});

renderStats();
