import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS, SHADOW } from '../../theme/spacing';
import { useCurrency } from '../../context/CurrencyContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TradingViewChart = ({ symbol, visible, onClose, onUsePrice }) => {
  const { formatAmount } = useCurrency();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.symbolBadge}>
                <Text style={styles.symbolText}>{symbol}</Text>
              </View>
              <Text style={styles.chartLabel}>Live Chart</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📊</Text>
              <Text style={styles.placeholderText}>TradingView Chart</Text>
              <Text style={styles.placeholderSub}>View full chart at tradingview.com</Text>
            </View>
          </View>

          {onUsePrice && (
            <TouchableOpacity style={styles.usePriceBtn} onPress={onUsePrice}>
              <Text style={styles.usePriceIcon}>⚡</Text>
              <Text style={styles.usePriceText}>Use Current Price as Entry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    backgroundColor: COLORS.darkCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...SHADOW.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  symbolBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  symbolText: { ...TYPOGRAPHY.body3, color: COLORS.black, fontWeight: '700' },
  chartLabel: { ...TYPOGRAPHY.body2, color: COLORS.grey },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.darkSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: COLORS.grey, fontSize: 14 },
  chartContainer: {
    flex: 1,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 48 },
  placeholderText: { ...TYPOGRAPHY.h3, color: COLORS.gold, marginTop: SPACING.md },
  placeholderSub: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: SPACING.sm },
  usePriceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    marginTop: SPACING.sm,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gold,
    gap: 8,
  },
  usePriceIcon: { fontSize: 16 },
  usePriceText: { ...TYPOGRAPHY.button, color: COLORS.black },
});
