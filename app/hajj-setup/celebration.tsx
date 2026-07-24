import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPARKLE_COUNT = 6;
const SPARKLE_RADIUS = 110;

export default function HajjCelebrationScreen() {
  const router = useRouter();

  const checkScale = useSharedValue(0);
  const checkRotate = useSharedValue(-30);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0.6);
  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(20);
  const ctaOpacity = useSharedValue(0);

  // Pre-compute sparkle angles
  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }).map((_, i) => ({
        angle: (i / SPARKLE_COUNT) * Math.PI * 2,
        delay: 350 + i * 80,
      })),
    []
  );

  // Each sparkle gets its own shared value so we can declare hooks at top level
  const sparkleProgress = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  useEffect(() => {
    // Ring burst
    ringScale.value = withTiming(2.4, { duration: 700, easing: Easing.out(Easing.cubic) });
    ringOpacity.value = withTiming(0, { duration: 700 });

    // Check pop
    checkScale.value = withDelay(
      120,
      withSpring(1, { damping: 8, stiffness: 140 })
    );
    checkRotate.value = withDelay(
      120,
      withSequence(
        withTiming(8, { duration: 220 }),
        withSpring(0, { damping: 10, stiffness: 160 })
      )
    );

    // Sparkles
    sparkles.forEach((sp, i) => {
      sparkleProgress[i].value = withDelay(
        sp.delay,
        withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
      );
    });

    // Text + CTA
    textOpacity.value = withDelay(450, withTiming(1, { duration: 500 }));
    textTranslate.value = withDelay(
      450,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    ctaOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value },
      { rotate: `${checkRotate.value}deg` },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [
      { translateY: (1 - ctaOpacity.value) * 12 },
    ],
  }));

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['rgba(201,168,76,0.18)', 'transparent', 'rgba(46,204,135,0.12)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.body}>
        {/* Sparkles + ring + check */}
        <View style={s.checkmarkArea}>
          <Animated.View style={[s.ring, ringStyle]} />

          {sparkles.map((sp, i) => (
            <Sparkle
              key={i}
              angle={sp.angle}
              progress={sparkleProgress[i]}
            />
          ))}

          <Animated.View style={[s.checkCircle, checkStyle]}>
            <Ionicons name="checkmark" size={64} color="#0f1628" />
          </Animated.View>
        </View>

        <Animated.View style={[s.copy, textStyle]}>
          <Text style={s.eyebrow}>MABRUK</Text>
          <Text style={s.title}>Your journey{'\n'}is ready</Text>
          <Text style={s.subtitle}>
            Rawaf will guide you through every step, in shaa Allah.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[s.footer, ctaStyle]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.replace('/(tabs)')}
        >
          <LinearGradient
            colors={[Palette.gold, '#a88838']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.cta}
          >
            <Text style={s.ctaText}>Open my itinerary</Text>
            <Ionicons name="arrow-forward" size={18} color="#0f1628" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function Sparkle({
  angle,
  progress,
}: {
  angle: number;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const distance = progress.value * SPARKLE_RADIUS;
    const opacity =
      progress.value < 0.5 ? progress.value * 2 : 1 - (progress.value - 0.5) * 2;
    return {
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { scale: 0.6 + progress.value * 0.6 },
      ],
      opacity,
    };
  });
  return (
    <Animated.View style={[s.sparkle, style]}>
      <Ionicons name="sparkles" size={20} color={Palette.gold} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  checkmarkArea: {
    width: 240,
    height: 240,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Palette.gold,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Palette.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.gold,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  sparkle: {
    position: 'absolute',
  },
  copy: { alignItems: 'center' },
  eyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 3,
    color: Palette.gold,
    marginBottom: 12,
  },
  title: {
    fontFamily: RawafFonts.display,
    fontSize: 42,
    color: Palette.textPrimary,
    lineHeight: 48,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 23,
    marginTop: 14,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
