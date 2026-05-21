function parseRiddle(riddleText) {
    const result = { A: '', B: '' };
    
    if (!riddleText) return result;
    
    const quotePattern = /["']([^"']+)["']/g;
    const matches = [...riddleText.matchAll(quotePattern)];
    const quotedValues = matches.map(m => m[1]);
    
    const wasPattern = /было\s*['"]([^'"]+)['"]/i;
    const addedPattern = /добавились?\s*['"]([^'"]+)['"]/i;
    
    const wasMatch = riddleText.match(wasPattern);
    const addedMatch = riddleText.match(addedPattern);
    
    if (wasMatch && wasMatch[1]) {
        result.A = wasMatch[1];
    }
    if (addedMatch && addedMatch[1]) {
        result.B = addedMatch[1];
    }
    
    if (!result.A && quotedValues[0]) result.A = quotedValues[0];
    if (!result.B && quotedValues[1]) result.B = quotedValues[1];
    
    if (result.A && !result.B && result.A.includes(',')) {
        const parts = resultA.split(/[, ]+/);
        if (parts.length >= 2) {
            result.A = parts[0].trim();
            result.B = parts[1].trim();
        }
    }
    
    return result;
}

function parseUser(riddleText) {
    const userPattern = /Пользователь:\s*(\S+)/i;
    const match = riddleText.match(userPattern);
    return match ? match[1] : '';
}

function parseMac(riddleText) {
    const macPattern = /МАС:\s*([0-9A-Fa-f:]+)/i;
    const match = riddleText.match(macPattern);
    return match ? match[1] : '';
}

async function sha256Hex(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function calculate() {
    const A = document.getElementById('fieldA').value.trim();
    const B = document.getElementById('fieldB').value.trim();
    const username = document.getElementById('username').value.trim();
    const mac = document.getElementById('mac').value.trim();
    
    if (!A || !B) {
        alert('Введите значения A и B');
        return;
    }
    
    if (!username || !mac) {
        alert('Введите пользователя и MAC адрес');
        return;
    }
    
    const fingerprint = `${username}:${mac}`;
    const fullString = A + B + fingerprint;
    
    const fullHash = await sha256Hex(fullString);
    const code = fullHash.substring(0, 12);
    
    const resultDiv = document.getElementById('result');
    const codeResult = document.getElementById('codeResult');
    
    codeResult.textContent = code;
    resultDiv.style.display = 'block';
    
    codeResult.onclick = () => {
        navigator.clipboard.writeText(code);
        const originalText = codeResult.textContent;
        codeResult.textContent = 'СКОПИРОВАНО';
        setTimeout(() => {
            codeResult.textContent = originalText;
        }, 2000);
    };
}

function parseRiddleFromInput() {
    const riddleText = document.getElementById('riddleInput').value;
    
    if (!riddleText.trim()) {
        return;
    }
    
    const { A, B } = parseRiddle(riddleText);
    
    if (A) document.getElementById('fieldA').value = A;
    if (B) document.getElementById('fieldB').value = B;
    
    const username = parseUser(riddleText);
    if (username) document.getElementById('username').value = username;
    
    const mac = parseMac(riddleText);
    if (mac) document.getElementById('mac').value = mac;
    
    const inputs = ['fieldA', 'fieldB', 'username', 'mac'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input.value) {
            input.style.backgroundColor = '#ccffcc';
            setTimeout(() => {
                input.style.backgroundColor = '';
            }, 500);
        }
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkTheme', isDark);
    
    const themeBtn = document.getElementById('themeToggle');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
}

function loadTheme() {
    const isDark = localStorage.getItem('darkTheme') === 'true';
    if (isDark) {
        document.body.classList.add('dark');
        document.getElementById('themeToggle').textContent = '☀️';
    } else {
        document.body.classList.remove('dark');
        document.getElementById('themeToggle').textContent = '🌙';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('parseBtn').addEventListener('click', parseRiddleFromInput);
    document.getElementById('generateBtn').addEventListener('click', calculate);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    loadTheme();
    
    const inputs = ['fieldA', 'fieldB', 'username', 'mac', 'riddleInput'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    calculate();
                }
            });
        }
    });
});