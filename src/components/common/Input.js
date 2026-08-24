import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.greyDark}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Text style={styles.icon}>{hidden ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginBottom: SPACING.xs },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkInput,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.darkBorder,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  focused: { borderColor: COLORS.gold },
  errorBorder: { borderColor: COLORS.red },
  input: { flex: 1, ...TYPOGRAPHY.body1, color: COLORS.white, marginLeft: SPACING.sm },
  icon: { fontSize: 18, color: COLORS.grey, marginRight: SPACING.xs },
  error: { ...TYPOGRAPHY.caption, color: COLORS.red, marginTop: SPACING.xs },
});
