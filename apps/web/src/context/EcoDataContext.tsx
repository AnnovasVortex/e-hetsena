'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface EcoDataContextType {
  isEcoData: boolean;
  toggleEcoData: () => void;
}

const EcoDataContext = createContext<EcoDataContextType>({
  isEcoData: false,
  toggleEcoData: () => {},
});

export function EcoDataProvider({ children }: { children: React.ReactNode }) {
  const [isEcoData, setIsEcoData] = useState<boolean>(false);

  // Récupération de la préférence enregistrée sur le téléphone
  useEffect(() => {
    const saved = localStorage.getItem('ehetsena_eco_data');
    if (saved !== null) {
      setIsEcoData(saved === 'true');
    } else {
      // Détection automatique si le navigateur mobile signale une connexion lente (2G/3G)
      const nav = navigator as any;
      if (nav.connection && (nav.connection.saveData || nav.connection.effectiveType === '2g')) {
        setIsEcoData(true);
      }
    }
  }, []);

  const toggleEcoData = () => {
    setIsEcoData((prev) => {
      const next = !prev;
      localStorage.setItem('ehetsena_eco_data', String(next));
      return next;
    });
  };

  return (
    <EcoDataContext.Provider value={{ isEcoData, toggleEcoData }}>
      {children}
    </EcoDataContext.Provider>
  );
}

export const useEcoData = () => useContext(EcoDataContext);
