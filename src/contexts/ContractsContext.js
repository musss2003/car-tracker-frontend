// src/contexts/ContractsContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getContracts } from '../services/contractService';

export const ContractsContext = createContext();

export const ContractsProvider = ({ children }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const fetchedContracts = await getContracts();
        setContracts(fetchedContracts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return (
    <ContractsContext.Provider value={{ contracts, loading, error }}>
      {children}
    </ContractsContext.Provider>
  );
};
