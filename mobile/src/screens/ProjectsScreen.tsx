import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { SutraTheme } from '../theme/tokens';
import { Eye, HardDrive } from 'lucide-react-native';

export function ProjectsScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', '3D & Spatial', 'Identity', 'Marketing', 'Digital'];

  const projects = [
    {
      id: '1',
      title: 'Luxury Villa Spatial Architecture',
      category: '3D & Spatial',
      deliverablesCount: 14,
      updated: 'Sep 28',
    },
    {
      id: '2',
      title: 'Sanskrit Brand Identity & Guidelines',
      category: 'Identity',
      deliverablesCount: 8,
      updated: 'Sep 27',
    },
    {
      id: '3',
      title: 'Diwali Festive Meta Ads Creative Suite',
      category: 'Marketing',
      deliverablesCount: 22,
      updated: 'Sep 20',
    },
  ];

  const filtered =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Projects</Text>
        <Text style={styles.headerSubtitle}>
          Archived creative assets, deliverable folders, and guidelines.
        </Text>
      </View>

      {/* Categories Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterChip,
              activeCategory === cat && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[
                styles.filterText,
                activeCategory === cat && styles.filterTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filtered.map((proj) => (
          <View key={proj.id} style={styles.projectCard}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{proj.category}</Text>
            </View>
            <Text style={styles.projectTitle}>{proj.title}</Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.metaRow}>
                <HardDrive size={13} color={SutraTheme.colors.brown} />
                <Text style={styles.metaText}>{proj.deliverablesCount} files in Drive</Text>
              </View>
              <Text style={styles.dateText}>{proj.updated}</Text>
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
  filterScroll: {
    maxHeight: 50,
    backgroundColor: SutraTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: SutraTheme.colors.border,
  },
  filterContainer: {
    paddingHorizontal: SutraTheme.spacing.lg,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SutraTheme.borderRadius.full,
    backgroundColor: SutraTheme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
  },
  filterChipActive: {
    backgroundColor: SutraTheme.colors.brown,
    borderColor: SutraTheme.colors.brown,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
  },
  filterTextActive: {
    color: '#FFFDF9',
  },
  scrollContent: {
    padding: SutraTheme.spacing.lg,
  },
  projectCard: {
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.xl,
    padding: SutraTheme.spacing.lg,
    marginBottom: 14,
    ...SutraTheme.shadow.soft,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: SutraTheme.colors.saffronSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
    letterSpacing: 0.5,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: SutraTheme.colors.borderLight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: SutraTheme.colors.muted,
  },
  dateText: {
    fontSize: 11,
    color: SutraTheme.colors.muted,
  },
});
