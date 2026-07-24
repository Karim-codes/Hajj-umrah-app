import { RitualGlyph, RitualGlyphKind, RitualIcon } from '@/components/ritual-glyph';
import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── TYPES & DATA ────────────────────────────────────────────────────────────

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
  glyph?: RitualGlyphKind;
};

type LapInfo = {
  total: number;
  fastWalkLaps: number;
  perLapAction?: string;
};

const UMRAH_STEPS: UmrahStep[] = [
  {
    id: 'ihram',
    phase: 'Preparation',
    title: 'Enter Ihram',
    arabicTitle: 'ٱلْإِحْرَام',
    detail:
      'Before reaching the Miqat, perform Ghusl (full body wash), wear your Ihram garments (two white unstitched cloths for men), and make the intention (niyyah) for Umrah. Then recite the Talbiyah.',
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
    phase: 'Al-Masjid al-Haram',
    title: 'Enter the Mosque',
    arabicTitle: 'دُخُول ٱلْمَسْجِد',
    glyph: 'mosque',
    detail:
      'Enter al-Masjid al-Haram through Bab as-Salam or any door. Step in with your right foot first and recite the du\'a for entering.',
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
    phase: 'First Sight',
    title: 'See the Ka\'bah',
    detail:
      'When you first see the Ka\'bah, stop and raise your hands in du\'a. This is a moment when supplications are accepted — ask Allah for whatever you wish.',
    icon: 'eye',
    important: true,
  },
  {
    id: 'tawaf-start',
    phase: 'Tawaf',
    title: 'Black Stone Start',
    arabicTitle: 'ٱلطَّوَاف',
    glyph: 'kaaba',
    detail:
      'Start at the Black Stone corner (green light marks it). If possible, touch or kiss it. If crowded, point with your right hand and say "Allahu Akbar". Keep the Ka\'bah on your left.',
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
    phase: 'Laps 1–3',
    title: 'Fast Walk (Raml)',
    arabicTitle: 'ٱلرَّمَل',
    detail:
      'First three rounds: men walk briskly with short steps. Practice Idtiba (uncover right shoulder). Recite du\'a between the Yemeni Corner and Black Stone.',
    dua: {
      arabic: 'رَبَّنَا آتِنَا فِي ٱلدُّنْيَا حَسَنَةً وَفِي ٱلْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ',
      transliteration: 'Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa \'adhaab an-naar',
      translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    },
    icon: 'speedometer',
  },
  {
    id: 'tawaf-normal',
    phase: 'Laps 4–7',
    title: 'Walk Normally',
    detail:
      'Rounds 4–7: walk at a normal pace. Continue du\'a, dhikr, and Quran. Say "Allahu Akbar" each time you pass the Black Stone.',
    icon: 'walk',
  },
  {
    id: 'tawaf-prayer',
    phase: 'After Tawaf',
    title: '2 Rak\'ah Prayer',
    arabicTitle: 'صَلَاة ٱلْمَقَام',
    detail:
      'Pray 2 rak\'ah behind Maqam Ibrahim. Recite Surah al-Kafirun in the first, Surah al-Ikhlas in the second. If crowded, pray anywhere in the mosque.',
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
    phase: 'Zamzam',
    title: 'Drink Zamzam',
    detail:
      'Face the Qiblah, say "Bismillah", drink in three sips. "Zamzam water is for whatever it is drunk for." Ask for knowledge, provision, and cure.',
    icon: 'water',
  },
  {
    id: 'sai-start',
    phase: 'Sa\'i Begins',
    title: 'Mount Safa',
    arabicTitle: 'ٱلسَّعْي',
    detail:
      'Go to Mount Safa. Face the Ka\'bah, raise your hands, say "Allahu Akbar" three times and make du\'a.',
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
    phase: '7 Laps',
    title: 'Safa ↔ Marwa',
    detail:
      'Walk Safa→Marwa (1), Marwa→Safa (2)… 7 laps ending at Marwa. Men jog between the green lights. Make personal du\'a throughout.',
    laps: {
      total: 7,
      fastWalkLaps: 0,
      perLapAction: 'At each mountain, face the Ka\'bah, raise your hands, and make du\'a.',
    },
    icon: 'repeat',
  },
  {
    id: 'halq',
    phase: 'Completion',
    title: 'Shave / Trim',
    arabicTitle: 'ٱلْحَلْق',
    detail:
      'Men: shaving (Halq) is preferred. Women: trim a fingertip\'s length. After this, all Ihram restrictions are lifted.',
    icon: 'cut',
    important: true,
  },
  {
    id: 'complete',
    phase: 'Alhamdulillah',
    title: 'Umrah Complete!',
    detail:
      'Your Umrah is complete! You are free from Ihram. May Allah accept your worship. Remain in Makkah and pray until Hajj begins on 8 Dhul-Hijjah.',
    icon: 'checkmark-circle',
    important: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── LAP COUNTER ─────────────────────────────────────────────────────────────

function LapCounter({ laps }: { laps: LapInfo }) {
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
              style={[s.trackerDot, done && s.trackerDotDone, isFast && !done && s.trackerDotFast]}
            >
              <Text style={[s.trackerDotText, done && s.trackerDotTextDone]}>{i + 1}</Text>
              {isFast && !done && <Text style={s.trackerDotLabel}>Fast</Text>}
            </View>
          );
        })}
      </View>

      {laps.perLapAction && <Text style={s.trackerHint}>{laps.perLapAction}</Text>}

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
            {currentLap >= laps.total ? 'Done!' : 'Allahu Akbar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── DU'A INLINE CARD (no nested Modal — fixes crash) ───────────────────────

function DuaInlineCard({ dua }: { dua: NonNullable<UmrahStep['dua']> }) {
  return (
    <View style={s.duaCard}>
      <Text style={s.duaArabic}>{dua.arabic}</Text>
      <View style={s.duaDivider} />
      <Text style={s.duaTranslit}>{dua.transliteration}</Text>
      <Text style={s.duaTranslation}>{dua.translation}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 1: ORIGINAL LINEAR TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

function LinearStepCard({
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
        <View style={[s.railIcon, step.important && s.railIconImportant]}>
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
            {step.arabicTitle && <Text style={s.stepArabic}>{step.arabicTitle}</Text>}
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Palette.textMuted}
          />
        </View>

        <Animated.View
          style={{
            maxHeight: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 800] }),
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
                <Text style={s.duaChipText}>View Du'a</Text>
              </TouchableOpacity>
            )}

            {step.laps && <LapCounter laps={step.laps} />}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

function LinearView({
  onDuaTap,
}: {
  onDuaTap: (dua: NonNullable<UmrahStep['dua']>, title: string) => void;
}) {
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.linearContent}
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
          <RitualGlyph kind="kaaba" size={54} color={Palette.gold} />
        </View>
        <Text style={s.heroEyebrow}>BEFORE DAY 8 · DHUL-HIJJAH</Text>
        <Text style={s.heroTitle}>Umrah</Text>
        <Text style={s.heroArabic}>ٱلْعُمْرَة</Text>
        <Text style={s.heroDesc}>
          Perform Umrah when you first arrive in Makkah. It consists of Ihram, Tawaf (7 rounds
          around the Ka'bah), Sa'i (7 laps between Safa & Marwa), and shaving or trimming the hair.
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
        <View
          style={[s.heroCorner, { bottom: 12, left: 12, transform: [{ rotate: '270deg' }] }]}
        />
        <View
          style={[s.heroCorner, { bottom: 12, right: 12, transform: [{ rotate: '180deg' }] }]}
        />
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

      {/* Section title */}
      <Text style={s.sectionTitle}>Step by step</Text>

      {UMRAH_STEPS.map((step, i) => (
        <LinearStepCard
          key={step.id}
          step={step}
          index={i}
          isLast={i === UMRAH_STEPS.length - 1}
          onDuaTap={onDuaTap}
        />
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIEW 2: SERPENTINE ROADMAP
// ═══════════════════════════════════════════════════════════════════════════════

const PATH_COLS = 3;
const NODE_SIZE = 62;
const NODE_GAP_Y = 70;
const ROAD_PAD_H = 22;

function getColumnX(col: number, containerW: number): number {
  const usable = containerW - ROAD_PAD_H * 2 - NODE_SIZE;
  return ROAD_PAD_H + (usable * col) / (PATH_COLS - 1);
}

function getSerpentineCols(count: number): number[] {
  const cycle = [0, 1, 2, 1];
  return Array.from({ length: count }, (_, i) => cycle[i % cycle.length]);
}

function StarField() {
  const stars = useRef(
    Array.from({ length: 35 }, () => ({
      x: Math.random() * SCREEN_W,
      y: Math.random() * 1500,
      size: 1 + Math.random() * 2,
      opacity: new Animated.Value(0.1 + Math.random() * 0.4),
      delay: Math.random() * 3000,
    })),
  ).current;

  useEffect(() => {
    stars.forEach((star) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: 0.05,
            duration: 1500 + Math.random() * 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 0.3 + Math.random() * 0.3,
            duration: 1500 + Math.random() * 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(twinkle);
      };
      setTimeout(twinkle, star.delay);
    });
  }, []);

  return (
    <>
      {stars.map((star, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: Palette.gold,
            opacity: star.opacity,
          }}
        />
      ))}
    </>
  );
}

function PulsingRing({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size + 18,
        height: size + 18,
        borderRadius: (size + 18) / 2,
        borderWidth: 2,
        borderColor: Palette.gold,
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.55] }),
        transform: [
          { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
        ],
      }}
    />
  );
}

