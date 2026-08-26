import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';

export const Input = ({ label, value, onChangeText, secureTextEntry, error, icon, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);
  
  // Animation value: 0 is unfocused/empty, 1 is focused/filled
  const animVal = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: (focused || (value && value.length > 0)) ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // Need to animate colors and layout
    }).start();
  }, [focused, value]);

  const labelTop = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -10]
  });

  const labelFontSize = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12]
  });

  const labelColor = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.textMuted, COLORS.primary]
  });
  
  const borderColor = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary]
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.inputWrapper, { borderColor: error ? COLORS.error : borderColor }, focused && styles.focusedWrapper]}>
        {icon && <Icon name={icon} size={22} color={focused ? COLORS.primary : COLORS.textMuted} style={styles.icon} />}
        
        <View style={styles.inputContent}>
          {label && (
            <Animated.Text style={[styles.floatingLabel, { top: labelTop, fontSize: labelFontSize, color: error ? COLORS.error : labelColor }]}>
              {label}
            </Animated.Text>
          )}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={hidden}
            placeholder=""
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
        </View>

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg, marginTop: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  focusedWrapper: {
    backgroundColor: COLORS.background,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: { marginRight: SPACING.sm },
  inputContent: { flex: 1, position: 'relative', height: '100%', justifyContent: 'center' },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    fontWeight: '600',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  input: { 
    flex: 1, 
    ...TYPOGRAPHY.body1, 
    color: COLORS.text, 
    paddingTop: 16, // push text down to make room for label
    paddingBottom: 0, 
    height: '100%' 
  },
  error: { ...TYPOGRAPHY.caption, color: COLORS.error, marginTop: SPACING.xs, marginLeft: SPACING.xs },
});
