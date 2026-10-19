const mainEl = document.getElementById('main');
const topEl = document.getElementById('top');
const modeBtn = document.getElementById('modeBtn');

let expr = '', lastAnswer = 0, degrees = true;

const toRad = x => degrees ? x * Math.PI / 180 : x;
const fns = {
  sin: x => Math.sin(toRad(x)),
  cos: x => Math.cos(toRad(x)),
  tan: x => Math.tan(toRad(x)),
  log: x => Math.log10(x),
  ln: x => Math.log(x),
  sqrt: x => Math.sqrt(x),
  fact: n => {
    if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error('bad factorial');
    let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
  }
};

function evaluate(text) {
  let s = text
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/π/g, '(' + Math.PI + ')')
    .replace(/(\d+(\.\d+)?)%/g, '($1/100)')
    .replace(/(\d+)!/g, 'fact($1)')
    .replace(/√\(/g, 'sqrt(')
    .replace(/\^/g, '**')
    .replace(/\be\b/g, '(' + Math.E + ')');
  const leftover = s.replace(/\b(sin|cos|tan|log|ln|sqrt|fact)\b/g, '');
  if (!/^[0-9+\-*/().\s]*$/.test(leftover)) throw new Error('invalid');
  const v = new Function('sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'fact',
    '"use strict"; return (' + s + ');')(fns.sin, fns.cos, fns.tan, fns.log, fns.ln, fns.sqrt, fns.fact);
  if (typeof v !== 'number' || !isFinite(v)) throw new Error('math');
  return parseFloat(v.toPrecision(12));
}

function render() {
  topEl.textContent = expr;
  if (!expr) { mainEl.textContent = '0'; return; }
  try { mainEl.textContent = String(evaluate(expr)); } catch (e) { /* incomplete expression */ }
}
function add(v) { expr += v; render(); }
function useResult(r) { expr = r; lastAnswer = parseFloat(r); render(); }

function equals() {
  if (!expr) return;
  try {
    const result = evaluate(expr);
    addTape(expr, String(result));
    topEl.textContent = expr + ' =';
    mainEl.textContent = String(result);
    lastAnswer = result;
    expr = String(result);
  } catch (e) {
    mainEl.textContent = 'Error';
    expr = '';
  }
}

document.getElementById('pad').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const a = b.dataset.a;
  if (a === 'clear') { expr = ''; render(); }
  else if (a === 'back') { expr = expr.replace(/(sin\(|cos\(|tan\(|log\(|ln\(|√\(|.)$/, ''); render(); }
  else if (a === 'equals') equals();
  else if (a === 'ans') add(String(lastAnswer));
  else add(b.dataset.v);
});
modeBtn.addEventListener('click', () => {
  degrees = !degrees;
  modeBtn.textContent = 'Angles: ' + (degrees ? 'Degrees' : 'Radians');
  render();
});
document.addEventListener('keydown', e => {
  if (/^[0-9.()+\-]$/.test(e.key)) add(e.key === '-' ? '−' : e.key);
  else if (e.key === '*') add('×');
  else if (e.key === '/') { e.preventDefault(); add('÷'); }
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
  else if (e.key === 'Backspace') { expr = expr.slice(0, -1); render(); }
  else if (e.key === 'Escape') { expr = ''; render(); }
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
