import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken, setToken as persistToken } from '../api/client';
import { getProfile } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  // On app start: if a token is already stored, try to load the profile.
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { patient } = await getProfile();
        setPatient(patient);
      } catch {
        await persistToken(null); // stale/expired token, clear it
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (token, patientData) => {
    await persistToken(token);
    setPatient(patientData);
  }, []);

  const logoutLocal = useCallback(async () => {
    await persistToken(null);
    setPatient(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { patient } = await getProfile();
    setPatient(patient);
    return patient;
  }, []);

  return (
    <AuthContext.Provider
      value={{ patient, isAuthenticated: !!patient, loading, login, logoutLocal, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
