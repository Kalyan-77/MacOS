import { useState } from 'react';

export default function Calculator({ userId }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');

  // Calculator logic
  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(`${inputValue} ${nextOperation}`);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setExpression(`${newValue} ${nextOperation}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setExpression(`${previousValue} ${operation} ${inputValue} =`);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex flex-col">
      {/* Display */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl mb-4 p-4 border border-white/30 flex-shrink-0">
        {/* Expression display */}
        <div className="text-right font-mono text-white/70 min-h-[25px] flex items-center justify-end mb-2 text-lg">
          {expression || '\u00A0'}
        </div>
        {/* Main display */}
        <div className="text-right font-mono text-white font-bold min-h-[50px] flex items-center justify-end break-all text-3xl">
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3 flex-1">
        {/* Row 1 */}
        <button
          onClick={() => inputNumber(7)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          7
        </button>
        <button
          onClick={() => inputNumber(8)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          8
        </button>
        <button
          onClick={() => inputNumber(9)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          9
        </button>
        <button
          onClick={() => performOperation('+')}
          className="bg-orange-500/60 backdrop-blur-sm hover:bg-orange-500/80 active:bg-orange-500/90 text-white font-bold rounded-xl border border-orange-300/50 transition-all duration-150 active:scale-95 text-2xl"
        >
          +
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputNumber(4)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          4
        </button>
        <button
          onClick={() => inputNumber(5)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          5
        </button>
        <button
          onClick={() => inputNumber(6)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          6
        </button>
        <button
          onClick={() => performOperation('-')}
          className="bg-orange-500/60 backdrop-blur-sm hover:bg-orange-500/80 active:bg-orange-500/90 text-white font-bold rounded-xl border border-orange-300/50 transition-all duration-150 active:scale-95 text-2xl"
        >
          -
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputNumber(1)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          1
        </button>
        <button
          onClick={() => inputNumber(2)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          2
        </button>
        <button
          onClick={() => inputNumber(3)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          3
        </button>
        <button
          onClick={() => performOperation('*')}
          className="bg-orange-500/60 backdrop-blur-sm hover:bg-orange-500/80 active:bg-orange-500/90 text-white font-bold rounded-xl border border-orange-300/50 transition-all duration-150 active:scale-95 text-2xl"
        >
          ×
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputNumber(0)}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          0
        </button>
        <button
          onClick={inputDot}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 text-2xl"
        >
          .
        </button>
        <button
          onClick={clear}
          className="bg-red-500/60 backdrop-blur-sm hover:bg-red-500/80 active:bg-red-500/90 text-white font-bold rounded-xl border border-red-300/50 transition-all duration-150 active:scale-95 text-lg"
        >
          C
        </button>
        <button
          onClick={() => performOperation('/')}
          className="bg-orange-500/60 backdrop-blur-sm hover:bg-orange-500/80 active:bg-orange-500/90 text-white font-bold rounded-xl border border-orange-300/50 transition-all duration-150 active:scale-95 text-2xl"
        >
          ÷
        </button>

        {/* Row 5 */}
        <button
          onClick={backspace}
          className="bg-yellow-500/60 backdrop-blur-sm hover:bg-yellow-500/80 active:bg-yellow-500/90 text-white font-bold rounded-xl border border-yellow-300/50 transition-all duration-150 active:scale-95 col-span-3 text-sm"
        >
          ⌫ Backspace
        </button>
        <button
          onClick={handleEquals}
          className="bg-green-500/60 backdrop-blur-sm hover:bg-green-500/80 active:bg-green-500/90 text-white font-bold rounded-xl border border-green-300/50 transition-all duration-150 active:scale-95 text-2xl"
        >
          =
        </button>
      </div>
    </div>
  );
}