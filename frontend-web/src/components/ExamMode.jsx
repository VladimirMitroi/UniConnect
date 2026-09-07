import { useEffect, useState, useCallback } from 'react';

/**
 * Mod examinare: fullscreen, fără selecție text, avertizare la părăsirea tab-ului.
 */
function ExamMode({ active, children, onViolation }) {
  const [warnings, setWarnings] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!active) {
      exitFullscreen();
      setWarnings(0);
      setTabHidden(false);
      document.body.classList.remove('exam-active');
      return;
    }

    document.body.classList.add('exam-active');
    enterFullscreen();

    const onVisibility = () => {
      if (document.hidden) {
        setTabHidden(true);
        setWarnings((w) => w + 1);
        onViolation?.('visibility');
      } else {
        setTabHidden(false);
      }
    };

    const onBlur = () => {
      setWarnings((w) => w + 1);
      onViolation?.('blur');
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setWarnings((w) => w + 1);
        onViolation?.('fullscreen_exit');
      }
    };

    const blockKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('keydown', blockKeys);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('keydown', blockKeys);
      document.body.classList.remove('exam-active');
      exitFullscreen();
    };
  }, [active, enterFullscreen, exitFullscreen, onViolation]);

  if (!active) {
    return children;
  }

  return (
    <div
      className="exam-mode select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    >
      {(tabHidden || warnings > 0) && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center py-2 px-4 text-sm font-bold shadow-lg">
          Atenție: ai părăsit fereastra de examinare ({warnings} avertisment{warnings !== 1 ? 'e' : ''}).
          Revino imediat la test.
        </div>
      )}
      {children}
    </div>
  );
}

export default ExamMode;
