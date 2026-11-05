import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { analyzePhoto } from '../ml/classifier';
import { Button, Card, Screen } from '../components/UI';
import { colors, space, type, radius } from '../theme';

const TIPS = [
  { icon: 'sunny-outline', text: 'Face a window — soft, even daylight works best.' },
  { icon: 'scan-outline', text: 'Fill the square with the area you want checked (cheek, forehead, chin).' },
  { icon: 'water-outline', text: 'Bare skin: no makeup or filters.' },
  { icon: 'hand-left-outline', text: 'Hold still so the photo is sharp.' },
];

export default function ScanScreen({ navigation }) {
  const { profile, addScan } = useApp();
  const [photo, setPhoto] = useState(null); // kept in memory only
  const [busy, setBusy] = useState(false);

  const pick = async (fromCamera) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', `Please allow ${fromCamera ? 'camera' : 'photo'} access in Settings.`);
      return;
    }
    const opts = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 };
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ ...opts, cameraType: ImagePicker.CameraType.front })
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled && res.assets?.[0]) setPhoto(res.assets[0]);
  };

  const analyze = async () => {
    if (!photo) return;
    setBusy(true);
    try {
      const result = await analyzePhoto(photo.uri, profile);
      addScan(result);
      setPhoto(null); // discard the photo — only the result is kept
      navigation.navigate('Profile');
    } catch (e) {
      console.warn(e);
      Alert.alert('Something went wrong', 'We could not analyze that photo. Please try another one.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl }}>
        <Text style={type.h2}>
          {profile.name ? `Hi ${profile.name}, ready for a scan?` : 'Ready for a scan?'}
        </Text>
        <Text style={[type.small, { marginTop: 4, marginBottom: space.lg }]}>
          The AI checks your skin for acne level and builds your skin profile.
        </Text>

        <View style={styles.frame}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photo} accessibilityLabel="Your skin photo" />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="camera-outline" size={48} color={colors.accent} />
              <Text style={[type.small, { marginTop: space.sm }]}>No photo yet</Text>
            </View>
          )}
        </View>

        {photo ? (
          <View style={{ gap: space.sm }}>
            <Button title="Analyze my skin" onPress={analyze} loading={busy} />
            <Button title="Retake" variant="ghost" onPress={() => setPhoto(null)} disabled={busy} />
          </View>
        ) : (
          <View style={{ gap: space.sm }}>
            <Button
              title="Take a photo"
              onPress={() => pick(true)}
              icon={<Ionicons name="camera" size={18} color="#fff" />}
            />
            <Button
              title="Choose from photos"
              variant="ghost"
              onPress={() => pick(false)}
              icon={<Ionicons name="images-outline" size={18} color={colors.accent} />}
            />
          </View>
        )}

        <Card style={{ marginTop: space.xl }}>
          <Text style={[type.h3, { marginBottom: space.sm }]}>Tips for an accurate scan</Text>
          {TIPS.map((t) => (
            <View key={t.text} style={styles.tip}>
              <Ionicons name={t.icon} size={18} color={colors.accent} />
              <Text style={[type.body, { flex: 1 }]}>{t.text}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.privacy}>
          <Ionicons name="lock-closed" size={14} color={colors.sage} />
          <Text style={type.small}>Analyzed on your phone. The photo is never saved or uploaded.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.accentSoft,
    marginBottom: space.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photo: { width: '100%', height: '100%' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tip: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', marginVertical: 5 },
  privacy: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
});
