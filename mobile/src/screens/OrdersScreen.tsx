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
  Clock,
  CheckCircle2,
  Download,
  FileCheck2,
  HardDrive,
} from 'lucide-react-native';

export function OrdersScreen() {
  const orders = [
    {
      id: 'ord_001',
      code: '#ORD-001',
      title: '3D Spatial Architecture — Luxury Living Suite',
      service: '3D Visualization',
      status: 'in_review',
      statusLabel: 'In Review',
      revision: 'Round 1 of 2',
      file: 'Pavilion_Villa_Baked_Model.gltf (42.1 MB)',
      updatedAt: 'Updated Today',
    },
    {
      id: 'ord_002',
      code: '#ORD-002',
      title: 'Sutra Studio Brand Identity & Sanskrit Typography',
      service: 'Brand Identity',
      status: 'completed',
      statusLabel: 'Completed',
      revision: 'Final Round 2 of 2',
      file: 'Sutra_Brand_Guidelines_V2.pdf (4.8 MB)',
      updatedAt: 'Sep 27, 2026',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>
          Track commission milestones and verified deliverable outputs.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {orders.map((ord) => (
          <View key={ord.id} style={styles.orderCard}>
            <View style={styles.cardTop}>
              <Text style={styles.codeText}>{ord.code}</Text>
              <View
                style={[
                  styles.statusChip,
                  ord.status === 'completed' ? styles.chipCompleted : styles.chipReview,
                ]}
              >
                {ord.status === 'completed' ? (
                  <CheckCircle2 size={12} color="#166534" />
                ) : (
                  <Clock size={12} color="#92400E" />
                )}
                <Text
                  style={[
                    styles.statusText,
                    ord.status === 'completed' ? styles.textCompleted : styles.textReview,
                  ]}
                >
                  {ord.statusLabel}
                </Text>
              </View>
            </View>

            <Text style={styles.titleText}>{ord.title}</Text>
            <Text style={styles.serviceText}>{ord.service}</Text>

            <View style={styles.fileBox}>
              <HardDrive size={14} color={SutraTheme.colors.brown} />
              <Text style={styles.fileName}>{ord.file}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.metaText}>{ord.revision} • {ord.updatedAt}</Text>
              <TouchableOpacity style={styles.downloadBtn}>
                <Download size={14} color={SutraTheme.colors.brown} />
                <Text style={styles.downloadText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  orderCard: {
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.xl,
    padding: SutraTheme.spacing.lg,
    marginBottom: 16,
    ...SutraTheme.shadow.soft,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  chipReview: {
    backgroundColor: '#FEF3C7',
  },
  chipCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  textReview: {
    color: '#92400E',
  },
  textCompleted: {
    color: '#166534',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 12,
    color: SutraTheme.colors.muted,
    marginBottom: 12,
  },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SutraTheme.colors.saffronSubtle,
    borderWidth: 1,
    borderColor: SutraTheme.colors.borderLight,
    padding: 10,
    borderRadius: SutraTheme.borderRadius.md,
    gap: 8,
    marginBottom: 12,
  },
  fileName: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: SutraTheme.colors.foreground,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: SutraTheme.colors.borderLight,
  },
  metaText: {
    fontSize: 11,
    color: SutraTheme.colors.muted,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: SutraTheme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SutraTheme.borderRadius.full,
  },
  downloadText: {
    fontSize: 11,
    fontWeight: '600',
    color: SutraTheme.colors.brown,
  },
});
