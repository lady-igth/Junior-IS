// App-wide state, saved on the phone only (AsyncStorage).
// Photos are never stored — only scan results.
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProduct } from '../data/products';

const KEY = 'skincare-guide/v1';

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
  const [ready, setReady] = useState(false);

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

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const update = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  const actions = useMemo(
    () => ({
      finishOnboarding: (profile) => update(() => ({ profile, onboarded: true })),
      editProfile: () => update(() => ({ onboarded: false })),
      addScan: (scan) => update((s) => ({ scans: [scan, ...s.scans].slice(0, 60) })),
      deleteScan: (id) => update((s) => ({ scans: s.scans.filter((x) => x.id !== id) })),
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
      setReminder: (slot, patch) =>
        update((s) => ({ reminders: { ...s.reminders, [slot]: { ...s.reminders[slot], ...patch } } })),
      resetAll: () => setState(initial),
    }),
    [update]
  );

  const value = useMemo(() => {
    const latest = state.scans[0] || null;
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

export const useApp = () => useContext(Ctx);
