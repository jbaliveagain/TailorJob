const workflowData = [
  ['Receive customer item', 'Check fabric damage, stains, loose seam, or size request'],
  ['Select service order', 'Repair, resize, patch, or outfit sale with fitting notes'],
  ['Stitch and adjust', 'Use controlled seam work to keep garment shape natural'],
  ['Final fitting check', 'Validate alignment, sleeve balance, and hem symmetry'],
  ['Deliver + payment', 'Hand over item, close ticket, and gain RP reputation'],
];

const serviceData = [
  ['Hem repair', '$120 · 8 min · low complexity'],
  ['Jacket resize', '$300 · 14 min · medium complexity'],
  ['Luxury dress fitting', '$540 · 20 min · high complexity'],
  ['Uniform patch + reinforce', '$180 · 10 min · service contract'],
];

const ordersData = [
  ['Citizen #1482', 'Torn jeans knee repair · Pickup 13:30 · <b>Urgent</b>'],
  ['Taxi Driver', 'Seatwear suit sleeve resize · Pickup 14:20 · Normal'],
  ['Wedding client', 'Dress waist adjustment · Pickup 16:00 · <b>Priority</b>'],
  ['Police contract', 'Uniform elbow reinforcement · Pickup 17:10 · Normal'],
];

const playerInventoryData = [
  'Repair Kit x2',
  'Premium Thread (Black) x12',
  'Premium Thread (White) x8',
  'Fabric Patch Set x5',
  'Tailor Scissors x1',
];

const workflowSteps = document.querySelector('#workflowSteps');
const serviceList = document.querySelector('#serviceList');
const orderList = document.querySelector('#orderList');
const stitchField = document.querySelector('#stitchField');
const startBtn = document.querySelector('#startBtn');
const resetBtn = document.querySelector('#resetBtn');
const inventoryBtn = document.querySelector('#inventoryBtn');
const qualityValue = document.querySelector('#qualityValue');
const completedValue = document.querySelector('#completedValue');
const comboValue = document.querySelector('#comboValue');
const earningsValue = document.querySelector('#earningsValue');
const repMeter = document.querySelector('#repMeter');
const repLabel = document.querySelector('#repLabel');
const statusText = document.querySelector('#statusText');
const playerInventory = document.querySelector('#playerInventory');
const inventoryItems = document.querySelector('#inventoryItems');

for (const [name, detail] of workflowData) {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${name}</strong><span>${detail}</span>`;
  workflowSteps.append(li);
}

for (const [name, detail] of serviceData) {
  const row = document.createElement('div');
  row.className = 'inv-row';
  row.innerHTML = `<strong>${name}</strong><small>${detail}</small>`;
  serviceList.append(row);
}

for (const [name, detail] of ordersData) {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${name}</strong><span>${detail}</span>`;
  orderList.append(li);
}

for (const item of playerInventoryData) {
  const li = document.createElement('li');
  li.textContent = item;
  inventoryItems.append(li);
}


let points = [];
let activeIndex = 0;
let dragging = false;
let sessionActive = false;
let quality = 0;
let completed = 0;
let combo = 0;
let earnings = 0;
let mistakes = 0;

function createSeamLayout() {
  stitchField.innerHTML = '';

  const seam = document.createElement('div');
  seam.className = 'seam-line';
  stitchField.append(seam);

  const cursor = document.createElement('div');
  cursor.id = 'needleCursor';
  cursor.className = 'needle-cursor';
  cursor.style.left = '8%';
  cursor.style.top = '50%';
  stitchField.append(cursor);

  points = [];
  const count = 8;

  for (let i = 0; i < count; i += 1) {
    const point = document.createElement('div');
    point.className = 'stitch-point';

    const left = 10 + (i * 10.5);
    const wave = i % 2 === 0 ? -10 : 10;
    const top = 50 + wave;

    point.style.left = `${left}%`;
    point.style.top = `${top}%`;
    point.dataset.index = String(i);

    stitchField.append(point);
    points.push(point);
  }
}

