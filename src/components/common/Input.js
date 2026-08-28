import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Input = ({ label, error, icon, secureTextEntry, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, isFocused && styles.focusedWrapper, error && styles.errorWrapper]}>
        {icon && <Icon name={icon} size={22} color={isFocused ? '#FFD700' : '#888888'} style={styles.leftIcon} />}
        
        <TextInput
          style={styles.input}
          placeholder={label}
          placeholderTextColor="#888888"
          secureTextEntry={hidden}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888888" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.7)', // Dark semi-transparent
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  focusedWrapper: { borderColor: '#FFD700', backgroundColor: 'rgba(25, 25, 25, 0.9)' },
  errorWrapper: { borderColor: '#FF4444' },
  leftIcon: { marginRight: 12 },
  input: { flex: 1, ...TYPOGRAPHY.body1, color: '#FFFFFF', height: '100%', fontSize: 15 },
  errorText: { ...TYPOGRAPHY.caption, color: '#FF4444', marginTop: 4, marginLeft: 4 },
});
