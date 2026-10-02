import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
} from 'react-native';
import { SutraTheme } from '../theme/tokens';
import { ArrowRight, Sparkles, Shield } from 'lucide-react-native';

interface WelcomeScreenProps {
  onLogin: (role?: string) => void;
}

export function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const [email, setEmail] = useState('');
  const [isEmailView, setIsEmailView] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SutraTheme.colors.background} />
      
      <View style={styles.content}>
        {/* Top Branding / Monogram */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Sparkles size={24} color={SutraTheme.colors.saffron} />
          </View>
          <Text style={styles.brandTitle}>SUTRA STUDIO</Text>
          <Text style={styles.tagline}>IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH</Text>
          <Text style={styles.subtitle}>
            Bespoke Creative & AI Digital Atelier for High-Growth Brands.
          </Text>
        </View>

        {/* Action Panel */}
        <View style={styles.actionCard}>
          {!isEmailView ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => onLogin('client')}
              >
                <Text style={styles.primaryButtonText}>Continue with Google</Text>
                <ArrowRight size={18} color="#FFFDF9" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.85}
                onPress={() => setIsEmailView(true)}
              >
                <Text style={styles.secondaryButtonText}>Sign in with Work Email</Text>
              </TouchableOpacity>

              <View style={styles.securityBadge}>
                <Shield size={14} color={SutraTheme.colors.brown} />
                <Text style={styles.securityText}>
                  Private Client Access • 256-bit Encrypted Vault
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Work Email</Text>
              <TextInput
                style={styles.input}
                placeholder="client@company.com"
                placeholderTextColor={SutraTheme.colors.mutedLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => onLogin('client')}
              >
                <Text style={styles.primaryButtonText}>Enter Client Studio</Text>
                <ArrowRight size={18} color="#FFFDF9" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textButton}
                onPress={() => setIsEmailView(false)}
              >
                <Text style={styles.textButtonText}>Back to options</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SutraTheme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SutraTheme.spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...SutraTheme.shadow.soft,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
    letterSpacing: 2,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
    color: SutraTheme.colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.xl,
    padding: SutraTheme.spacing.xl,
    ...SutraTheme.shadow.soft,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SutraTheme.colors.brown,
    paddingVertical: 14,
    borderRadius: SutraTheme.borderRadius.full,
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFDF9',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SutraTheme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    paddingVertical: 14,
    borderRadius: SutraTheme.borderRadius.full,
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: SutraTheme.colors.foreground,
    fontSize: 14,
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  securityText: {
    fontSize: 11,
    color: SutraTheme.colors.muted,
  },
  formContainer: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: SutraTheme.colors.foreground,
    marginBottom: 4,
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  textButtonText: {
    fontSize: 12,
    color: SutraTheme.colors.muted,
  },
});
