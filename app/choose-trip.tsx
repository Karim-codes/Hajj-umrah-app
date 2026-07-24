import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChooseTripScreen() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fade, transform: [{ translateY: slide }] }}
        >
          <Text style={s.eyebrow}>WELCOME TO RAWAF</Text>
          <Text style={s.title}>What brings{'\n'}you here?</Text>
          <Text style={s.subtitle}>
            Choose your sacred journey. We&apos;ll tailor the entire experience —
            guides, timeline, and tools — just for it.
          </Text>

          {/* HAJJ */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/hajj-setup/welcome')}
            style={s.cardWrap}
          >
            <LinearGradient
              colors={['rgba(201,168,76,0.28)', 'rgba(201,168,76,0.08)', 'rgba(201,168,76,0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.card, { borderColor: Palette.goldBorder }]}
            >
              <View style={s.cardHead}>
                <View style={[s.iconBubble, { backgroundColor: Palette.goldMuted }]}>
                  <Ionicons name="compass" size={26} color={Palette.gold} />
                </View>
                <View style={[s.tag, { backgroundColor: Palette.goldMuted }]}>
                  <Text style={[s.tagText, { color: Palette.gold }]}>GUIDED SETUP</Text>
                </View>
              </View>

              <Text style={s.cardTitle}>I&apos;m going for Hajj</Text>
              <Text style={s.cardSub}>
                Includes Umrah Tamattu &amp; the full Hajj rites — Mina, Arafah, Muzdalifah, and stoning.
              </Text>

              <View style={s.bullets}>
                <Bullet text="Build your trip in 7 quick steps" gold />
                <Bullet text="Add flights, hotels, layovers &amp; camp" gold />
                <Bullet text="Step-by-step Hajj &amp; Umrah guides" gold />
              </View>

              <View style={s.cta}>
                <Text style={[s.ctaText, { color: Palette.gold }]}>
                  Plan my Hajj
                </Text>
                <Ionicons name="arrow-forward" size={18} color={Palette.gold} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* UMRAH */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/umrah-setup/destination')}
            style={s.cardWrap}
          >
            <LinearGradient
              colors={['rgba(46,204,135,0.22)', 'rgba(46,204,135,0.06)', 'rgba(46,204,135,0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.card, { borderColor: 'rgba(46,204,135,0.35)' }]}
            >
              <View style={s.cardHead}>
                <View style={[s.iconBubble, { backgroundColor: 'rgba(46,204,135,0.18)' }]}>
                  <Ionicons name="star" size={26} color={Palette.green} />
                </View>
                <View style={[s.tag, { backgroundColor: 'rgba(46,204,135,0.18)' }]}>
                  <Text style={[s.tagText, { color: Palette.green }]}>YEAR-ROUND</Text>
                </View>
              </View>

              <Text style={s.cardTitle}>I&apos;m going for Umrah</Text>
              <Text style={s.cardSub}>
                A focused Umrah trip — any time of year. Plan your own flights and stays;
                we organise the rest.
              </Text>

              <View style={s.bullets}>
                <Bullet text="Add your flights &amp; hotels manually" />
                <Bullet text="Step-by-step Umrah guide with du&apos;as" />
                <Bullet text="Beautifully organised journey timeline" />
              </View>

              <View style={s.cta}>
                <Text style={[s.ctaText, { color: Palette.green }]}>
                  Set up my Umrah trip
                </Text>
                <Ionicons name="arrow-forward" size={18} color={Palette.green} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={s.foot}>
            You can switch any time from Settings.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Bullet({ text, gold }: { text: string; gold?: boolean }) {
  return (
    <View style={s.bulletRow}>
      <Ionicons
        name="checkmark-circle"
        size={14}
        color={gold ? Palette.gold : Palette.green}
      />
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  scroll: { padding: 24, paddingBottom: 40 },
  eyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.6,
    color: Palette.gold,
    marginTop: 8,
  },
  title: {
    fontFamily: RawafFonts.display,
    fontSize: 40,
    color: Palette.textPrimary,
    lineHeight: 46,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 28,
  },
  cardWrap: { marginBottom: 16 },
  card: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  cardTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 26,
    color: Palette.textPrimary,
    lineHeight: 32,
  },
  cardSub: {
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 14,
  },
  bullets: { marginBottom: 16 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  bulletText: {
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textPrimary,
    marginLeft: 9,
    flex: 1,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  ctaText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  foot: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
