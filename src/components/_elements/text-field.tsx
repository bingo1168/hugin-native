import { StyleSheet, Text } from 'react-native';

import { useGlobalStore } from '@/services';
import { Styles } from '@/styles';

type TextType = 'primary' | 'secondary' | 'error';
type SizeType = 'small' | 'medium' | 'large';

interface Props {
  children: string;
  type?: TextType;
  size?: SizeType;
  maxLength?: number;
  bold?: boolean;
  style?: object | false;
}

export const TextField: React.FC<Props> = ({
  children,
  type = 'primary',
  size = 'medium',
  maxLength,
  bold,
  style,
}) => {
  const theme = useGlobalStore((state) => state.theme);
  const color = theme?.[type];
  const fontSize = Styles.fontSizes[size] ?? Styles.fontSizes.medium;
  const fontWeight = bold ? 'bold' : 'normal';

  const truncatedText =
    maxLength && children.length > maxLength
      ? `${children.substring(0, maxLength)}...`
      : children;

  return (
    <Text style={[styles.text, { color, fontSize, fontWeight, ...style }]}>
      {truncatedText}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Montserrat-Regular',
    marginVertical: 2,
  },
});
