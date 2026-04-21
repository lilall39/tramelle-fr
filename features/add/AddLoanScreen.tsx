import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Calendar } from 'react-native-calendars';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
  const [personEmail, setPersonEmail] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [itemName, setItemName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [itemValueInput, setItemValueInput] = useState('');
  const [loanDateIso, setLoanDateIso] = useState(todayIsoDateLocal());
  const [expectedReturnIso, setExpectedReturnIso] = useState('');
  const [note, setNote] = useState('');
  const [activeDateField, setActiveDateField] = useState<'loan' | 'return' | null>(null);

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
          person_email: personEmail.trim() ? personEmail.trim().toLowerCase() : null,
          person_phone: personPhone.trim() ? personPhone.trim() : null,
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

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            hitSlop={12}
            className="flex-row items-center gap-1 rounded-full bg-stone-200/80 px-3 py-2 dark:bg-zinc-800"
          >
            <Text className="text-[16px] font-semibold text-zinc-800 dark:text-zinc-100">‹</Text>
            <Text className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">Retour</Text>
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

          <Text className="mt-5 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Email (optionnel)
          </Text>
          <TextInput
            value={personEmail}
            onChangeText={setPersonEmail}
            placeholder="exemple@email.com"
            placeholderTextColor="#a1a1aa"
            autoCapitalize="none"
            keyboardType="email-address"
            className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-[16px] text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground"
          />

          <Text className="mt-5 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Téléphone (optionnel)
          </Text>
          <TextInput
            value={personPhone}
            onChangeText={setPersonPhone}
            placeholder="+33..."
            placeholderTextColor="#a1a1aa"
            keyboardType="phone-pad"
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
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveDateField('loan')}
            className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Text className="font-mono text-[15px] text-zinc-950 dark:text-foreground">{loanDateIso}</Text>
          </Pressable>

          <Text className="mt-6 text-[13px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Retour prévu (optionnel)
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveDateField('return')}
            className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Text className="font-mono text-[15px] text-zinc-950 dark:text-foreground">
              {expectedReturnIso || 'Aucune date'}
            </Text>
          </Pressable>
          {expectedReturnIso ? (
            <Pressable accessibilityRole="button" onPress={() => setExpectedReturnIso('')} className="mt-2 self-start">
              <Text className="text-[13px] font-medium text-zinc-500 dark:text-muted">Effacer la date de retour</Text>
            </Pressable>
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

      <Modal visible={activeDateField !== null} transparent animationType="fade" onRequestClose={() => setActiveDateField(null)}>
        <Pressable className="flex-1 items-center justify-center bg-black/35 px-4" onPress={() => setActiveDateField(null)}>
          <Pressable
            className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
            onPress={() => {}}
          >
            <Text className="mb-2 text-center text-[15px] font-semibold text-zinc-900 dark:text-foreground">
              {activeDateField === 'loan' ? 'Choisir la date du prêt' : 'Choisir la date de retour'}
            </Text>
            <Calendar
              current={activeDateField === 'loan' ? loanDateIso : expectedReturnIso || loanDateIso}
              markedDates={{
                [(activeDateField === 'loan' ? loanDateIso : expectedReturnIso || loanDateIso)]: {
                  selected: true,
                  selectedColor: '#A17E45',
                },
              }}
              onDayPress={(day) => {
                if (activeDateField === 'loan') {
                  setLoanDateIso(day.dateString);
                } else {
                  setExpectedReturnIso(day.dateString);
                }
                setActiveDateField(null);
              }}
            />
            <Pressable accessibilityRole="button" onPress={() => setActiveDateField(null)} className="mt-2 self-end px-3 py-2">
              <Text className="text-[14px] font-semibold text-gold">Fermer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
