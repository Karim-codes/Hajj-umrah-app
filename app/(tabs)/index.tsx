import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { daysBetween, daysUntil, formatDateShort, getCurrentStay } from '@/lib/date-helpers';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeTab() {
  const router = useRouter();
  const { itinerary } = useItinerary();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const visaPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(visaPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(visaPulse, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeAnim, visaPulse]);

  useEffect(() => {
    if (!itinerary) router.replace('/');
  }, [itinerary, router]);

  if (!itinerary) return null;

  const departureDate = itinerary.flights?.outbound?.departureDate;
  const returnDate = itinerary.flights?.return?.arrivalDate;
  const daysLeft = daysUntil(departureDate);
  const tripDays = daysBetween(departureDate, returnDate);
  const currentHotel = getCurrentStay(itinerary.hotels);

  const callGuide = () => {
    const phone = itinerary.guide?.phone || '';
    if (phone) Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* iOS-style large title header */}
        <View style={styles.headerBlock}>
          <Text style={styles.greeting}>As-salamu alaykum</Text>
          <Text style={styles.greetingName}>{itinerary.pilgrim?.name?.split(' ')[0] || 'Pilgrim'}</Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* HERO CARD — premium boarding-pass-meets-passport */}
          <LinearGradient
            colors={['#1e2d52', '#1a2545', '#162038']}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroBrand}>RAWAF</Text>
                <Text style={styles.heroBrandSub}>HAJJ ITINERARY</Text>
              </View>
              <View style={styles.packagePill}>
                <Text style={styles.packagePillNum}>{itinerary.pilgrim?.packageNumber}</Text>
                <Text style={styles.packagePillName}>{itinerary.pilgrim?.packageName}</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <Text style={styles.heroLabel}>PILGRIM</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {itinerary.pilgrim?.name}
            </Text>

            <View style={styles.heroRoute}>
              <View style={styles.heroRouteSide}>
                <Text style={styles.heroRouteCity}>LHR</Text>
                <Text style={styles.heroRouteDate}>{formatDateShort(departureDate)}</Text>
              </View>
              <View style={styles.heroRouteMiddle}>
                <View style={styles.heroRouteLine}>
                  <View style={styles.heroRouteDot} />
                  <View style={styles.heroRouteDash} />
                  <Ionicons name="airplane" size={14} color={Palette.gold} style={{ transform: [{ rotate: '90deg' }] }} />
                  <View style={styles.heroRouteDash} />
                  <View style={[styles.heroRouteDot, styles.heroRouteDotEnd]} />
                </View>
                <Text style={styles.heroRouteDuration}>{tripDays || '—'} DAYS</Text>
              </View>
              <View style={[styles.heroRouteSide, { alignItems: 'flex-end' }]}>
                <Text style={styles.heroRouteCity}>JED</Text>
                <Text style={styles.heroRouteDate}>{formatDateShort(returnDate)}</Text>
              </View>
            </View>

            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.heroBottomLabel}>FLIGHT</Text>
                <Text style={styles.heroBottomValue}>
                  {itinerary.flights?.outbound?.flightNumbers?.[0] || '—'}
                </Text>
              </View>
              <View>
                <Text style={styles.heroBottomLabel}>SEAT</Text>
                <Text style={styles.heroBottomValue}>—</Text>
              </View>
              <View>
                <Text style={styles.heroBottomLabel}>BOOKING</Text>
                <Text style={[styles.heroBottomValue, { color: Palette.gold }]}>
                  {itinerary.flights?.outbound?.bookingRef || '—'}
                </Text>
              </View>
            </View>

            {/* Decorative corners */}
            <View style={[styles.heroCorner, { top: 12, left: 12 }]} />
            <View style={[styles.heroCorner, { top: 12, right: 12, transform: [{ rotate: '90deg' }] }]} />
            <View style={[styles.heroCorner, { bottom: 12, left: 12, transform: [{ rotate: '270deg' }] }]} />
            <View style={[styles.heroCorner, { bottom: 12, right: 12, transform: [{ rotate: '180deg' }] }]} />

            <Text style={styles.heroWatermark}>RAWAF</Text>
          </LinearGradient>

          {/* Visa status row */}
          <View style={styles.statusRow}>
            <Animated.View style={[styles.statusDot, { opacity: visaPulse }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Hajj Visa</Text>
              <Text style={styles.statusValue}>{itinerary.visa?.visaStatus || 'Pending'}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Palette.green} />
              <Text style={styles.statusBadgeText}>Verified</Text>
            </View>
          </View>

          {/* Hajj Guide entry — day-by-day rites */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/hajj-guide')}
            style={{ marginBottom: 8 }}
          >
            <LinearGradient
              colors={['rgba(201,168,76,0.22)', 'rgba(201,168,76,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.guideCard}
            >
              <View style={styles.guideIcon}>
                <Ionicons name="compass" size={24} color={Palette.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideEyebrow}>HAJJ GUIDE</Text>
                <Text style={styles.guideTitle}>Your day-by-day journey</Text>
                <Text style={styles.guideSub}>
                  Day 8 Mina · Arafah · Muzdalifah · Stoning · Tawaf
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Palette.gold} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Today's Stay / Next Stay — iOS list-style row */}
          <Text style={styles.sectionTitle}>{currentHotel ? "Today's stay" : 'Next stay'}</Text>
          <View style={styles.listCard}>
            <View style={styles.listRow}>
              <View style={styles.listIcon}>
                <Ionicons name="bed" size={20} color={Palette.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>
                  {currentHotel?.name || itinerary.hotels?.hotel1?.name || 'Hotel details'}
                </Text>
                <Text style={styles.listSubtitle}>
                  {currentHotel?.city || itinerary.hotels?.hotel1?.city || ''}
                  {' · '}
                  {formatDateShort(currentHotel?.checkIn || itinerary.hotels?.hotel1?.checkIn)}
                  {' → '}
                  {formatDateShort(currentHotel?.checkOut || itinerary.hotels?.hotel1?.checkOut)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
            </View>
          </View>

          {/* Countdown */}
          {daysLeft !== null && daysLeft > 0 && (
            <LinearGradient
              colors={['rgba(201,168,76,0.12)', 'rgba(201,168,76,0.04)']}
              style={styles.countdownCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View>
                <Text style={styles.countdownLabel}>DEPARTURE IN</Text>
                <View style={styles.countdownNumbers}>
                  <Text style={styles.countdownBig}>{daysLeft}</Text>
                  <Text style={styles.countdownUnit}>days</Text>
                </View>
                <Text style={styles.countdownDate}>
                  {formatDateShort(departureDate)} · {itinerary.flights?.outbound?.departureTime}
                </Text>
              </View>
              <View style={styles.countdownIcon}>
                <Text style={{ fontSize: 44 }}>✈️</Text>
              </View>
            </LinearGradient>
          )}

          {daysLeft !== null && daysLeft <= 0 && tripDays !== null && daysLeft > -tripDays && (
            <LinearGradient
              colors={['rgba(46,204,135,0.15)', 'rgba(46,204,135,0.04)']}
              style={[styles.countdownCard, { borderColor: 'rgba(46,204,135,0.3)' }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View>
                <Text style={[styles.countdownLabel, { color: Palette.green }]}>YOUR HAJJ</Text>
                <Text style={styles.countdownUnit}>Is underway 🤲</Text>
              </View>
              <View style={styles.countdownIcon}>
                <Text style={{ fontSize: 44 }}>🕋</Text>
              </View>
            </LinearGradient>
          )}

          {/* Contacts list — iOS Settings-style grouped list */}
          <Text style={styles.sectionTitle}>Contacts</Text>
          <View style={styles.listCard}>
            <TouchableOpacity style={styles.listRow} onPress={callGuide} activeOpacity={0.6}>
              <View style={styles.listIcon}>
                <Ionicons name="person" size={20} color={Palette.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{itinerary.guide?.name || 'Your Guide'}</Text>
                <Text style={styles.listSubtitle}>{itinerary.guide?.phone || ''}</Text>
              </View>
              <View style={styles.callPill}>
                <Ionicons name="call" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.listSeparator} />

            <View style={styles.listRow}>
              <View style={[styles.listIcon, { backgroundColor: 'rgba(46,204,135,0.15)' }]}>
                <Ionicons name="flag" size={20} color={Palette.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>Mina Camp</Text>
                <Text style={styles.listSubtitle}>{itinerary.camp?.name || ''}</Text>
              </View>
            </View>

            <View style={styles.listSeparator} />

            <View style={styles.listRow}>
              <View style={[styles.listIcon, { backgroundColor: 'rgba(240,165,80,0.15)' }]}>
                <Ionicons name="bus" size={20} color={Palette.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>Transportation</Text>
                <Text style={styles.listSubtitle}>{itinerary.transportation || '—'}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 30 },

  // iOS-style header
  headerBlock: { marginBottom: 20, paddingRight: 56 },
  greeting: { fontFamily: RawafFonts.body, fontSize: 14, color: Palette.textSecondary },
  greetingName: {
    fontFamily: RawafFonts.display,
    fontSize: 34,
    color: Palette.textPrimary,
    lineHeight: 40,
    marginTop: 2,
  },

  // HERO CARD
  heroCard: {
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroBrand: { fontFamily: RawafFonts.display, fontSize: 22, color: Palette.gold, letterSpacing: 4 },
  heroBrandSub: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 9,
    color: Palette.textSecondary,
    letterSpacing: 2,
    marginTop: -2,
  },
  packagePill: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    alignItems: 'center',
  },
  packagePillNum: { fontFamily: RawafFonts.display, fontSize: 18, color: Palette.gold, lineHeight: 20 },
  packagePillName: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 9,
    color: Palette.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroDivider: { height: 1, backgroundColor: 'rgba(201,168,76,0.15)', marginVertical: 18 },
  heroLabel: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 9,
    color: Palette.textMuted,
    letterSpacing: 1.5,
  },
  heroName: {
    fontFamily: RawafFonts.display,
    fontSize: 26,
    color: Palette.textPrimary,
    marginTop: 2,
    marginBottom: 18,
  },

  // Route
  heroRoute: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  heroRouteSide: { flex: 1 },
  heroRouteCity: { fontFamily: RawafFonts.display, fontSize: 28, color: Palette.textPrimary, lineHeight: 32 },
  heroRouteDate: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  heroRouteMiddle: { alignItems: 'center', paddingHorizontal: 8 },
  heroRouteLine: { flexDirection: 'row', alignItems: 'center' },
  heroRouteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.gold },
  heroRouteDotEnd: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Palette.gold },
  heroRouteDash: { width: 14, height: 1, backgroundColor: 'rgba(201,168,76,0.4)', marginHorizontal: 2 },
  heroRouteDuration: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    color: Palette.gold,
    letterSpacing: 1.5,
    marginTop: 4,
  },

  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  heroBottomLabel: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 9,
    color: Palette.textMuted,
    letterSpacing: 1,
  },
  heroBottomValue: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
    marginTop: 3,
  },
  heroCorner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.4)',
  },
  heroWatermark: {
    position: 'absolute',
    right: -10,
    bottom: 60,
    fontFamily: RawafFonts.display,
    fontSize: 90,
    color: 'rgba(201,168,76,0.025)',
    letterSpacing: 8,
    transform: [{ rotate: '-15deg' }],
  },

  // Visa status row (iOS style)
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 14,
    paddingLeft: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(46,204,135,0.2)',
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    marginBottom: 16,
  },
  guideIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(201,168,76,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideEyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.4,
  },
  guideTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 19,
    color: Palette.textPrimary,
    marginTop: 1,
    lineHeight: 22,
  },
  guideSub: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.green,
    marginRight: 12,
    shadowColor: Palette.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  statusTitle: { fontFamily: RawafFonts.body, fontSize: 11, color: Palette.textSecondary },
  statusValue: { fontFamily: RawafFonts.bodySemiBold, fontSize: 15, color: Palette.green, marginTop: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46,204,135,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 11,
    color: Palette.green,
    marginLeft: 4,
  },

  // iOS-style section title
  sectionTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 12,
    color: Palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  // iOS-style grouped list card
  listCard: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Palette.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listTitle: { fontFamily: RawafFonts.bodySemiBold, fontSize: 15, color: Palette.textPrimary },
  listSubtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  listSeparator: {
    height: 1,
    backgroundColor: Palette.border,
    marginLeft: 62,
  },
  callPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.green,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Countdown
  countdownCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    marginBottom: 22,
  },
  countdownLabel: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  countdownNumbers: { flexDirection: 'row', alignItems: 'baseline' },
  countdownBig: {
    fontFamily: RawafFonts.display,
    fontSize: 56,
    color: Palette.textPrimary,
    lineHeight: 60,
  },
  countdownUnit: {
    fontFamily: RawafFonts.body,
    fontSize: 16,
    color: Palette.textSecondary,
    marginLeft: 8,
  },
  countdownDate: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 6,
  },
  countdownIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(201,168,76,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
