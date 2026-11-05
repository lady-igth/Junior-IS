import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { Button, Card, Chip } from '../components/UI';
import { colors, space, type, radius, cap } from '../theme';
import { QUESTIONS, scoreQuiz } from '../logic/quiz';

export default function OnboardingScreen() {
  const { profile, finishOnboarding } = useApp();
  const [name, setName] = useState(profile.name);
  const [answers, setAnswers] = useState(profile.quiz || {});
  const answer = (qid, key) => setAnswers((a) => ({ ...a, [qid]: key }));
  const result = scoreQuiz(answers);
  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;

  const start = () =>
    finishOnboarding({
      name: name.trim(),
      quiz: answers,
      selfSkinType: result.skinType?.label || 'unsure',
      sensitive: result.sensitive,
    });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Ionicons name="sparkles" size={30} color="#fff" />
        </View>
        <Text style={type.title}>The Skincare Guide</Text>
        <Text style={[type.body, { color: colors.muted, marginTop: space.sm, marginBottom: space.xl }]}>
          Take a photo of your skin, get an AI skin profile, and build a routine with products matched to you.
        </Text>

        <Card>
          <Text style={type.h3}>What should we call you?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your first name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="words"
          />
        </Card>

        <Text style={[type.h2, { marginTop: space.md }]}>Skin Quiz</Text>
        <Text style={[type.small, { marginBottom: space.md }]}>
          {answeredCount}/{QUESTIONS.length} answered · Your answers work with the photo to make the analysis more
          accurate. Skip any you're not sure about.
        </Text>

        {QUESTIONS.map((q, i) => (
          <Card key={q.id}>
            <Text style={[type.h3, { marginBottom: space.md }]}>
              {i + 1}. {q.text}
            </Text>
            <View style={styles.wrapRow}>
              {q.options.map((o) => (
                <View key={o.key} style={{ marginBottom: space.sm }}>
                  <Chip label={o.label} active={answers[q.id] === o.key} onPress={() => answer(q.id, o.key)} />
                </View>
              ))}
            </View>
          </Card>
        ))}

        {result.skinType && (
          <Card style={{ backgroundColor: colors.sageSoft }}>
            <Text style={type.small}>Your quiz result so far</Text>
            <Text style={type.h3}>
              {cap(result.skinType.label)} skin{result.sensitive ? ' · sensitive' : ''}
            </Text>
          </Card>
        )}

        <View style={styles.privacy}>
          <Ionicons name="lock-closed" size={18} color={colors.sage} />
          <Text style={[type.small, { flex: 1 }]}>
            Your photos are analyzed on this phone and deleted right away. Nothing is uploaded. Only your results
            are saved, and only on this device.
          </Text>
        </View>

        <Button
          title="Get started"
          onPress={start}
        />
        <Text style={[type.small, { textAlign: 'center', marginTop: space.md }]}>
          This app gives general skincare suggestions, not medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: space.xl, paddingBottom: space.xxl * 2 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  input: {
    marginTop: space.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: space.md,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.bg,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  privacy: {
    flexDirection: 'row',
    gap: space.sm,
    backgroundColor: colors.sageSoft,
    padding: space.md,
    borderRadius: radius.sm,
    marginBottom: space.xl,
    alignItems: 'flex-start',
  },
});
