import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { getProduct, STEP_ORDER } from '../data/products';
import { ensurePermission, scheduleDaily, cancel } from '../notifications';
import { Button, Card, Screen } from '../components/UI';
import { colors, space, type, radius } from '../theme';

const fmtHour = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;

function Reminder({ slot }) {
  const { reminders, setReminder } = useApp();
  const r = reminders[slot];
  const [minH, maxH] = slot === 'AM' ? [5, 11] : [17, 23];

  const apply = async (on, hour) => {
    await cancel(r.id);
    if (!on) return setReminder(slot, { on: false, id: null, hour });
    const ok = await ensurePermission();
    if (!ok) {
      Alert.alert('Notifications are off', 'Turn on notifications for this app in Settings to get reminders.');
      return setReminder(slot, { on: false, id: null, hour });
    }
    const id = await scheduleDaily(slot, hour);
    setReminder(slot, { on: true, id, hour });
  };

  const shift = (d) => {
    const h = Math.min(maxH, Math.max(minH, r.hour + d));
    if (h !== r.hour) apply(r.on, h);
  };

  return (
    <View style={styles.reminder}>
      <Ionicons name={slot === 'AM' ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.accent} />
      <Text style={[type.body, { flex: 1 }]}>{slot} reminder</Text>
      <Pressable onPress={() => shift(-1)} hitSlop={8} accessibilityLabel="Earlier">
        <Ionicons name="remove-circle-outline" size={22} color={colors.muted} />
      </Pressable>
      <Text style={[type.body, { width: 72, textAlign: 'center' }]}>{fmtHour(r.hour)}</Text>
      <Pressable onPress={() => shift(1)} hitSlop={8} accessibilityLabel="Later">
        <Ionicons name="add-circle-outline" size={22} color={colors.muted} />
      </Pressable>
      <Switch
        value={r.on}
        onValueChange={(v) => apply(v, r.hour)}
        trackColor={{ true: colors.accent, false: colors.border }}
      />
    </View>
  );
}

function Step({ product, index, onRemove }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.small}>{product.category}</Text>
        <Text style={type.body}>
          {product.brand} {product.name}
        </Text>
      </View>
      <Pressable onPress={onRemove} hitSlop={10} accessibilityLabel={`Remove ${product.name}`}>
        <Ionicons name="close-circle-outline" size={22} color={colors.muted} />
      </Pressable>
    </View>
  );
}

export default function RoutineScreen({ navigation }) {
  const { routine, removeFromRoutine } = useApp();

  const forSlot = (slot) =>
    routine
      .filter((r) => r.slot === slot)
      .map((r) => getProduct(r.productId))
      .filter(Boolean)
      .sort((a, b) => STEP_ORDER[a.category] - STEP_ORDER[b.category]);

  const am = forSlot('AM');
  const pm = forSlot('PM');

  if (routine.length === 0) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Ionicons name="list-outline" size={64} color={colors.accent} />
        <Text style={[type.h2, { marginTop: space.md }]}>Your routine is empty</Text>
        <Text style={[type.body, { color: colors.muted, textAlign: 'center', marginVertical: space.md }]}>
          Save products from your matches to build your morning and night routine.
        </Text>
        <Button title="Browse my matches" onPress={() => navigation.navigate('Products')} />
      </Screen>
    );
  }

  const section = (slot, list) => (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm }}>
        <Ionicons name={slot === 'AM' ? 'sunny' : 'moon'} size={20} color={colors.accent} />
        <Text style={type.h2}>{slot === 'AM' ? 'Morning' : 'Night'}</Text>
      </View>
      {list.length === 0 ? (
        <Text style={type.small}>Nothing here yet.</Text>
      ) : (
        list.map((p, i) => (
          <Step key={p.id} product={p} index={i} onRemove={() => removeFromRoutine(p.id, slot)} />
        ))
      )}
      {slot === 'AM' && !list.some((p) => p.category === 'Sunscreen') && (
        <Text style={[type.small, { marginTop: space.sm, color: colors.red }]}>
          Tip: add a sunscreen — it's the most important morning step.
        </Text>
      )}
    </Card>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl }}>
        {section('AM', am)}
        {section('PM', pm)}
        <Card>
          <Text style={[type.h3, { marginBottom: space.sm }]}>Daily reminders</Text>
          <Reminder slot="AM" />
          <Reminder slot="PM" />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: colors.accent, fontWeight: '700' },
  reminder: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
});
