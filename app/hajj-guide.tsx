import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RiteStep = {
  time: string;
  title: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  source?: string; // short label e.g. "Sahih Muslim 1218"
};

type Proof = {
  topic: string;
  narration: string;
  source: string;
};

type HajjDay = {
  hijri: string;
  gregorian: string; // approx for 1447H
  name: string;
  arabicName: string;
  location: string;
  locationIcon: keyof typeof Ionicons.glyphMap;
  summary: string;
  steps: RiteStep[];
  reminder?: string;
  proofs: Proof[];
};

// Approximate 1447H Hajj dates (Saudi moon-sighting may shift ±1 day)
const HAJJ_DAYS: HajjDay[] = [
  {
    hijri: '8 Dhul-Hijjah',
    gregorian: '2026-05-25',
    name: 'Yawm at-Tarwiyah',
    arabicName: 'يَوْم ٱلتَّرْوِيَة',
    location: 'Mina',
    locationIcon: 'home',
    summary:
      'The first official day of Hajj. Enter Ihram, make your intention, and travel to Mina for a day of prayer and reflection.',
    steps: [
      {
        time: 'Before Fajr',
        title: 'Enter the state of Ihram',
        detail:
          'Perform Ghusl, wear your Ihram garments, and make the niyyah (intention) for Hajj. Begin reciting the Talbiyah: “Labbayk Allahumma Labbayk…”.',
        icon: 'shirt',
      },
      {
        time: 'Morning',
        title: 'Travel to Mina',
        detail:
          'Leave Makkah for Mina (≈8 km). Try to arrive before Dhuhr. Continue the Talbiyah throughout the journey.',
        icon: 'bus',
        source: 'Sahih Muslim 1218',
      },
      {
        time: 'Day & Night',
        title: 'Five prayers in Mina',
        detail:
          'Pray Dhuhr, Asr, Maghrib, Isha, and Fajr (of the 9th) in Mina. Shorten (qasr) the four-unit prayers to two — but do NOT combine them. Spend the night in dhikr, du’a, and rest.',
        icon: 'moon',
        source: 'Sahih Muslim 1218 · Sunan Abi Dawud 1911',
      },
    ],
    reminder: 'Stay hydrated. Avoid arguments and harsh words while in Ihram.',
    proofs: [
      {
        topic: 'Proceeding to Mina',
        narration:
          'The Prophet (ﷺ) proceeded to Mina on the Day of Tarwiyah… and he offered there the Dhuhr, Asr, Maghrib, Isha, and Fajr prayers.',
        source: 'Sahih Muslim 1218 (Hadith of Jabir ibn Abdullah)',
      },
      {
        topic: 'Praying Dhuhr in Mina, Fajr of the 9th in Mina',
        narration:
          'The Messenger of Allah (ﷺ) offered the noon prayer on the 8th of Dhul-Hijjah and dawn prayer on the 9th of Dhul-Hijjah in Mina.',
        source: 'Sunan Abi Dawud 1911',
      },
    ],
  },
  {
    hijri: '9 Dhul-Hijjah',
    gregorian: '2026-05-26',
    name: 'Yawm Arafah',
    arabicName: 'يَوْم عَرَفَة',
    location: 'Arafat → Muzdalifah',
    locationIcon: 'sunny',
    summary:
      'The greatest day of Hajj. Standing at Arafat is the pillar — without it, there is no Hajj.',
    steps: [
      {
        time: 'After Fajr',
        title: 'Depart for Arafat',
        detail:
          'After praying Fajr in Mina, travel to Arafat. Continue the Talbiyah and du’a along the way.',
        icon: 'navigate',
      },
      {
        time: 'After Zawal',
        title: 'Combined Dhuhr & Asr',
        detail:
          'After the khutbah, pray Dhuhr and Asr together (jam‘ taqdim, shortened) with one Adhan and two Iqamahs. The Prophet (ﷺ) prayed nothing between them.',
        icon: 'time',
        source: 'Sahih Muslim 1218',
      },
      {
        time: 'Until Maghrib',
        title: 'Wuquf — the Standing',
        detail:
          'Face the Qiblah, raise your hands, and make sincere du’a until sunset. This is the most blessed time of the year. Repent, ask, weep, and seek forgiveness.',
        icon: 'hand-left',
        source: 'Sahih Muslim 1218',
      },
      {
        time: 'After sunset',
        title: 'Travel to Muzdalifah',
        detail:
          'Leave Arafat calmly after Maghrib (do NOT pray Maghrib at Arafat). Pray Maghrib and Isha together in Muzdalifah with one Adhan and two Iqamahs.',
        icon: 'moon',
        source: 'Sahih Muslim 1218',
      },
      {
        time: 'Night',
        title: 'Sleep under the open sky',
        detail:
          'Rest in Muzdalifah and collect 49–70 small pebbles for stoning the Jamarat. Pray Fajr there, then make du’a until just before sunrise.',
        icon: 'sparkles',
      },
    ],
    reminder:
      'Do not delay leaving Arafat before sunset. The du’a of Arafah is the best du’a.',
    proofs: [
      {
        topic: 'Combining Dhuhr & Asr at Arafah',
        narration:
          'He (ﷺ) came to the bottom of the valley and addressed the people… then Bilal called the Adhan… he then prayed Dhuhr and then Asr, and he did not pray anything between them.',
        source: 'Sahih Muslim 1218',
      },
      {
        topic: 'Maghrib & Isha combined at Muzdalifah',
        narration:
          'He (ﷺ) came to Muzdalifah and offered there the Maghrib and Isha prayers with one Adhan and two Iqamahs.',
        source: 'Sahih Muslim 1218',
      },
    ],
  },
  {
    hijri: '10 Dhul-Hijjah',
    gregorian: '2026-05-27',
    name: 'Yawm an-Nahr (Eid al-Adha)',
    arabicName: 'يَوْم ٱلنَّحْر',
    location: 'Muzdalifah → Mina → Makkah',
    locationIcon: 'star',
    summary:
      'The Day of Sacrifice. Four major rites: stoning Jamrat al-Aqaba, sacrifice, shaving/trimming, and Tawaf al-Ifadah. The Prophet (ﷺ) permitted flexibility in their order.',
    steps: [
      {
        time: 'Before sunrise',
        title: 'Leave Muzdalifah for Mina',
        detail: 'Travel to Mina carrying your pebbles. Continue the Talbiyah until you throw your first stone.',
        icon: 'walk',
      },
      {
        time: 'Forenoon (Duha)',
        title: 'Stone Jamrat al-Aqaba',
        detail:
          'Throw 7 pebbles, one at a time, at the largest pillar (Jamrat al-Kubra) from the middle of the valley, saying “Allahu Akbar” with each throw. Stop the Talbiyah after the first stone.',
        icon: 'ellipse',
        source: 'Sahih Muslim 1299',
      },
      {
        time: 'After stoning',
        title: 'Sacrifice (Hadi)',
        detail:
          'Your Hajj package usually arranges the sacrifice on your behalf. Confirm with your guide that it has been completed.',
        icon: 'checkmark-done',
      },
      {
        time: 'Then',
        title: 'Shave or trim the hair',
        detail:
          'Men: shave (preferred — the Prophet ﷺ made du’a 3 times for those who shaved, once for those who trimmed). Women: trim a fingertip’s length. After this you exit partial Ihram — most restrictions are lifted (except marital relations).',
        icon: 'cut',
        source: 'Sahih Bukhari 1727',
      },
      {
        time: 'Same day (or soon after)',
        title: 'Tawaf al-Ifadah & Sa‘i',
        detail:
          'Travel to Makkah to perform Tawaf al-Ifadah (7 rounds) and Sa‘i between Safa and Marwa (if you did not do Sa‘i with Tawaf al-Qudum). After this, full Ihram is over.',
        icon: 'refresh-circle',
      },
      {
        time: 'Night',
        title: 'Return to Mina',
        detail: 'Spend the night of the 11th in Mina.',
        icon: 'moon',
      },
    ],
    reminder:
      'Eid Mubarak. The order is recommended, but if you do any rite out of order — “Do it now, and there is no harm.”',
    proofs: [
      {
        topic: 'Stoning Jamrat al-Aqaba',
        narration:
          'I saw the Messenger of Allah (ﷺ) throwing pebbles… from the middle of the valley on the day of sacrifice.',
        source: 'Sahih Muslim 1299',
      },
      {
        topic: 'Flexibility in the order of rites',
        narration:
          'A man said, “I slaughtered before I threw (pebbles).” The Prophet (ﷺ) said, “Throw now, and there is no harm.” Another said, “I shaved before I slaughtered.” He said, “Slaughter now, and there is no harm.”',
        source: 'Sahih Bukhari 1721',
      },
      {
        topic: 'Du’a for those who shave',
        narration:
          'O Allah! Be merciful to those who have their head shaved. (The Prophet ﷺ repeated this three times for those who shaved and once for those who trimmed.)',
        source: 'Sahih Bukhari 1727',
      },
    ],
  },
  {
    hijri: '11 Dhul-Hijjah',
    gregorian: '2026-05-28',
    name: 'Ayyam at-Tashreeq · Day 1',
    arabicName: 'أَيَّام ٱلتَّشْرِيق',
    location: 'Mina',
    locationIcon: 'home',
    summary: 'Days of remembrance. Stone all three Jamarat after Zawal and stay overnight in Mina.',
    steps: [
      {
        time: 'After Zawal',
        title: 'Stone the small Jamrah (Sughra)',
        detail:
          'Throw 7 pebbles, one at a time, saying “Allahu Akbar” with each. Then move forward, face the Qiblah, raise your hands, and make a long du’a.',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1751',
      },
      {
        time: 'Then',
        title: 'Stone the middle Jamrah (Wusta)',
        detail:
          'Throw 7 pebbles. Then move to the left, face the Qiblah, raise your hands, and make a long du’a — just as you did at the first.',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1751',
      },
      {
        time: 'Then',
        title: 'Stone Jamrat al-Aqaba',
        detail:
          'Throw 7 pebbles. Do NOT stand for du’a after this one — depart immediately. (21 pebbles total today.)',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1746, 1751',
      },
      {
        time: 'Throughout the day',
        title: 'Dhikr & Takbeer',
        detail:
          'Increase in remembrance of Allah. The Takbeer of Tashreeq is recited after every fard prayer.',
        icon: 'sparkles',
      },
      {
        time: 'Night',
        title: 'Sleep in Mina',
        detail: 'Spending the night (mabit) in Mina is obligatory.',
        icon: 'moon',
      },
    ],
    proofs: [
      {
        topic: 'Stoning after Zawal on Tashreeq days',
        narration:
          'The Messenger of Allah (ﷺ) used to pelt the Jamarah on the Day of Nahr (10th) in the forenoon, and on the following days (11th–13th) after the sun had passed the meridian.',
        source: 'Sahih Bukhari 1746',
      },
      {
        topic: 'Long du’a after the first and second Jamarah',
        narration:
          'After the first and second Jamarah, he (ﷺ) would stand for a long time, face the Qiblah, and make du’a. After the third (Aqaba), he would depart without standing.',
        source: 'Sahih Bukhari 1751',
      },
    ],
  },
  {
    hijri: '12 Dhul-Hijjah',
    gregorian: '2026-05-29',
    name: 'Ayyam at-Tashreeq · Day 2',
    arabicName: 'أَيَّام ٱلتَّشْرِيق',
    location: 'Mina',
    locationIcon: 'home',
    summary:
      'Stone the three Jamarat again after Zawal. You may leave Mina before Maghrib (Nafr al-Awwal) or stay one more night.',
    steps: [
      {
        time: 'After Zawal',
        title: 'Stone all three Jamarat',
        detail:
          '7 pebbles at the small, middle, then large pillar — 21 total. Long du’a after the small and middle. No standing after Aqaba.',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1746, 1751',
      },
      {
        time: 'Before Maghrib',
        title: 'Nafr al-Awwal (optional early departure)',
        detail:
          'You may leave Mina before sunset. If sunset catches you in Mina, you must stay for the 13th and stone again.',
        icon: 'exit',
      },
    ],
    reminder: 'If you stay, the reward is greater. Either choice is permissible.',
    proofs: [
      {
        topic: 'Stoning after Zawal',
        narration:
          'The Messenger of Allah (ﷺ)… on the following days (11th–13th) [pelted] after the sun had passed the meridian.',
        source: 'Sahih Bukhari 1746',
      },
      {
        topic: 'Du’a routine between Jamarat',
        narration:
          'After the first and second Jamarah, he (ﷺ) would stand for a long time, face the Qiblah, and make du’a. After the third (Aqaba), he would depart without standing.',
        source: 'Sahih Bukhari 1751',
      },
    ],
  },
  {
    hijri: '13 Dhul-Hijjah',
    gregorian: '2026-05-30',
    name: 'Ayyam at-Tashreeq · Day 3',
    arabicName: 'أَيَّام ٱلتَّشْرِيق',
    location: 'Mina → Makkah',
    locationIcon: 'home',
    summary: 'Final day of stoning for those who stayed. Then Tawaf al-Wada before leaving Makkah.',
    steps: [
      {
        time: 'After Zawal',
        title: 'Stone all three Jamarat',
        detail:
          '7 pebbles at each pillar in order — 21 total. Long du’a after the small and middle, none after Aqaba.',
        icon: 'ellipse',
        source: 'Sahih Bukhari 1746, 1751',
      },
      {
        time: 'Before leaving Makkah',
        title: 'Tawaf al-Wada (Farewell Tawaf)',
        detail:
          '7 rounds around the Ka‘bah as your final act in Makkah. The people were ordered to make this their last action before leaving. Make du’a and ask Allah to accept your Hajj.',
        icon: 'refresh-circle',
        source: 'Sahih Bukhari 1755',
      },
    ],
    reminder: 'May Allah accept your Hajj — Hajj Mabrur.',
    proofs: [
      {
        topic: 'The Farewell Tawaf',
        narration:
          'The people were ordered to perform the Tawaf of the Ka‘bah as the last thing before leaving (Makkah).',
        source: 'Sahih Bukhari 1755',
      },
    ],
  },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HajjGuideScreen() {
  const router = useRouter();
  const today = todayISO();

  const initialIndex = useMemo(() => {
    const idx = HAJJ_DAYS.findIndex((d) => d.gregorian === today);
    if (idx >= 0) return idx;
    // Pick nearest upcoming if before, else last
    const upcoming = HAJJ_DAYS.findIndex((d) => d.gregorian > today);
    if (upcoming >= 0) return upcoming;
    return 0;
  }, [today]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [proofsOpen, setProofsOpen] = useState(false);
  const day = HAJJ_DAYS[activeIndex];
  const isToday = day.gregorian === today;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hajj Guide</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysStrip}
        contentContainerStyle={styles.daysStripContent}
      >
        {HAJJ_DAYS.map((d, i) => {
          const active = i === activeIndex;
          const todayBadge = d.gregorian === today;
          return (
            <TouchableOpacity
              key={d.hijri}
              onPress={() => setActiveIndex(i)}
              activeOpacity={0.7}
              style={[styles.dayPill, active && styles.dayPillActive]}
            >
              <Text style={[styles.dayPillNum, active && styles.dayPillNumActive]}>
                {d.hijri.split(' ')[0]}
              </Text>
              <Text style={[styles.dayPillLabel, active && styles.dayPillLabelActive]}>
                Dhul-Hijjah
              </Text>
              {todayBadge && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero day card */}
        <LinearGradient
          colors={['#1e2d52', '#1a2545', '#162038']}
          style={styles.dayHero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isToday && (
            <View style={styles.todayBadge}>
              <View style={styles.todayBadgeDot} />
              <Text style={styles.todayBadgeText}>TODAY</Text>
            </View>
          )}
          <Text style={styles.dayHeroHijri}>{day.hijri}</Text>
          <Text style={styles.dayHeroName}>{day.name}</Text>
          <Text style={styles.dayHeroArabic}>{day.arabicName}</Text>

          <View style={styles.dayHeroLocationRow}>
            <Ionicons name={day.locationIcon} size={14} color={Palette.gold} />
            <Text style={styles.dayHeroLocation}>{day.location}</Text>
          </View>

          <Text style={styles.dayHeroSummary}>{day.summary}</Text>

          {/* Decorative corners */}
          <View style={[styles.heroCorner, { top: 12, left: 12 }]} />
          <View style={[styles.heroCorner, { top: 12, right: 12, transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.heroCorner, { bottom: 12, left: 12, transform: [{ rotate: '270deg' }] }]} />
          <View style={[styles.heroCorner, { bottom: 12, right: 12, transform: [{ rotate: '180deg' }] }]} />
        </LinearGradient>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Your day, step by step</Text>
        <View style={styles.timeline}>
          {day.steps.map((step, i) => {
            const last = i === day.steps.length - 1;
            return (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineIconWrap}>
                    <Ionicons name={step.icon} size={16} color={Palette.gold} />
                  </View>
                  {!last && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTime}>{step.time.toUpperCase()}</Text>
                  <Text style={styles.timelineTitle}>{step.title}</Text>
                  <Text style={styles.timelineDetail}>{step.detail}</Text>
                  {step.source && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setProofsOpen(true)}
                      style={styles.sourceChip}
                    >
                      <Ionicons name="book" size={11} color={Palette.gold} />
                      <Text style={styles.sourceChipText}>{step.source}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Proofs from the Sunnah button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setProofsOpen(true)}
          style={styles.proofsBtn}
        >
          <Ionicons name="book" size={18} color={Palette.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.proofsBtnTitle}>Proofs from the Sunnah</Text>
            <Text style={styles.proofsBtnSub}>
              {day.proofs.length} hadith · {day.name}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Palette.gold} />
        </TouchableOpacity>

        {day.reminder && (
          <View style={styles.reminderCard}>
            <Ionicons name="information-circle" size={18} color={Palette.gold} />
            <Text style={styles.reminderText}>{day.reminder}</Text>
          </View>
        )}

        {/* Nav arrows */}
        <View style={styles.navRow}>
          <TouchableOpacity
            disabled={activeIndex === 0}
            onPress={() => setActiveIndex((i) => Math.max(0, i - 1))}
            style={[styles.navBtn, activeIndex === 0 && styles.navBtnDisabled]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={Palette.textPrimary} />
            <Text style={styles.navBtnText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={activeIndex === HAJJ_DAYS.length - 1}
            onPress={() => setActiveIndex((i) => Math.min(HAJJ_DAYS.length - 1, i + 1))}
            style={[styles.navBtn, activeIndex === HAJJ_DAYS.length - 1 && styles.navBtnDisabled]}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Proofs bottom sheet */}
      <Modal
        visible={proofsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setProofsOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setProofsOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetEyebrow}>PROOFS FROM THE SUNNAH</Text>
                <Text style={styles.sheetTitle}>{day.name}</Text>
                <Text style={styles.sheetSub}>{day.hijri}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setProofsOpen(false)}
                style={styles.sheetClose}
                hitSlop={10}
              >
                <Ionicons name="close" size={20} color={Palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flexGrow: 0 }}
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              {day.proofs.map((p, i) => (
                <View key={i} style={styles.proofCard}>
                  <View style={styles.proofTopicRow}>
                    <View style={styles.proofNumber}>
                      <Text style={styles.proofNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.proofTopic}>{p.topic}</Text>
                  </View>
                  <View style={styles.proofQuoteWrap}>
                    <View style={styles.proofQuoteBar} />
                    <Text style={styles.proofNarration}>“{p.narration}”</Text>
                  </View>
                  <View style={styles.proofSourceRow}>
                    <Ionicons name="book" size={12} color={Palette.gold} />
                    <Text style={styles.proofSource}>{p.source}</Text>
                  </View>
                </View>
              ))}
              <View style={{ height: 24 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },

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

  daysStrip: { maxHeight: 78, flexGrow: 0 },
  daysStripContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  dayPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    minWidth: 72,
    position: 'relative',
  },
  dayPillActive: {
    backgroundColor: Palette.goldMuted,
    borderColor: Palette.goldLight,
  },
  dayPillNum: {
    fontFamily: RawafFonts.display,
    fontSize: 22,
    color: Palette.textPrimary,
    lineHeight: 24,
  },
  dayPillNumActive: { color: Palette.gold },
  dayPillLabel: {
    fontFamily: RawafFonts.body,
    fontSize: 10,
    color: Palette.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  dayPillLabelActive: { color: Palette.gold },
  todayDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.green,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 30 },

  dayHero: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    overflow: 'hidden',
    marginBottom: 22,
    marginTop: 4,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Palette.greenMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  todayBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.green },
  todayBadgeText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.green,
    letterSpacing: 1,
  },
  dayHeroHijri: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dayHeroName: {
    fontFamily: RawafFonts.display,
    fontSize: 30,
    color: Palette.textPrimary,
    lineHeight: 34,
    marginTop: 4,
  },
  dayHeroArabic: {
    fontFamily: RawafFonts.displayRegular,
    fontSize: 22,
    color: Palette.gold,
    marginTop: 4,
    textAlign: 'right',
  },
  dayHeroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  dayHeroLocation: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 13,
    color: Palette.textPrimary,
  },
  dayHeroSummary: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  heroCorner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: Palette.gold,
  },

  sectionTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  timeline: { marginBottom: 18 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 32 },
  timelineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: Palette.goldBorder,
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 22,
  },
  timelineTime: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.2,
  },
  timelineTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 19,
    color: Palette.textPrimary,
    marginTop: 2,
    lineHeight: 24,
  },
  timelineDetail: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },

  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  reminderText: {
    flex: 1,
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textPrimary,
    lineHeight: 19,
  },

  navRow: { flexDirection: 'row', gap: 10 },
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
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 14,
    color: Palette.textPrimary,
  },

  // Source chip under each step
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  sourceChipText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 11,
    color: Palette.gold,
    letterSpacing: 0.3,
  },

  // Proofs entry button
  proofsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    backgroundColor: 'rgba(201,168,76,0.08)',
    marginTop: 4,
    marginBottom: 16,
  },
  proofsBtnTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  proofsBtnSub: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },

  // Bottom sheet
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
    maxHeight: '85%',
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
  sheetEyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.4,
  },
  sheetTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 24,
    color: Palette.textPrimary,
    marginTop: 3,
  },
  sheetSub: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
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
  sheetContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  proofCard: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 14,
  },
  proofTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  proofNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofNumberText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 11,
    color: Palette.gold,
  },
  proofTopic: {
    flex: 1,
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  proofQuoteWrap: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  proofQuoteBar: {
    width: 2,
    backgroundColor: Palette.gold,
    borderRadius: 1,
    opacity: 0.6,
  },
  proofNarration: {
    flex: 1,
    fontFamily: RawafFonts.displayRegular,
    fontSize: 16,
    color: Palette.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  proofSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  proofSource: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.gold,
    letterSpacing: 0.3,
  },
});
