export const COLORS = {
  // Base backgrounds
  background: '#0B0E11', // Deep dark for main screens
  card: '#181A20',       // Slightly lighter for cards/panels
  surface: '#2B3139',    // Inputs, borders, hovered states
  
  // Brand
  primary: '#FCD535',    // Premium Gold/Yellow (like logo)
  primaryDark: '#C9A321',
  primaryMuted: 'rgba(252, 213, 53, 0.1)',
  
  // Trading Colors
  buy: '#0ECB81',        // Profit Green
  sell: '#F6465D',       // Loss Red
  buyMuted: 'rgba(14, 203, 129, 0.15)',
  sellMuted: 'rgba(246, 70, 93, 0.15)',
  
  // Text
  text: '#EAECEF',       // Primary white
  textMuted: '#848E9C',  // Secondary grey
  
  // States
  success: '#0ECB81',
  error: '#F6465D',
  warning: '#FCD535',
  info: '#2196F3',
  
  // Utility
  border: '#2B3139',
  transparent: 'transparent',
  overlay: 'rgba(11, 14, 17, 0.8)',
  
  // Legacy aliases (to not break old code immediately before we refactor them)
  black: '#0B0E11',
  white: '#EAECEF',
  gold: '#FCD535',
  grey: '#848E9C',
  green: '#0ECB81',
  red: '#F6465D',
};

export default COLORS;
