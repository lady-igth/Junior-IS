import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, space, radius, type, levelColor, cap } from '../theme';

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        primary ? styles.btnPrimary : styles.btnGhost,
        (pressed || disabled) && { opacity: 0.7 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? '#fff' : colors.accent} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.btnText, { color: primary ? '#fff' : colors.accent }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function ConfidenceBar({ label, value, color = colors.accent, highlight }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <View style={{ marginVertical: space.xs + 2 }}>
      <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
        <Text style={[type.body, highlight && { fontWeight: '700' }]}>{cap(label)}</Text>
        <Text style={[type.small, highlight && { color: colors.ink, fontWeight: '700' }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function LevelBadge({ level }) {
  return (
    <View style={[styles.badge, { backgroundColor: levelColor[level] || colors.muted }]}>
      <Text style={styles.badgeText}>{cap(level)}</Text>
    </View>
  );
}

export function Notice({ children, tone = 'info' }) {
  const bg = tone === 'warn' ? colors.amberSoft : colors.sageSoft;
  return (
    <View style={[styles.notice, { backgroundColor: bg }]}>
      <Text style={type.small}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  btn: {
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnGhost: { backgroundColor: colors.accentSoft },
  btnText: { fontSize: 16, fontWeight: '600' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: space.sm,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 14, color: colors.ink, fontWeight: '500' },
  track: { height: 10, backgroundColor: colors.border, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  notice: { borderRadius: radius.sm, padding: space.md, marginBottom: space.md },
});
