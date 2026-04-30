import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Surah Al-Hajj 22:27 — the divine call to Hajj
const AYAH_WORDS = [
  'وَأَذِّن',
  'فِي',
  'ٱلنَّاسِ',
  'بِٱلْحَجِّ',
  'يَأْتُوكَ',
  'رِجَالًا',
  'وَعَلَىٰ',
  'كُلِّ',
  'ضَامِرٍ',
];

export default function SplashScreen() {
  const router = useRouter();
  const { hasData, isLoading } = useItinerary();

  const fade = useRef(new Animated.Value(0)).current;
  const brandFade = useRef(new Animated.Value(0)).current;
  const brandSlide = useRef(new Animated.Value(8)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;
  const translationFade = useRef(new Animated.Value(0)).current;
  const attributionFade = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;

  // One animated value per ayah word
  const wordAnims = useRef(AYAH_WORDS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(brandFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(brandSlide, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(dividerWidth, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(200),
      // Word-by-word ayah reveal — slower stagger so each word is readable
      Animated.stagger(
        220,
        wordAnims.map((v) =>
          Animated.timing(v, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        )
      ),
      Animated.delay(400),
      Animated.timing(translationFade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(attributionFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(taglineFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(ctaFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [
    fade,
    brandFade,
    brandSlide,
    dividerWidth,
    wordAnims,
    translationFade,
    attributionFade,
    taglineFade,
    ctaFade,
  ]);

  useEffect(() => {
    if (!isLoading && hasData) {
      const timer = setTimeout(() => router.replace('/(tabs)'), 6500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasData, router]);

  return (
    <LinearGradient
      colors={['#0a1024', '#0f1628', '#0a1024']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />

      <Animated.View style={[styles.content, { opacity: fade }]}>
        <Animated.View
          style={{
            opacity: brandFade,
            transform: [{ translateY: brandSlide }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.brand}>RAWAF</Text>
          <Text style={styles.subtitle}>Hajj Connect Center</Text>
        </Animated.View>

        <View style={styles.dividerRow}>
          <Animated.View
            style={[
              styles.dividerLine,
              {
                width: dividerWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }),
              },
            ]}
          />
          <Animated.Text style={[styles.dividerStar, { opacity: dividerWidth }]}>◆</Animated.Text>
          <Animated.View
            style={[
              styles.dividerLine,
              {
                width: dividerWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }),
              },
            ]}
          />
        </View>

        {/* Ayah — word by word reveal */}
        <View style={styles.ayahRow}>
          {AYAH_WORDS.map((word, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.ayahWord,
                {
                  opacity: wordAnims[i],
                  transform: [
                    {
                      translateY: wordAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [6, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {word}
            </Animated.Text>
          ))}
        </View>

        <Animated.Text style={[styles.translation, { opacity: translationFade }]}>
          “And proclaim to the people the Hajj; they will come to you on foot and on every lean camel.”
        </Animated.Text>

        <Animated.Text style={[styles.attribution, { opacity: attributionFade }]}>
          Surah Al-Hajj · 22:27
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.tagWrap, { opacity: taglineFade }]}>
        <Text style={styles.tagline}>Your sacred journey, beautifully organized.</Text>
      </Animated.View>

      {!hasData && !isLoading && (
        <Animated.View style={[styles.ctaContainer, { opacity: ctaFade }]}>
          <TouchableOpacity onPress={() => router.push('/upload')} activeOpacity={0.85}>
            <LinearGradient
              colors={[Palette.gold, '#a88838']}
              style={styles.ctaButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaText}>Upload Your Itinerary</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.ctaHint}>Upload your Nusuk Hajj PDF to begin</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },

  vignetteTop: {
    position: 'absolute',
    top: -180,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: -200,
    width: 460,
    height: 460,
    borderRadius: 230,
    backgroundColor: 'rgba(201,168,76,0.035)',
  },

  content: { alignItems: 'center', width: '100%' },

  brand: {
    fontFamily: RawafFonts.display,
    fontSize: 42,
    color: Palette.textPrimary,
    letterSpacing: 10,
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textSecondary,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 8,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 26,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(201,168,76,0.4)',
  },
  dividerStar: {
    fontSize: 8,
    color: Palette.gold,
    marginHorizontal: 12,
  },

  ayahRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  ayahWord: {
    fontFamily: RawafFonts.display,
    fontSize: 24,
    color: Palette.textPrimary,
    marginHorizontal: 5,
    marginVertical: 2,
    lineHeight: 38,
  },
  translation: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  attribution: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 12,
  },

  tagWrap: { position: 'absolute', bottom: 180, alignItems: 'center', paddingHorizontal: 32 },
  tagline: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  ctaContainer: { position: 'absolute', bottom: 70, alignItems: 'center' },
  ctaButton: {
    paddingHorizontal: 44,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: Palette.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: '#0f1628',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ctaHint: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 14,
    letterSpacing: 0.3,
  },
});
