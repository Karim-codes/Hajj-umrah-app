import EditableField from '@/components/editable-field';
import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { formatDate } from '@/lib/date-helpers';
import type { Flight } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function extractCode(city?: string): string {
  if (!city) return '—';
  const match = city.match(/\(([A-Z]{3})\)/);
  if (match) return match[1];
  return city.substring(0, 3).toUpperCase();
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmt12(hhmm?: string): string {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m < 10 ? '0' : ''}${m} ${period}`;
}

function TimePressable({ value, path }: { value?: string; path: string }) {
  const { updateField } = useItinerary();
  const [open, setOpen] = useState(false);

  const initial = useMemo(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!Number.isNaN(h) && !Number.isNaN(m)) {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
      }
    }
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, [value]);

  const [temp, setTemp] = useState<Date>(initial);

  return (
    <>
      <TouchableOpacity
        onPress={() => { setTemp(initial); setOpen(true); }}
        activeOpacity={0.75}
        style={styles.timeBtn}
      >
        <Text style={[styles.timeText, !value && styles.timePlaceholder]}>
          {value ? fmt12(value) : 'Add time'}
        </Text>
        <Ionicons
          name="time-outline"
          size={11}
          color={value ? Palette.gold : Palette.textMuted}
          style={{ marginTop: 2, marginLeft: 3 }}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.pickerSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.pickerHead}>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={10}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Set time</Text>
              <TouchableOpacity
                onPress={() => {
                  const h = temp.getHours();
                  const m = temp.getMinutes();
                  updateField(path, `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`);
                  setOpen(false);
                }}
                hitSlop={10}
              >
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerBody}>
              <DateTimePicker
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                value={temp}
                onChange={(_, d) => { if (d) setTemp(d); }}
                themeVariant="dark"
                textColor={Palette.textPrimary}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Boarding pass card ────────────────────────────────────────────────────

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
      {/* Header row */}
      <View style={styles.passHeader}>
        <View style={styles.passTypeBadge}>
          <Text style={styles.passTypeText}>{type === 'outbound' ? 'OUTBOUND' : 'RETURN'}</Text>
        </View>
        <View style={styles.airlineTag}>
          <EditableField
            value={flight.airline}
            path={`flights.${prefix}.airline`}
            textStyle={styles.airlineTagText}
          />
        </View>
      </View>

      {/* Route — compact */}
      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <Text style={styles.cityCode}>{extractCode(flight.departureCity)}</Text>
          <Text style={styles.cityName} numberOfLines={1}>
            {flight.departureCity || '—'}
          </Text>
        </View>

        <View style={styles.routeMiddle}>
          <View style={styles.routeLine}>
            <View style={styles.routeDotStart} />
            <View style={styles.routeDash} />
            <Ionicons
              name="airplane"
              size={13}
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
        </View>
      </View>

      {/* Stopover pill */}
      {flight.stopoverCity ? (
        <View style={styles.stopoverPill}>
          <Ionicons name="time-outline" size={12} color={Palette.orange} />
          <Text style={styles.stopoverText}>
            {flight.stopoverCity} · {flight.layoverDuration || '—'} layover
          </Text>
        </View>
      ) : null}

      {/* Details grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>DATE</Text>
          <Text style={styles.detailValue}>{formatDate(flight.departureDate)}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>DEPARTURE</Text>
          <TimePressable value={flight.departureTime} path={`flights.${prefix}.departureTime`} />
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>ARRIVAL</Text>
          <TimePressable value={flight.arrivalTime} path={`flights.${prefix}.arrivalTime`} />
        </View>
      </View>

      {/* Tear line */}
      <View style={styles.tearLine}>
        <View style={styles.tearCircleLeft} />
        <View style={styles.tearDash} />
        <View style={styles.tearCircleRight} />
      </View>

      {/* Bottom — passenger only */}
      <View style={styles.passBottom}>
        <View style={styles.passField}>
          <Text style={styles.passLabel}>PASSENGER</Text>
          <Text style={styles.passValue}>{pilgrimName.toUpperCase()}</Text>
        </View>
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

  const isUmrah = itinerary.tripType === 'umrah';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Your Flights</Text>
          <Text style={styles.screenSubtitle}>
            {itinerary.flights?.outbound?.airline || 'Airline'} · {isUmrah ? 'Umrah' : 'Hajj'} · Round trip
          </Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim, gap: 14 }}>
          <BoardingPassCard
            flight={itinerary.flights.outbound}
            type="outbound"
            prefix="outbound"
            pilgrimName={itinerary.pilgrim?.name || ''}
          />

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
  headerSection: { marginBottom: 20 },
  screenTitle: { fontFamily: RawafFonts.display, fontSize: 34, color: Palette.textPrimary, lineHeight: 40 },
  screenSubtitle: { fontFamily: RawafFonts.body, fontSize: 13, color: Palette.textSecondary, marginTop: 4 },
  boardingPass: {
    backgroundColor: Palette.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
    overflow: 'hidden',
  },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
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
  airlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineTagText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.textSecondary,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  routePoint: { flex: 1 },
  routeMiddle: { alignItems: 'center', paddingTop: 6, paddingHorizontal: 6 },
  routeLine: { flexDirection: 'row', alignItems: 'center' },
  routeDotStart: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.gold },
  routeDash: { width: 14, height: 1, backgroundColor: Palette.goldLight, marginHorizontal: 2 },
  routeDotEnd: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Palette.gold,
  },
  directText: { fontFamily: RawafFonts.body, fontSize: 10, color: Palette.textMuted, marginTop: 4 },
  cityCode: { fontFamily: RawafFonts.display, fontSize: 26, color: Palette.textPrimary },
  cityName: { fontFamily: RawafFonts.body, fontSize: 11, color: Palette.textSecondary, marginTop: -2 },
  detailsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 4,
  },
  detailCell: { flex: 1, alignItems: 'center' },
  detailDivider: { width: 1, height: 24, backgroundColor: Palette.border, marginHorizontal: 2 },
  detailLabel: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 8,
    color: Palette.textMuted,
    letterSpacing: 1,
    marginBottom: 3,
  },
  detailValue: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 12,
    color: Palette.textPrimary,
  },
  timeText: { fontFamily: RawafFonts.bodySemiBold, fontSize: 13, color: Palette.textPrimary },
  timePlaceholder: { fontSize: 11, color: Palette.textMuted, fontFamily: RawafFonts.body },
  timeBtn: { flexDirection: 'row', alignItems: 'center' },
  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(8,12,24,0.72)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: Palette.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: Palette.goldBorder,
  },
  pickerHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  pickerTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
    letterSpacing: 0.5,
  },
  pickerCancel: { fontFamily: RawafFonts.body, fontSize: 14, color: Palette.textSecondary },
  pickerDone: { fontFamily: RawafFonts.bodyBold, fontSize: 14, color: Palette.gold },
  pickerBody: { alignItems: 'center', paddingTop: 6 },
  stopoverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Palette.orangeMuted,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  stopoverText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.orange,
    marginLeft: 6,
  },
  tearLine: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  tearCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.background,
    marginLeft: -28,
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
    marginRight: -28,
  },
  passBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  passField: { flex: 1 },
  passLabel: {
    fontFamily: RawafFonts.body,
    fontSize: 9,
    color: Palette.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  passValue: { fontFamily: RawafFonts.bodySemiBold, fontSize: 12, color: Palette.textPrimary },
  passValueGold: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 12,
    color: Palette.gold,
    letterSpacing: 1,
  },
});
