import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { useNavigation, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ScreenLayout, TextField } from '@/components';
import { useGlobalStore } from '@/services';
import { SettingsScreens, type SettingsStackParamList } from '@/types';

import { languages } from '../i18n';

interface Props {
  route: RouteProp<
    SettingsStackParamList,
    typeof SettingsScreens.ChangeLanguageScreen
  >;
}

export const ChangeLanguageScreen: React.FC<Props> = () => {
  const { i18n } = useTranslation();
  const navigation = useNavigation();
  const theme = useGlobalStore((state) => state.theme);
  const borderColor = theme.border;
  const currentLanguage = i18n.language;
  const sortedLanguages = [...languages].sort((a, b) => {
    if (a.code === currentLanguage) {
      return -1;
    }
    if (b.code === currentLanguage) {
      return 1;
    }
    return 0;
  });

  const itemMapper = (item: { name: string; code: string }) => {
    async function onPress() {
      await i18n.changeLanguage(item.code);
      navigation.goBack();
    }
    const active = currentLanguage === item.code;

    return (
      <TouchableOpacity
        disabled={active}
        onPress={onPress}
        style={[styles.item, { borderColor }]}>
        <TextField style={styles.itemTitle} bold={active}>
          {item.name}
        </TextField>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout>
      <FlatList
        data={sortedLanguages}
        keyExtractor={(item, i) => `${item.name}-${i}`}
        renderItem={({ item }) => itemMapper(item)}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  itemTitle: {
    alignSelf: 'center',
  },
});
