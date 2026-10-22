import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { recommend } from '../logic/matching';
import { CATEGORIES } from '../data/products';
import { Chip, Notice, Screen } from '../components/UI';
import { colors, space, type, radius, cap } from '../theme';

function ProductCard({ item, rank, saved, onSave }) {
  const { product: p, reasons } = item;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={type.small}>
            {p.brand} · {p.category} · {p.price}
          </Text>
          <Text style={[type.h3, { marginTop: 2 }]}>{p.name}</Text>
        </View>
        {rank < 3 && (
          <View style={styles.match}>
            <Text style={styles.matchText}>Top match</Text>
          </View>
        )}
      </View>
      <Text style={[type.body, { color: colors.muted, marginTop: space.sm }]}>{p.blurb}</Text>
      {p.actives.length > 0 && (
        <Text style={[type.small, { marginTop: space.sm }]}>Key ingredients: {p.actives.join(', ')}</Text>
      )}
      {reasons.length > 0 && (
        <View style={styles.reasons}>
          {reasons.map((r) => (
            <View key={r} style={styles.reason}>
              <Ionicons name="checkmark-circle" size={14} color={colors.sage} />
              <Text style={styles.reasonText}>{r}</Text>
            </View>
          ))}
        </View>
      )}
      <Pressable
        onPress={() => onSave(p.id)}
        disabled={saved}
        style={[styles.save, saved && { backgroundColor: colors.sageSoft }]}
        accessibilityRole="button"
      >
        <Ionicons name={saved ? 'checkmark' : 'add'} size={16} color={saved ? colors.sage : colors.accent} />
        <Text style={[styles.saveText, saved && { color: colors.sage }]}>
          {saved ? 'In My Routine' : `Save to My Routine (${p.slots.join(' + ')})`}
        </Text>
      </Pressable>
    </View>
  );
}

export default function ProductsScreen() {
  const { matchProfile, latest, isSaved, saveToRoutine } = useApp();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => recommend(matchProfile, { category, query }),
    [matchProfile, category, query]
  );

  const header = (
    <View>
      <Text style={[type.small, { marginBottom: space.md }]}>
        {latest
          ? `Ranked for ${cap(matchProfile.skinType)} skin with ${latest.concern.label} acne${
              matchProfile.sensitive ? ', sensitive' : ''
            }.`
          : `Ranked for ${cap(matchProfile.skinType)} skin. Do a scan for better matches.`}
      </Text>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products, brands, ingredients"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space.md }}>
        {['All', ...CATEGORIES].map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={results}
        keyExtractor={(r) => r.product.id}
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl }}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <ProductCard
            item={item}
            rank={index}
            saved={isSaved(item.product.id)}
            onSave={saveToRoutine}
          />
        )}
        ListEmptyComponent={<Text style={[type.body, { color: colors.muted }]}>No products match "{query}".</Text>}
        ListFooterComponent={
          <Notice>Suggestions are general information, not medical advice. Patch-test new products.</Notice>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  match: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  matchText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.sm },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.sageSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reasonText: { fontSize: 12, color: colors.ink },
  save: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingVertical: 10,
  },
  saveText: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    marginBottom: space.md,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.ink },
});
