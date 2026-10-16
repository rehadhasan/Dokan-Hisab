import { useEffect, useRef, useState } from 'react';
import type { TextStyle } from 'react-native';
import { fonts } from '@/theme/typography';
import { formatAmount, formatNumber } from '@/utils/numberFormat';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AppText } from './AppText';

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  isCurrency?: boolean;
  duration?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({ value, style, isCurrency = true, duration = 600 }: AnimatedNumberProps) {
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const start = Date.now();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const step = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const text = isCurrency ? formatAmount(display, digitFormat) : formatNumber(display, digitFormat);

  return (
    <AppText weight="bold" style={style}>
      {text}
    </AppText>
  );
}
