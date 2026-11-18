// Products screen: all products ranked by the matching algorithm,
// with a search box and a filter for each category.
import React, { useState } from 'react';
import { FlatList, ScrollView, View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { recommend } from '../logic/matching';
import { CATEGORIES } from '../data/products';
import { Chip, Screen } from '../components/UI';
import { colors, space, type, radius, cap } from '../theme';

// The line above the list that says what the ranking is based on.
function rankingNote(matchProfile, latest) {
  const skin = `${cap(matchProfile.skinType)} skin`;
  if (!latest) return `For ${skin}`;
  const sensitive = matchProfile.sensitive ? ' · sensitive' : '';
  return `For ${skin} · ${latest.concern.label} acne${sensitive}`;
}

// One product in the list, with its reasons and a Save button.
function ProductCard({ item, rank, saved, onSave }) {
  const { product: p, reasons } = item;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={type.small}>
            {p.brand} · {p.price}
          </Text>
          <Text style={[type.h3, { marginTop: 2 }]}>{p.name}</Text>
        </View>
        {rank < 3 && (
          <View style={styles.match}>
            <Text style={styles.matchText}>Top</Text>
          </View>
        )}
      </View>
      {reasons.length > 0 && (
        <Text style={[type.small, { marginTop: space.sm }]}>{reasons.join(' · ')}</Text>
      )}
      <Pressable
        onPress={() => onSave(p.id)}
        disabled={saved}
        style={styles.save}
        accessibilityRole="button"
      >
        <Ionicons name={saved ? 'checkmark' : 'add'} size={16} color={saved ? colors.muted : colors.accent} />
        <Text style={[styles.saveText, saved && { color: colors.muted }]}>{saved ? 'Saved' : 'Save'}</Text>
      </Pressable>
    </View>
  );
}

export default function ProductsScreen() {
  const { matchProfile, latest, isSaved, saveToRoutine } = useApp();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  // Score and rank every product for this user (only 25, so this is instant).
  const results = recommend(matchProfile, { category, query });

  const header = (
    <View>
      <Text style={[type.small, { marginBottom: space.md }]}>
        {rankingNote(matchProfile, latest)}
      </Text>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
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
          <Text style={[type.small, { textAlign: 'center' }]}>Not medical advice. Patch-test new products.</Text>
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
    marginBottom: space.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  match: { backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  matchText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  save: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  saveText: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    marginBottom: space.md,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.ink },
});
