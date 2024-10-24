import { StyleSheet, TouchableOpacity } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useThemeStore } from '@/services';
import { Styles } from '@/styles';
import type { CustomIconProps } from '@/types';

import { CustomIcon, TextField } from './_elements';

interface Props {
  onPress: () => void;
  icon: CustomIconProps;
  title: string;
}

export const SettingsItem: React.FC<Props> = ({ title, icon, onPress }) => {
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const backgroundColor = theme.primary;
  const color = theme.primaryForeground;
  // const borderColor = theme.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.settingsItem, { backgroundColor }]}>
      <CustomIcon color={color} name={icon.name} type={icon.type} size={24} />
      <TextField style={{ color, marginLeft: 24 }}>{t(title)}</TextField>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingsItem: {
    alignItems: 'center',
    borderRadius: Styles.borderRadius.small,
    // borderWidth: 1,
    flexDirection: 'row',
    marginVertical: 6,
    padding: 16,
  },
});
