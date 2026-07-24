import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --------------------------------------------------------------------------
// Re-usable inputs
// --------------------------------------------------------------------------

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'numbers-and-punctuation';
  autoCapitalize?: 'none' | 'words' | 'characters';
  hint?: string;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        placeholderTextColor={Palette.textMuted}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'words'}
        autoCorrect={false}
      />
      {hint ? <Text style={fieldStyles.hint}>{hint}</Text> : null}
    </View>
  );
}

function Section({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <View style={sectionStyles.wrap}>
      <TouchableOpacity
        style={sectionStyles.header}
        activeOpacity={0.7}
        onPress={() => setOpen((o) => !o)}
      >
        <View style={sectionStyles.iconWrap}>
          <Ionicons name={icon} size={16} color={Palette.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={sectionStyles.title}>{title}</Text>
          {subtitle ? <Text style={sectionStyles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Palette.textMuted}
        />
      </TouchableOpacity>
      {open ? <View style={sectionStyles.body}>{children}</View> : null}
    </View>
  );
}

// --------------------------------------------------------------------------
// Screen
// --------------------------------------------------------------------------

export default function SettingsScreen() {
  const router = useRouter();
  const { itinerary, setItinerary, clear } = useItinerary();
  const [draft, setDraft] = useState(() =>
    itinerary ? JSON.parse(JSON.stringify(itinerary)) : null
  );

  if (!draft) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Ionicons name="document-text-outline" size={42} color={Palette.gold} />
          <Text style={styles.emptyTitle}>No itinerary yet</Text>
          <Text style={styles.emptyText}>
            Upload your Nusuk PDF or load the demo from the welcome screen first.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.replace('/')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>Go to welcome</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Update a deeply-nested field via dot-path. Pure, returns a new object.
  const update = (path: string, value: string) => {
    setDraft((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] == null) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateFlightNumber = (
    leg: 'outbound' | 'return',
    index: 0 | 1,
    value: string
  ) => {
    setDraft((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const arr: string[] = next.flights[leg].flightNumbers || [];
      arr[index] = value;
      next.flights[leg].flightNumbers = arr;
      return next;
    });
  };

  const save = async () => {
    await setItinerary(draft);
    Alert.alert('Saved', 'Your itinerary has been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const confirmReset = () => {
    Alert.alert(
      'Clear itinerary?',
      'This removes all your saved data and returns you to the welcome screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clear();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Details</Text>
        <TouchableOpacity onPress={save} hitSlop={10} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>
            These details power your dashboard, journey, and Hajj guide. Edit anything
            that the PDF didn’t pick up correctly.
          </Text>

          {/* Personal */}
          <Section title="Personal" icon="person-outline">
            <Field
              label="Display name"
              value={draft.pilgrim.name}
              onChangeText={(v) => update('pilgrim.name', v)}
              placeholder="Abdikarim Ahmed"
            />
            <Field
              label="Full name (as on visa)"
              value={draft.visa.fullName}
              onChangeText={(v) => update('visa.fullName', v)}
              placeholder="ABDIKARIM ALI YUSEF AHMED"
              autoCapitalize="characters"
            />
            <Field
              label="Nationality"
              value={draft.visa.nationality}
              onChangeText={(v) => update('visa.nationality', v)}
              placeholder="United Kingdom"
            />
            <Field
              label="Pilgrim type"
              value={draft.pilgrim.pilgrimType}
              onChangeText={(v) => update('pilgrim.pilgrimType', v)}
              placeholder="B2C"
              autoCapitalize="characters"
            />
            <Field
              label="Package number"
              value={draft.pilgrim.packageNumber}
              onChangeText={(v) => update('pilgrim.packageNumber', v)}
              placeholder="573"
              autoCapitalize="none"
            />
            <Field
              label="Package name"
              value={draft.pilgrim.packageName}
              onChangeText={(v) => update('pilgrim.packageName', v)}
              placeholder="Osturat"
            />
          </Section>

          {/* Outbound flight */}
          <Section
            title="Outbound flight"
            icon="airplane-outline"
            subtitle="Home → Saudi Arabia"
          >
            <Field
              label="Airline"
              value={draft.flights.outbound.airline}
              onChangeText={(v) => update('flights.outbound.airline', v)}
              placeholder="Emirates"
            />
            <Field
              label="First flight number"
              value={draft.flights.outbound.flightNumbers?.[0] || ''}
              onChangeText={(v) => updateFlightNumber('outbound', 0, v)}
              placeholder="EK32"
              autoCapitalize="characters"
            />
            <Field
              label="Connecting flight number"
              value={draft.flights.outbound.flightNumbers?.[1] || ''}
              onChangeText={(v) => updateFlightNumber('outbound', 1, v)}
              placeholder="EK805"
              autoCapitalize="characters"
            />
            <Field
              label="From (city)"
              value={draft.flights.outbound.departureCity}
              onChangeText={(v) => update('flights.outbound.departureCity', v)}
              placeholder="London"
            />
            <Field
              label="Departure date"
              value={draft.flights.outbound.departureDate}
              onChangeText={(v) => update('flights.outbound.departureDate', v)}
              placeholder="2026-05-20"
              hint="Format: YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Departure time"
              value={draft.flights.outbound.departureTime}
              onChangeText={(v) => update('flights.outbound.departureTime', v)}
              placeholder="19:50"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Stopover (optional)"
              value={draft.flights.outbound.stopoverCity}
              onChangeText={(v) => update('flights.outbound.stopoverCity', v)}
              placeholder="Dubai"
            />
            <Field
              label="Layover duration"
              value={draft.flights.outbound.layoverDuration}
              onChangeText={(v) => update('flights.outbound.layoverDuration', v)}
              placeholder="1h 00m"
              autoCapitalize="none"
            />
            <Field
              label="To (city)"
              value={draft.flights.outbound.arrivalCity}
              onChangeText={(v) => update('flights.outbound.arrivalCity', v)}
              placeholder="Jeddah"
            />
            <Field
              label="Arrival date"
              value={draft.flights.outbound.arrivalDate}
              onChangeText={(v) => update('flights.outbound.arrivalDate', v)}
              placeholder="2026-05-21"
              hint="Format: YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Arrival time"
              value={draft.flights.outbound.arrivalTime}
              onChangeText={(v) => update('flights.outbound.arrivalTime', v)}
              placeholder="08:45"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Arrival airport"
              value={draft.flights.outbound.arrivalAirport || ''}
              onChangeText={(v) => update('flights.outbound.arrivalAirport', v)}
              placeholder="King Abdulaziz International Airport"
            />
            <Field
              label="Booking reference"
              value={draft.flights.outbound.bookingRef}
              onChangeText={(v) => update('flights.outbound.bookingRef', v)}
              placeholder="7441468"
              autoCapitalize="characters"
            />
          </Section>

          {/* Return flight */}
          <Section
            title="Return flight"
            icon="airplane-outline"
            subtitle="Saudi Arabia → Home"
          >
            <Field
              label="Airline"
              value={draft.flights.return.airline}
              onChangeText={(v) => update('flights.return.airline', v)}
              placeholder="Emirates"
            />
            <Field
              label="First flight number"
              value={draft.flights.return.flightNumbers?.[0] || ''}
              onChangeText={(v) => updateFlightNumber('return', 0, v)}
              placeholder="EK808"
              autoCapitalize="characters"
            />
            <Field
              label="Connecting flight number"
              value={draft.flights.return.flightNumbers?.[1] || ''}
              onChangeText={(v) => updateFlightNumber('return', 1, v)}
              placeholder="EK29"
              autoCapitalize="characters"
            />
            <Field
              label="From (city)"
              value={draft.flights.return.departureCity}
              onChangeText={(v) => update('flights.return.departureCity', v)}
              placeholder="Madina"
            />
            <Field
              label="Departure airport"
              value={draft.flights.return.departureAirport || ''}
              onChangeText={(v) => update('flights.return.departureAirport', v)}
              placeholder="Prince Mohammad Bin Abdulaziz International Airport"
            />
            <Field
              label="Departure date"
              value={draft.flights.return.departureDate}
              onChangeText={(v) => update('flights.return.departureDate', v)}
              placeholder="2026-06-03"
              hint="Format: YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Departure time"
              value={draft.flights.return.departureTime}
              onChangeText={(v) => update('flights.return.departureTime', v)}
              placeholder="04:35"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Stopover (optional)"
              value={draft.flights.return.stopoverCity}
              onChangeText={(v) => update('flights.return.stopoverCity', v)}
              placeholder="Dubai"
            />
            <Field
              label="Layover duration"
              value={draft.flights.return.layoverDuration}
              onChangeText={(v) => update('flights.return.layoverDuration', v)}
              placeholder="1h 25m"
              autoCapitalize="none"
            />
            <Field
              label="To (city)"
              value={draft.flights.return.arrivalCity}
              onChangeText={(v) => update('flights.return.arrivalCity', v)}
              placeholder="London"
            />
            <Field
              label="Arrival date"
              value={draft.flights.return.arrivalDate}
              onChangeText={(v) => update('flights.return.arrivalDate', v)}
              placeholder="2026-06-03"
              hint="Format: YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Arrival time"
              value={draft.flights.return.arrivalTime}
              onChangeText={(v) => update('flights.return.arrivalTime', v)}
              placeholder="14:25"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Booking reference"
              value={draft.flights.return.bookingRef}
              onChangeText={(v) => update('flights.return.bookingRef', v)}
              placeholder="7489392"
              autoCapitalize="characters"
            />
          </Section>

          {/* Makkah hotel */}
          <Section title="Makkah hotel" icon="business-outline">
            <Field
              label="Hotel name"
              value={draft.hotels.hotel1.name}
              onChangeText={(v) => update('hotels.hotel1.name', v)}
              placeholder="Osturat Emaar Hotel"
            />
            <Field
              label="City"
              value={draft.hotels.hotel1.city}
              onChangeText={(v) => update('hotels.hotel1.city', v)}
              placeholder="Makkah"
            />
            <Field
              label="Check-in date"
              value={draft.hotels.hotel1.checkIn}
              onChangeText={(v) => update('hotels.hotel1.checkIn', v)}
              placeholder="2026-05-20"
              hint="Format: YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Check-out date"
              value={draft.hotels.hotel1.checkOut}
              onChangeText={(v) => update('hotels.hotel1.checkOut', v)}
              placeholder="2026-05-31"
              hint="Format: YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
          </Section>

          {/* Madinah hotel */}
          <Section title="Madinah hotel" icon="business-outline">
            <Field
              label="Hotel name"
              value={draft.hotels.hotel2.name}
              onChangeText={(v) => update('hotels.hotel2.name', v)}
              placeholder="Tulip Inn AlDar Rawafed"
            />
            <Field
              label="City"
              value={draft.hotels.hotel2.city}
              onChangeText={(v) => update('hotels.hotel2.city', v)}
              placeholder="Madina"
            />
            <Field
              label="Check-in date"
              value={draft.hotels.hotel2.checkIn}
              onChangeText={(v) => update('hotels.hotel2.checkIn', v)}
              placeholder="2026-05-31"
              hint="Format: YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
            <Field
              label="Check-out date"
              value={draft.hotels.hotel2.checkOut}
              onChangeText={(v) => update('hotels.hotel2.checkOut', v)}
              placeholder="2026-06-03"
              hint="Format: YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
          </Section>

          {/* Mina camp + guide + Hajj dates */}
          <Section title="Mina camp & guide" icon="map-outline">
            <Field
              label="Camp name"
              value={draft.camp.name}
              onChangeText={(v) => update('camp.name', v)}
              placeholder="AlMuaisim Camp"
            />
            <Field
              label="Guide name"
              value={draft.guide.name}
              onChangeText={(v) => update('guide.name', v)}
              placeholder="Mohammed Ahmed"
            />
            <Field
              label="Guide phone"
              value={draft.guide.phone}
              onChangeText={(v) => update('guide.phone', v)}
              placeholder="+44 7904 993279"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
            <Field
              label="Service provider"
              value={draft.transportation}
              onChangeText={(v) => update('transportation', v)}
              placeholder="Package Transportation"
            />
          </Section>

          <Section
            title="Hajj dates"
            icon="calendar-outline"
            subtitle="Anchors the day-by-day ritual guide"
          >
            <Field
              label="Day of Arafah (9 Dhul-Hijjah)"
              value={draft.hajj?.arafahDate || ''}
              onChangeText={(v) => update('hajj.arafahDate', v)}
              placeholder="2026-05-27"
              hint="Format: YYYY-MM-DD · We compute Tarwiyah, Eid, and Tashreeq from this."
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
            />
          </Section>

          <TouchableOpacity
            style={styles.savePrimary}
            activeOpacity={0.85}
            onPress={save}
          >
            <Ionicons name="checkmark-circle" size={18} color={Palette.background} />
            <Text style={styles.savePrimaryText}>Save changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerBtn}
            activeOpacity={0.7}
            onPress={confirmReset}
          >
            <Ionicons name="trash-outline" size={16} color={Palette.red} />
            <Text style={styles.dangerText}>Clear itinerary</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------

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
  saveBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  saveBtnText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.gold,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 30 },

  intro: {
    fontFamily: RawafFonts.body,
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 19,
    marginBottom: 18,
  },

  savePrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.gold,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 18,
  },
  savePrimaryText: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 15,
    color: Palette.background,
    letterSpacing: 0.3,
  },

  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 6,
  },
  dangerText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 13,
    color: Palette.red,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 24,
    color: Palette.textPrimary,
    marginTop: 10,
  },
  emptyText: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: Palette.goldMuted,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  emptyBtnText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.gold,
  },
});

const sectionStyles = StyleSheet.create({
  wrap: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Palette.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  subtitle: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
});

const fieldStyles = StyleSheet.create({
  wrap: { marginTop: 14 },
  label: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 15,
    color: Palette.textPrimary,
    backgroundColor: Palette.cardBgLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  hint: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 6,
  },
});