function RoadConnector({
  fromX,
  fromY,
  toX,
  toY,
  done,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  done?: boolean;
}) {
  const DOTS = 16;
  const halfNode = NODE_SIZE / 2;
  const x1 = fromX + halfNode;
  const y1 = fromY + halfNode;
  const x2 = toX + halfNode;
  const y2 = toY + halfNode;
  const cpX = (x1 + x2) / 2 + (x2 - x1) * 0.25;
  const cpY = (y1 + y2) / 2;

  const dots = [];
  for (let i = 1; i < DOTS; i++) {
    const t = i / DOTS;
    const invT = 1 - t;
    const bx = invT * invT * x1 + 2 * invT * t * cpX + t * t * x2;
    const by = invT * invT * y1 + 2 * invT * t * cpY + t * t * y2;
    const sz = 3 + Math.sin(t * Math.PI) * 1.5;
    dots.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          left: bx - sz / 2,
          top: by - sz / 2,
          width: sz,
          height: sz,
          borderRadius: sz / 2,
          backgroundColor: done ? 'rgba(201,168,76,0.85)' : 'rgba(201,168,76,0.28)',
        }}
      />,
    );
  }
  return <>{dots}</>;
}

function RoadmapView({
  activeIdx,
  setActiveIdx,
  onNodeTap,
}: {
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  onNodeTap: (step: UmrahStep, idx: number) => void;
}) {
  const containerW = SCREEN_W;
  const cols = getSerpentineCols(UMRAH_STEPS.length);
  const nodePositions = UMRAH_STEPS.map((_, i) => ({
    x: getColumnX(cols[i], containerW),
    y: i * (NODE_SIZE + NODE_GAP_Y),
  }));
  const totalRoadHeight = UMRAH_STEPS.length * (NODE_SIZE + NODE_GAP_Y) + 80;
  const completedUpTo = activeIdx;

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={[s.roadScrollContent, { paddingBottom: 60 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[s.roadContainer, { height: totalRoadHeight }]}>
        <StarField />

        {/* Connectors */}
        {nodePositions.map((pos, i) => {
          if (i === 0) return null;
          const prev = nodePositions[i - 1];
          return (
            <RoadConnector
              key={`c-${i}`}
              fromX={prev.x}
              fromY={prev.y}
              toX={pos.x}
              toY={pos.y}
              done={i <= completedUpTo}
            />
          );
        })}

        {/* Nodes */}
        {UMRAH_STEPS.map((step, i) => {
          const pos = nodePositions[i];
          const isActive = i === activeIdx;
          const isDone = i < completedUpTo;
          const isLocked = i > completedUpTo;
          const isLast = i === UMRAH_STEPS.length - 1;

          return (
            <View
              key={step.id}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: NODE_SIZE,
                height: NODE_SIZE,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isActive && <PulsingRing size={NODE_SIZE} />}

              <TouchableOpacity
                onPress={() => onNodeTap(step, i)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 34, left: 24, right: 24 }}
                style={[
                  s.node,
                  isDone && s.nodeDone,
                  isActive && s.nodeActive,
                  isLocked && s.nodeLocked,
                  isLast && s.nodeFinish,
                ]}
              >
                <RitualIcon
                  name={step.glyph ?? step.icon}
                  size={isDone ? 22 : 25}
                  color={isDone ? '#0f1628' : isActive ? Palette.gold : Palette.textMuted}
                />
                {isDone && (
                  <View style={s.checkBadge}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={s.nodeLabel}>
                <Text
                  style={[
                    s.nodeLabelText,
                    isActive && s.nodeLabelActive,
                    isDone && s.nodeLabelDone,
                  ]}
                  numberOfLines={2}
                >
                  {step.title}
                </Text>
                <Text style={[s.nodePhaseText, isActive && { color: Palette.gold }]}>
                  {step.phase}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Start marker */}
        <View
          style={[
            s.endMarker,
            { top: -36, left: getColumnX(cols[0], containerW) + NODE_SIZE / 2 - 30 },
          ]}
        >
          <Text style={s.endMarkerText}>START</Text>
          <Ionicons name="flag" size={14} color={Palette.green} />
        </View>

        {/* Finish marker */}
        <View
          style={[
            s.endMarker,
            {
              top: nodePositions[nodePositions.length - 1].y + NODE_SIZE + 14,
              left: getColumnX(cols[cols.length - 1], containerW) + NODE_SIZE / 2 - 30,
            },
          ]}
        >
          <Text style={s.endMarkerText}>FINISH</Text>
          <Ionicons name="star" size={14} color={Palette.gold} />
        </View>
      </View>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN — combines both views with toggle
// ═══════════════════════════════════════════════════════════════════════════════

type ViewMode = 'linear' | 'roadmap';

export default function UmrahGuideScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('linear');

  // Roadmap state
  const [activeIdx, setActiveIdx] = useState(0);

  // Detail bottom sheet (used by roadmap view)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStep, setDetailStep] = useState<UmrahStep | null>(null);
  const [showDuaInSheet, setShowDuaInSheet] = useState(false);

  // Du'a bottom sheet (used by linear view — single modal, no nesting)
  const [duaModal, setDuaModal] = useState<{
    visible: boolean;
    dua: NonNullable<UmrahStep['dua']> | null;
    title: string;
  }>({ visible: false, dua: null, title: '' });

  const openDuaSheet = (dua: NonNullable<UmrahStep['dua']>, title: string) => {
    setDuaModal({ visible: true, dua, title });
  };

  const openDetail = (step: UmrahStep, idx: number) => {
    setActiveIdx(idx);
    setDetailStep(step);
    setShowDuaInSheet(false);
    setDetailOpen(true);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={Palette.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Umrah Guide</Text>
          <Text style={s.headerSub}>ٱلْعُمْرَة</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      {/* View mode toggle */}
      <View style={s.toggleWrap}>
        <TouchableOpacity
          style={[s.toggleBtn, viewMode === 'linear' && s.toggleBtnActive]}
          onPress={() => setViewMode('linear')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="list"
            size={16}
            color={viewMode === 'linear' ? '#0f1628' : Palette.textSecondary}
          />
          <Text style={[s.toggleText, viewMode === 'linear' && s.toggleTextActive]}>
            Timeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, viewMode === 'roadmap' && s.toggleBtnActive]}
          onPress={() => setViewMode('roadmap')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="map"
            size={16}
            color={viewMode === 'roadmap' ? '#0f1628' : Palette.textSecondary}
          />
          <Text style={[s.toggleText, viewMode === 'roadmap' && s.toggleTextActive]}>
            Road Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar (roadmap only) */}
      {viewMode === 'roadmap' && (
        <View style={s.progressWrap}>
          <View style={s.progressBar}>
            <View
              style={[
                s.progressFill,
                { width: `${((activeIdx + 1) / UMRAH_STEPS.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={s.progressText}>
            {activeIdx + 1} of {UMRAH_STEPS.length}
          </Text>
        </View>
      )}

      {/* Render active view */}
      {viewMode === 'linear' ? (
        <LinearView onDuaTap={openDuaSheet} />
      ) : (
        <RoadmapView
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          onNodeTap={openDetail}
        />
      )}

      {/* ── Du'a sheet (linear view) — SINGLE modal, no nesting ────────── */}
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
          <Pressable style={[s.sheet, { maxHeight: '85%' }]} onPress={(e) => e.stopPropagation()}>
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
              <ScrollView contentContainerStyle={s.sheetDuaBody} showsVerticalScrollIndicator={false}>
                <Text style={s.sheetDuaArabic}>{duaModal.dua.arabic}</Text>
                <View style={s.sheetDuaDivider} />
                <Text style={s.sheetDuaTranslit}>{duaModal.dua.transliteration}</Text>
                <Text style={s.sheetDuaTranslation}>{duaModal.dua.translation}</Text>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Detail sheet (roadmap view) — du'a shown INLINE, no 2nd modal */}
      <Modal
        visible={detailOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailOpen(false)}
      >
        <Pressable style={s.sheetBackdrop} onPress={() => setDetailOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.sheetHandle} />

            {detailStep && (
              <>
                <View style={s.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={s.sheetPhaseRow}>
                      <Text style={s.sheetEyebrow}>{detailStep.phase.toUpperCase()}</Text>
                      <View style={s.sheetStepBadge}>
                        <Text style={s.sheetStepBadgeText}>
                          STEP {activeIdx + 1}/{UMRAH_STEPS.length}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.sheetTitle}>{detailStep.title}</Text>
                    {detailStep.arabicTitle && (
                      <Text style={s.sheetArabicTitle}>{detailStep.arabicTitle}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setDetailOpen(false)}
                    style={s.sheetClose}
                    hitSlop={10}
                  >
                    <Ionicons name="close" size={20} color={Palette.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={s.sheetBody}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={s.sheetDetail}>{detailStep.detail}</Text>

                  {/* Du'a — toggle inline instead of opening another modal */}
                  {detailStep.dua && !showDuaInSheet && (
                    <TouchableOpacity
                      onPress={() => setShowDuaInSheet(true)}
                      activeOpacity={0.7}
                      style={s.duaEntryBtn}
                    >
                      <LinearGradient
                        colors={['rgba(201,168,76,0.18)', 'rgba(201,168,76,0.06)']}
                        style={s.duaEntryInner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <View style={s.duaEntryIcon}>
                          <Ionicons name="volume-high" size={18} color={Palette.gold} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.duaEntryTitle}>View Du'a</Text>
                          <Text style={s.duaEntrySub}>
                            Arabic · Transliteration · Translation
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Palette.gold} />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {detailStep.dua && showDuaInSheet && (
                    <View style={{ marginTop: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={[s.sheetEyebrow, { letterSpacing: 1.2 }]}>DU'A</Text>
                        <TouchableOpacity onPress={() => setShowDuaInSheet(false)} hitSlop={8}>
                          <Ionicons name="chevron-up" size={18} color={Palette.textMuted} />
                        </TouchableOpacity>
                      </View>
                      <DuaInlineCard dua={detailStep.dua} />
                    </View>
                  )}

                  {detailStep.laps && <LapCounter laps={detailStep.laps} />}

                  {/* Navigation buttons */}
                  <View style={s.navRow}>
                    <TouchableOpacity
                      disabled={activeIdx === 0}
                      onPress={() => {
                        const prev = activeIdx - 1;
                        setActiveIdx(prev);
                        setDetailStep(UMRAH_STEPS[prev]);
                        setShowDuaInSheet(false);
                      }}
                      style={[s.navBtn, activeIdx === 0 && s.navBtnDisabled]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-back" size={16} color={Palette.textPrimary} />
                      <Text style={s.navBtnText}>Previous</Text>
                    </TouchableOpacity>

                    {activeIdx < UMRAH_STEPS.length - 1 ? (
                      <TouchableOpacity
                        onPress={() => {
                          const next = activeIdx + 1;
                          setActiveIdx(next);
                          setDetailStep(UMRAH_STEPS[next]);
                          setShowDuaInSheet(false);
                        }}
                        style={[s.navBtn, s.navBtnPrimary]}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.navBtnText, { color: '#0f1628' }]}>Next Step</Text>
                        <Ionicons name="chevron-forward" size={16} color="#0f1628" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setDetailOpen(false)}
                        style={[s.navBtn, s.navBtnPrimary]}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="checkmark-circle" size={16} color="#0f1628" />
                        <Text style={[s.navBtnText, { color: '#0f1628' }]}>Finish</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={{ height: 24 }} />
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  backBtn: { padding: 4 },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 17,
    color: Palette.textPrimary,
  },
  headerSub: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 14,
    color: Palette.gold,
    marginTop: -1,
  },

  // Toggle
  toggleWrap: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Palette.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  toggleBtnActive: {
    backgroundColor: Palette.gold,
  },
  toggleText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textSecondary,
  },
  toggleTextActive: {
    color: '#0f1628',
  },

  // Progress (roadmap)
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.gold,
  },
  progressText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 11,
    color: Palette.textMuted,
  },

  scroll: { flex: 1 },

  // ── LINEAR VIEW STYLES ─────────────────────────────────────────────
  linearContent: { paddingHorizontal: 18, paddingBottom: 30 },

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

  // Pills
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

  sectionTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  // Step cards (linear)
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

  // Du'a chip (linear)
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

  // Du'a inline card
  duaCard: {
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

  // Lap counter
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

  // ── ROADMAP VIEW STYLES ────────────────────────────────────────────
  roadScrollContent: { alignItems: 'center' },
  roadContainer: {
    width: '100%',
    position: 'relative',
    paddingTop: 50,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: Palette.cardBg,
    borderWidth: 2,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nodeDone: { backgroundColor: Palette.gold, borderColor: Palette.gold },
  nodeActive: { borderColor: Palette.gold, borderWidth: 2.5, backgroundColor: Palette.cardBgLight },
  nodeLocked: { opacity: 0.5 },
  nodeFinish: { borderColor: Palette.gold },
  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Palette.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.background,
  },
  nodeLabel: {
    position: 'absolute',
    top: NODE_SIZE + 4,
    width: 100,
    alignItems: 'center',
  },
  nodeLabelText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 11,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  nodeLabelActive: { color: Palette.textPrimary },
  nodeLabelDone: { color: Palette.gold },
  nodePhaseText: {
    fontFamily: RawafFonts.body,
    fontSize: 9,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 1,
    letterSpacing: 0.3,
  },
  endMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  endMarkerText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    color: Palette.textPrimary,
    letterSpacing: 1.5,
  },

  // ── SHARED BOTTOM SHEET ────────────────────────────────────────────
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
    maxHeight: '78%',
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  sheetPhaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetEyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.4,
  },
  sheetStepBadge: {
    backgroundColor: Palette.goldMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sheetStepBadgeText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    color: Palette.gold,
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 26,
    color: Palette.textPrimary,
    marginTop: 4,
    lineHeight: 30,
  },
  sheetArabicTitle: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 20,
    color: Palette.gold,
    marginTop: 2,
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
    paddingTop: 18,
    paddingBottom: 12,
  },
  sheetDetail: {
    fontFamily: RawafFonts.body,
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 23,
  },

  // Du'a sheet body (linear view)
  sheetDuaBody: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sheetDuaArabic: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 28,
    color: Palette.textPrimary,
    textAlign: 'right',
    lineHeight: 44,
  },
  sheetDuaDivider: {
    height: 1,
    backgroundColor: Palette.goldBorder,
    marginVertical: 20,
  },
  sheetDuaTranslit: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 16,
    color: Palette.gold,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  sheetDuaTranslation: {
    fontFamily: RawafFonts.body,
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 22,
    marginTop: 12,
  },

  // Du'a entry button (roadmap detail sheet)
  duaEntryBtn: { marginTop: 16 },
  duaEntryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  duaEntryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duaEntryTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  duaEntrySub: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 1,
  },

  // Nav row (roadmap detail sheet)
  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
  },
  navBtnPrimary: {
    backgroundColor: Palette.gold,
    borderColor: Palette.gold,
  },
  navBtnDisabled: { opacity: 0.35 },
  navBtnText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
});