function updateStats() {
  qualityValue.textContent = `${Math.max(0, Math.min(100, Math.round(quality)))}%`;
  completedValue.textContent = completed;
  comboValue.textContent = `${combo}x`;
  earningsValue.textContent = `$${earnings.toLocaleString()}`;

  const rep = Math.min(100, Math.round(20 + quality * 0.55 + combo * 4));
  repMeter.style.width = `${rep}%`;

  if (rep < 35) repLabel.textContent = 'Neighborhood Tailor';
  else if (rep < 70) repLabel.textContent = 'Trusted Alteration Shop';
  else repLabel.textContent = 'Premium RP Tailor Service';
}

function resetSeamProgress(message = 'Seam reset. Hold mouse and stitch through points in order.') {
  activeIndex = 0;
  dragging = false;
  statusText.textContent = message;

  for (const point of points) point.classList.remove('hit');
}

function beginSession() {
  sessionActive = true;
  mistakes = 0;
  createSeamLayout();
  stitchField.hidden = false;
  resetSeamProgress('Garment prepared. Hold left mouse button and follow stitch points.');
}

function finishSeam() {
  const seamQuality = Math.max(50, 100 - mistakes * 12);
  quality = Math.min(100, (quality * 0.45) + seamQuality * 0.55);

  if (seamQuality >= 82) {
    combo += 1;
    completed += 1;
    earnings += 180 + combo * 30;
    statusText.textContent = `Clean stitch! Quality ${seamQuality}%. Customer satisfied.`;
  } else {
    combo = 0;
    earnings += 90;
    statusText.textContent = `Seam completed with corrections (${seamQuality}%). Payment reduced.`;
  }

  updateStats();
  resetSeamProgress('Prepare next garment or continue practicing this seam.');
}

function setCursorPosition(event) {
  const cursor = document.querySelector('#needleCursor');
  if (!cursor) return;

  const rect = stitchField.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
}

function handleMove(event) {
  setCursorPosition(event);

  if (!sessionActive || !dragging) return;

  const target = points[activeIndex];
  if (!target) return;

  const targetRect = target.getBoundingClientRect();
  const withinX = event.clientX >= targetRect.left && event.clientX <= targetRect.right;
  const withinY = event.clientY >= targetRect.top && event.clientY <= targetRect.bottom;

  if (withinX && withinY) {
    target.classList.add('hit');
    activeIndex += 1;

    if (activeIndex >= points.length) finishSeam();
  }
}

stitchField.addEventListener('mousedown', (event) => {
  if (!sessionActive) return;
  dragging = true;
  setCursorPosition(event);
});

window.addEventListener('mouseup', () => {
  if (!sessionActive) return;
  if (dragging && activeIndex > 0 && activeIndex < points.length) {
    mistakes += 1;
    combo = 0;
    statusText.textContent = 'Thread slipped. Hold mouse and continue from start.';
    resetSeamProgress('Thread slipped. Restart seam from point 1.');
    updateStats();
  }
  dragging = false;
});

stitchField.addEventListener('mousemove', handleMove);

startBtn.addEventListener('click', beginSession);
inventoryBtn.addEventListener('click', () => {
  const isHidden = playerInventory.hasAttribute('hidden');
  if (isHidden) playerInventory.removeAttribute('hidden');
  else playerInventory.setAttribute('hidden', '');
});

resetBtn.addEventListener('click', () => {
  if (!sessionActive) {
    statusText.textContent = 'Prepare garment first.';
    return;
  }
  mistakes += 1;
  combo = 0;
  resetSeamProgress('Manual reset. Begin stitching again from first point.');
  updateStats();
});

createSeamLayout();
stitchField.hidden = true;
statusText.textContent = 'Click “Prepare Garment” to load seam and start stitching.';
updateStats();
