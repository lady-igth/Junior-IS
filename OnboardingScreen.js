// Onboarding screen (first launch): asks for the user's name and the 6-question Skin Quiz.
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

  // Save one quiz answer, e.g. answer('afterWash', 'tight')
  const answer = (qid, key) => setAnswers((a) => ({ ...a, [qid]: key }));

  // Live quiz result, updated every time an answer changes
  const result = scoreQuiz(answers);
  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;

  // "Get started": save the name and quiz results, then open the app
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
        <Text style={type.title}>The Skincare Guide</Text>
        <Text style={[type.body, { color: colors.muted, marginTop: space.sm, marginBottom: space.xl }]}>
          A skin profile and routine made for you.
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
          {answeredCount}/{QUESTIONS.length} answered · skip any you're unsure of
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
          <Card>
            <Text style={type.small}>Your result</Text>
            <Text style={type.h3}>
              {cap(result.skinType.label)} skin{result.sensitive ? ' · sensitive' : ''}
            </Text>
          </Card>
        )}

        <Button title="Get started" onPress={start} style={{ marginTop: space.md }} />
        <Text style={[type.small, { textAlign: 'center', marginTop: space.md }]}>
          Photos stay on your phone. Not medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: space.xl, paddingBottom: space.xxl * 2 },
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
});
