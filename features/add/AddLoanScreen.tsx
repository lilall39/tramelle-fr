import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SegmentPair } from '@/components/ui/SegmentPair';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useCreateLoan } from '@/hooks/useCreateLoan';
import { isDevMockLoansMode } from '@/services/devLoansMock';
import { isSupabaseConfigured } from '@/services/supabase';
import type { LoanKind, LoanMode } from '@/types/loan';
import { formatShortDate } from '@/utils/format';
import { todayIsoDateLocal } from '@/utils/loanDisplay';
import { parseMoneyInput, parseOptionalMoneyInput, validateCreateLoanDraft } from '@/utils/validators';

function isValidIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s.trim());
}

export function AddLoanScreen() {
  const router = useRouter();
  const { user } = useAuthSession();
  const createLoan = useCreateLoan();

  const [mode, setMode] = useState<LoanMode>('lent');
  const [loanKind, setLoanKind] = useState<LoanKind>('object');
  const [personName, setPersonName] = useState('');
  const [itemName, setItemName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [itemValueInput, setItemValueInput] = useState('');
  const [loanDateIso, setLoanDateIso] = useState(todayIsoDateLocal());
  const [expectedReturnIso, setExpectedReturnIso] = useState('');
  const [note, setNote] = useState('');

  const mock = isDevMockLoansMode();
  const canSubmit = Boolean(user?.id && isSupabaseConfigured() && !mock);

  const onSubmit = async () => {
    if (mock || !isSupabaseConfigured()) {
      Alert.alert('Mode démo', 'Configurez Supabase et connectez-vous pour enregistrer un prêt.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Connexion', 'Connectez-vous pour enregistrer un prêt.');
      return;
    }

    const draft = validateCreateLoanDraft({
      loan_kind: loanKind,
      person_name: personName,
      item_name: itemName,
      amountInput,
      item_valueInput: itemValueInput,
    });
    if (!draft.ok) {
      Alert.alert('Champs manquants', draft.message);
      return;
    }

    if (!isValidIsoDate(loanDateIso)) {
      Alert.alert('Date du prêt', 'Utilisez le format AAAA-MM-JJ.');
      return;
    }
    if (expectedReturnIso.trim() && !isValidIsoDate(expectedReturnIso.trim())) {
      Alert.alert('Retour prévu', 'Utilisez le format AAAA-MM-JJ ou laissez vide.');
      return;
    }

    if (loanKind === 'object') {
      const iv = parseOptionalMoneyInput(itemValueInput);
      if (iv !== null && iv < 0) {
        Alert.alert('Valeur', 'La valeur estimée doit être positive.');
        return;
      }
    }

    try {
      const rawItemVal = parseOptionalMoneyInput(itemValueInput);
      const itemVal =
        loanKind === 'object' && rawItemVal !== null && rawItemVal > 0 ? rawItemVal : null;

      await createLoan.mutateAsync({
        userId: user.id,
        payload: {
          mode,
          loan_kind: loanKind,
          person_name: personName.trim(),
          item_name: loanKind === 'object' ? itemName.trim() : null,
          amount: loanKind === 'money' ? parseMoneyInput(amountInput)! : null,
          item_value: loanKind === 'object' ? itemVal : null,
          loan_date: loanDateIso.trim(),
          expected_return_date: expectedReturnIso.trim() ? expectedReturnIso.trim() : null,
          note: note.trim() || null,
          status: 'open',
        },
      });
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Enregistrement impossible.';
      Alert.alert('Erreur', msg);
    }
  };

  const loanDatePreview = isValidIsoDate(loanDateIso) ? formatShortDate(loanDateIso) : '—';
  const returnPreview =
    expectedReturnIso.trim() && isValidIsoDate(expectedReturnIso.trim()) ? formatShortDate(expectedReturnIso.trim()) : null;

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
            <Text className="text-[15px] font-medium text-zinc-600 dark:text-muted">Retour</Text>
          </Pressable>
          <Text className="text-[17px] font-semibold text-zinc-950 dark:text-foreground">Nouveau prêt</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/auth')} hitSlop={10}>
            <Text className="text-[14px] font-semibold text-gold">Compte</Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mt-2 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Type
          </Text>
          <View className="mt-2">
            <SegmentPair<LoanKind>
              left={{ key: 'object', label: 'Objet' }}
              right={{ key: 'money', label: 'Argent' }}
              value={loanKind}
              onChange={setLoanKind}
            />
          </View>

          <Text className="mt-6 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Sens
          </Text>
          <View className="mt-2">
            <SegmentPair<LoanMode>
              left={{ key: 'lent', label: 'Je prête' }}
              right={{ key: 'borrowed', label: "J'emprunte" }}
              value={mode}
              onChange={setMode}
            />
          </View>

          <Text className="mt-6 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Personne
          </Text>
          <TextInput
            value={personName}
            onChangeText={setPersonName}
            placeholder="Nom ou pseudo"
            placeholderTextColor="#a1a1aa"
            autoCapitalize="words"
            className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-[16px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
          />

          {loanKind === 'object' ? (
            <>
              <Text className="mt-5 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Libellé
              </Text>
              <TextInput
                value={itemName}
                onChangeText={setItemName}
                placeholder="Ex. Appareil photo, livre…"
                placeholderTextColor="#a1a1aa"
                className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-[16px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
              />
              <Text className="mt-5 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Valeur estimée (optionnel)
              </Text>
              <TextInput
                value={itemValueInput}
                onChangeText={setItemValueInput}
                placeholder="€"
                placeholderTextColor="#a1a1aa"
                keyboardType="decimal-pad"
                className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-[16px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
              />
            </>
          ) : (
            <>
              <Text className="mt-5 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Montant (€)
              </Text>
              <TextInput
                value={amountInput}
                onChangeText={setAmountInput}
                placeholder="0,00"
                placeholderTextColor="#a1a1aa"
                keyboardType="decimal-pad"
                className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-[16px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
              />
            </>
          )}

          <Text className="mt-6 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Date du prêt
          </Text>
          <TextInput
            value={loanDateIso}
            onChangeText={setLoanDateIso}
            placeholder="AAAA-MM-JJ"
            placeholderTextColor="#a1a1aa"
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 font-mono text-[15px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
          />
          <Text className="mt-1.5 text-[13px] text-zinc-500 dark:text-muted">{loanDatePreview}</Text>

          <Text className="mt-6 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Retour prévu (optionnel)
          </Text>
          <TextInput
            value={expectedReturnIso}
            onChangeText={setExpectedReturnIso}
            placeholder="AAAA-MM-JJ"
            placeholderTextColor="#a1a1aa"
            autoCapitalize="none"
            className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 font-mono text-[15px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
          />
          {returnPreview ? (
            <Text className="mt-1.5 text-[13px] text-zinc-500 dark:text-muted">{returnPreview}</Text>
          ) : null}

          <Text className="mt-6 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Note (optionnel)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Rappel personnel…"
            placeholderTextColor="#a1a1aa"
            multiline
            className="mt-2 min-h-[88px] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[16px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
          />

          <View className="mt-10">
            <PrimaryButton
              label="Enregistrer"
              disabled={!canSubmit || createLoan.isPending}
              onPress={() => void onSubmit()}
            />
          </View>
          {!canSubmit ? (
            <View className="mt-4 items-center gap-2">
              <Text className="text-center text-[13px] text-zinc-500 dark:text-muted">
                {mock || !isSupabaseConfigured()
                  ? 'Connexion Supabase requise pour enregistrer.'
                  : 'Connectez-vous pour enregistrer.'}
              </Text>
              {!mock && isSupabaseConfigured() && !user?.id ? (
                <Pressable accessibilityRole="button" onPress={() => router.push('/auth')}>
                  <Text className="text-[14px] font-semibold text-gold">Se connecter</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {createLoan.isPending ? (
            <ActivityIndicator className="mt-4" color="#A17E45" />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
