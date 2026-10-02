import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { SutraTheme } from '../theme/tokens';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react-native';

interface NewOrderScreenProps {
  navigation: any;
}

export function NewOrderScreen({ navigation }: NewOrderScreenProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('3D Spatial Modeling');
  const [briefDetails, setBriefDetails] = useState('');

  const services = [
    { title: '3D Spatial Modeling', price: 'From ₹45,000' },
    { title: 'Brand Identity', price: 'From ₹25,000' },
    { title: 'Meta Ads Suite', price: 'From ₹20,000' },
    { title: 'Web App Portal', price: 'From ₹60,000' },
    { title: 'AI Automation', price: 'From ₹35,000' },
    { title: 'Video Creation', price: 'From ₹30,000' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
          style={styles.backButton}
        >
          <ArrowLeft size={18} color={SutraTheme.colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>New Commission</Text>
          <Text style={styles.headerStep}>Step {step} of 4: {step === 1 ? 'Select Service' : step === 2 ? 'Project Details' : step === 3 ? 'Drive References' : 'Confirmation'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeader}>Choose Studio Discipline</Text>
            {services.map((srv, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.serviceCard,
                  selectedService === srv.title && styles.serviceCardSelected,
                ]}
                onPress={() => setSelectedService(srv.title)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{srv.title}</Text>
                  <Text style={styles.servicePrice}>{srv.price}</Text>
                </View>
                {selectedService === srv.title && (
                  <CheckCircle2 size={18} color={SutraTheme.colors.brown} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeader}>Describe Project Goals</Text>
            <Text style={styles.subtext}>
              Provide specifications, target demographics, and creative guidelines for the atelier.
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="E.g., High-end spatial renders for luxury pavilion with warm lighting and teak woodwork..."
              placeholderTextColor={SutraTheme.colors.mutedLight}
              multiline
              numberOfLines={6}
              value={briefDetails}
              onChangeText={setBriefDetails}
            />
          </View>
        )}

        {step >= 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.confirmBox}>
              <CheckCircle2 size={36} color={SutraTheme.colors.statusCompleted} />
              <Text style={styles.confirmTitle}>Ready for Submission</Text>
              <Text style={styles.confirmText}>
                Selected Service: <Text style={{ fontWeight: '700' }}>{selectedService}</Text>
              </Text>
              <Text style={styles.confirmSub}>
                Your commission will be provisioned in your Google Drive folder and submitted for Studio Producer review.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={() => {
            if (step < 3) {
              setStep(step + 1);
            } else {
              navigation.navigate('Orders');
            }
          }}
        >
          <Text style={styles.submitBtnText}>
            {step === 3 ? 'Confirm & Initialize Commission' : 'Continue to Next Step'}
          </Text>
          <ArrowRight size={16} color="#FFFDF9" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SutraTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SutraTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SutraTheme.colors.border,
    backgroundColor: SutraTheme.colors.surface,
    gap: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: SutraTheme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
  },
  headerStep: {
    fontSize: 11,
    color: SutraTheme.colors.brown,
    fontWeight: '600',
  },
  scrollContent: {
    padding: SutraTheme.spacing.lg,
  },
  stepContainer: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
    color: SutraTheme.colors.muted,
    lineHeight: 18,
    marginBottom: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.lg,
    padding: SutraTheme.spacing.md,
  },
  serviceCardSelected: {
    borderColor: SutraTheme.colors.brown,
    backgroundColor: SutraTheme.colors.saffronSubtle,
  },
  serviceInfo: {
    gap: 2,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SutraTheme.colors.foreground,
  },
  servicePrice: {
    fontSize: 12,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.lg,
    padding: 14,
    fontSize: 13,
    color: SutraTheme.colors.foreground,
    textAlignVertical: 'top',
    height: 140,
  },
  confirmBox: {
    alignItems: 'center',
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.xl,
    padding: SutraTheme.spacing.xl,
    marginTop: 20,
    ...SutraTheme.shadow.soft,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
    marginTop: 12,
    marginBottom: 6,
  },
  confirmText: {
    fontSize: 13,
    color: SutraTheme.colors.foreground,
    marginBottom: 8,
  },
  confirmSub: {
    fontSize: 12,
    color: SutraTheme.colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    padding: SutraTheme.spacing.lg,
    backgroundColor: SutraTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: SutraTheme.colors.border,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SutraTheme.colors.brown,
    paddingVertical: 14,
    borderRadius: SutraTheme.borderRadius.full,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFDF9',
    fontSize: 13,
    fontWeight: '600',
  },
});
