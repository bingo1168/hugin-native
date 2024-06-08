import { useState } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useGlobalStore } from '@/services';

import { Avatar, TextField } from './_elements';

interface Props {
  name: string;
  hash: string;
  onPress: (hash: string, name: string) => void;
}

export const PreviewItem: React.FC<Props> = ({ name, hash, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);
  const theme = useGlobalStore((state) => state.theme);
  const isNew = true; // dummy
  const borderColor = isNew ? theme.primary : theme.border;

  function handleLongPress() {
    setIsPressed(true);
    // Do something like a popup?
  }

  function handlePress() {
    onPress(hash, name);
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: isPressed ? theme.backgroundAccent : 'transparent',
          borderColor,
        },
      ]}
      onLongPress={handleLongPress}
      onPressOut={() => setIsPressed(false)}>
      <Avatar size={50} hash={hash} />
      <View style={styles.content}>
        <TextField bold={isNew} maxLength={22} size="large">
          {name}
        </TextField>
        {/* {lastMessage && (
          <TextField bold={isNew} maxLength={65} size="small">
            {lastMessage.text}
          </TextField>
        )} */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  content: {
    flex: 1,
    marginLeft: 16,
  },
});
