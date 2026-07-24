import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { daysBetween, daysUntil, formatDateShort, getCurrentStay, getNextOrCurrentStay } from '@/lib/date-helpers';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Prayer Countdown ────────────────────────────────────────────────────────

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

// Makkah (21.4225, 39.8262) / Madinah (24.4672, 39.6112)
function getCityCoords(city: string): { lat: number; lng: number } {
  const lower = city.toLowerCase();
  if (lower.includes('makkah') || lower.includes('mecca'))
    return { lat: 21.4225, lng: 39.8262 };
  return { lat: 24.4672, lng: 39.6112 }; // default Madinah
}

type CraftedGlyphType = 'guide' | 'hajj' | 'stay' | 'prayer' | 'weather';

function CraftedGlyph({ type, color }: { type: CraftedGlyphType; color: string }) {
  if (type === 'guide') {
    return (
      <View style={glyph.glyphBox}>
        <View style={[glyph.guideFrame, { borderColor: color }]} />
        <View style={[glyph.guideCore, { borderColor: color }]} />
        <View style={[glyph.guideStarV, { backgroundColor: color }]} />
        <View style={[glyph.guideStarH, { backgroundColor: color }]} />
      </View>
    );
  }

  if (type === 'hajj') {
    return (
      <View style={glyph.glyphBox}>
        <View style={[glyph.hajjRing, { borderColor: color }]} />
        <View style={[glyph.hajjNeedleLong, { backgroundColor: color }]} />
        <View style={[glyph.hajjNeedleShort, { backgroundColor: color }]} />
        <View style={[glyph.hajjCenter, { backgroundColor: color }]} />
      </View>
    );
  }

  if (type === 'stay') {
    return (
      <View style={glyph.glyphBox}>
        <View style={[glyph.stayBase, { borderColor: color }]} />
        <View style={[glyph.stayArch, { borderColor: color }]} />
        <View style={[glyph.stayPillarLeft, { backgroundColor: color }]} />
        <View style={[glyph.stayPillarRight, { backgroundColor: color }]} />
      </View>
    );
  }

  if (type === 'prayer') {
    return (
      <View style={glyph.glyphBox}>
        <View style={[glyph.prayerRing, { borderColor: color }]} />
        <View style={[glyph.prayerHandLong, { backgroundColor: color }]} />
        <View style={[glyph.prayerHandShort, { backgroundColor: color }]} />
        <View style={[glyph.prayerDot, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={glyph.glyphBox}>
      <View style={[glyph.weatherSun, { borderColor: color }]} />
      <View style={[glyph.weatherRayTop, { backgroundColor: color }]} />
      <View style={[glyph.weatherRayBottom, { backgroundColor: color }]} />
      <View style={[glyph.weatherWave1, { backgroundColor: color }]} />
      <View style={[glyph.weatherWave2, { backgroundColor: color }]} />
    </View>
  );
}

function SigilBadge({
  type,
  size = 44,
  glow = 'rgba(201,168,76,0.16)',
  start = 'rgba(255,255,255,0.08)',
  end = 'rgba(255,255,255,0.01)',
  stroke = 'rgba(201,168,76,0.34)',
  glyphColor = Palette.gold,
}: {
  type: CraftedGlyphType;
  size?: number;
  glow?: string;
  start?: string;
  end?: string;
  stroke?: string;
  glyphColor?: string;
}) {
  return (
    <LinearGradient
      colors={[start, end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        sigil.badge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
          borderColor: stroke,
          shadowColor: glow,
        },
      ]}
    >
      <View style={[sigil.innerRing, { borderColor: stroke }]} />
      <View style={[sigil.glint, { backgroundColor: glow }]} />
      <CraftedGlyph type={type} color={glyphColor} />
    </LinearGradient>
  );
}

const sigil = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  innerRing: {
    position: 'absolute',
    inset: 5,
    borderWidth: 1,
    borderRadius: 10,
    opacity: 0.35,
  },
  glint: {
    position: 'absolute',
    top: -12,
    right: -10,
    width: 28,
    height: 18,
    borderRadius: 14,
    opacity: 0.35,
    transform: [{ rotate: '-24deg' }],
  },
});

