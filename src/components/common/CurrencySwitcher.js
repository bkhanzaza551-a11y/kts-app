import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS, SHADOW } from '../../theme/spacing';
import { useCurrency } from '../../context/CurrencyContext';

export const CurrencySwitcher = ({ compact = false }) => {
  const { currency, switchCurrency, getCurrencies, getCurrentCurrency, getCurrentCurrencyCode } = useCurrency();
  const [visible, setVisible] = useState(false);
  const currencies = getCurrencies();
  const current = getCurrentCurrency();

  const handleSelect = (code) => {
    switchCurrency(code);
    setVisible(false);
  };

  if (compact) {
    return (
      <>
        <TouchableOpacity style={styles.compactBtn} onPress={() => setVisible(true)}>
          <Text style={styles.compactSymbol}>{current.symbol}</Text>
          <Text style={styles.compactCode}>{getCurrentCurrencyCode()}</Text>
          <Text style={styles.compactArrow}>▼</Text>
        </TouchableOpacity>

        <Modal visible={visible} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>Select Currency</Text>
              <Text style={styles.sheetSubtitle}>Changes prices across the entire app</Text>

              {Object.values(currencies).map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.option, getCurrentCurrencyCode() === c.code && styles.optionActive]}
                  onPress={() => handleSelect(c.code)}
                >
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionSymbol, getCurrentCurrencyCode() === c.code && styles.optionSymbolActive]}>
                      <Text style={[styles.optionSymbolText, getCurrentCurrencyCode() === c.code && styles.optionSymbolTextActive]}>{c.symbol}</Text>
                    </View>
                    <View>
                      <Text style={[styles.optionName, getCurrentCurrencyCode() === c.code && styles.optionNameActive]}>{c.code}</Text>
                      <Text style={styles.optionFullName}>{c.name}</Text>
                    </View>
                  </View>
                  {getCurrentCurrencyCode() === c.code && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setVisible(true)}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardEmoji}>💱</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardLabel}>Currency</Text>
          <Text style={styles.cardValue}>{current.symbol} {getCurrentCurrencyCode()} — {current.name}</Text>
        </View>
        <Text style={styles.cardArrow}>→</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Select Currency</Text>
            <Text style={styles.sheetSubtitle}>Changes prices across the entire app</Text>

            {Object.values(currencies).map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.option, getCurrentCurrencyCode() === c.code && styles.optionActive]}
                onPress={() => handleSelect(c.code)}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionSymbol, getCurrentCurrencyCode() === c.code && styles.optionSymbolActive]}>
                    <Text style={[styles.optionSymbolText, getCurrentCurrencyCode() === c.code && styles.optionSymbolTextActive]}>{c.symbol}</Text>
                  </View>
                  <View>
                    <Text style={[styles.optionName, getCurrentCurrencyCode() === c.code && styles.optionNameActive]}>{c.code}</Text>
                    <Text style={styles.optionFullName}>{c.name}</Text>
                  </View>
                </View>
                {getCurrentCurrencyCode() === c.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  compactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    gap: 4,
  },
  compactSymbol: { color: COLORS.gold, fontWeight: '700', fontSize: 14 },
  compactCode: { color: COLORS.white, fontWeight: '600', fontSize: 12 },
  compactArrow: { color: COLORS.grey, fontSize: 8 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    marginBottom: SPACING.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardEmoji: { fontSize: 20 },
  cardContent: { flex: 1 },
  cardLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey },
  cardValue: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '600', marginTop: 2 },
  cardArrow: { color: COLORS.grey, fontSize: 16 },

  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.darkCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: 40,
    ...SHADOW.medium,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.darkBorder,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  sheetTitle: { ...TYPOGRAPHY.h3, color: COLORS.white, textAlign: 'center' },
  sheetSubtitle: { ...TYPOGRAPHY.body3, color: COLORS.grey, textAlign: 'center', marginTop: 4, marginBottom: SPACING.xl },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.darkSurface,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  optionActive: {
    backgroundColor: COLORS.goldMuted,
    borderColor: COLORS.gold,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionSymbol: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.darkBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSymbolActive: { backgroundColor: COLORS.gold },
  optionSymbolText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  optionSymbolTextActive: { color: COLORS.black },
  optionName: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600' },
  optionNameActive: { color: COLORS.gold },
  optionFullName: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: 1 },

  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: { color: COLORS.black, fontWeight: '700', fontSize: 14 },

  cancelBtn: {
    marginTop: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.darkSurface,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    alignItems: 'center',
  },
  cancelText: { ...TYPOGRAPHY.body1, color: COLORS.grey },
});
