import EditableField from '@/components/editable-field';
import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { formatDate, formatDay } from '@/lib/date-helpers';
import type { Flight } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function extractCode(city?: string): string {
  if (!city) return '—';
  const match = city.match(/\(([A-Z]{3})\)/);
  if (match) return match[1];
  return city.substring(0, 3).toUpperCase();
}

function BoardingPassCard({
  flight,
  type,
  prefix,
  pilgrimName,
}: {
  flight: Flight;
  type: 'outbound' | 'return';
  prefix: string;
  pilgrimName: string;
}) {
  return (
    <View style={styles.boardingPass}>
      <View style={styles.passHeader}>
        <View style={styles.passTypeBadge}>
          <Text style={styles.passTypeText}>{type === 'outbound' ? 'OUTBOUND' : 'RETURN'}</Text>
        </View>
        <View style={styles.confirmedBadge}>
          <Ionicons name="checkmark-circle" size={14} color={Palette.green} />
          <Text style={styles.confirmedText}>Confirmed</Text>
        </View>
      </View>

      <View style={styles.airlineRow}>
        <View style={styles.airlineLogo}>
          <Ionicons name="airplane" size={20} color={Palette.gold} />
        </View>
        <View>
          <EditableField
            value={flight.airline}
            path={`flights.${prefix}.airline`}
            textStyle={styles.airlineName}
          />
          <Text style={styles.flightNums}>
            {flight.flightNumbers?.join(' → ') || '—'}
          </Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <Text style={styles.cityCode}>{extractCode(flight.departureCity)}</Text>
          <Text style={styles.cityName} numberOfLines={1}>
            {flight.departureCity || '—'}
          </Text>
          <Text style={styles.dateText}>
            {formatDay(flight.departureDate)} {formatDate(flight.departureDate)}
          </Text>
          <Text style={styles.timeText}>{flight.departureTime || '—'}</Text>
        </View>

        <View style={styles.routeMiddle}>
          <View style={styles.routeLine}>
            <View style={styles.routeDotStart} />
            <View style={styles.routeDash} />
            <Ionicons
              name="airplane"
              size={14}
              color={Palette.gold}
              style={{ transform: [{ rotate: '90deg' }] }}
            />
            <View style={styles.routeDash} />
            <View style={styles.routeDotEnd} />
          </View>
          <Text style={styles.directText}>
            {flight.flightNumbers?.length > 1 ? `${flight.flightNumbers.length} legs` : 'Direct'}
          </Text>
        </View>

        <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
          <Text style={styles.cityCode}>{extractCode(flight.arrivalCity)}</Text>
          <Text style={styles.cityName} numberOfLines={1}>
            {flight.arrivalCity || '—'}
          </Text>
          <Text style={styles.dateText}>
            {formatDay(flight.arrivalDate)} {formatDate(flight.arrivalDate)}
          </Text>
          <Text style={styles.timeText}>{flight.arrivalTime || '—'}</Text>
        </View>
      </View>

      {flight.stopoverCity ? (
        <View style={styles.stopoverPill}>
          <Ionicons name="time-outline" size={12} color={Palette.orange} />
          <Text style={styles.stopoverText}>
            {flight.stopoverCity} · {flight.layoverDuration || '—'} layover
          </Text>
        </View>
      ) : null}

      <View style={styles.tearLine}>
        <View style={styles.tearCircleLeft} />
        <View style={styles.tearDash} />
        <View style={styles.tearCircleRight} />
      </View>

      <View style={styles.passBottom}>
        <View style={styles.passField}>
          <Text style={styles.passLabel}>PASSENGER</Text>
          <Text style={styles.passValue}>{pilgrimName.toUpperCase()}</Text>
        </View>
        <View style={styles.passField}>
          <Text style={styles.passLabel}>BOOKING REF</Text>
          <EditableField
            value={flight.bookingRef}
            path={`flights.${prefix}.bookingRef`}
            textStyle={styles.passValueGold}
          />
        </View>
      </View>

      <View style={styles.barcode}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.barcodeBar,
              {
                width: i % 2 === 0 ? 3 : 1.5,
                opacity: 0.15 + (i % 5) * 0.05,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function FlightsTab() {
  const { itinerary } = useItinerary();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  if (!itinerary) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Your Flights</Text>
          <Text style={styles.screenSubtitle}>
            {itinerary.flights?.outbound?.airline || 'Airline'} · Round trip
          </Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <BoardingPassCard
            flight={itinerary.flights.outbound}
            type="outbound"
            prefix="outbound"
            pilgrimName={itinerary.pilgrim?.name || ''}
          />

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Ionicons name="swap-vertical" size={20} color={Palette.textMuted} />
            <View style={styles.separatorLine} />
          </View>

          <BoardingPassCard
            flight={itinerary.flights.return}
            type="return"
            prefix="return"
            pilgrimName={itinerary.pilgrim?.name || ''}
          />
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
  headerSection: { marginBottom: 24, paddingRight: 56 },
  screenTitle: { fontFamily: RawafFonts.display, fontSize: 34, color: Palette.textPrimary, lineHeight: 40 },
  screenSubtitle: { fontFamily: RawafFonts.body, fontSize: 13, color: Palette.textSecondary, marginTop: 4 },
  boardingPass: {
    backgroundColor: Palette.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
    overflow: 'hidden',
  },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  passTypeBadge: {
    backgroundColor: Palette.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  passTypeText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.5,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greenMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confirmedText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 11,
    color: Palette.green,
    marginLeft: 4,
  },
  airlineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  airlineLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  airlineName: { fontFamily: RawafFonts.bodySemiBold, fontSize: 16, color: Palette.textPrimary },
  flightNums: { fontFamily: RawafFonts.body, fontSize: 12, color: Palette.textSecondary, marginTop: 1 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  routePoint: { flex: 1 },
  routeMiddle: { alignItems: 'center', paddingTop: 8, paddingHorizontal: 8 },
  routeLine: { flexDirection: 'row', alignItems: 'center' },
  routeDotStart: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.gold },
  routeDash: { width: 16, height: 1, backgroundColor: Palette.goldLight, marginHorizontal: 2 },
  routeDotEnd: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Palette.gold,
  },
  directText: { fontFamily: RawafFonts.body, fontSize: 10, color: Palette.textMuted, marginTop: 4 },
  cityCode: { fontFamily: RawafFonts.display, fontSize: 28, color: Palette.textPrimary },
  cityName: { fontFamily: RawafFonts.body, fontSize: 11, color: Palette.textSecondary, marginTop: -2 },
  dateText: { fontFamily: RawafFonts.body, fontSize: 11, color: Palette.textMuted, marginTop: 8 },
  timeText: { fontFamily: RawafFonts.bodySemiBold, fontSize: 18, color: Palette.textPrimary, marginTop: 2 },
  stopoverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Palette.orangeMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  stopoverText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.orange,
    marginLeft: 6,
  },
  tearLine: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  tearCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.background,
    marginLeft: -30,
  },
  tearDash: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  tearCircleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.background,
    marginRight: -30,
  },
  passBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  passField: { flex: 1 },
  passLabel: {
    fontFamily: RawafFonts.body,
    fontSize: 9,
    color: Palette.textMuted,
    letterSpacing: 1,
    marginBottom: 3,
  },
  passValue: { fontFamily: RawafFonts.bodySemiBold, fontSize: 13, color: Palette.textPrimary },
  passValueGold: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.gold,
    letterSpacing: 1,
  },
  barcode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 16,
    height: 30,
  },
  barcodeBar: {
    height: '100%',
    backgroundColor: Palette.textSecondary,
    marginHorizontal: 0.5,
    borderRadius: 0.5,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  separatorLine: { width: 30, height: 1, backgroundColor: Palette.border, marginHorizontal: 10 },
});