const glyph = StyleSheet.create({
  glyphBox: { width: 22, height: 22, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  guideFrame: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 4,
    position: 'absolute',
  },
  guideCore: {
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderRadius: 2,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  guideStarV: { position: 'absolute', width: 1.5, height: 12, borderRadius: 1 },
  guideStarH: { position: 'absolute', width: 12, height: 1.5, borderRadius: 1 },
  hajjRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    position: 'absolute',
  },
  hajjNeedleLong: {
    position: 'absolute',
    width: 1.5,
    height: 10,
    borderRadius: 1,
    transform: [{ rotate: '28deg' }],
  },
  hajjNeedleShort: {
    position: 'absolute',
    width: 1.5,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '-62deg' }],
  },
  hajjCenter: { width: 3, height: 3, borderRadius: 2 },
  stayBase: {
    position: 'absolute',
    width: 14,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 2,
    bottom: 3,
  },
  stayArch: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderRadius: 5,
    top: 4,
  },
  stayPillarLeft: {
    position: 'absolute',
    left: 7,
    bottom: 4,
    width: 1.5,
    height: 6,
    borderRadius: 1,
  },
  stayPillarRight: {
    position: 'absolute',
    right: 7,
    bottom: 4,
    width: 1.5,
    height: 6,
    borderRadius: 1,
  },
  prayerRing: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 8,
    position: 'absolute',
  },
  prayerHandLong: {
    position: 'absolute',
    width: 1.5,
    height: 6,
    top: 5,
    borderRadius: 1,
  },
  prayerHandShort: {
    position: 'absolute',
    width: 5,
    height: 1.5,
    right: 5,
    top: 11,
    borderRadius: 1,
    transform: [{ rotate: '-30deg' }],
  },
  prayerDot: { width: 2.5, height: 2.5, borderRadius: 2 },
  weatherSun: {
    width: 9,
    height: 9,
    borderWidth: 1.5,
    borderRadius: 5,
    position: 'absolute',
  },
  weatherRayTop: { position: 'absolute', width: 1.5, height: 4, top: 1, borderRadius: 1 },
  weatherRayBottom: { position: 'absolute', width: 1.5, height: 4, bottom: 1, borderRadius: 1 },
  weatherWave1: {
    position: 'absolute',
    width: 9,
    height: 1.5,
    bottom: 4,
    borderRadius: 2,
    transform: [{ rotate: '-10deg' }],
  },
  weatherWave2: {
    position: 'absolute',
    width: 9,
    height: 1.5,
    bottom: 1,
    borderRadius: 2,
    transform: [{ rotate: '-10deg' }],
  },
});

 type MonochromeBadgeType = 'guide' | 'hajj' | 'stay' | 'prayer' | 'weather';

 function MonochromeGlyph({ type }: { type: MonochromeBadgeType }) {
   const stroke = 'rgba(255,255,255,0.84)';
   const soft = 'rgba(255,255,255,0.56)';

   if (type === 'guide') {
     return (
       <View style={monoGlyph.box}>
         <View style={[monoGlyph.bookLeft, { borderColor: stroke }]} />
         <View style={[monoGlyph.bookRight, { borderColor: stroke }]} />
         <View style={[monoGlyph.bookSpine, { backgroundColor: soft }]} />
         <View style={[monoGlyph.bookmark, { backgroundColor: soft }]} />
       </View>
     );
   }

   if (type === 'hajj') {
     return (
       <View style={monoGlyph.box}>
         <View style={[monoGlyph.compassRing, { borderColor: stroke }]} />
         <View style={[monoGlyph.compassNeedleLong, { backgroundColor: stroke }]} />
         <View style={[monoGlyph.compassNeedleShort, { backgroundColor: soft }]} />
         <View style={[monoGlyph.compassDot, { backgroundColor: stroke }]} />
       </View>
     );
   }

   if (type === 'stay') {
     return (
       <View style={monoGlyph.box}>
         <View style={[monoGlyph.bedHeadboard, { borderColor: stroke }]} />
         <View style={[monoGlyph.bedBase, { borderColor: stroke }]} />
         <View style={[monoGlyph.bedMattress, { backgroundColor: soft }]} />
         <View style={[monoGlyph.bedPillow, { borderColor: soft }]} />
       </View>
     );
   }

   if (type === 'prayer') {
     return (
       <View style={monoGlyph.box}>
         <View style={[monoGlyph.clockRing, { borderColor: stroke }]} />
         <View style={[monoGlyph.clockHandLong, { backgroundColor: stroke }]} />
         <View style={[monoGlyph.clockHandShort, { backgroundColor: soft }]} />
         <View style={[monoGlyph.clockCenter, { backgroundColor: stroke }]} />
       </View>
     );
   }

   return (
     <View style={monoGlyph.box}>
       <View style={[monoGlyph.weatherArc, { borderColor: stroke }]} />
       <View style={[monoGlyph.weatherHorizon, { backgroundColor: soft }]} />
       <View style={[monoGlyph.weatherRayLeft, { backgroundColor: stroke }]} />
       <View style={[monoGlyph.weatherRayTop, { backgroundColor: stroke }]} />
       <View style={[monoGlyph.weatherRayRight, { backgroundColor: stroke }]} />
     </View>
   );
 }

 function MonochromeBadge({ type, size = 44 }: { type: MonochromeBadgeType; size?: number }) {
   return (
     <View
       style={[
         monoBadge.badge,
         {
           width: size,
           height: size,
           borderRadius: Math.round(size * 0.32),
         },
       ]}
     >
       <View style={monoBadge.innerRing} />
       <View style={monoBadge.cornerCut} />
       <View style={monoBadge.sheen} />
       <MonochromeGlyph type={type} />
     </View>
   );
 }

 const monoBadge = StyleSheet.create({
   badge: {
     backgroundColor: 'rgba(255,255,255,0.03)',
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.09)',
     alignItems: 'center',
     justifyContent: 'center',
     overflow: 'hidden',
   },
   innerRing: {
     position: 'absolute',
     top: 5,
     right: 5,
     bottom: 5,
     left: 5,
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.05)',
     borderRadius: 9,
   },
   cornerCut: {
     position: 'absolute',
     top: 0,
     left: 0,
     width: 16,
     height: 16,
     borderTopWidth: 1.5,
     borderLeftWidth: 1.5,
     borderColor: 'rgba(255,255,255,0.12)',
     borderTopLeftRadius: 10,
   },
   sheen: {
     position: 'absolute',
     top: -8,
     right: -8,
     width: 26,
     height: 14,
     backgroundColor: 'rgba(255,255,255,0.03)',
     borderRadius: 14,
     transform: [{ rotate: '-24deg' }],
   },
 });

 const monoGlyph = StyleSheet.create({
   box: { width: 22, height: 22, position: 'relative', alignItems: 'center', justifyContent: 'center' },
   bookLeft: {
     position: 'absolute',
     left: 3,
     width: 7,
     height: 11,
     borderWidth: 1.5,
     borderRightWidth: 0,
     borderTopLeftRadius: 3,
     borderBottomLeftRadius: 3,
   },
   bookRight: {
     position: 'absolute',
     right: 3,
     width: 7,
     height: 11,
     borderWidth: 1.5,
     borderLeftWidth: 0,
     borderTopRightRadius: 3,
     borderBottomRightRadius: 3,
   },
   bookSpine: {
     position: 'absolute',
     width: 1.5,
     height: 11,
     borderRadius: 1,
   },
   bookmark: {
     position: 'absolute',
     top: 4,
     right: 6,
     width: 1.5,
     height: 5,
     borderRadius: 1,
   },
   compassRing: {
     position: 'absolute',
     width: 15,
     height: 15,
     borderWidth: 1.5,
     borderRadius: 8,
   },
   compassNeedleLong: {
     position: 'absolute',
     width: 1.5,
     height: 9,
     borderRadius: 1,
     transform: [{ rotate: '32deg' }],
   },
   compassNeedleShort: {
     position: 'absolute',
     width: 1.5,
     height: 5,
     borderRadius: 1,
     transform: [{ rotate: '-58deg' }],
   },
   compassDot: { width: 3, height: 3, borderRadius: 2 },
   bedHeadboard: {
     position: 'absolute',
     left: 4,
     bottom: 5,
     width: 4,
     height: 8,
     borderWidth: 1.5,
     borderRightWidth: 0,
     borderTopLeftRadius: 2,
     borderBottomLeftRadius: 2,
   },
   bedBase: {
     position: 'absolute',
     right: 4,
     bottom: 5,
     width: 12,
     height: 6,
     borderWidth: 1.5,
     borderLeftWidth: 0,
     borderTopRightRadius: 2,
     borderBottomRightRadius: 2,
   },
   bedMattress: {
     position: 'absolute',
     left: 8,
     bottom: 9,
     width: 8,
     height: 1.5,
     borderRadius: 1,
   },
   bedPillow: {
     position: 'absolute',
     left: 5,
     bottom: 7,
     width: 3,
     height: 2.5,
     borderWidth: 1.2,
     borderRadius: 2,
   },
   clockRing: {
     position: 'absolute',
     width: 15,
     height: 15,
     borderWidth: 1.5,
     borderRadius: 8,
   },
   clockHandLong: {
     position: 'absolute',
     top: 5,
     width: 1.5,
     height: 5,
     borderRadius: 1,
   },
   clockHandShort: {
     position: 'absolute',
     top: 11,
     right: 5,
     width: 4.5,
     height: 1.5,
     borderRadius: 1,
     transform: [{ rotate: '-28deg' }],
   },
   clockCenter: { width: 2.5, height: 2.5, borderRadius: 2 },
   weatherArc: {
     position: 'absolute',
     width: 10,
     height: 6,
     borderWidth: 1.5,
     borderBottomWidth: 0,
     borderTopLeftRadius: 8,
     borderTopRightRadius: 8,
     top: 6,
   },
   weatherHorizon: {
     position: 'absolute',
     bottom: 6,
     width: 14,
     height: 1.5,
     borderRadius: 1,
   },
   weatherRayLeft: {
     position: 'absolute',
     top: 8,
     left: 4,
     width: 3,
     height: 1.5,
     borderRadius: 1,
     transform: [{ rotate: '-35deg' }],
   },
   weatherRayTop: {
     position: 'absolute',
     top: 3,
     width: 1.5,
     height: 3,
     borderRadius: 1,
   },
   weatherRayRight: {
     position: 'absolute',
     top: 8,
     right: 4,
     width: 3,
     height: 1.5,
     borderRadius: 1,
     transform: [{ rotate: '35deg' }],
   },
 });

