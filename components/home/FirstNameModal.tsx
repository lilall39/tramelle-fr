import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

type FirstNameModalProps = {
  visible: boolean;
  onContinue: (firstName: string) => void | Promise<void>;
};

export function FirstNameModal({ visible, onContinue }: FirstNameModalProps) {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0;

  const submit = async () => {
    if (!canSubmit || busy) {
      return;
    }
    setBusy(true);
    try {
      await onContinue(trimmed);
      setValue('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={() => {}}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center bg-black/45"
        style={{ paddingTop: Math.max(20, insets.top), paddingBottom: Math.max(20, insets.bottom) }}
      >
        <View className="flex-1 justify-center px-5">
          <Card className="w-full max-w-md self-center p-0 px-7 py-8">
            <Text className="text-center text-[22px] font-semibold leading-7 tracking-[-0.4px] text-zinc-950 dark:text-foreground">
              Comment devons-nous vous appeler ?
            </Text>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="Prénom"
              placeholderTextColor="#a1a1aa"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="done"
              onSubmitEditing={() => void submit()}
              editable={!busy}
              className="mt-6 rounded-2xl border border-zinc-200/90 bg-stone-50/90 px-4 py-3.5 text-[17px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-foreground"
              accessibilityLabel="Prénom"
            />
            <View className="mt-8 w-full">
              <PrimaryButton label="Continuer" disabled={!canSubmit || busy} onPress={() => void submit()} />
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
