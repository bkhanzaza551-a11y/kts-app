import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';

export const RiskDisclaimer = ({ style, compact = false }) => {
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Icon name="shield-alert-outline" size={14} color={COLORS.gold} style={styles.compactIcon} />
        <Text style={styles.compactText}>
          Risk Warning: Forex and CFD trading involves significant risk of capital loss. Past performance does not guarantee future results.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Icon name="shield-alert-outline" size={18} color="#FFB300" />
        </View>
        <Text style={styles.title}>Regulatory & Financial Risk Disclosure</Text>
      </View>
      <Text style={styles.text}>
        Forex, CFDs, and cryptocurrency trading involve a high degree of risk and are not suitable for all investors. High leverage can work against you as well as for you.
      </Text>
      <Text style={[styles.text, { marginTop: 6 }]}>
        AI bots, automated strategies, and trading signals provided in this application are for analytical and educational purposes only and do not constitute financial advice. Past performance is not indicative of future results. Never trade with capital you cannot afford to lose.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#14181D',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.25)',
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFB300',
    letterSpacing: 0.2,
  },
  text: {
    fontSize: 11,
    color: '#8E9BAE',
    lineHeight: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 179, 0, 0.06)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.15)',
    marginVertical: 10,
  },
  compactIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  compactText: {
    flex: 1,
    fontSize: 11,
    color: '#A0AEC0',
    lineHeight: 15,
  },
});
