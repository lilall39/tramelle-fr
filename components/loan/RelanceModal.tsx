import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';

import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

type RelanceModalProps = {
  visible: boolean;
  onClose: () => void;
  message: string;
};

export function RelanceModal({ visible, onClose, message }: RelanceModalProps) {
  const [busy, setBusy] = useState(false);

  const onShare = async () => {
    setBusy(true);
    try {
      await Share.share({
        message,
        title: 'Relance — prêt',
      });
    } catch {
      Alert.alert('Partage', 'Le partage a été annulé ou n’est pas disponible.');
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async () => {
    try {
      await Clipboard.setStringAsync(message);
      Alert.alert('Copié', 'Vous pouvez coller le texte dans Messages, Mail ou ailleurs.');
    } catch {
      Alert.alert('Erreur', 'Copie impossible.');
    }
  };

  const onOpenMail = async () => {
    const body = encodeURIComponent(message);
    const mailUrl = `mailto:?subject=${encodeURIComponent('Relance — prêt')}&body=${body}`;
    try {
      const ok = await Linking.canOpenURL(mailUrl);
      if (ok) {
        await Linking.openURL(mailUrl);
        return;
      }
    } catch {
      /* fallthrough */
    }
    Alert.alert('Mail', 'Aucune application mail disponible.');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-black/50 px-4 py-8">
        <Card className="max-h-[88%] px-5 py-6">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-[18px] font-semibold text-zinc-950 dark:text-foreground">Message de relance</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fermer" hitSlop={12} onPress={onClose}>
              <Text className="text-[22px] leading-none text-zinc-400">×</Text>
            </Pressable>
          </View>

          <ScrollView
            className="mt-4 max-h-[220px]"
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-[16px] leading-6 text-zinc-800 dark:text-zinc-200">{message}</Text>
          </ScrollView>

          <Text className="mt-4 text-[13px] leading-5 text-zinc-500 dark:text-muted">
            {Platform.OS === 'ios' || Platform.OS === 'android'
              ? 'Astuce : touchez « Partager » pour choisir Messages ou une autre app, puis envoyez depuis celle-ci.'
              : 'Astuce : dans Mail sur Mac ou sur le web, le brouillon s’affiche souvent en bas — c’est normal. Pour envoyer : bouton Envoyer en haut à droite de la fenêtre Mail, ou raccourci clavier ⌘ + Entrée.'}
          </Text>

          <View className="mt-6 gap-3">
            <PrimaryButton label={busy ? 'Ouverture…' : 'Partager…'} disabled={busy} onPress={() => void onShare()} />
            <Pressable
              accessibilityRole="button"
              onPress={() => void onCopy()}
              className="rounded-2xl border border-zinc-200 bg-white py-4 active:opacity-90 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Text className="text-center text-base font-semibold text-zinc-950 dark:text-foreground">Copier le texte</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => void onOpenMail()}
              className="rounded-2xl border border-zinc-200 bg-white py-4 active:opacity-90 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Text className="text-center text-base font-semibold text-zinc-950 dark:text-foreground">Ouvrir dans Mail</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClose} className="py-2">
              <Text className="text-center text-[15px] font-medium text-zinc-500 dark:text-muted">Fermer</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Modal>
  );
}
