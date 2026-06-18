import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Animated, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ChatMessage, ProductSuggestion } from '../types';
import { AI_SERVICE_URL } from '../config/api';
import { dispatchAction } from '../dispatcher/ActionDispatcher';
import { Ionicons } from '@expo/vector-icons';

const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
    };

    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 150);
    const anim3 = animateDot(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
      <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
    </View>
  );
};

const ProductSuggestionCard: React.FC<{
  suggestion: ProductSuggestion;
  navigation: any;
}> = React.memo(({ suggestion, navigation }) => {
  const theme = useTheme();

  const handleAddToCart = useCallback(() => {
    dispatchAction({
      type: 'ADD_TO_CART',
      payload: {
        id: suggestion.id,
        name: suggestion.name
      }
    });
  }, [suggestion]);

  const handleNavigate = useCallback(() => {
    navigation.navigate('ProductDetail', { productId: suggestion.id });
  }, [navigation, suggestion.id]);

  const btnStyle = useMemo(() => [
    styles.suggestionBtn,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  return (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={handleNavigate}
      activeOpacity={0.9}
    >
      <Image source={{ uri: suggestion.image_url }} style={styles.suggestionImage} />
      <View style={styles.suggestionInfo}>
        <Text style={styles.suggestionName} numberOfLines={1}>{suggestion.name}</Text>
        <Text style={styles.suggestionPrice}>₹{suggestion.price}</Text>
        {suggestion.reason ? (
          <Text style={styles.suggestionReason} numberOfLines={1}>{suggestion.reason}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={btnStyle}
        onPress={handleAddToCart}
      >
        <Text style={styles.suggestionBtnText}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const ChatBubble: React.FC<{
  message: ChatMessage;
  navigation: any;
}> = React.memo(({ message, navigation }) => {
  const theme = useTheme();
  const isBot = message.role === 'assistant';

  const avatarStyle = useMemo(() => [
    styles.avatar,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  const bubbleStyle = useMemo(() => [
    styles.bubble,
    isBot
      ? [styles.botBubble, { backgroundColor: '#ffffff' }]
      : [styles.userBubble, { backgroundColor: theme.primary }]
  ], [isBot, theme.primary]);

  const textStyle = useMemo(() => [
    styles.bubbleText,
    { color: isBot ? theme.text || '#1A1A1A' : '#ffffff' }
  ], [isBot, theme.text]);

  const wrapperStyle = useMemo(() => [
    styles.bubbleWrapper,
    isBot ? styles.botWrapper : styles.userWrapper
  ], [isBot]);

  return (
    <View style={wrapperStyle}>
      {isBot && (
        <View style={avatarStyle}>
          <Ionicons name="sparkles" size={14} color="#ffffff" />
        </View>
      )}
      <View style={styles.bubbleInner}>
        <View style={bubbleStyle}>
          <Text style={textStyle}>
            {message.content}
          </Text>
        </View>

        {isBot && message.suggestions && message.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {message.suggestions.map((s) => (
              <ProductSuggestionCard
                key={s.id}
                suggestion={s}
                navigation={navigation}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

const ChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Kiddo Assistant, your trusted shopping helper. Ask me about snacks, toys, or diapers suitable for your child's age!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [childAge] = useState<number | null>(36);

  const flatListRef = useRef<FlatList>(null);

  const starterPrompts = useMemo(() => [
    "Safe snacks for my 8 month old?",
    "Birthday gift ideas under ₹500",
    "Best diapers for sensitive skin",
    "Summer activities near me",
  ], []);

  const handleSend = useCallback(async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setInputText('');
    setIsTyping(true);
    
    // Optimistically update messages local state
    setMessages((prev) => {
      const nextMessages = [...prev, userMsg];
      
      // Call async endpoint using the updated messages reference
      (async () => {
        try {
          const backendHistory = nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          }));

          const res = await fetch(`${AI_SERVICE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: backendHistory,
              userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
              childAgeMonths: childAge,
            }),
          });

          const data = await res.json();
          const botMsg: ChatMessage = {
            id: data.sessionId || Date.now().toString(),
            role: 'assistant',
            content: data.reply || "I didn't catch that, could you repeat?",
            suggestions: data.suggestions || [],
            timestamp: new Date(),
          };
          setMessages((current) => [...current, botMsg]);
        } catch (err) {
          console.error('[Chat] failed to contact bot:', err);
          const errorMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: "Sorry, I'm having trouble connecting to my servers. Could you try again in a moment?",
            timestamp: new Date(),
          };
          setMessages((current) => [...current, errorMsg]);
        } finally {
          setIsTyping(false);
        }
      })();
      
      return nextMessages;
    });
  }, [childAge]);

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.background }
  ], [theme.background]);

  const headerAvatarStyle = useMemo(() => [
    styles.headerAvatar,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  const sendBtnStyle = useMemo(() => [
    styles.sendBtn,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  const chipStyle = useMemo(() => [
    styles.chip,
    { borderColor: theme.primary }
  ], [theme.primary]);

  const chipTextStyle = useMemo(() => [
    styles.chipText,
    { color: theme.primary }
  ], [theme.primary]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    return <ChatBubble message={item} navigation={navigation} />;
  }, [navigation]);

  const handleInputSubmit = useCallback(() => {
    handleSend(inputText);
  }, [handleSend, inputText]);

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={headerAvatarStyle}>
            <Ionicons name="sparkles" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Kiddo Assistant</Text>
            <Text style={styles.headerSubtitle}>Online | Shopping Helper</Text>
          </View>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Starter Chips (Only show if only 1 welcome message exists) */}
        {messages.length === 1 && (
          <View style={styles.chipsContainer}>
            {starterPrompts.map((prompt, i) => (
              <TouchableOpacity
                key={i}
                style={chipStyle}
                onPress={() => handleSend(prompt)}
              >
                <Text style={chipTextStyle}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything..."
            placeholderTextColor="#aaaaaa"
            onSubmitEditing={handleInputSubmit}
          />
          <TouchableOpacity
            style={sendBtnStyle}
            onPress={handleInputSubmit}
          >
            <Ionicons name="send" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#888888',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  botWrapper: {
    alignSelf: 'flex-start',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  bubbleInner: {
    flexShrink: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
  },
  botBubble: {
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  userBubble: {
    borderTopRightRadius: 0,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginBottom: 8,
    width: 250,
  },
  suggestionImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  suggestionInfo: {
    flex: 1,
    marginLeft: 10,
  },
  suggestionName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  suggestionPrice: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  suggestionReason: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  suggestionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  suggestionBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  textInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#f6f6f6',
    borderRadius: 19,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#333333',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 36,
    marginBottom: 16,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#888888',
    marginHorizontal: 3,
  },
});

export default ChatScreen;