function PrayerCountdown({ city }: { city: string }) {
  const [prayers, setPrayers] = useState<{ name: string; time: string }[] | null>(null);
  const [next, setNext] = useState<{ name: string; time: string; diff: string } | null>(null);

  const fetchPrayers = useCallback(async () => {
    try {
      const { lat, lng } = getCityCoords(city);
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=4`
      );
      const json = await res.json();
      const timings = json?.data?.timings;
      if (!timings) return;
      const list = PRAYER_NAMES.map((n) => ({ name: n, time: timings[n] }));
      setPrayers(list);

      // Find next prayer
      const now = new Date();
      for (const p of list) {
        const [h, m] = p.time.split(':').map(Number);
        const pDate = new Date(now);
        pDate.setHours(h, m, 0, 0);
        if (pDate > now) {
          const diffMs = pDate.getTime() - now.getTime();
          const hrs = Math.floor(diffMs / 3600000);
          const mins = Math.floor((diffMs % 3600000) / 60000);
          setNext({
            name: p.name,
            time: p.time,
            diff: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
          });
          return;
        }
      }
      // All prayers passed today
      setNext({ name: list[0].name, time: list[0].time, diff: 'Tomorrow' });
    } catch {
      // silent fail
    }
  }, [city]);

  useEffect(() => { fetchPrayers(); }, [fetchPrayers]);

  if (!next) return null;

  return (
    <View style={prayerStyles.card}>
      <View style={prayerStyles.row}>
        <View style={prayerStyles.iconWrap}>
          <MonochromeBadge type="prayer" size={38} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={prayerStyles.label}>NEXT PRAYER</Text>
          <Text style={prayerStyles.name}>{next.name}</Text>
        </View>
        <View style={prayerStyles.timeWrap}>
          <Text style={prayerStyles.time}>{next.time}</Text>
          <Text style={prayerStyles.countdown}>in {next.diff}</Text>
        </View>
      </View>
      {prayers && (
        <View style={prayerStyles.grid}>
          {prayers.map((p: { name: string; time: string }) => (
            <View key={p.name} style={prayerStyles.gridItem}>
              <Text style={[prayerStyles.gridName, p.name === next.name && { color: Palette.green }]}>
                {p.name}
              </Text>
              <Text style={[prayerStyles.gridTime, p.name === next.name && { color: Palette.green }]}>
                {p.time}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const prayerStyles = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(46,204,135,0.2)',
    marginBottom: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    marginRight: 12,
  },
  label: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    color: Palette.textMuted,
    letterSpacing: 1.2,
  },
  name: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 16,
    color: Palette.textPrimary,
    marginTop: 1,
  },
  timeWrap: { alignItems: 'flex-end' },
  time: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 16,
    color: Palette.green,
  },
  countdown: {
    fontFamily: RawafFonts.body,
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  gridItem: {
    width: '33.33%' as any,
    alignItems: 'center',
    paddingVertical: 6,
  },
  gridName: {
    fontFamily: RawafFonts.body,
    fontSize: 10,
    color: Palette.textMuted,
    letterSpacing: 0.5,
  },
  gridTime: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});

// ─── Weather Card ────────────────────────────────────────────────────────────

function WeatherCard({ city }: { city: string }) {
  const [weather, setWeather] = useState<{ temp: number; desc: string } | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      const { lat, lng } = getCityCoords(city);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`
      );
      const json = await res.json();
      const current = json?.current;
      if (!current) return;
      const temp = Math.round(current.temperature_2m);
      const code = current.weather_code as number;
      // Simple weather code mapping
      let desc = 'Clear';
      if (code >= 1 && code <= 3) { desc = 'Partly cloudy'; }
      else if (code >= 45 && code <= 48) { desc = 'Foggy'; }
      else if (code >= 51 && code <= 67) { desc = 'Rain'; }
      else if (code >= 71 && code <= 77) { desc = 'Snow'; }
      else if (code >= 80 && code <= 99) { desc = 'Storms'; }
      setWeather({ temp, desc });
    } catch {
      // silent
    }
  }, [city]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  if (!weather) return null;

  return (
    <View style={weatherStyles.card}>
      <View style={weatherStyles.row}>
        <View style={weatherStyles.iconWrap}>
          <MonochromeBadge type="weather" size={38} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={weatherStyles.label}>{city.toUpperCase()}</Text>
          <Text style={weatherStyles.desc}>{weather.desc}</Text>
        </View>
        <Text style={weatherStyles.temp}>{weather.temp}°C</Text>
      </View>
      {weather.temp >= 40 && (
        <View style={weatherStyles.warn}>
          <Ionicons name="warning" size={13} color={Palette.orange} />
          <Text style={weatherStyles.warnText}>Extreme heat — stay hydrated</Text>
        </View>
      )}
    </View>
  );
}

