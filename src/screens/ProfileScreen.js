import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { Button, Card, ConfidenceBar, LevelBadge, Notice, Screen } from '../components/UI';
import { CONCERN_LABELS } from '../ml/config';
import { colors, space, type, levelColor, levelSoft, cap } from '../theme';

// 0 = clear … 2 = moderate, weighted by confidence
const severity = (scan) => (scan.concern.probs.mild || 0) + 2 * (scan.concern.probs.moderate || 0);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const SUMMARY = {
  clear: 'Your skin looks clear. Focus on a simple routine: gentle cleanser, moisturizer and daily sunscreen.',
  mild: 'Some mild breakouts detected. Gentle exfoliating or anti-acne ingredients can help.',
  moderate:
    'Noticeable breakouts detected. Over-the-counter treatments can help, and a dermatologist can offer stronger options.',
};

export default function ProfileScreen({ navigation }) {
  const { latest, scans, profile, deleteScan, editProfile } = useApp();

  if (!latest) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Ionicons name="person-circle-outline" size={64} color={colors.accent} />
        <Text style={[type.h2, { marginTop: space.md }]}>No skin profile yet</Text>
        <Text style={[type.body, { color: colors.muted, textAlign: 'center', marginVertical: space.md }]}>
          Do your first scan to see your results here.
        </Text>
        <Button title="Start a scan" onPress={() => navigation.navigate('Scan')} />
        <Pressable onPress={editProfile} style={{ marginTop: space.lg }}>
          <Text style={[type.small, { color: colors.accent, fontWeight: '600' }]}>Retake Skin Quiz / edit setup</Text>
        </Pressable>
      </Screen>
    );
  }

  const level = latest.concern.label;
  const prev = scans[1];
  let trend = null;
  if (prev) {
    const diff = severity(latest) - severity(prev);
    trend =
      diff < -0.15 ? 'Improving since your last scan' : diff > 0.15 ? 'More breakouts than your last scan' : 'About the same as your last scan';
  }

  const confirmDelete = (id) =>
    Alert.alert('Delete this scan?', 'This removes the result from your history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteScan(id) },
    ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl }}>
        {latest.mode === 'demo' && (
          <Notice tone="warn">
            Demo mode: the AI model isn't running in this build, so this is a rough estimate. Use the development
            build to get real model results.
          </Notice>
        )}

        <Card style={{ backgroundColor: levelSoft[level] }}>
          <Text style={type.small}>Latest scan · {fmtDate(latest.date)}</Text>
          <View style={[styles.row, { marginVertical: space.sm }]}>
            <Text style={type.h2}>Acne level</Text>
            <LevelBadge level={level} />
          </View>
          <Text style={type.body}>{SUMMARY[level]}</Text>
          {trend && (
            <Text style={[type.small, { marginTop: space.sm, color: colors.ink }]}>
              <Ionicons name="trending-up-outline" size={13} /> {trend}
            </Text>
          )}
        </Card>

        <Card>
          <Text style={type.h3}>How confident is the AI?</Text>
          <Text style={[type.small, { marginBottom: space.sm }]}>
            {latest.concern.usedQuiz
              ? 'Photo (70%) combined with your breakout answer from the Skin Quiz (30%).'
              : 'Probability for each acne level from the photo.'}
          </Text>
          {CONCERN_LABELS.map((l) => (
            <ConfidenceBar
              key={l}
              label={l}
              value={latest.concern.probs[l]}
              color={levelColor[l]}
              highlight={l === level}
            />
          ))}
          {latest.concern.photoOnly && latest.concern.photoOnly.label !== level && (
            <Text style={[type.small, { marginTop: space.sm }]}>
              The photo alone said {latest.concern.photoOnly.label}; your quiz answer shifted the result.
            </Text>
          )}
        </Card>

        <Card>
          <View style={styles.row}>
            <Text style={type.h3}>Skin type</Text>
            <Text style={[type.h3, { color: colors.accent }]}>{cap(latest.skinType.label)}</Text>
          </View>
          {latest.skinType.probs ? (
            <>
              <Text style={[type.small, { marginTop: 4 }]}>
                {latest.skinType.source === 'quiz'
                  ? 'Based on your Skin Quiz answers.'
                  : latest.skinType.source === 'combined'
                  ? 'Combines your photo with your Skin Quiz.'
                  : 'From your photo.'}
              </Text>
              {Object.keys(latest.skinType.probs).map((l) => (
                <ConfidenceBar
                  key={l}
                  label={l}
                  value={latest.skinType.probs[l]}
                  highlight={l === latest.skinType.label}
                />
              ))}
            </>
          ) : (
            <Text style={[type.small, { marginTop: 4 }]}>
              {profile.selfSkinType === 'unsure'
                ? 'You weren’t sure of your skin type, so we’re using “normal” for now.'
                : 'Based on your answer during setup. Retake the Skin Quiz below for a better estimate.'}
            </Text>
          )}
          {profile.sensitive && <Text style={[type.small, { marginTop: space.sm }]}>Sensitive skin: yes</Text>}
        </Card>

        {level === 'moderate' && (
          <Notice tone="warn">
            If breakouts are painful, leave marks, or don't improve after 8–12 weeks, consider seeing a dermatologist.
          </Notice>
        )}

        <View style={{ gap: space.sm, marginBottom: space.xl }}>
          <Button title="See my product matches" onPress={() => navigation.navigate('Products')} />
          <Button title="Retake scan" variant="ghost" onPress={() => navigation.navigate('Scan')} />
        </View>

        <Text style={[type.h2, { marginBottom: space.sm }]}>Progress</Text>
        <Text style={[type.small, { marginBottom: space.md }]}>
          Each scan's result is saved here (never the photo) so you can track changes over time.
        </Text>
        {scans.map((s) => (
          <View key={s.id} style={styles.historyRow}>
            <View style={[styles.dot, { backgroundColor: levelColor[s.concern.label] }]} />
            <View style={{ flex: 1 }}>
              <Text style={type.body}>{cap(s.concern.label)}</Text>
              <Text style={type.small}>
                {fmtDate(s.date)} · {Math.round(s.concern.confidence * 100)}% confident
                {s.mode === 'demo' ? ' · demo' : ''}
              </Text>
            </View>
            <Pressable onPress={() => confirmDelete(s.id)} hitSlop={10} accessibilityLabel="Delete scan">
              <Ionicons name="trash-outline" size={18} color={colors.muted} />
            </Pressable>
          </View>
        ))}

        <Pressable onPress={editProfile} style={{ marginTop: space.xl, alignSelf: 'center' }}>
          <Text style={[type.small, { color: colors.accent, fontWeight: '600' }]}>Retake Skin Quiz / edit setup</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.sm,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
