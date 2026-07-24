import { Palette, RawafFonts } from '@/constants/rawaf-theme';
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

// Basmala — word by word for a dignified staggered reveal
const BASMALA_WORDS = ['بِسْمِ', 'ٱللَّٰهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];

export default function UmrahBismillahScreen() {
  const router = useRouter();

  const fade = useRef(new Animated.Value(0)).current;
  const brandFade = useRef(new Animated.Value(0)).current;
  const brandSlide = useRef(new Animated.Value(8)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;
  const translationFade = useRef(new Animated.Value(0)).current;
  const duaFade = useRef(new Animated.Value(0)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;

  const wordAnims = useRef(BASMALA_WORDS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    Animated.sequence([
      Animated.delay(300),
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
      Animated.stagger(
        260,
        wordAnims.map((v) =>
          Animated.timing(v, {
            toValue: 1,
            duration: 650,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        )
      ),
      Animated.delay(400),
      Animated.timing(translationFade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.delay(200),
      Animated.timing(duaFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(ctaFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fade, brandFade, brandSlide, dividerWidth, wordAnims, translationFade, duaFade, ctaFade]);

  return (
    <LinearGradient
      colors={['#0a1024', '#0f1628', '#0a1024']}
      style={s.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={s.vignetteTop} />
      <View style={s.vignetteBottom} />

      <Animated.View style={[s.content, { opacity: fade }]}>
        {/* Brand header */}
        <Animated.View
          style={{
            opacity: brandFade,
            transform: [{ translateY: brandSlide }],
            alignItems: 'center',
          }}
        >
          <Text style={s.brand}>RAWAF</Text>
          <Text style={s.subtitle}>Your Umrah Begins</Text>
        </Animated.View>

        {/* Expanding divider */}
        <View style={s.dividerRow}>
          <Animated.View
            style={[
              s.dividerLine,
              { width: dividerWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) },
            ]}
          />
          <Animated.Text style={[s.dividerStar, { opacity: dividerWidth }]}>
            ◆
          </Animated.Text>
          <Animated.View
            style={[
              s.dividerLine,
              { width: dividerWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) },
            ]}
          />
        </View>

        {/* Basmala — word by word */}
        <View style={s.ayahRow}>
          {BASMALA_WORDS.map((word, i) => (
            <Animated.Text
              key={i}
              style={[
                s.ayahWord,
                {
                  opacity: wordAnims[i],
                  transform: [
                    {
                      translateY: wordAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
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

        {/* Translation */}
        <Animated.Text style={[s.translation, { opacity: translationFade }]}>
          "In the name of Allah, the Most Gracious, the Most Merciful."
        </Animated.Text>

        {/* Dua */}
        <Animated.Text style={[s.dua, { opacity: duaFade }]}>
          May your Umrah be accepted
        </Animated.Text>
      </Animated.View>

      {/* CTA */}
      <Animated.View style={[s.ctaContainer, { opacity: ctaFade }]}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
          <LinearGradient
            colors={[Palette.green, '#1faa6e']}
            style={s.ctaButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={s.ctaText}>Open My Itinerary</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={s.ctaHint}>Your journey is beautifully organized</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },

  vignetteTop: {
    position: 'absolute',
    top: -180,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(46,204,135,0.04)',
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
    fontSize: 38,
    color: Palette.textPrimary,
    letterSpacing: 10,
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 8,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
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
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  ayahWord: {
    fontFamily: RawafFonts.display,
    fontSize: 36,
    color: Palette.textPrimary,
    marginHorizontal: 6,
    marginVertical: 2,
    lineHeight: 54,
  },

  translation: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    paddingHorizontal: 12,
    marginTop: 6,
  },

  dua: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.green,
    letterSpacing: 0.5,
    marginTop: 18,
    textAlign: 'center',
  },

  ctaContainer: { position: 'absolute', bottom: 70, alignItems: 'center', width: '100%', paddingHorizontal: 32 },
  ctaButton: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: Palette.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.8,
  },
  ctaHint: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 14,
    letterSpacing: 0.3,
  },
});
