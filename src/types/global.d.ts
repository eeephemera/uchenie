// src/types/global.d.ts

interface Ethereum {
    isMetaMask?: boolean;
    request?: (...args: any[]) => Promise<void>;
    // Вы можете добавить больше методов и свойств в зависимости от ваших потребностей
  }
  
  interface Window {
    ethereum?: Ethereum;
  }
  