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
  Sparkles,
  PlusCircle,
  MessageSquare,
  FolderGit2,
  HardDrive,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const quickActions = [
    { title: 'New Order', icon: PlusCircle, route: 'NewOrder' },
    { title: 'Sutra AI', icon: MessageSquare, route: 'Chat' },
    { title: 'Projects', icon: FolderGit2, route: 'Projects' },
    { title: 'Vault', icon: HardDrive, route: 'More' },
  ];

  const services = [
    { title: '3D Spatial Modeling', price: 'From ₹45,000' },
    { title: 'Brand Identity', price: 'From ₹25,000' },
    { title: 'Meta Ads Suite', price: 'From ₹20,000' },
    { title: 'Web App Portal', price: 'From ₹60,000' },
    { title: 'AI Automation', price: 'From ₹35,000' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>CLIENT COMMAND</Text>
            <Text style={styles.greeting}>Namaste, Yash</Text>
            <Text style={styles.subGreeting}>Studio Living Private Limited</Text>
          </View>
          <View style={styles.lotusBadge}>
            <Sparkles size={18} color={SutraTheme.colors.saffron} />
          </View>
        </View>

        {/* Plan Status Banner */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.badgeRow}>
              <Text style={styles.planTag}>MONTHLY GROWTH SUITE</Text>
              <Text style={styles.activeTag}>● Active</Text>
            </View>
            <Text style={styles.planPrice}>₹24,999/mo</Text>
          </View>
          <Text style={styles.planDesc}>
            4 of 6 active monthly creative deliverables completed this cycle.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
        </View>

        {/* Quick Action Cards */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(action.route)}
              >
                <View style={styles.iconCircle}>
                  <Icon size={20} color={SutraTheme.colors.brown} />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Commissions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Commissions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderCode}>#ORD-001</Text>
            <View style={styles.reviewChip}>
              <Clock size={12} color={SutraTheme.colors.statusProgress} />
              <Text style={styles.reviewText}>In Review</Text>
            </View>
          </View>
          <Text style={styles.orderTitle}>3D Spatial Architecture — Luxury Living Suite</Text>
          <Text style={styles.orderMeta}>Revision Round 1 of 2 • Google Drive Synced</Text>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderCode}>#ORD-002</Text>
            <View style={styles.completedChip}>
              <CheckCircle2 size={12} color={SutraTheme.colors.statusCompleted} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          </View>
          <Text style={styles.orderTitle}>Sutra Studio Brand Identity & Sanskrit Typography</Text>
          <Text style={styles.orderMeta}>Deliverables Approved • Vector Pack Available</Text>
        </View>

        {/* 12 Disciplines Carousel */}
        <Text style={styles.sectionTitle}>Studio Capabilities</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
          {services.map((srv, idx) => (
            <View key={idx} style={styles.serviceItem}>
              <Text style={styles.serviceName}>{srv.title}</Text>
              <Text style={styles.servicePrice}>{srv.price}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SutraTheme.colors.background,
  },
  scrollContent: {
    padding: SutraTheme.spacing.lg,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
    letterSpacing: 1.5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
    marginTop: 2,
  },
  subGreeting: {
    fontSize: 12,
    color: SutraTheme.colors.muted,
    marginTop: 2,
  },
  lotusBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: {
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.xl,
    padding: SutraTheme.spacing.lg,
    marginBottom: 24,
    ...SutraTheme.shadow.soft,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planTag: {
    fontSize: 10,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
  },
  activeTag: {
    fontSize: 10,
    color: SutraTheme.colors.statusCompleted,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
  },
  planDesc: {
    fontSize: 12,
    color: SutraTheme.colors.muted,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: SutraTheme.colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: SutraTheme.colors.saffron,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: SutraTheme.colors.brown,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.lg,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SutraTheme.colors.saffronSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
  },
  orderCard: {
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.lg,
    padding: SutraTheme.spacing.md,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderCode: {
    fontSize: 12,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
  },
  reviewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  reviewText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  completedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#166534',
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
    marginBottom: 4,
  },
  orderMeta: {
    fontSize: 11,
    color: SutraTheme.colors.muted,
  },
  servicesScroll: {
    marginTop: 4,
  },
  serviceItem: {
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.md,
    padding: 12,
    marginRight: 10,
    width: 150,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 11,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
  },
});
