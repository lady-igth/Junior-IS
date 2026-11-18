// Profile screen: shows the latest skin profile (acne level + skin type)
// with confidence bars, the trend since the last scan, and scan history.
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { Button, Card, ConfidenceBar, LevelBadge, Notice, Screen } from '../components/UI';
import { CONCERN_LABELS } from '../ml/config';
import { colors, space, type, levelColor, cap } from '../theme';

// 0 = clear … 2 = moderate, weighted by confidence
const severity = (scan) => (scan.concern.probs.mild || 0) + 2 * (scan.concern.probs.moderate || 0);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// Compare the latest scan with the one before it.
function trendText(latest, prev) {
  if (!prev) return null;
  const diff = severity(latest) - severity(prev);
  if (diff < -0.15) return 'Improving since your last scan';
  if (diff > 0.15) return 'More breakouts than your last scan';
  return 'About the same as your last scan';
}

const SUMMARY = {
  clear: 'Your skin looks clear. Keep a simple routine.',
  mild: 'Some mild breakouts. Anti-acne ingredients can help.',
  moderate: 'Noticeable breakouts. A dermatologist can help if they last.',
};

export default function ProfileScreen({ navigation }) {
  const { latest, scans, profile, deleteScan, editProfile } = useApp();

  if (!latest) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Ionicons name="person-circle-outline" size={56} color={colors.muted} />
        <Text style={[type.h2, { marginTop: space.md }]}>No skin profile yet</Text>
        <Text style={[type.body, { color: colors.muted, textAlign: 'center', marginVertical: space.md }]}>
          Do a scan to see your results.
        </Text>
        <Button title="Start a scan" onPress={() => navigation.navigate('Scan')} />
        <Pressable onPress={editProfile} style={{ marginTop: space.lg }}>
          <Text style={[type.small, { color: colors.ink, fontWeight: '600' }]}>Retake Skin Quiz</Text>
        </Pressable>
      </Screen>
    );
  }

  const level = latest.concern.label;
  const trend = trendText(latest, scans[1]);

  const confirmDelete = (id) =>
    Alert.alert('Delete this scan?', 'This removes the result from your history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteScan(id) },
    ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl }}>
        {latest.mode === 'demo' && (
          <Notice tone="warn">Demo mode: rough estimate, not the AI model.</Notice>
        )}

        <Card>
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
          <Text style={type.h3}>Confidence</Text>
          <Text style={[type.small, { marginBottom: space.sm }]}>
            {latest.concern.usedQuiz ? 'Photo 70% + quiz 30%' : 'From the photo'}
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
        </Card>

        <Card>
          <View style={styles.row}>
            <Text style={type.h3}>Skin type</Text>
            <Text style={type.h3}>{cap(latest.skinType.label)}</Text>
          </View>
          {latest.skinType.probs ? (
            <>
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
              {profile.selfSkinType === 'unsure' ? 'Using “normal” for now.' : 'From your setup answer.'}
            </Text>
          )}
          {profile.sensitive && <Text style={[type.small, { marginTop: space.sm }]}>Sensitive skin</Text>}
        </Card>

        {level === 'moderate' && (
          <Notice tone="warn">Painful or lasting breakouts? See a dermatologist.</Notice>
        )}

        <View style={{ gap: space.sm, marginBottom: space.xl }}>
          <Button title="See my products" onPress={() => navigation.navigate('Products')} />
        </View>

        <Text style={[type.h2, { marginBottom: space.md }]}>History</Text>
        {scans.map((s) => (
          <View key={s.id} style={styles.historyRow}>
            <View style={[styles.dot, { backgroundColor: levelColor[s.concern.label] }]} />
            <View style={{ flex: 1 }}>
              <Text style={type.body}>{cap(s.concern.label)}</Text>
              <Text style={type.small}>
                {fmtDate(s.date)} · {Math.round(s.concern.confidence * 100)}%
                {s.mode === 'demo' ? ' · demo' : ''}
              </Text>
            </View>
            <Pressable onPress={() => confirmDelete(s.id)} hitSlop={10} accessibilityLabel="Delete scan">
              <Ionicons name="trash-outline" size={18} color={colors.muted} />
            </Pressable>
          </View>
        ))}

        <Pressable onPress={editProfile} style={{ marginTop: space.xl, alignSelf: 'center' }}>
          <Text style={[type.small, { color: colors.ink, fontWeight: '600' }]}>Retake Skin Quiz</Text>
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
    marginBottom: space.sm,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
