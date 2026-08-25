import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  USDT: { symbol: '₮', name: 'Tether', code: 'USDT' },
  PKR: { symbol: 'Rs', name: 'Pakistani Rupee', code: 'PKR' },
};

const RATES = {
  USD_USDT: 1.0,
  USD_PKR: 278.50,
  USDT_USD: 1.0,
  USDT_PKR: 278.50,
  PKR_USD: 0.00359,
  PKR_USDT: 0.00359,
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState(RATES);

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const saved = await storage.getCurrency();
      if (saved && CURRENCIES[saved]) {
        setCurrency(saved);
      }
    } catch (e) {
      console.warn('Failed to load currency:', e);
    }
  };

  const switchCurrency = async (newCurrency) => {
    if (CURRENCIES[newCurrency]) {
      setCurrency(newCurrency);
      await storage.setCurrency(newCurrency);
    }
  };

  const convert = (amount, from = 'USD') => {
    if (from === currency) return amount;
    const key = `${from}_${currency}`;
    if (rates[key]) {
      return amount * rates[key];
    }
    return amount;
  };

  const formatAmount = (amount, from = 'USD') => {
    if (amount == null) return '--';
    const converted = convert(parseFloat(amount), from);
    const info = CURRENCIES[currency];
    return `${info.symbol} ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCurrencies = () => CURRENCIES;
  const getCurrentCurrency = () => CURRENCIES[currency];
  const getCurrentCurrencyCode = () => currency;

  return (
    <CurrencyContext.Provider value={{
      currency,
      switchCurrency,
      convert,
      formatAmount,
      getCurrencies,
      getCurrentCurrency,
      getCurrentCurrencyCode,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
