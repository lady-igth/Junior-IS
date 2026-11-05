// App memory: holds the profile, quiz answers, scan results, routine and reminders,
// and saves them on the phone with AsyncStorage. Every screen reads it with useApp().
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProduct } from '../data/products';

const KEY = 'skincare-guide/v1'; // name of the saved data on the phone

// What the app remembers when it is first installed
const initial = {
  onboarded: false,
  profile: { name: '', selfSkinType: 'unsure', sensitive: false, quiz: {} }, // quiz: Skin Quiz answers
  scans: [], // newest first: { id, date, mode, concern, skinType }
  routine: [], // { productId, slot: 'AM' | 'PM' }
  reminders: {
    AM: { on: false, hour: 8, id: null },
    PM: { on: false, hour: 21, id: null },
  },
};

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false); // true once saved data has loaded

  // 1) When the app opens, load the saved data from the phone
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setState({ ...initial, ...JSON.parse(raw) });
      } catch (e) {
        console.warn('Could not load saved data', e);
      }
      setReady(true);
    })();
  }, []);

  // 2) Every time something changes, save it back to the phone
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  // Helper: change part of the state and keep the rest
  const update = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  // 3) Everything the screens can do to the saved data
  const actions = useMemo(
    () => ({
      // Onboarding finished: save the profile and open the app
      finishOnboarding: (profile) => update(() => ({ profile, onboarded: true })),
      // Go back to onboarding to retake the Skin Quiz
      editProfile: () => update(() => ({ onboarded: false })),
      // Add a new scan result at the front (keep at most 60)
      addScan: (scan) => update((s) => ({ scans: [scan, ...s.scans].slice(0, 60) })),
      deleteScan: (id) => update((s) => ({ scans: s.scans.filter((x) => x.id !== id) })),
      // Save a product to the AM and/or PM routine it belongs in (no duplicates)
      saveToRoutine: (productId) =>
        update((s) => {
          const p = getProduct(productId);
          if (!p) return {};
          const adds = p.slots
            .filter((slot) => !s.routine.some((r) => r.productId === productId && r.slot === slot))
            .map((slot) => ({ productId, slot }));
          return { routine: [...s.routine, ...adds] };
        }),
      removeFromRoutine: (productId, slot) =>
        update((s) => ({
          routine: s.routine.filter((r) => !(r.productId === productId && r.slot === slot)),
        })),
      // Change one reminder's settings (on/off, hour, notification id)
      setReminder: (slot, patch) =>
        update((s) => ({ reminders: { ...s.reminders, [slot]: { ...s.reminders[slot], ...patch } } })),
    }),
    [update]
  );

  // 4) What every screen receives from useApp()
  const value = useMemo(() => {
    const latest = state.scans[0] || null; // most recent scan
    const isSaved = (productId) => state.routine.some((r) => r.productId === productId);
    // Profile used by the matching algorithm
    const matchProfile = {
      skinType: latest?.skinType?.label || (state.profile.selfSkinType !== 'unsure' ? state.profile.selfSkinType : 'normal'),
      concernProbs: latest?.concern?.probs || null,
      sensitive: state.profile.sensitive,
    };
    return { ...state, ready, latest, isSaved, matchProfile, ...actions };
  }, [state, ready, actions]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Screens call useApp() to read and change the saved data
export const useApp = () => useContext(Ctx);
