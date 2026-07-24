import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { deriveHajjDays, formatDate, getStepStatus } from '@/lib/date-helpers';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ──────────────────────────────────────────────────────────────────

type StepStatus = 'done' | 'active' | 'upcoming';

interface DetailRow {
  label: string;
  value: string;
}

interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string; // base color for icon halo
  status: StepStatus;
  date?: string;
  details: DetailRow[];
}

interface Phase {
  id: string;
  label: string;
  meccaCount?: string; // e.g. "4 stops"
  steps: Step[];
}

const { width } = Dimensions.get('window');

// ─── Hero progress card ─────────────────────────────────────────────────────

function ProgressHero({
  tripType,
  pilgrim,
  done,
  total,
  nextStep,
}: {
  tripType: 'hajj' | 'umrah';
  pilgrim: string;
  done: number;
  total: number;
  nextStep?: Step;
}) {
  const pct = total > 0 ? done / total : 0;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, widthAnim]);

  const heroLabel = tripType === 'hajj' ? 'Hajj Journey' : 'Umrah Journey';
  const heroSub =
    tripType === 'hajj'
      ? 'From your home — through the rites of Hajj — and back'
      : 'From your home — through the rites of Umrah — and back';

  return (
    <LinearGradient
      colors={['rgba(201,168,76,0.18)', 'rgba(201,168,76,0.04)', 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={hero.card}
    >
      <View style={hero.row}>
        <View style={hero.eyebrowDot} />
        <Text style={hero.eyebrow}>{tripType === 'hajj' ? 'HAJJ 1447 AH' : 'UMRAH JOURNEY'}</Text>
      </View>
      <Text style={hero.title}>{heroLabel}</Text>
      <Text style={hero.subtitle}>{heroSub}</Text>

      <View style={hero.progressRow}>
        <View style={hero.progressTrack}>
          <Animated.View
            style={[
              hero.progressFill,
              {
                width: widthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[Palette.gold, '#e7c97a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <Text style={hero.progressText}>
          {done}<Text style={hero.progressTextMuted}> / {total}</Text>
        </Text>
      </View>

      {nextStep && (
        <View style={hero.nextRow}>
          <View style={hero.nextIcon}>
            <Ionicons name={nextStep.icon} size={16} color={Palette.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={hero.nextLabel}>UP NEXT</Text>
            <Text style={hero.nextTitle} numberOfLines={1}>
              {nextStep.title}
            </Text>
          </View>
          {nextStep.date && <Text style={hero.nextDate}>{nextStep.date}</Text>}
        </View>
      )}

      {pilgrim ? <Text style={hero.pilgrim}>For {pilgrim}</Text> : null}
    </LinearGradient>
  );
}

// ─── Single step card ──────────────────────────────────────────────────────

function StepCard({
  step,
  isFirst,
  isLast,
}: {
  step: Step;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(step.status === 'active');
  const expandAnim = useRef(new Animated.Value(step.status === 'active' ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (step.status === 'active') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [step.status, pulseAnim]);

  const toggle = () => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const isDone = step.status === 'done';
  const isActive = step.status === 'active';

  const haloColor = isDone
    ? Palette.green
    : isActive
      ? step.accent
      : Palette.textMuted;

  return (
    <View style={card.row}>
      {/* Rail with icon node */}
      <View style={card.rail}>
        {!isFirst && (
          <View
            style={[
              card.railLineTop,
              { backgroundColor: isDone || isActive ? Palette.gold : Palette.border },
            ]}
          />
        )}

        <Animated.View
          style={[
            card.nodeOuter,
            isActive && { transform: [{ scale: pulseAnim }] },
            {
              backgroundColor: isActive
                ? 'rgba(201,168,76,0.18)'
                : isDone
                  ? 'rgba(46,204,135,0.16)'
                  : 'rgba(255,255,255,0.04)',
              borderColor: haloColor,
            },
          ]}
        >
          {isDone ? (
            <Ionicons name="checkmark" size={18} color={Palette.green} />
          ) : (
            <Ionicons
              name={step.icon}
              size={16}
              color={isActive ? step.accent : Palette.textMuted}
            />
          )}
        </Animated.View>

        {!isLast && (
          <View
            style={[
              card.railLineBottom,
              { backgroundColor: isDone ? Palette.gold : Palette.border },
            ]}
          />
        )}
      </View>

      {/* Card */}
      <TouchableOpacity
        style={[
          card.card,
          isActive && card.cardActive,
          isDone && card.cardDone,
        ]}
        activeOpacity={0.85}
        onPress={toggle}
      >
        <View style={card.head}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                card.title,
                isDone && { color: Palette.textSecondary },
              ]}
              numberOfLines={1}
            >
              {step.title}
            </Text>
            <Text style={card.subtitle} numberOfLines={1}>
              {step.subtitle}
            </Text>
          </View>

          {isActive && (
            <View style={card.nowPill}>
              <View style={card.nowDot} />
              <Text style={card.nowText}>NOW</Text>
            </View>
          )}
          {step.date && !isActive && (
            <Text style={card.dateText}>{step.date}</Text>
          )}
        </View>

        <Animated.View
          style={[
            card.body,
            {
              maxHeight: expandAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 360],
              }),
              opacity: expandAnim,
            },
          ]}
        >
          <View style={card.bodyInner}>
            {step.details.map((d, i) => (
              <View key={i} style={card.detailRow}>
                <Text style={card.detailLabel}>{d.label}</Text>
                <Text style={card.detailValue} numberOfLines={2}>
                  {d.value}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Phase group header ─────────────────────────────────────────────────────

function PhaseHeader({ phase, doneCount }: { phase: Phase; doneCount: number }) {
  return (
    <View style={ph.wrap}>
      <View style={ph.line} />
      <View style={ph.pill}>
        <Text style={ph.label}>{phase.label}</Text>
        <Text style={ph.count}>
          {doneCount} / {phase.steps.length}
        </Text>
      </View>
      <View style={ph.line} />
    </View>
  );
}

// ─── Build steps for either trip type ───────────────────────────────────────

function buildSteps(itinerary: any): { tripType: 'hajj' | 'umrah'; phases: Phase[] } {
  const outbound = itinerary.flights?.outbound;
  const ret = itinerary.flights?.return;
  const hajjDays = deriveHajjDays(itinerary.hajj?.arafahDate);
  const campName = itinerary.camp?.name || '';

  // Trip type: prefer the stored tripType, fall back to heuristic (camp or Arafah date set).
  const tripType: 'hajj' | 'umrah' = itinerary.tripType ?? (campName || hajjDays ? 'hajj' : 'umrah');

  // Determine Umrah route and assign hotels correctly
  const umrahRoute = itinerary.umrah?.route;
  const madinahFirst = umrahRoute === 'madinah-makkah';
  const makkahOnly = umrahRoute === 'makkah-only';

  // When madinahFirst, review.tsx stores: hotel1=Madinah, hotel2=Makkah
  // Otherwise: hotel1=Makkah, hotel2=Madinah
  const hotel1 = itinerary.hotels?.hotel1;
  const hotel2 = itinerary.hotels?.hotel2;
  const makkahHotel = (tripType === 'umrah' && madinahFirst) ? hotel2 : hotel1;
  const madinahHotel = (tripType === 'umrah' && madinahFirst) ? hotel1 : hotel2;

  const sToStatus = getStepStatus;

  const preTrip: Step[] = [
    {
      id: 'depart-home',
      title: 'Departure from Home',
      subtitle: outbound?.departureCity || 'Your home city',
      icon: 'home-outline',
      accent: Palette.gold,
      status: sToStatus(outbound?.departureDate),
      date: outbound?.departureDate ? formatDate(outbound.departureDate) : undefined,
      details: [
        { label: 'Date', value: formatDate(outbound?.departureDate) },
        { label: 'Time', value: outbound?.departureTime || '—' },
        { label: 'Flight', value: outbound?.flightNumbers?.[0] || '—' },
        { label: 'Airline', value: outbound?.airline || '—' },
      ],
    },
    ...(outbound?.stopoverCity
      ? [
          {
            id: 'layover-out',
            title: `Layover · ${outbound.stopoverCity}`,
            subtitle: `${outbound.layoverDuration || 'Connecting flight'}`,
            icon: 'swap-horizontal' as const,
            accent: '#7eb6ff',
            status: sToStatus(outbound.departureDate, outbound.arrivalDate),
            details: [
              { label: 'Stopover', value: outbound.stopoverCity },
              { label: 'Wait', value: outbound.layoverDuration || '—' },
              { label: 'Connecting', value: outbound.flightNumbers?.[1] || '—' },
              { label: 'Airline', value: outbound.airline || '—' },
            ],
          } satisfies Step,
        ]
      : []),
    {
      id: 'arrive-saudi',
      title: 'Arrival in Saudi Arabia',
      subtitle: outbound?.arrivalAirport || outbound?.arrivalCity || '—',
      icon: 'airplane',
      accent: Palette.gold,
      status: sToStatus(outbound?.arrivalDate),
      date: outbound?.arrivalDate ? formatDate(outbound.arrivalDate) : undefined,
      details: [
        { label: 'Date', value: formatDate(outbound?.arrivalDate) },
        { label: 'Time', value: outbound?.arrivalTime || '—' },
        { label: 'Airport', value: outbound?.arrivalAirport || '—' },
        { label: 'Transfer', value: itinerary.transportation || '—' },
      ],
    },
  ];

  const makkahPhase: Step[] = [
    ...(tripType === 'umrah' && madinahFirst ? [{
      id: 'travel-makkah',
      title: 'Travel to Makkah',
      subtitle: itinerary.transportation || 'Package transportation',
      icon: 'car' as const,
      accent: '#7eb6ff',
      status: sToStatus(makkahHotel?.checkIn),
      date: makkahHotel?.checkIn ? formatDate(makkahHotel.checkIn) : undefined,
      details: [
        { label: 'Date', value: formatDate(makkahHotel?.checkIn) },
        { label: 'Transport', value: itinerary.transportation || '—' },
        { label: 'To', value: 'Makkah' },
      ],
    } satisfies Step] : []),
    {
      id: 'hotel-makkah',
      title: `Stay in ${makkahHotel?.city || 'Makkah'}`,
      subtitle: makkahHotel?.name || 'First accommodation',
      icon: 'business',
      accent: Palette.gold,
      status: sToStatus(makkahHotel?.checkIn, makkahHotel?.checkOut),
      date: makkahHotel?.checkIn ? formatDate(makkahHotel.checkIn) : undefined,
      details: [
        { label: 'Hotel', value: makkahHotel?.name || '—' },
        { label: 'City', value: makkahHotel?.city || '—' },
        { label: 'Check-in', value: formatDate(makkahHotel?.checkIn) },
        { label: 'Check-out', value: formatDate(makkahHotel?.checkOut) },
      ],
    },
    {
      id: 'umrah-rites',
      title: tripType === 'hajj' ? 'Perform Umrah (Tamattu)' : 'Perform Umrah',
      subtitle: 'Ihram · Tawaf · Sa\'i · Halq',
      icon: 'sparkles',
      accent: '#9be8c5',
      status: sToStatus(makkahHotel?.checkIn, hajjDays?.tarwiyah || makkahHotel?.checkOut),
      details: [
        { label: 'Ihram', value: 'Enter at Miqat or hotel' },
        { label: 'Tawaf', value: '7 rounds around the Ka\'bah' },
        { label: 'Sa\'i', value: '7 rounds Safa ↔ Marwa' },
        { label: 'After', value: 'Shave / trim → Ihram lifted' },
      ],
    },
  ];

  const hajjRites: Step[] = tripType === 'hajj'
    ? [
        {
          id: 'tarwiyah',
          title: 'Day of Tarwiyah — Mina',
          subtitle: `8 Dhul-Hijjah · ${campName || 'Camp'}`,
          icon: 'flag',
          accent: '#f0c674',
          status: hajjDays ? sToStatus(hajjDays.tarwiyah) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.tarwiyah) : '8 Dhul-Hijjah',
          details: [
            { label: 'Date', value: hajjDays ? formatDate(hajjDays.tarwiyah) : '8 Dhul-Hijjah' },
            { label: 'Camp', value: campName || '—' },
            { label: 'Rituals', value: 'Enter Ihram · Travel to Mina' },
            { label: 'Prayers', value: 'Dhuhr → Fajr (shortened)' },
          ],
        },
        {
          id: 'arafah',
          title: 'Day of Arafah',
          subtitle: '9 Dhul-Hijjah · The pillar of Hajj',
          icon: 'sunny',
          accent: '#ffb86b',
          status: hajjDays ? sToStatus(hajjDays.arafah) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.arafah) : '9 Dhul-Hijjah',
          details: [
            { label: 'Date', value: hajjDays ? formatDate(hajjDays.arafah) : '9 Dhul-Hijjah' },
            { label: 'Morning', value: 'Travel Mina → Arafat' },
            { label: 'Afternoon', value: 'Wuquf until sunset' },
            { label: 'Night', value: 'Depart to Muzdalifah after sunset' },
          ],
        },
        {
          id: 'muzdalifah',
          title: 'Muzdalifah',
          subtitle: 'Night of 9/10 Dhul-Hijjah · Collect pebbles',
          icon: 'moon',
          accent: '#a8c8ff',
          status: hajjDays ? sToStatus(hajjDays.arafah, hajjDays.eid) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.arafah) : '9/10 Dhul-Hijjah',
          details: [
            { label: 'Night', value: hajjDays ? formatDate(hajjDays.arafah) : '9 Dhul-Hijjah (night)' },
            { label: 'Salah', value: 'Pray Maghrib & Isha combined' },
            { label: 'Sleep', value: 'Sunnah to sleep in the open' },
            { label: 'Collect', value: '49–70 pebbles for the Jamarat' },
          ],
        },
        {
          id: 'eid',
          title: 'Eid al-Adha',
          subtitle: '10 Dhul-Hijjah · Stoning & sacrifice',
          icon: 'gift',
          accent: '#ff8b8b',
          status: hajjDays ? sToStatus(hajjDays.eid) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.eid) : '10 Dhul-Hijjah',
          details: [
            { label: 'Date', value: hajjDays ? formatDate(hajjDays.eid) : '10 Dhul-Hijjah' },
            { label: 'Stoning', value: '7 pebbles at Jamarat al-Aqabah' },
            { label: 'Sacrifice', value: 'Hady (animal sacrifice)' },
            { label: 'Then', value: 'Halq · Tawaf al-Ifadah · Sa\'i' },
          ],
        },
        {
          id: 'tashreeq',
          title: 'Ayam al-Tashreeq',
          subtitle: '11–13 Dhul-Hijjah · Stone the Jamarat',
          icon: 'ellipsis-horizontal-circle',
          accent: '#f0c674',
          status: hajjDays ? sToStatus(hajjDays.tashreeq1, hajjDays.tashreeq3) : 'upcoming',
          date: hajjDays ? formatDate(hajjDays.tashreeq1) : '11–13 Dhul-Hijjah',
          details: [
            { label: 'Day 11', value: hajjDays ? formatDate(hajjDays.tashreeq1) : '11 Dhul-Hijjah' },
            { label: 'Day 12', value: hajjDays ? formatDate(hajjDays.tashreeq2) : '12 Dhul-Hijjah' },
            { label: 'Day 13', value: hajjDays ? formatDate(hajjDays.tashreeq3) : '13 Dhul-Hijjah' },
            { label: 'Daily', value: '21 pebbles · 7 at each Jamarat' },
          ],
        },
        {
          id: 'wada',
          title: 'Tawaf al-Wada',
          subtitle: 'Farewell tawaf before leaving Makkah',
          icon: 'refresh-circle',
          accent: '#9be8c5',
          status: hajjDays ? sToStatus(hajjDays.tashreeq3, hotel1?.checkOut) : 'upcoming',
          details: [
            { label: 'After', value: hajjDays ? formatDate(hajjDays.tashreeq3) : '13 Dhul-Hijjah' },
            { label: 'Hotel', value: hotel1?.name || '—' },
            { label: 'Check-out', value: formatDate(hotel1?.checkOut) },
            { label: 'Ritual', value: 'Tawaf al-Wada (farewell)' },
          ],
        },
      ]
    : [];

  const madinahPhase: Step[] = madinahHotel?.name
    ? [
        ...(!madinahFirst ? [{
          id: 'travel-madinah',
          title: `Travel to ${madinahHotel.city || 'Madinah'}`,
          subtitle: itinerary.transportation || 'Package transportation',
          icon: 'car' as const,
          accent: '#7eb6ff',
          status: sToStatus(madinahHotel.checkIn),
          date: madinahHotel.checkIn ? formatDate(madinahHotel.checkIn) : undefined,
          details: [
            { label: 'Date', value: formatDate(madinahHotel.checkIn) },
            { label: 'Transport', value: itinerary.transportation || '—' },
            { label: 'To', value: madinahHotel.city || '—' },
          ],
        } satisfies Step] : []),
        {
          id: 'hotel-madinah',
          title: `Stay in ${madinahHotel.city || 'Madinah'}`,
          subtitle: madinahHotel.name,
          icon: 'moon',
          accent: '#a8c8ff',
          status: sToStatus(madinahHotel.checkIn, madinahHotel.checkOut),
          date: madinahHotel.checkIn ? formatDate(madinahHotel.checkIn) : undefined,
          details: [
            { label: 'Hotel', value: madinahHotel.name },
            { label: 'City', value: madinahHotel.city || '—' },
            { label: 'Check-in', value: formatDate(madinahHotel.checkIn) },
            { label: 'Check-out', value: formatDate(madinahHotel.checkOut) },
          ],
        },
        {
          id: 'masjid-nabawi',
          title: 'Visit Masjid an-Nabawi',
          subtitle: 'Pray · Greet the Prophet ﷺ · Rawdah',
          icon: 'rose',
          accent: '#9be8c5',
          status: sToStatus(madinahHotel.checkIn, madinahHotel.checkOut),
          details: [
            { label: 'Greet', value: 'Salam to the Prophet ﷺ' },
            { label: 'Visit', value: 'Abu Bakr & Umar (RA)' },
            { label: 'Rawdah', value: 'Pray in the Garden if possible' },
            { label: 'Reward', value: '1,000× prayers' },
          ],
        },
      ]
    : [];

  const returnPhase: Step[] = [
    {
      id: 'depart-saudi',
      title: 'Departure from Saudi',
      subtitle: ret?.departureAirport || ret?.departureCity || 'Saudi airport',
      icon: 'airplane',
      accent: Palette.gold,
      status: sToStatus(ret?.departureDate),
      date: ret?.departureDate ? formatDate(ret.departureDate) : undefined,
      details: [
        { label: 'Date', value: formatDate(ret?.departureDate) },
        { label: 'Time', value: ret?.departureTime || '—' },
        { label: 'Flight', value: ret?.flightNumbers?.[0] || '—' },
        { label: 'Airport', value: ret?.departureAirport || '—' },
      ],
    },
    ...(ret?.stopoverCity
      ? [
          {
            id: 'layover-ret',
            title: `Layover · ${ret.stopoverCity}`,
            subtitle: ret.layoverDuration || 'Connecting flight',
            icon: 'swap-horizontal' as const,
            accent: '#7eb6ff',
            status: sToStatus(ret.departureDate, ret.arrivalDate),
            details: [
              { label: 'Stopover', value: ret.stopoverCity },
              { label: 'Wait', value: ret.layoverDuration || '—' },
              { label: 'Connecting', value: ret.flightNumbers?.[1] || '—' },
              { label: 'Airline', value: ret.airline || '—' },
            ],
          } satisfies Step,
        ]
      : []),
    {
      id: 'arrive-home',
      title: 'Arrival Home',
      subtitle: ret?.arrivalCity || 'Home city',
      icon: 'home',
      accent: '#9be8c5',
      status: sToStatus(ret?.arrivalDate),
      date: ret?.arrivalDate ? formatDate(ret.arrivalDate) : undefined,
      details: [
        { label: 'Date', value: formatDate(ret?.arrivalDate) },
        { label: 'Time', value: ret?.arrivalTime || '—' },
        { label: 'Flight', value: ret?.flightNumbers?.join(' / ') || '—' },
      ],
    },
  ];

  // Build phase ordering based on the route
  const makkahPhaseEntry: Phase = {
    id: 'makkah',
    label: tripType === 'hajj' ? 'Makkah · Umrah Tamattu' : 'Makkah · Umrah',
    steps: makkahPhase,
  };
  const madinahPhaseEntry: Phase | null = madinahPhase.length
    ? { id: 'madinah', label: 'Madinah · Ziyarah', steps: madinahPhase }
    : null;

  const phases: Phase[] = [
    { id: 'travel-out', label: 'Pre-Trip & Travel', steps: preTrip },
    // When madinahFirst, show Madinah before Makkah
    ...(tripType === 'umrah' && madinahFirst
      ? [
          ...(madinahPhaseEntry ? [madinahPhaseEntry] : []),
          makkahPhaseEntry,
        ]
      : [
          makkahPhaseEntry,
          ...(tripType === 'hajj'
            ? [{ id: 'hajj', label: 'Hajj Rituals', steps: hajjRites } as Phase]
            : []),
          ...(madinahPhaseEntry ? [madinahPhaseEntry] : []),
        ]),
    { id: 'return', label: 'Return Home', steps: returnPhase },
  ];

  return { tripType, phases };
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function JourneyTab() {
  const { itinerary } = useItinerary();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const built = useMemo(() => (itinerary ? buildSteps(itinerary) : null), [itinerary]);

  if (!itinerary || !built) return null;

  const { tripType, phases } = built;
  const allSteps = phases.flatMap((p) => p.steps);
  const done = allSteps.filter((s) => s.status === 'done').length;
  const nextStep =
    allSteps.find((s) => s.status === 'active') ??
    allSteps.find((s) => s.status === 'upcoming');

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <ProgressHero
            tripType={tripType}
            pilgrim={itinerary.pilgrim?.name || ''}
            done={done}
            total={allSteps.length}
            nextStep={nextStep}
          />

          {phases.map((phase) => {
            const phaseDone = phase.steps.filter((st) => st.status === 'done').length;
            return (
              <View key={phase.id}>
                <PhaseHeader phase={phase} doneCount={phaseDone} />
                {phase.steps.map((step, i) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    isFirst={i === 0}
                    isLast={i === phase.steps.length - 1}
                  />
                ))}
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 },
});

const hero = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.gold,
    marginRight: 8,
  },
  eyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.4,
    color: Palette.gold,
  },
  title: {
    fontFamily: RawafFonts.display,
    fontSize: 34,
    color: Palette.textPrimary,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  progressTextMuted: {
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textMuted,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  nextIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Palette.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextLabel: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.6,
    color: Palette.gold,
    marginBottom: 2,
  },
  nextTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  nextDate: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.textSecondary,
    marginLeft: 8,
  },
  pilgrim: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 12,
    letterSpacing: 0.4,
  },
});

const ph = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  line: { flex: 1, height: 1, backgroundColor: Palette.border },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  label: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: Palette.textSecondary,
  },
  count: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 10,
    color: Palette.textMuted,
    marginLeft: 8,
  },
});

