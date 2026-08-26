import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';

export const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, error, icon, style, keyboardType, autoCapitalize, maxLength }) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, focused && styles.focused, error && styles.errorBorder]}>
        {icon && <Icon name={icon} size={20} color={focused ? COLORS.primary : COLORS.textMuted} style={styles.icon} />}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label: { ...TYPOGRAPHY.body3, color: COLORS.textMuted, marginBottom: SPACING.xs, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  focused: { borderColor: COLORS.primary, backgroundColor: COLORS.background },
  errorBorder: { borderColor: COLORS.error },
  input: { flex: 1, ...TYPOGRAPHY.body1, color: COLORS.text, paddingHorizontal: SPACING.xs },
  icon: { marginRight: SPACING.xs },
  error: { ...TYPOGRAPHY.caption, color: COLORS.error, marginTop: SPACING.xs },
});
