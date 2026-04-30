import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { formatDate, getStepStatus } from '@/lib/date-helpers';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Step {
  title: string;
  subtitle: string;
  status: 'done' | 'active' | 'upcoming';
  details: { label: string; value: string }[];
}

function TimelineStep({ step, index, isLast }: { step: Step; index: number; isLast: boolean }) {
  const [expanded, setExpanded] = useState(step.status === 'active');
  const expandAnim = useRef(new Animated.Value(step.status === 'active' ? 1 : 0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (step.status === 'active') {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        ])
      );
      glow.start();
      return () => glow.stop();
    }
  }, [step.status, glowAnim]);

  const toggle = () => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 0 : 1,
      tension: 40,
      friction: 10,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const dotColor =
    step.status === 'done' ? Palette.green : step.status === 'active' ? Palette.gold : Palette.textMuted;
  const dotSize = step.status === 'active' ? 14 : 10;

  return (
    <View style={styles.stepRow}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.timelineLine,
            index === 0 && { top: '50%' },
            isLast && { height: '50%' },
            { backgroundColor: step.status === 'done' ? Palette.green : Palette.border },
          ]}
        />
        {step.status === 'active' ? (
          <Animated.View
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
                opacity: glowAnim,
                shadowColor: Palette.gold,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
                elevation: 6,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
              },
            ]}
          />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.stepCard,
          step.status === 'active' && styles.stepCardActive,
          step.status === 'done' && styles.stepCardDone,
        ]}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={styles.stepHeader}>
          <View style={styles.stepNumBadge}>
            <Text style={styles.stepNum}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={[
                styles.stepTitle,
                step.status === 'done' && { color: Palette.textSecondary },
              ]}
            >
              {step.title}
            </Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
          </View>
          {step.status === 'done' && (
            <Ionicons name="checkmark-circle" size={20} color={Palette.green} />
          )}
          {step.status === 'active' && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>NOW</Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Palette.textMuted}
            style={{ marginLeft: 8 }}
          />
        </View>

        <Animated.View
          style={[
            styles.stepDetail,
            {
              maxHeight: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }),
              opacity: expandAnim,
            },
          ]}
        >
          <View style={styles.detailContent}>
            {step.details.map((detail, i) => (
              <View key={i} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

export default function JourneyTab() {
  const { itinerary } = useItinerary();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  if (!itinerary) return null;

  const outbound = itinerary.flights?.outbound;
  const returnFlight = itinerary.flights?.return;
  const hotel1 = itinerary.hotels?.hotel1;
  const hotel2 = itinerary.hotels?.hotel2;

  const steps: Step[] = [
    {
      title: 'Departure from Home',
      subtitle: outbound?.departureCity || 'Origin city',
      status: getStepStatus(outbound?.departureDate),
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
            title: `Layover in ${outbound.stopoverCity}`,
            subtitle: `${outbound.layoverDuration || ''} wait time`,
            status: getStepStatus(outbound.departureDate, outbound.arrivalDate),
            details: [
              { label: 'Stopover', value: outbound.stopoverCity },
              { label: 'Wait time', value: outbound.layoverDuration || '—' },
              { label: 'Connecting', value: outbound.flightNumbers?.[1] || '—' },
              { label: 'Airline', value: outbound.airline || '—' },
            ],
          } as Step,
        ]
      : []),
    {
      title: 'Arrival in Saudi Arabia',
      subtitle: outbound?.arrivalAirport || outbound?.arrivalCity || 'Arrival',
      status: getStepStatus(outbound?.arrivalDate),
      details: [
        { label: 'Date', value: formatDate(outbound?.arrivalDate) },
        { label: 'Time', value: outbound?.arrivalTime || '—' },
        { label: 'Airport', value: outbound?.arrivalAirport || '—' },
        { label: 'Transfer', value: itinerary.transportation || '—' },
      ],
    },
    {
      title: `Hotel in ${hotel1?.city || 'Makkah'}`,
      subtitle: hotel1?.name || 'First accommodation',
      status: getStepStatus(hotel1?.checkIn, hotel1?.checkOut),
      details: [
        { label: 'Hotel', value: hotel1?.name || '—' },
        { label: 'Check-in', value: formatDate(hotel1?.checkIn) },
        { label: 'Check-out', value: formatDate(hotel1?.checkOut) },
        { label: 'City', value: hotel1?.city || '—' },
      ],
    },
    {
      title: 'Mina Camp — Hajj Rituals',
      subtitle: itinerary.camp?.name || 'Camp assignment',
      status: getStepStatus(hotel1?.checkOut, hotel2?.checkIn),
      details: [
        { label: 'Camp', value: itinerary.camp?.name || '—' },
        { label: 'Start', value: formatDate(hotel1?.checkOut) },
        { label: 'End', value: formatDate(hotel2?.checkIn) },
        { label: 'Guide', value: itinerary.guide?.name || '—' },
      ],
    },
    {
      title: `Hotel in ${hotel2?.city || 'Madinah'}`,
      subtitle: hotel2?.name || 'Second accommodation',
      status: getStepStatus(hotel2?.checkIn, hotel2?.checkOut),
      details: [
        { label: 'Hotel', value: hotel2?.name || '—' },
        { label: 'Check-in', value: formatDate(hotel2?.checkIn) },
        { label: 'Check-out', value: formatDate(hotel2?.checkOut) },
        { label: 'City', value: hotel2?.city || '—' },
      ],
    },
    {
      title: 'Departure from Saudi',
      subtitle: returnFlight?.departureAirport || returnFlight?.departureCity || 'Saudi airport',
      status: getStepStatus(returnFlight?.departureDate),
      details: [
        { label: 'Date', value: formatDate(returnFlight?.departureDate) },
        { label: 'Time', value: returnFlight?.departureTime || '—' },
        { label: 'Flight', value: returnFlight?.flightNumbers?.[0] || '—' },
        { label: 'Airport', value: returnFlight?.departureAirport || '—' },
      ],
    },
    ...(returnFlight?.stopoverCity
      ? [
          {
            title: `Layover in ${returnFlight.stopoverCity}`,
            subtitle: `${returnFlight.layoverDuration || ''} wait time`,
            status: getStepStatus(returnFlight.departureDate, returnFlight.arrivalDate),
            details: [
              { label: 'Stopover', value: returnFlight.stopoverCity },
              { label: 'Wait time', value: returnFlight.layoverDuration || '—' },
              { label: 'Connecting', value: returnFlight.flightNumbers?.[1] || '—' },
              { label: 'Airline', value: returnFlight.airline || '—' },
            ],
          } as Step,
        ]
      : []),
    {
      title: 'Arrival Home',
      subtitle: returnFlight?.arrivalCity || 'Home city',
      status: getStepStatus(returnFlight?.arrivalDate),
      details: [
        { label: 'Date', value: formatDate(returnFlight?.arrivalDate) },
        { label: 'Time', value: returnFlight?.arrivalTime || '—' },
        { label: 'Flight', value: returnFlight?.flightNumbers?.join(' / ') || '—' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Your Journey</Text>
          <Text style={styles.screenSubtitle}>
            {steps.filter((s) => s.status === 'done').length} of {steps.length} steps completed
          </Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {steps.map((step, idx) => (
            <TimelineStep key={idx} step={step} index={idx} isLast={idx === steps.length - 1} />
          ))}
        </Animated.View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 30,
  },
  headerSection: { marginBottom: 20, paddingRight: 56 },
  screenTitle: { fontFamily: RawafFonts.display, fontSize: 34, color: Palette.textPrimary, lineHeight: 40 },
  screenSubtitle: { fontFamily: RawafFonts.body, fontSize: 13, color: Palette.textSecondary, marginTop: 4 },
  stepRow: { flexDirection: 'row', marginBottom: 4 },
  timeline: { width: 30, alignItems: 'center', position: 'relative' },
  timelineLine: {
    position: 'absolute',
    width: 2,
    top: 0,
    bottom: 0,
    backgroundColor: Palette.border,
  },
  dot: { marginTop: 22, zIndex: 1 },
  stepCard: {
    flex: 1,
    backgroundColor: Palette.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  stepCardActive: { borderColor: Palette.goldBorder, backgroundColor: Palette.cardBgLight },
  stepCardDone: { opacity: 0.7 },
  stepHeader: { flexDirection: 'row', alignItems: 'center' },
  stepNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(201,168,76,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: { fontFamily: RawafFonts.bodySemiBold, fontSize: 11, color: Palette.gold },
  stepTitle: { fontFamily: RawafFonts.bodySemiBold, fontSize: 15, color: Palette.textPrimary },
  stepSubtitle: { fontFamily: RawafFonts.body, fontSize: 12, color: Palette.textSecondary, marginTop: 1 },
  activeBadge: {
    backgroundColor: Palette.goldMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    color: Palette.gold,
    letterSpacing: 1,
  },
  stepDetail: { overflow: 'hidden' },
  detailContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    marginTop: 12,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  detailLabel: { fontFamily: RawafFonts.body, fontSize: 12, color: Palette.textSecondary },
  detailValue: { fontFamily: RawafFonts.bodyMedium, fontSize: 13, color: Palette.textPrimary },
});
