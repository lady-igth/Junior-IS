// Daily AM / PM routine reminders (local notifications, no server).
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('routine', {
      name: 'Routine reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function scheduleDaily(slot, hour) {
  const body =
    slot === 'AM'
      ? 'Good morning! Time for your AM routine — don’t forget sunscreen.'
      : 'Evening check-in: time for your PM routine.';
  return Notifications.scheduleNotificationAsync({
    content: { title: 'The Skincare Guide', body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
      channelId: 'routine',
    },
  });
}

export async function cancel(id) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    // already gone
  }
}
