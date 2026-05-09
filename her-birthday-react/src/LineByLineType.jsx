import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './LineByLineType.css';

/**
 * Types out an array of lines one by one.
 * Each line stays visible after being typed — no deletion.
 * A blinking cursor sits at the end of the currently typing line.
 */
const LineByLineType = ({
  lines = [],
  typingSpeed = 55,
  pauseBetweenLines = 600,
  cursorChar = '_',
  className = '',
}) => {
  // completedLines: fully typed lines
  // currentLine: index of the line currently being typed
  // currentChar: how many chars of current line are visible
  const [completedLines, setCompletedLines] = useState([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const cursorRef = useRef(null);

  // Blink the cursor with gsap
  useEffect(() => {
    if (!cursorRef.current) return;
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: 0.45,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
    return () => tween.kill();
  }, [done]);

  // Typing loop
  useEffect(() => {
    if (done || currentLineIdx >= lines.length) {
      setDone(true);
      return;
    }

    const line = lines[currentLineIdx];

    if (currentCharIdx < line.length) {
      // Still typing current line — add next character
      const speed = typingSpeed + (Math.random() - 0.5) * 30; // slight jitter
      const timer = setTimeout(() => {
        setCurrentCharIdx(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // Current line finished — pause, then move to next
      const timer = setTimeout(() => {
        setCompletedLines(prev => [...prev, line]);
        setCurrentLineIdx(prev => prev + 1);
        setCurrentCharIdx(0);
      }, pauseBetweenLines);
      return () => clearTimeout(timer);
    }
  }, [currentCharIdx, currentLineIdx, done, lines, typingSpeed, pauseBetweenLines]);

  const currentLine = !done && currentLineIdx < lines.length
    ? lines[currentLineIdx]
    : null;

  const visiblePartial = currentLine
    ? currentLine.substring(0, currentCharIdx)
    : '';

  return (
    <div className={`lbl-type ${className}`.trim()}>
      {/* Already-typed lines */}
      {completedLines.map((line, i) => (
        <p key={i} className={`lbl-type__line lbl-type__line--done line-${i}`}>
          {line}
        </p>
      ))}

      {/* Currently typing line */}
      {currentLine && (
        <p className={`lbl-type__line lbl-type__line--active line-${currentLineIdx}`}>
          {visiblePartial}
          <span ref={cursorRef} className="lbl-type__cursor">
            {cursorChar}
          </span>
        </p>
      )}

      {/* Cursor blinks at end when all done */}
      {done && (
        <span ref={cursorRef} className="lbl-type__cursor lbl-type__cursor--end">
          {cursorChar}
        </span>
      )}
    </div>
  );
};

export default LineByLineType;
