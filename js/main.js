        const display = document.getElementById('display');
        let expression = '';
        let history = []; // for undo

        display.focus();

        function append(value) {
            const ops = '+-*/^%';
            const lastChar = expression.slice(-1);
            if (ops.includes(value) && ops.includes(lastChar) && value !== '(') return;
            history.push(expression);
            if (history.length > 10) history.shift(); // limit stack
            expression += value;
            updateDisplay();
            autoCloseParens();
        }

        function appendSymbol(symbol) {
            append(symbol);
        }

        function updateDisplay() {
            display.value = expression || '0';
            // console.log(expression)
        }

        function clearAll() {
            history.push(expression);
            expression = '';
            updateDisplay();
        }

        function backspace() {
            history.push(expression);
            expression = expression.slice(0, -1);
            updateDisplay();
        }

        function toggleSign() {
            // Toggle sign of last number (before last op/parens)
            const regex = /(\d*\.?\d*)([+\-*/^%()]*)$/;
            const match = expression.match(regex);
            if (match) {
                let num = match[1];
                const rest = match[2];
                if (num && num !== '0') {
                    history.push(expression);
                    if (num.startsWith('-')) {
                        num = num.slice(1);
                    } else {
                        num = '-' + num;
                    }
                    expression = expression.slice(0, -match[0].length) + num + rest;
                    updateDisplay();
                }
            }
        }

        function calculate() {
            try {
                if (!expression || expression.endsWith('(')) {
                    display.value = 'Error';
                    return;
                }

                let evalExpr = expression
                    .replace(/×/g, '*')
                    .replace(/−/g, '-')
                    .replace(/÷/g, '/');
                    const result = math.evaluate(evalExpr);
                    console.log(result);
                expression = math.format(result, { precision: 10 });
                updateDisplay();
            } catch (e) {
                display.value = 'Error';
                expression = '';
            }
        }

        function autoCloseParens() {
            // const parens = expression.match(/[\(\)]/g) || [];
            // if (parens[parens.length - 1] === '(') {
            //     append(')');
            // }
        }

        function toggleMode() {
            // Toggle 2nd functions (e.g. sin<->asin) - placeholder
            alert('2nd mode toggled (extend for asin etc)');
        }

        function undo() {
            if (history.length > 0) {
                expression = history.pop();
                updateDisplay();
            }
        }

        // Full keyboard support
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl && key === 'z') {
                e.preventDefault();
                undo();
                return;
            }
            if (ctrl && key === 'Backspace') {
                e.preventDefault();
                clearAll();
                return;
            }
            if (key === 'Enter' || key === '=') {
                calculate();
            } else if (key === 'Escape') {
                clearAll();
            } else if (key === 'Backspace') {
                backspace();
            } else if (['0','1','2','3','4','5','6','7','8','9','.'].includes(key)) {
                append(key);
            } else if ('+-*/^()'.includes(key)) {
                append(key);
            } else if (key === '%') {
                append('%');
            } else if (key === '!') {
                append('!');
            }
        });

        // Prevent zoom on iOS
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, {passive: false});

        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);