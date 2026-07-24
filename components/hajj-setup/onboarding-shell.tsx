import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  step: number; // 1-based; 0 means hide bar (welcome)
  total: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
  onBack?: () => void; // override default router.back
  hideBack?: boolean;
}

export function OnboardingShell({
  step,
  total,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  onSkip,
  skipLabel = 'Skip',
  onBack,
  hideBack,
}: Props) {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const ratio = step > 0 ? Math.min(step / total, 1) : 0;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: ratio,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    Animated.timing(fade, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [ratio, progress, fade]);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
        <View style={s.header}>
          {!hideBack ? (
            <TouchableOpacity
              onPress={() => (onBack ? onBack() : router.back())}
              hitSlop={10}
              style={s.backBtn}
            >
              <Ionicons name="chevron-back" size={24} color={Palette.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={s.backBtn} />
          )}

          {step > 0 ? (
            <View style={s.progressWrap}>
              <View style={s.progressTrack}>
                <Animated.View style={[s.progressFill, { width: widthInterpolate }]}>
                  <LinearGradient
                    colors={[Palette.gold, '#e8c460']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <Text style={s.progressText}>
                Step {step} of {total}
              </Text>
            </View>
          ) : (
            <View style={s.progressWrap} />
          )}

          <View style={s.backBtn} />
        </View>

        {/* BODY */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fade }}>
            <Text style={s.title}>{title}</Text>
            {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
            <View style={{ marginTop: 18 }}>{children}</View>
          </Animated.View>
        </ScrollView>

        {/* FOOTER */}
        <View style={s.footer}>
          {onSkip ? (
            <TouchableOpacity onPress={onSkip} style={s.skipBtn} hitSlop={10}>
              <Text style={s.skipText}>{skipLabel}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPrimary}
            disabled={primaryDisabled}
            style={{ flex: 1, opacity: primaryDisabled ? 0.45 : 1 }}
          >
            <LinearGradient
              colors={[Palette.gold, '#a88838']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.primary}
            >
              <Text style={s.primaryText}>{primaryLabel}</Text>
              <Ionicons name="arrow-forward" size={18} color="#0f1628" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressWrap: { flex: 1, alignItems: 'center' },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressText: {
    marginTop: 6,
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.4,
    color: Palette.textMuted,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  title: {
    fontFamily: RawafFonts.display,
    fontSize: 34,
    color: Palette.textPrimary,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 21,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    backgroundColor: Palette.background,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  skipText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 14,
    color: Palette.textSecondary,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 15,
    color: '#0f1628',
    letterSpacing: 0.4,
  },
});
