import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { daysBetween, formatDateShort, getStepStatus } from '@/lib/date-helpers';
import { Hotel } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StaysScreen() {
  const router = useRouter();
  const { itinerary } = useItinerary();

  if (!itinerary) return null;

  const isUmrah = itinerary.tripType === 'umrah';
  const madinahFirst = itinerary.umrah?.route === 'madinah-makkah';

  // Build ordered list of stays
  const stays: { hotel: Hotel; label: string }[] = [];
  const h1 = itinerary.hotels?.hotel1;
  const h2 = itinerary.hotels?.hotel2;

  // When madinahFirst, review.tsx stores: hotel1=Madinah, hotel2=Makkah
  // So show them in the correct visit order
  if (isUmrah && madinahFirst) {
    if (h1?.name) stays.push({ hotel: h1, label: h1.city || 'Madinah' });
    if (h2?.name) stays.push({ hotel: h2, label: h2.city || 'Makkah' });
  } else {
    if (h1?.name) stays.push({ hotel: h1, label: h1.city || 'Makkah' });
    if (h2?.name) stays.push({ hotel: h2, label: h2.city || 'Madinah' });
  }

  const totalNights = stays.reduce(
    (sum, item) => sum + (daysBetween(item.hotel.checkIn, item.hotel.checkOut) ?? 0),
    0
  );
  const routeSummary = stays.map((item) => item.label.toUpperCase()).join('  —  ');
  const nextStay = stays.find((item) => getStepStatus(item.hotel.checkIn, item.hotel.checkOut) !== 'done');

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Your Stays</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {stays.length > 0 && (
          <View style={s.overviewCard}>
            <Text style={s.overviewEyebrow}>STAY OVERVIEW</Text>
            <Text style={s.overviewRoute}>{routeSummary}</Text>
            <Text style={s.overviewSub}>
              {nextStay ? `Next stop · ${nextStay.label}` : 'All planned stays completed'}
            </Text>

            <View style={s.overviewStats}>
              <View style={s.overviewStat}>
                <Text style={s.overviewStatLabel}>STAYS</Text>
                <Text style={s.overviewStatValue}>{stays.length}</Text>
              </View>
              <View style={s.overviewDivider} />
              <View style={s.overviewStat}>
                <Text style={s.overviewStatLabel}>NIGHTS</Text>
                <Text style={s.overviewStatValue}>{totalNights || '—'}</Text>
              </View>
              <View style={s.overviewDivider} />
              <View style={s.overviewStat}>
                <Text style={s.overviewStatLabel}>CURRENT</Text>
                <Text style={s.overviewStatValueSmall}>{nextStay?.label || 'Done'}</Text>
              </View>
            </View>
          </View>
        )}

        {stays.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="bed-outline" size={48} color={Palette.textMuted} />
            <Text style={s.emptyText}>No stays added yet</Text>
          </View>
        )}

        {stays.map((item, idx) => {
          const status = getStepStatus(item.hotel.checkIn, item.hotel.checkOut);
          const nights = daysBetween(item.hotel.checkIn, item.hotel.checkOut);
          const isActive = status === 'active';
          const isDone = status === 'done';
          const statusLabel = isActive ? 'Now' : isDone ? 'Done' : 'Upcoming';
          const windowLabel = isActive
            ? 'Currently checked in'
            : isDone
              ? 'Completed stay'
              : item.hotel.checkIn
                ? `Begins ${formatDateShort(item.hotel.checkIn)}`
                : 'Dates pending';

          return (
            <View key={idx} style={s.timelineRow}>
              <View style={s.timelineCol}>
                <View style={[s.timelineNode, isActive && s.timelineNodeActive, isDone && s.timelineNodeDone]}>
                  <Text style={s.timelineNodeText}>{idx + 1}</Text>
                </View>
                {idx < stays.length - 1 && <View style={s.timelineLine} />}
              </View>

              <View style={[s.stayContent, isActive && s.stayContentActive, isDone && s.stayContentDone]}>
                <View style={s.stayHeadRow}>
                  <Text style={s.stayEyebrow}>{`STAY ${idx + 1}`}</Text>
                  <View style={[s.statusPill, isActive && s.statusPillActive, isDone && s.statusPillDone]}>
                    <Text style={s.statusPillText}>{statusLabel}</Text>
                  </View>
                </View>

                <Text style={[s.stayName, isDone && { opacity: 0.55 }]}>{item.hotel.name}</Text>
                <Text style={s.windowLabel}>{windowLabel}</Text>

                <View style={s.metaRow}>
                  <View style={s.metaChip}>
                    <Text style={s.metaChipText}>{item.label}</Text>
                  </View>
                  <View style={s.metaChip}>
                    <Text style={s.metaChipText}>{nights !== null ? `${nights} nights` : 'Dates pending'}</Text>
                  </View>
                </View>

                <View style={s.dateGrid}>
                  <View style={s.datePanel}>
                    <Text style={s.dateLabel}>CHECK-IN</Text>
                    <Text style={s.dateValue}>{formatDateShort(item.hotel.checkIn)}</Text>
                  </View>
                  <View style={s.datePanelDivider} />
                  <View style={s.datePanel}>
                    <Text style={s.dateLabel}>CHECK-OUT</Text>
                    <Text style={s.dateValue}>{formatDateShort(item.hotel.checkOut)}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 22,
    color: Palette.textPrimary,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textMuted,
  },
  stayCard: {
    marginBottom: 12,
  },
  stayContent: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  stayHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stayEyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.gold,
    letterSpacing: 1.4,
  },
  statusPill: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.28)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillActive: {
    backgroundColor: 'rgba(46,204,135,0.12)',
    borderColor: 'rgba(46,204,135,0.32)',
  },
  statusPillDone: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: Palette.border,
  },
  statusPillText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 10,
    color: Palette.textSecondary,
  },
  stayName: {
    fontFamily: RawafFonts.display,
    fontSize: 22,
    color: Palette.textPrimary,
    lineHeight: 26,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    marginBottom: 14,
  },
  cityText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 13,
    color: Palette.textSecondary,
  },
  datesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  dateBlock: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 8,
    color: Palette.textMuted,
    letterSpacing: 1,
    marginBottom: 3,
  },
  dateValue: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textPrimary,
  },
  dateDivider: {
    width: 1,
    height: 24,
    backgroundColor: Palette.border,
    marginHorizontal: 4,
  },
  overviewCard: {
    backgroundColor: Palette.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 18,
  },
  overviewEyebrow: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 10,
    color: Palette.textMuted,
    letterSpacing: 1.6,
  },
  overviewRoute: {
    fontFamily: RawafFonts.display,
    fontSize: 24,
    color: Palette.textPrimary,
    marginTop: 6,
    lineHeight: 28,
  },
  overviewSub: {
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 6,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewDivider: {
    width: 1,
    backgroundColor: Palette.border,
    marginHorizontal: 4,
  },
  overviewStatLabel: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 9,
    color: Palette.textMuted,
    letterSpacing: 1,
  },
  overviewStatValue: {
    fontFamily: RawafFonts.display,
    fontSize: 24,
    color: Palette.textPrimary,
    marginTop: 4,
    lineHeight: 28,
  },
  overviewStatValueSmall: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 13,
    color: Palette.textPrimary,
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
  },
  timelineCol: {
    width: 28,
    alignItems: 'center',
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeActive: {
    borderColor: Palette.green,
    backgroundColor: 'rgba(46,204,135,0.12)',
  },
  timelineNodeDone: {
    borderColor: Palette.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  timelineNodeText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 11,
    color: Palette.textPrimary,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: Palette.border,
    marginTop: 6,
    marginBottom: -6,
  },
  stayContentActive: {
    borderColor: 'rgba(46,204,135,0.28)',
    backgroundColor: 'rgba(46,204,135,0.03)',
  },
  stayContentDone: {
    opacity: 0.78,
  },
  windowLabel: {
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metaChipText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.textSecondary,
  },
  dateGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingVertical: 12,
  },
  datePanel: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  datePanelDivider: {
    width: 1,
    height: 28,
    backgroundColor: Palette.border,
  },
});