const weatherStyles = StyleSheet.create({
  card: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    marginRight: 12,
  },
  label: {
    fontFamily: RawafFonts.bodyBold,
    fontSize: 9,
    color: Palette.textMuted,
    letterSpacing: 1.2,
  },
  desc: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.textPrimary,
    marginTop: 1,
  },
  temp: {
    fontFamily: RawafFonts.display,
    fontSize: 28,
    color: Palette.gold,
  },
  warn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  warnText: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 12,
    color: Palette.orange,
  },
});

// ─── Main Home Screen ────────────────────────────────────────────────────────

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

  const isUmrah = itinerary.tripType === 'umrah';
  const departureDate = itinerary.flights?.outbound?.departureDate;
  const returnDate = itinerary.flights?.return?.arrivalDate;
  const daysLeft = daysUntil(departureDate);
  const tripDays = daysBetween(departureDate, returnDate);
  const currentHotel = getCurrentStay(itinerary.hotels);
  const displayStay = getNextOrCurrentStay(itinerary.hotels);
  const stayLabel = currentHotel ? "Today's stay" : 'Next stay';

  // Umrah journey overview — the two holy cities in visit order
  const umrahRoute = itinerary.umrah?.route;
  const madinahFirst = umrahRoute === 'madinah-makkah';
  const makkahOnly = umrahRoute === 'makkah-only';
  const umrahFirstCity = madinahFirst ? 'MADINAH' : 'MAKKAH';
  const umrahSecondCity = madinahFirst ? 'MAKKAH' : 'MADINAH';


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* iOS-style large title header */}
        <View style={styles.headerBlock}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>As-salamu alaykum</Text>
            <Text style={styles.greetingName}>{itinerary.pilgrim?.name?.split(' ')[0] || 'Pilgrim'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.settingsBtn}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* HERO CARD — premium boarding-pass-meets-passport */}
          <LinearGradient
            colors={['#1e2d52', '#1a2545', '#162038']}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {!isUmrah && (
              <>
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
              </>
            )}

            <Text style={styles.heroLabel}>PILGRIM</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {itinerary.pilgrim?.name}
            </Text>

            {isUmrah ? (
              <View style={styles.heroRoute}>
                <View style={styles.heroRouteSide}>
                  <Text style={styles.heroRouteCity}>{umrahFirstCity}</Text>
                  <Text style={styles.heroRouteDate}>{formatDateShort(departureDate)}</Text>
                </View>
                <View style={styles.heroRouteMiddle}>
                  <View style={styles.heroRouteLine}>
                    <View style={styles.heroRouteDot} />
                    <View style={styles.heroRouteDash} />
                    <Ionicons name="moon" size={13} color={Palette.gold} />
                    <View style={styles.heroRouteDash} />
                    <View style={[styles.heroRouteDot, styles.heroRouteDotEnd]} />
                  </View>
                  <Text style={styles.heroRouteDuration}>{tripDays || '—'} DAYS</Text>
                </View>
                <View style={[styles.heroRouteSide, { alignItems: 'flex-end' }]}>
                  <Text style={styles.heroRouteCity}>
                    {makkahOnly ? 'HOME' : umrahSecondCity}
                  </Text>
                  <Text style={styles.heroRouteDate}>{formatDateShort(returnDate)}</Text>
                </View>
              </View>
            ) : (
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
            )}

            {isUmrah ? (
              <View style={styles.heroBottom}>
                <View>
                  <Text style={styles.heroBottomLabel}>DEPART</Text>
                  <Text style={styles.heroBottomValue}>{formatDateShort(departureDate)}</Text>
                </View>
                <View>
                  <Text style={styles.heroBottomLabel}>NIGHTS</Text>
                  <Text style={styles.heroBottomValue}>{tripDays ?? '—'}</Text>
                </View>
                <View>
                  <Text style={styles.heroBottomLabel}>RETURN</Text>
                  <Text style={styles.heroBottomValue}>{formatDateShort(returnDate)}</Text>
                </View>
              </View>
            ) : (
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
            )}

            {/* Decorative corners */}
            <View style={[styles.heroCorner, { top: 12, left: 12 }]} />
            <View style={[styles.heroCorner, { top: 12, right: 12, transform: [{ rotate: '90deg' }] }]} />
            <View style={[styles.heroCorner, { bottom: 12, left: 12, transform: [{ rotate: '270deg' }] }]} />
            <View style={[styles.heroCorner, { bottom: 12, right: 12, transform: [{ rotate: '180deg' }] }]} />

            {!isUmrah && <Text style={styles.heroWatermark}>RAWAF</Text>}
          </LinearGradient>

          {/* Visa status row — Hajj only */}
          {!isUmrah && (
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
          )}

          {/* Umrah Guide */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/umrah-guide')}
            style={{ marginBottom: 8 }}
          >
            <LinearGradient
              colors={['rgba(201,168,76,0.22)', 'rgba(201,168,76,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.guideCard}
            >
              <View style={styles.guideIcon}>
                <MonochromeBadge type="guide" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideEyebrow}>UMRAH GUIDE</Text>
                <Text style={styles.guideTitle}>Step-by-step Umrah rituals</Text>
                <Text style={styles.guideSub}>
                  Ihram · Tawaf · Sa'i · Du'as · Lap Counter
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Palette.gold} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Hajj Guide entry — day-by-day rites (Hajj only) */}
          {!isUmrah && (
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
                  <MonochromeBadge type="hajj" />
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
          )}

          {/* Today's Stay / Next Stay — redesigned */}
          <Text style={styles.sectionTitle}>NEXT STAY</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/stays')}
            style={styles.stayCard}
          >
            <View style={styles.stayTop}>
              <View style={styles.stayIconWrap}>
                <MonochromeBadge type="stay" size={40} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stayName} numberOfLines={1}>
                  {displayStay?.name || 'Hotel details'}
                </Text>
                <Text style={styles.stayCity}>{displayStay?.city || 'Tap to set'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
            </View>
            <View style={styles.stayDates}>
              <View style={styles.stayDateBlock}>
                <Text style={styles.stayDateLabel}>CHECK-IN</Text>
                <Text style={styles.stayDateValue}>
                  {displayStay?.checkIn ? formatDateShort(displayStay.checkIn) : 'Tap to set'}
                </Text>
              </View>
              <View style={styles.stayDateBlock}>
                <Text style={styles.stayDateLabel}>CHECK-OUT</Text>
                <Text style={styles.stayDateValue}>
                  {displayStay?.checkOut ? formatDateShort(displayStay.checkOut) : 'Tap to set'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Prayer Countdown */}
          <PrayerCountdown city={displayStay?.city || (madinahFirst ? 'Madinah' : 'Makkah')} />

          {/* Weather */}
          <WeatherCard city={displayStay?.city || (madinahFirst ? 'Madinah' : 'Makkah')} />

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
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingRight: 8,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.cardBg,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
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
  heroRouteCity: { fontFamily: RawafFonts.display, fontSize: 20, color: Palette.textPrimary, lineHeight: 24 },
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

  // Next Stay card
  stayCard: {
    backgroundColor: Palette.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 14,
  },
  stayTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stayIconWrap: {
    marginRight: 12,
  },
  stayName: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  stayCity: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  stayDates: {
    flexDirection: 'row',
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: Palette.border,
    overflow: 'hidden',
  },
  stayDateBlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  stayDateLabel: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 8,
    color: Palette.textMuted,
    letterSpacing: 1,
    marginBottom: 3,
  },
  stayDateValue: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 12,
    color: Palette.textSecondary,
  },
});
