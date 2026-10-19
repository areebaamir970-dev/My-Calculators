const mainEl = document.getElementById('main');
const topEl = document.getElementById('top');
const symbols = { '/': '÷', '*': '×', '-': '−', '+': '+' };

let current = '0', previous = null, operator = null, fresh = false;

function show() { mainEl.textContent = current; }
function compute(a, b, op) {
  a = parseFloat(a); b = parseFloat(b);
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? 'Error' : a / b;
  return b;
}
function clean(n) { return n === 'Error' ? n : String(parseFloat(Number(n).toPrecision(12))); }

function useResult(r) { current = r; previous = operator = null; fresh = true; topEl.textContent = ''; show(); }

function press(action, value) {
  if (current === 'Error' && action !== 'clear') { current = '0'; previous = operator = null; }
  switch (action) {
    case 'num':
      if (fresh) { current = '0'; fresh = false; }
      if (value === '.' && current.includes('.')) return;
      current = (current === '0' && value !== '.') ? value : current + value;
      break;
    case 'op':
      if (operator && !fresh) current = clean(compute(previous, current, operator));
      previous = current; operator = value; fresh = true;
      topEl.textContent = previous + ' ' + symbols[value];
      break;
    case 'equals': {
      if (!operator) return;
      const text = previous + ' ' + symbols[operator] + ' ' + current;
      current = clean(compute(previous, current, operator));
      topEl.textContent = text + ' =';
      addTape(text, current);
      previous = operator = null; fresh = true;
      break;
    }
    case 'clear': current = '0'; previous = operator = null; fresh = false; topEl.textContent = ''; break;
    case 'back': current = current.length > 1 ? current.slice(0, -1) : '0'; break;
    case 'sign': if (current !== '0') current = current.startsWith('-') ? current.slice(1) : '-' + current; break;
    case 'percent': current = clean(parseFloat(current) / 100); break;
  }
  show();
}

document.getElementById('pad').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) press(b.dataset.a, b.dataset.v);
});
document.addEventListener('keydown', e => {
  if (/[0-9.]/.test(e.key)) press('num', e.key);
  else if ('+-*/'.includes(e.key)) press('op', e.key);
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); press('equals'); }
  else if (e.key === 'Backspace') press('back');
  else if (e.key === 'Escape') press('clear');
});

// Paper tape (history)
const tapeList = document.getElementById('tapeList');
const tapeEmpty = document.getElementById('tapeEmpty');
function addTape(text, result) {
  const li = document.createElement('li');
  li.textContent = text + ' =';
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = result;
  b.title = 'Use this result';
  b.addEventListener('click', () => useResult(result));
  li.appendChild(b);
  tapeList.prepend(li);
  tapeEmpty.hidden = true;
}
document.getElementById('clearTape').addEventListener('click', () => {
  tapeList.innerHTML = '';
  tapeEmpty.hidden = false;
});