const NODE = 36;

const card = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: 80 },
  rail: {
    width: NODE + 8,
    alignItems: 'center',
    position: 'relative',
  },
  railLineTop: {
    position: 'absolute',
    width: 2,
    top: 0,
    height: 22,
    left: (NODE + 8) / 2 - 1,
  },
  railLineBottom: {
    position: 'absolute',
    width: 2,
    top: 22 + NODE,
    bottom: 0,
    left: (NODE + 8) / 2 - 1,
  },
  nodeOuter: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    zIndex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  cardActive: {
    borderColor: Palette.goldBorder,
    backgroundColor: Palette.cardBgLight,
    shadowColor: Palette.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  cardDone: { opacity: 0.78 },
  head: { flexDirection: 'row', alignItems: 'center' },
  title: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  nowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Palette.goldMuted,
    marginLeft: 8,
  },
  nowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.gold,
    marginRight: 5,
  },
  nowText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: Palette.gold,
  },
  dateText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 11,
    color: Palette.textMuted,
    marginLeft: 8,
    maxWidth: width * 0.28,
    textAlign: 'right',
  },
  body: { overflow: 'hidden' },
  bodyInner: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  detailLabel: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    flex: 0.4,
  },
  detailValue: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 13,
    color: Palette.textPrimary,
    flex: 0.6,
    textAlign: 'right',
  },
});
