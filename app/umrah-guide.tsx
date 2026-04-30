import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── DATA ────────────────────────────────────────────────────────────────────

type UmrahStep = {
  id: string;
  phase: string;
  title: string;
  arabicTitle?: string;
  detail: string;
  dua?: { arabic: string; transliteration: string; translation: string };
  laps?: LapInfo;
  icon: keyof typeof Ionicons.glyphMap;
  important?: boolean;
};

type LapInfo = {
  total: number;
  fastWalkLaps: number; // first N laps are Raml (fast walk)
  perLapAction?: string;
};

const UMRAH_STEPS: UmrahStep[] = [
  {
    id: 'ihram',
    phase: 'Preparation',
    title: 'Enter the state of Ihram',
    arabicTitle: 'ٱلْإِحْرَام',
    detail:
      'Before reaching the Miqat, perform Ghusl (full body wash), wear your Ihram garments (two white unstitched cloths for men), and make the intention (niyyah) for Umrah in your heart. Then recite the Talbiyah.',
    dua: {
      arabic: 'لَبَّيْكَ ٱللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ ٱلْحَمْدَ وَٱلنِّعْمَةَ لَكَ وَٱلْمُلْكَ، لَا شَرِيكَ لَكَ',
      transliteration:
        'Labbayk Allaahumma labbayk, labbayk laa shareeka laka labbayk, innal-hamda wan-ni\'mata laka wal-mulk, laa shareeka lak',
      translation:
        'Here I am O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise, grace, and sovereignty belong to You. You have no partner.',
    },
    icon: 'shirt',
  },
  {
    id: 'enter-masjid',
    phase: 'Entering al-Masjid al-Haram',
    title: 'Enter with your right foot',
    arabicTitle: 'دُخُول ٱلْمَسْجِد',
    detail:
      'Enter al-Masjid al-Haram through Bab as-Salam (the Door of Peace) or any door. Step in with your right foot first and recite the du\'a for entering the mosque.',
    dua: {
      arabic: 'بِسْمِ ٱللَّهِ، وَٱلصَّلَاةُ وَٱلسَّلَامُ عَلَىٰ رَسُولِ ٱللَّهِ، ٱللَّهُمَّ ٱفْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
      transliteration:
        'Bismillaah, was-salaatu was-salaamu \'alaa Rasoolillaah. Allaahumma iftah lee abwaaba rahmatik',
      translation:
        'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open for me the doors of Your mercy.',
    },
    icon: 'enter',
    important: true,
  },
  {
    id: 'first-sight',
    phase: 'Seeing the Ka\'bah',
    title: 'First sight of the Ka\'bah',
    detail:
      'When you first see the Ka\'bah, stop and raise your hands in du\'a. This is a moment when supplications are accepted. Ask Allah for whatever you wish — the scholars say du\'a at first sight of the Ka\'bah is never rejected.',
    icon: 'eye',
    important: true,
  },
  {
    id: 'tawaf-start',
    phase: 'Tawaf (Circumambulation)',
    title: 'Begin at the Black Stone (Hajar al-Aswad)',
    arabicTitle: 'ٱلطَّوَاف',
    detail:
      'Start your Tawaf at the Black Stone corner. The green light on the wall marks the starting line. If possible, touch or kiss the Black Stone. If crowded, simply face it and point with your right hand, saying "Allahu Akbar". Keep the Ka\'bah on your left side throughout.',
    dua: {
      arabic: 'بِسْمِ ٱللَّهِ، ٱللَّهُ أَكْبَرُ',
      transliteration: 'Bismillaah, Allahu Akbar',
      translation: 'In the name of Allah, Allah is the Greatest.',
    },
    laps: {
      total: 7,
      fastWalkLaps: 3,
      perLapAction: 'Each time you pass the Black Stone, face it, point with your right hand, and say "Allahu Akbar".',
    },
    icon: 'refresh-circle',
    important: true,
  },
  {
    id: 'tawaf-raml',
    phase: 'Tawaf — Laps 1-3 (Raml)',
    title: 'Fast walk for the first 3 laps',
    arabicTitle: 'ٱلرَّمَل',
    detail:
      'For the first three rounds, men should walk briskly with short steps (Raml). Also practice Idtiba — uncover your right shoulder by placing the Ihram cloth under your right arm. Make du\'a throughout — there is no fixed du\'a except between the Yemeni Corner and the Black Stone.',
    dua: {
      arabic: 'رَبَّنَا آتِنَا فِي ٱلدُّنْيَا حَسَنَةً وَفِي ٱلْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ',
      transliteration: 'Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa \'adhaab an-naar',
      translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    },
    icon: 'speedometer',
  },
  {
    id: 'tawaf-normal',
    phase: 'Tawaf — Laps 4-7',
    title: 'Walk normally for remaining 4 laps',
    detail:
      'For rounds 4 through 7, walk at a normal pace. Continue making personal du\'a, dhikr, and reciting Quran. Between the Yemeni Corner and the Black Stone, recite "Rabbanaa aatinaa…". Touch the Yemeni Corner if you can reach it (do not kiss it). Say "Allahu Akbar" each time you pass the Black Stone.',
    icon: 'walk',
  },
  {
    id: 'tawaf-prayer',
    phase: 'After Tawaf',
    title: 'Pray 2 rak\'ah behind Maqam Ibrahim',
    arabicTitle: 'صَلَاة خَلْفَ ٱلْمَقَام',
    detail:
      'After completing 7 rounds, cover your right shoulder and pray 2 rak\'ah behind Maqam Ibrahim (the station of Ibrahim). If it is too crowded, pray anywhere in the mosque. Recite Surah al-Kafirun in the first rak\'ah and Surah al-Ikhlas in the second.',
    dua: {
      arabic: 'وَٱتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
      transliteration: 'Wat-takhidhoo min maqaami Ibraaheema musalla',
      translation: 'And take the station of Ibrahim as a place of prayer. (Quran 2:125)',
    },
    icon: 'book',
    important: true,
  },
  {
    id: 'zamzam',
    phase: 'Zamzam Water',
    title: 'Drink Zamzam water',
    detail:
      'After praying, drink Zamzam water. Face the Qiblah, say "Bismillah", drink in three sips, and make du\'a — the Prophet (ﷺ) said: "Zamzam water is for whatever it is drunk for." Ask Allah for beneficial knowledge, ample provision, and cure from every disease.',
    icon: 'water',
  },
  {
    id: 'sai-start',
    phase: 'Sa\'i (Walking between Safa & Marwa)',
    title: 'Begin at Mount Safa',
    arabicTitle: 'ٱلسَّعْي',
    detail:
      'Go to Mount Safa. When you see the Ka\'bah, face it, raise your hands, and say "Allahu Akbar" three times. Then make du\'a. This is where Sa\'i begins.',
    dua: {
      arabic: 'إِنَّ ٱلصَّفَا وَٱلْمَرْوَةَ مِن شَعَائِرِ ٱللَّهِ',
      transliteration: 'Innas-Safaa wal-Marwata min sha\'aa\'irillaah',
      translation: 'Indeed, Safa and Marwa are among the symbols of Allah. (Quran 2:158)',
    },
    icon: 'flag',
    important: true,
  },
  {
    id: 'sai-laps',
    phase: 'Sa\'i — 7 Laps',
    title: 'Walk between Safa & Marwa (7 times)',
    detail:
      'Walk from Safa to Marwa (that is 1 lap), then Marwa back to Safa (that is 2 laps). Continue until you complete 7 laps, ending at Marwa. Between the two green fluorescent lights, men should jog. Make du\'a throughout the Sa\'i. There is no fixed du\'a — make personal supplications.',
    laps: {
      total: 7,
      fastWalkLaps: 0, // jogging is between green lights only
      perLapAction: 'At each mountain (Safa & Marwa), face the Ka\'bah, raise your hands, and make du\'a before continuing.',
    },
    icon: 'repeat',
  },
  {
    id: 'halq',
    phase: 'Completion',
    title: 'Shave or trim your hair',
    arabicTitle: 'ٱلْحَلْق / ٱلتَّقْصِير',
    detail:
      'Men: shaving the entire head (Halq) is preferred — the Prophet (ﷺ) made du\'a three times for those who shaved. Alternatively, trim the hair equally from all sides. Women: cut a fingertip\'s length from the ends of the hair. After this, your Umrah is complete and all Ihram restrictions are lifted.',
    icon: 'cut',
    important: true,
  },
  {
    id: 'complete',
    phase: 'Alhamdulillah',
    title: 'Your Umrah is complete!',
    detail:
      'Praise Allah for completing this blessed act of worship. You are now free from Ihram. May Allah accept your Umrah. You may stay in Makkah, pray in the Haram, and worship until the days of Hajj begin on 8 Dhul-Hijjah.',
    icon: 'checkmark-circle',
    important: true,
  },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function DuaCard({ dua }: { dua: NonNullable<UmrahStep['dua']> }) {
  return (
    <View style={s.duaCard}>
      <Text style={s.duaArabic}>{dua.arabic}</Text>
      <View style={s.duaDivider} />
      <Text style={s.duaTranslit}>{dua.transliteration}</Text>
      <Text style={s.duaTranslation}>{dua.translation}</Text>
    </View>
  );
}

function TawafTracker({ laps }: { laps: LapInfo }) {
  const [currentLap, setCurrentLap] = useState(0);

  return (
    <View style={s.trackerCard}>
      <View style={s.trackerHeader}>
        <Text style={s.trackerTitle}>Lap Counter</Text>
        <Text style={s.trackerCount}>
          {currentLap} / {laps.total}
        </Text>
      </View>

      <View style={s.trackerLaps}>
        {Array.from({ length: laps.total }).map((_, i) => {
          const done = i < currentLap;
          const isFast = i < laps.fastWalkLaps && laps.fastWalkLaps > 0;
          return (
            <View
              key={i}
              style={[
                s.trackerDot,
                done && s.trackerDotDone,
                isFast && !done && s.trackerDotFast,
              ]}
            >
              <Text
                style={[
                  s.trackerDotText,
                  done && s.trackerDotTextDone,
                ]}
              >
                {i + 1}
              </Text>
              {isFast && !done && (
                <Text style={s.trackerDotLabel}>Fast</Text>
              )}
            </View>
          );
        })}
      </View>

      {laps.perLapAction && (
        <Text style={s.trackerHint}>{laps.perLapAction}</Text>
      )}

      <View style={s.trackerButtons}>
        <TouchableOpacity
          onPress={() => setCurrentLap((c) => Math.max(0, c - 1))}
          style={[s.trackerBtn, s.trackerBtnSecondary]}
          disabled={currentLap === 0}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={20} color={Palette.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentLap((c) => Math.min(laps.total, c + 1))}
          style={s.trackerBtn}
          disabled={currentLap >= laps.total}
          activeOpacity={0.7}
        >
          <Text style={s.trackerBtnText}>
            {currentLap >= laps.total ? 'Done!' : 'Allahu Akbar ☝️'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepCard({
  step,
  index,
  isLast,
  onDuaTap,
}: {
  step: UmrahStep;
  index: number;
  isLast: boolean;
  onDuaTap: (dua: NonNullable<UmrahStep['dua']>, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 0 : 1,
      tension: 40,
      friction: 10,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  return (
    <View style={s.stepRow}>
      {/* Timeline rail */}
      <View style={s.rail}>
        <View
          style={[
            s.railIcon,
            step.important && s.railIconImportant,
          ]}
        >
          <Ionicons
            name={step.icon}
            size={16}
            color={step.important ? Palette.gold : Palette.textSecondary}
          />
        </View>
        {!isLast && <View style={s.railLine} />}
      </View>

      {/* Content */}
      <TouchableOpacity
        style={[s.stepCard, step.important && s.stepCardHighlight]}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={s.stepTop}>
          <View style={s.stepNumBadge}>
            <Text style={s.stepNum}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.stepPhase}>{step.phase.toUpperCase()}</Text>
            <Text style={s.stepTitle}>{step.title}</Text>
            {step.arabicTitle && (
              <Text style={s.stepArabic}>{step.arabicTitle}</Text>
            )}
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Palette.textMuted}
          />
        </View>

        <Animated.View
          style={{
            maxHeight: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 800],
            }),
            opacity: expandAnim,
            overflow: 'hidden',
          }}
        >
          <View style={s.stepBody}>
            <Text style={s.stepDetail}>{step.detail}</Text>

            {step.dua && (
              <TouchableOpacity
                onPress={() => onDuaTap(step.dua!, step.title)}
                activeOpacity={0.7}
                style={s.duaChip}
              >
                <Ionicons name="volume-high" size={14} color={Palette.gold} />
                <Text style={s.duaChipText}>View Du\'a</Text>
              </TouchableOpacity>
            )}

            {step.laps && <TawafTracker laps={step.laps} />}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function UmrahGuideScreen() {
  const router = useRouter();
  const [duaModal, setDuaModal] = useState<{
    visible: boolean;
    dua: NonNullable<UmrahStep['dua']> | null;
    title: string;
  }>({ visible: false, dua: null, title: '' });

  const openDua = (dua: NonNullable<UmrahStep['dua']>, title: string) => {
    setDuaModal({ visible: true, dua, title });
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Umrah Guide</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={['#1e2d52', '#1a2545', '#162038']}
          style={s.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={s.heroEmoji}>
            <Text style={{ fontSize: 48 }}>🕋</Text>
          </View>
          <Text style={s.heroEyebrow}>BEFORE DAY 8 · DHUL-HIJJAH</Text>
          <Text style={s.heroTitle}>Umrah</Text>
          <Text style={s.heroArabic}>ٱلْعُمْرَة</Text>
          <Text style={s.heroDesc}>
            Perform Umrah when you first arrive in Makkah. It consists of Ihram, Tawaf (7 rounds around the Ka'bah), Sa'i (7 laps between Safa & Marwa), and shaving or trimming the hair.
          </Text>

          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>4</Text>
              <Text style={s.heroStatLabel}>Pillars</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>7+7</Text>
              <Text style={s.heroStatLabel}>Laps</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>12</Text>
              <Text style={s.heroStatLabel}>Steps</Text>
            </View>
          </View>

          {/* Decorative corners */}
          <View style={[s.heroCorner, { top: 12, left: 12 }]} />
          <View style={[s.heroCorner, { top: 12, right: 12, transform: [{ rotate: '90deg' }] }]} />
          <View style={[s.heroCorner, { bottom: 12, left: 12, transform: [{ rotate: '270deg' }] }]} />
          <View style={[s.heroCorner, { bottom: 12, right: 12, transform: [{ rotate: '180deg' }] }]} />
        </LinearGradient>

        {/* Quick summary pills */}
        <View style={s.pillRow}>
          {[
            { icon: 'shirt' as const, label: 'Ihram' },
            { icon: 'refresh-circle' as const, label: 'Tawaf' },
            { icon: 'repeat' as const, label: "Sa'i" },
            { icon: 'cut' as const, label: 'Halq' },
          ].map((p) => (
            <View key={p.label} style={s.pill}>
              <Ionicons name={p.icon} size={14} color={Palette.gold} />
              <Text style={s.pillText}>{p.label}</Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <Text style={s.sectionTitle}>Step by step</Text>

        {UMRAH_STEPS.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            isLast={i === UMRAH_STEPS.length - 1}
            onDuaTap={openDua}
          />
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Du'a bottom sheet */}
      <Modal
        visible={duaModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setDuaModal((prev) => ({ ...prev, visible: false }))}
      >
        <Pressable
          style={s.sheetBackdrop}
          onPress={() => setDuaModal((prev) => ({ ...prev, visible: false }))}
        >
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.sheetHandle} />

            <View style={s.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetEyebrow}>DU'A</Text>
                <Text style={s.sheetTitle}>{duaModal.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDuaModal((prev) => ({ ...prev, visible: false }))}
                style={s.sheetClose}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color={Palette.textPrimary} />
              </TouchableOpacity>
            </View>

            {duaModal.dua && (
              <ScrollView
                contentContainerStyle={s.sheetBody}
                showsVerticalScrollIndicator={false}
              >
                <Text style={s.sheetArabic}>{duaModal.dua.arabic}</Text>
                <View style={s.sheetDivider} />
                <Text style={s.sheetTranslit}>{duaModal.dua.transliteration}</Text>
                <Text style={s.sheetTranslation}>{duaModal.dua.translation}</Text>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 17,
    color: Palette.textPrimary,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 30 },

  // Hero
  hero: {
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 4,
    alignItems: 'center',
  },
  heroEmoji: { marginBottom: 14 },
  heroEyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 2,
  },
  heroTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 42,
    color: Palette.textPrimary,
    lineHeight: 46,
    marginTop: 4,
  },
  heroArabic: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 28,
    color: Palette.gold,
    marginTop: 2,
  },
  heroDesc: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 8,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  heroStat: { alignItems: 'center', flex: 1 },
  heroStatNum: {
    fontFamily: RawafFonts.display,
    fontSize: 24,
    color: Palette.gold,
    lineHeight: 26,
  },
  heroStatLabel: {
    fontFamily: RawafFonts.body,
    fontSize: 10,
    color: Palette.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
  },
  heroCorner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: Palette.gold,
  },

  // Quick pills
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    backgroundColor: Palette.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  pillText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.textPrimary,
  },

  // Section title
  sectionTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  // Step cards
  stepRow: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 32 },
  railIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railIconImportant: {
    backgroundColor: Palette.goldMuted,
    borderColor: Palette.goldLight,
  },
  railLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: Palette.goldBorder,
    marginTop: 4,
    marginBottom: -4,
  },

  stepCard: {
    flex: 1,
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  stepCardHighlight: {
    borderColor: 'rgba(201,168,76,0.25)',
  },
  stepTop: { flexDirection: 'row', alignItems: 'center' },
  stepNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(201,168,76,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 11,
    color: Palette.gold,
  },
  stepPhase: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    color: Palette.gold,
    letterSpacing: 1.2,
  },
  stepTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 18,
    color: Palette.textPrimary,
    lineHeight: 22,
    marginTop: 1,
  },
  stepArabic: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 16,
    color: Palette.gold,
    marginTop: 2,
  },

  stepBody: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    marginTop: 12,
  },
  stepDetail: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 21,
  },

  // Du'a chip
  duaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  duaChipText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 12,
    color: Palette.gold,
  },

  // Inline du'a card (unused here, but available)
  duaCard: {
    marginTop: 14,
    backgroundColor: 'rgba(201,168,76,0.06)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  duaArabic: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 22,
    color: Palette.textPrimary,
    textAlign: 'right',
    lineHeight: 34,
  },
  duaDivider: {
    height: 1,
    backgroundColor: Palette.goldBorder,
    marginVertical: 12,
  },
  duaTranslit: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 14,
    color: Palette.gold,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  duaTranslation: {
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 19,
    marginTop: 8,
  },

  // Tawaf/Sa'i tracker
  trackerCard: {
    marginTop: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    padding: 16,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackerTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textPrimary,
  },
  trackerCount: {
    fontFamily: RawafFonts.display,
    fontSize: 20,
    color: Palette.gold,
  },
  trackerLaps: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 14,
  },
  trackerDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.cardBg,
    borderWidth: 1.5,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerDotDone: {
    backgroundColor: Palette.gold,
    borderColor: Palette.gold,
  },
  trackerDotFast: {
    borderColor: Palette.goldLight,
  },
  trackerDotText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textSecondary,
  },
  trackerDotTextDone: { color: '#0f1628' },
  trackerDotLabel: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 7,
    color: Palette.gold,
    letterSpacing: 0.5,
    position: 'absolute',
    bottom: -2,
  },
  trackerHint: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  trackerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  trackerBtn: {
    flex: 1,
    backgroundColor: Palette.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerBtnSecondary: {
    flex: 0,
    width: 48,
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  trackerBtnText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: '#0f1628',
  },

  // Bottom sheet (du'a)
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 8,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: Palette.goldBorder,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.textMuted,
    opacity: 0.4,
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  sheetEyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.4,
  },
  sheetTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 22,
    color: Palette.textPrimary,
    marginTop: 3,
    lineHeight: 26,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  sheetBody: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sheetArabic: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 28,
    color: Palette.textPrimary,
    textAlign: 'right',
    lineHeight: 44,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: Palette.goldBorder,
    marginVertical: 20,
  },
  sheetTranslit: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 16,
    color: Palette.gold,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  sheetTranslation: {
    fontFamily: RawafFonts.body,
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 22,
    marginTop: 12,
  },
});
