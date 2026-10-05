import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { SutraTheme } from '../theme/tokens';
import {
  CreditCard,
  HardDrive,
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

interface MoreScreenProps {
  onLogout: () => void;
}

export function MoreScreen({ onLogout }: MoreScreenProps) {
  const menuItems = [
    { title: 'Plan & Monthly Allowances', subtitle: 'Growth Plan • ₹24,999/mo', icon: Sparkles },
    { title: 'Invoices & Tax Receipts', subtitle: '3 statements synchronized', icon: CreditCard },
    { title: 'Google Drive Media Vault', subtitle: '256-bit encrypted root folder', icon: HardDrive },
    { title: 'Profile & Team Members', subtitle: 'Studio Living Private Limited', icon: User },
    { title: 'Privacy & White-Label Safeguard', subtitle: 'Confidentiality Agreement Active', icon: ShieldCheck },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Studio Hub</Text>
        <Text style={styles.headerSubtitle}>
          Manage subscriptions, billing, drive storage, and team settings.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>YJ</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Yash Joshi</Text>
            <Text style={styles.userRole}>Verified Client Member</Text>
            <Text style={styles.userEmail}>client@sutrastudio.com</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={idx} style={styles.menuRow} activeOpacity={0.7}>
                <View style={styles.iconCircle}>
                  <Icon size={18} color={SutraTheme.colors.brown} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={16} color={SutraTheme.colors.mutedLight} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={onLogout}
        >
          <LogOut size={16} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out from Studio</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SutraTheme.colors.background,
  },
  header: {
    padding: SutraTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SutraTheme.colors.border,
    backgroundColor: SutraTheme.colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
  },
  headerSubtitle: {
    fontSize: 12,
    color: SutraTheme.colors.muted,
    marginTop: 2,
  },
  scrollContent: {
    padding: SutraTheme.spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.xl,
    padding: SutraTheme.spacing.lg,
    marginBottom: 20,
    ...SutraTheme.shadow.soft,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: SutraTheme.colors.saffronSubtle,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
  },
  userRole: {
    fontSize: 11,
    fontWeight: '600',
    color: SutraTheme.colors.brown,
    marginTop: 1,
  },
  userEmail: {
    fontSize: 12,
    color: SutraTheme.colors.muted,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: 24,
    ...SutraTheme.shadow.soft,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SutraTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SutraTheme.colors.borderLight,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SutraTheme.colors.saffronSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
  },
  menuSubtitle: {
    fontSize: 11,
    color: SutraTheme.colors.muted,
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: SutraTheme.borderRadius.full,
    gap: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
