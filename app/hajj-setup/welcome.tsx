import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HajjSetupWelcome() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide, scale]);

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <View style={s.body}>
        <Animated.View
          style={[
            s.iconHalo,
            { transform: [{ scale }], opacity: fade },
          ]}
        >
          <LinearGradient
            colors={['rgba(201,168,76,0.35)', 'rgba(201,168,76,0.05)']}
            style={s.iconBubble}
          >
            <Ionicons name="compass" size={42} color={Palette.gold} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text style={s.eyebrow}>HAJJ ONBOARDING</Text>
          <Text style={s.title}>Let&apos;s plan{'\n'}your Hajj</Text>
          <Text style={s.subtitle}>
            A few quick steps and Rawaf will tailor your entire journey — flights,
            hotels, camps, and the Hajj rites — just for you.
          </Text>

          <View style={s.bullets}>
            <Bullet icon="time-outline" text="Takes about 3 minutes" />
            <Bullet icon="create-outline" text="Edit anything later in Settings" />
            <Bullet icon="shield-checkmark-outline" text="Saved only on this device" />
          </View>
        </Animated.View>
      </View>

      <View style={s.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/hajj-setup/name')}
        >
          <LinearGradient
            colors={[Palette.gold, '#a88838']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.cta}
          >
            <Text style={s.ctaText}>Begin</Text>
            <Ionicons name="arrow-forward" size={18} color="#0f1628" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Bullet({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={s.bullet}>
      <Ionicons name={icon} size={16} color={Palette.gold} />
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  headerRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 4 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconHalo: {
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  iconBubble: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  eyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
    color: Palette.gold,
    marginBottom: 10,
  },
  title: {
    fontFamily: RawafFonts.display,
    fontSize: 44,
    color: Palette.textPrimary,
    lineHeight: 50,
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 23,
    marginTop: 12,
  },
  bullets: { marginTop: 24, gap: 12 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bulletText: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  ctaText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 16,
    color: '#0f1628',
    letterSpacing: 0.4,
  },
});
