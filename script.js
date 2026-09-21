const diceGrid = document.querySelector('#dice-grid');
const rollButton = document.querySelector('#roll-button');
const clearButton = document.querySelector('#clear-button');
const historyBody = document.querySelector('#history-body');
const resultHeading = document.querySelector('#result-heading');
const resultDetail = document.querySelector('#result-detail');
const roundNumber = document.querySelector('#round-number');
const storageKey = 'look-who-is-biggest-history';
const dotMap = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

let history = readHistory();

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function createDieCard(player, value = null) {
  const card = document.createElement('article');
  card.className = 'die-card';
  card.dataset.player = player;
  const valueMarkup = value === null
    ? '<span class="die-value">?</span>'
    : `<span class="die-value"><span class="die-scene"><span class="die-cube">${createFace(value, 'front')}${createFace(7 - value, 'back')}${createFace(value === 6 ? 1 : value + 1, 'right')}${createFace(value === 1 ? 6 : value - 1, 'left')}${createFace(3, 'top')}${createFace(4, 'bottom')}</span></span></span>`;
  card.innerHTML = `<div class="die-player"><span>玩家 ${player}</span><span class="die-status"></span></div>${valueMarkup}`;
  return card;
}

function createFace(value, side) {
  return `<span class="die-face die-face-${side}">${createDots(value)}</span>`;
}

function createDots(value) {
  return `<span class="die-dots" aria-label="${value} 點">${Array.from({ length: 9 }, (_, index) => `<i class="dot${dotMap[value].includes(index) ? '' : ' is-hidden'}"></i>`).join('')}</span>`;
}

function renderDice(values = [null, null, null, null], isRolling = false) {
  const cards = values.map((value, index) => createDieCard(index + 1, value));
  if (isRolling) cards.forEach((card) => card.classList.add('is-rolling'));
  diceGrid.replaceChildren(...cards);
}

function randomValues() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
}

function rollDice() {
  const values = randomValues();
  [...diceGrid.children].forEach((card) => card.classList.add('is-rolling'));
  rollButton.disabled = true;
  rollButton.querySelector('span:last-child').textContent = '擲骰中...';
  const animationTimer = window.setInterval(() => renderDice(randomValues(), true), 85);
  window.setTimeout(() => {
    window.clearInterval(animationTimer);
    renderDice(values);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const winners = values.reduce((players, value, index) => value === highest ? [...players, index + 1] : players, []);
    const lowestPlayers = values.reduce((players, value, index) => value === lowest ? [...players, index + 1] : players, []);
    values.forEach((value, index) => {
      const card = diceGrid.children[index];
      if (value === highest) card.classList.add('is-winner');
      if (value === lowest && value !== highest) card.classList.add('is-lowest');
      card.querySelector('.die-status').textContent = value === highest ? '最高' : value === lowest ? '最低' : '';
    });
    const winnerText = winners.length > 1 ? `玩家 ${winners.join('、')} 平手` : `玩家 ${winners[0]} 最大`;
    resultHeading.textContent = winnerText;
    resultDetail.textContent = `最高 ${highest} 點，最低 ${lowest} 點${lowestPlayers.length > 1 ? `（玩家 ${lowestPlayers.join('、')}）` : ''}`;
    history.unshift({ values, winner: winnerText });
    history = history.slice(0, 20);
    localStorage.setItem(storageKey, JSON.stringify(history));
    roundNumber.textContent = String(history.length).padStart(2, '0');
    renderHistory();
    rollButton.disabled = false;
    rollButton.querySelector('span:last-child').textContent = '擲骰子';
  }, 650);
}

function renderHistory() {
  if (!history.length) {
    historyBody.innerHTML = '<tr class="empty-row"><td colspan="6">還沒有紀錄，先來擲一局吧。</td></tr>';
    roundNumber.textContent = '01';
    return;
  }
  historyBody.innerHTML = history.map((round, index) => `<tr><td>#${String(history.length - index).padStart(2, '0')}</td>${round.values.map(value => `<td>${value}</td>`).join('')}<td>${round.winner}</td></tr>`).join('');
}

rollButton.addEventListener('click', rollDice);
clearButton.addEventListener('click', () => {
  history = [];
  localStorage.removeItem(storageKey);
  renderDice();
  resultHeading.textContent = '準備開始';
  resultDetail.textContent = '按下擲骰，看看誰能擲出最大的點數。';
  renderHistory();
});

renderDice();
renderHistory();