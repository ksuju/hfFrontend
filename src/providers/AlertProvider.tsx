import React, { createContext, useContext, ReactNode } from 'react';

interface AlertContextType {
  // 필요한 alert 관련 상태와 함수들을 여기에 정의
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AlertContext.Provider value={{}}>
      {children}
    </AlertContext.Provider>
  );
};

const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export { AlertProvider, useAlert }; 