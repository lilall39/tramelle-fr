import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuthSession } from '@/hooks/useAuthSession';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase';

type InlineNotice = { variant: 'error' | 'success'; text: string };

function messageFromUnknown(e: unknown): string {
  if (e instanceof Error && e.message) {
    return e.message;
  }
  if (typeof e === 'string') {
    return e;
  }
  return 'Une erreur inattendue est survenue.';
}

function friendlyAuthError(e: unknown): string {
  const raw = messageFromUnknown(e);
  if (raw.toLowerCase().includes('failed to fetch')) {
    return "Connexion bloquée entre votre navigateur et Supabase. Désactivez VPN/bloqueur de pub, puis réessayez en navigation privée.";
  }
  return raw;
}

export default function AuthScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formNotice, setFormNotice] = useState<InlineNotice | null>(null);
  const [signOutNotice, setSignOutNotice] = useState<InlineNotice | null>(null);

  const validateCredentials = (): string | null => {
    const trimmed = email.trim();
    if (!trimmed) {
      return 'Indiquez une adresse email.';
    }
    if (password.length < 6) {
      return 'Le mot de passe doit faire au moins 6 caractères.';
    }
    return null;
  };

  const onSignIn = async () => {
    setFormNotice(null);
    if (!isSupabaseConfigured()) {
      setFormNotice({ variant: 'error', text: 'Configuration incomplète : variables Supabase manquantes.' });
      return;
    }

    const validation = validateCredentials();
    if (validation) {
      setFormNotice({ variant: 'error', text: validation });
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setFormNotice({ variant: 'error', text: error.message || 'Connexion impossible.' });
        return;
      }
      router.replace('/');
    } catch (e) {
      setFormNotice({ variant: 'error', text: friendlyAuthError(e) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignUp = async () => {
    setFormNotice(null);
    if (!isSupabaseConfigured()) {
      setFormNotice({ variant: 'error', text: 'Configuration incomplète : variables Supabase manquantes.' });
      return;
    }

    const validation = validateCredentials();
    if (validation) {
      setFormNotice({ variant: 'error', text: validation });
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabase();
      const result = await supabase.auth.signUp({ email: email.trim(), password });
      const data = result?.data;
      const error = result?.error;

      if (error) {
        setFormNotice({ variant: 'error', text: error.message || 'Inscription impossible.' });
        return;
      }

      if (data?.session) {
        setFormNotice({ variant: 'success', text: 'Compte créé avec succès. Connexion effectuée.' });
        setTimeout(() => {
          router.replace('/');
        }, 900);
        return;
      }

      setFormNotice({
        variant: 'success',
        text:
          'Compte créé. Si vous recevez un email de confirmation, ouvrez le lien puis utilisez « Se connecter ». Sinon, essayez « Se connecter » maintenant.',
      });
    } catch (e) {
      setFormNotice({ variant: 'error', text: friendlyAuthError(e) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignOut = async () => {
    setSignOutNotice(null);
    if (!isSupabaseConfigured()) {
      router.back();
      return;
    }
    setIsSubmitting(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setSignOutNotice({ variant: 'error', text: error.message || 'Déconnexion impossible.' });
        return;
      }
      router.replace('/');
    } catch (e) {
      setSignOutNotice({ variant: 'error', text: messageFromUnknown(e) });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-background" edges={['top']}>
        <ActivityIndicator color="#A17E45" />
      </SafeAreaView>
    );
  }

  if (user && isSupabaseConfigured()) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background" edges={['top', 'left', 'right']}>
        <View className="flex-1 justify-center px-6">
          <Text className="text-center text-2xl font-semibold text-zinc-950 dark:text-foreground">Compte</Text>
          <Text className="mt-2 text-center text-sm text-zinc-600 dark:text-muted">Vous êtes connecté·e.</Text>
          <Text className="mt-2 text-center text-sm text-zinc-600 dark:text-muted">
            Vous êtes déjà connecté·e avec ce compte. Déconnectez-vous pour changer d'adresse email.
          </Text>
          <Text className="mt-6 text-center text-base font-medium text-zinc-900 dark:text-foreground">
            {user.email ?? 'Compte actif'}
          </Text>
          {signOutNotice?.variant === 'error' ? (
            <Text className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{signOutNotice.text}</Text>
          ) : null}
          <View className="mt-8">
            <PrimaryButton
              disabled={isSubmitting}
              label={isSubmitting ? 'Patientez…' : 'Se déconnecter'}
              onPress={() => void onSignOut()}
            />
          </View>
          <View className="mt-6 items-center">
            <Pressable accessibilityRole="button" onPress={() => router.back()}>
              <Text className="text-sm text-zinc-500 dark:text-muted">Retour</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-1 justify-center px-6">
        <Text className="text-center text-2xl font-semibold text-zinc-950 dark:text-foreground">Connexion</Text>
        <Text className="mt-2 text-center text-sm text-zinc-600 dark:text-muted">
          Connexion et inscription avec votre email. Même mot de passe que sur Supabase Auth.
        </Text>
        {!isSupabaseConfigured() ? (
          <Text className="mt-4 text-center text-sm text-amber-800 dark:text-amber-200">
            Fichier .env incomplet : ajoutez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY puis redémarrez Expo.
          </Text>
        ) : null}

        {formNotice ? (
          <View
            className={`mt-4 rounded-2xl border px-4 py-3 ${
              formNotice.variant === 'error'
                ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40'
                : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/40'
            }`}
          >
            <Text
              className={`text-center text-sm leading-5 ${
                formNotice.variant === 'error'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-emerald-900 dark:text-emerald-100'
              }`}
            >
              {formNotice.text}
            </Text>
          </View>
        ) : null}

        <View className="mt-8 gap-3">
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setFormNotice(null);
            }}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 dark:border-zinc-800 dark:bg-card dark:text-foreground"
          />
          <View className="flex-row items-stretch overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-card">
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              placeholder="Mot de passe"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setFormNotice(null);
              }}
              className="min-h-[48px] flex-1 px-4 py-3 text-base text-zinc-950 dark:text-foreground"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onPress={() => setShowPassword((v) => !v)}
              className="justify-center px-3 active:opacity-70"
            >
              <Text className="text-sm font-medium text-gold">{showPassword ? 'Masquer' : 'Afficher'}</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-6 gap-3">
          <PrimaryButton
            disabled={isSubmitting}
            label={isSubmitting ? 'Patientez…' : 'Se connecter'}
            onPress={() => void onSignIn()}
          />
          <PrimaryButton
            disabled={isSubmitting}
            label={isSubmitting ? 'Patientez…' : 'Créer un compte'}
            onPress={() => void onSignUp()}
          />
        </View>

        <View className="mt-6 items-center">
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Text className="text-sm text-zinc-500 dark:text-muted">Retour</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
