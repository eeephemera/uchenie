import React from 'react';

// CSS для анимации спиннера
const spinnerStyle = {
  border: '4px solid rgba(0, 0, 0, 0.1)', // Тонкий серый цвет для бордера
  borderLeftColor: '#000', // Чёрный цвет для левого бордера, создавая анимацию вращения
  borderRadius: '50%', // Круглая форма
  width: '40px', // Ширина спиннера
  height: '40px', // Высота спиннера
  animation: 'spin 1s linear infinite', // Анимация бесконечного вращения
};

const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Spinner = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      {/* Добавляем стиль анимации */}
      <style>{spinnerKeyframes}</style>
      <div style={spinnerStyle}></div> {/* Спиннер */}
    </div>
  );
};

export default Spinner;
