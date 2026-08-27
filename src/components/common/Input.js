import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Input = ({ label, error, icon, secureTextEntry, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, isFocused && styles.focusedWrapper, error && styles.errorWrapper]}>
        {icon && <Icon name={icon} size={22} color={isFocused ? COLORS.primary : COLORS.textMuted} style={styles.leftIcon} />}
        
        <TextInput
          style={styles.input}
          placeholder={label}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={hidden}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: SPACING.md,
    height: 54,
  },
  focusedWrapper: { borderColor: COLORS.primary },
  errorWrapper: { borderColor: COLORS.error },
  leftIcon: { marginRight: SPACING.sm },
  input: { flex: 1, ...TYPOGRAPHY.body1, color: COLORS.text, height: '100%' },
  errorText: { ...TYPOGRAPHY.caption, color: COLORS.error, marginTop: 4, marginLeft: 4 },
});
