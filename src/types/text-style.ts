export interface TextStyle {
  size: string; // px value like "16px"
  weight: 'normal' | 'semibold' | 'bold';
  color: string; // hex color like "#000000"
}

export const getStyleClasses = (style?: TextStyle) => {
  if (!style) return '';
  
  const weightClass = style.weight === 'normal' ? 'font-normal' : style.weight === 'semibold' ? 'font-semibold' : 'font-bold';
  
  return weightClass;
};

export const getStyleObject = (style?: TextStyle) => {
  if (!style) return { fontSize: '16px', fontWeight: 'normal', color: '#111827' };
  
  return {
    fontSize: style.size || '16px',
    fontWeight: style.weight === 'normal' ? 400 : style.weight === 'semibold' ? 600 : 700,
    color: style.color || '#111827'
  };
};
