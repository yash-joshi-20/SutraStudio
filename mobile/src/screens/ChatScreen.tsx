import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SutraTheme } from '../theme/tokens';
import { Send, Sparkles, Bot, User } from 'lucide-react-native';

export function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste Yash. I am Sutra AI, your studio creative assistant. How can we elevate your brand visuals, 3D spaces, or marketing campaigns today?',
      time: '11:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    'Create a 3D architectural model',
    'Design festive Meta Ads suite',
    'Review active deliverable status',
  ];

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'I have logged your request in your atelier draft brief. Would you like me to initialize a project commission with our creative team?',
        time: 'Just now',
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={18} color={SutraTheme.colors.saffron} />
          <Text style={styles.headerTitle}>Sutra AI Concierge</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Bespoke Creative & Order Assistant • Connected to Atelier
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.messagesList}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <View style={styles.bubbleHeader}>
                {msg.sender === 'ai' ? (
                  <View style={styles.avatarRow}>
                    <Bot size={14} color={SutraTheme.colors.brown} />
                    <Text style={styles.senderName}>Sutra AI</Text>
                  </View>
                ) : (
                  <View style={styles.avatarRow}>
                    <User size={14} color="#FFFDF9" />
                    <Text style={[styles.senderName, { color: '#FFFDF9' }]}>You</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.timeText,
                    msg.sender === 'user' && { color: 'rgba(255,253,249,0.7)' },
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.aiText,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Quick Prompts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickPromptScroll}
          contentContainerStyle={styles.quickPromptContainer}
        >
          {quickPrompts.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => setInputText(prompt)}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your creative requirement..."
            placeholderTextColor={SutraTheme.colors.mutedLight}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Send size={16} color="#FFFDF9" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SutraTheme.colors.foreground,
  },
  headerSubtitle: {
    fontSize: 11,
    color: SutraTheme.colors.muted,
    marginTop: 2,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    padding: SutraTheme.spacing.lg,
    gap: 12,
  },
  messageBubble: {
    padding: 14,
    borderRadius: SutraTheme.borderRadius.lg,
    maxWidth: '85%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    ...SutraTheme.shadow.soft,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: SutraTheme.colors.brown,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: SutraTheme.colors.brown,
  },
  timeText: {
    fontSize: 10,
    color: SutraTheme.colors.muted,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  aiText: {
    color: SutraTheme.colors.foreground,
  },
  userText: {
    color: '#FFFDF9',
  },
  quickPromptScroll: {
    maxHeight: 40,
    paddingHorizontal: SutraTheme.spacing.lg,
    marginBottom: 8,
  },
  quickPromptContainer: {
    gap: 8,
  },
  promptChip: {
    backgroundColor: SutraTheme.colors.surface,
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SutraTheme.borderRadius.full,
  },
  promptText: {
    fontSize: 11,
    color: SutraTheme.colors.brown,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SutraTheme.spacing.md,
    backgroundColor: SutraTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: SutraTheme.colors.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SutraTheme.colors.border,
    borderRadius: SutraTheme.borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: SutraTheme.colors.foreground,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SutraTheme.colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
