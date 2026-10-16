import { Text, type TextProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';

interface AppTextProps extends TextProps {
  weight?: keyof typeof fonts;
  color?: string;
  size?: number;
}

export function AppText({ weight = 'regular', color, size = 15, style, ...props }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      {...props}
      style={[{ fontFamily: fonts[weight], color: color ?? colors.text, fontSize: size }, style]}
    />
  );
}
