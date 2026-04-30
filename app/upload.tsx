import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { parsePdfText } from '@/lib/pdf-parser';
import { SAMPLE_ITINERARY } from '@/lib/sample-data';

const { width } = Dimensions.get('window');

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function UploadScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const { setItinerary, setOriginalItinerary } = useItinerary();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const finishWith = async (data: typeof SAMPLE_ITINERARY) => {
    await setItinerary(data);
    await setOriginalItinerary(data);
    setStatus('success');
    Animated.spring(bounceAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();
    setTimeout(() => router.replace('/(tabs)'), 1100);
  };

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      setStatus('loading');

      const parsed = await parsePdfText(file.uri);

      if (parsed && (parsed.pilgrim?.name || parsed.flights.outbound.flightNumbers.length > 0)) {
        await finishWith(parsed);
      } else {
        Alert.alert(
          'Could not fully parse',
          'We could not extract all fields from this PDF. We will load a demo itinerary you can edit by tapping any field.',
          [
            {
              text: 'Use demo data',
              onPress: () => finishWith(SAMPLE_ITINERARY),
            },
            { text: 'Try again', onPress: () => setStatus('idle') },
          ]
        );
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const loadSample = async () => {
    setStatus('loading');
    setTimeout(() => finishWith(SAMPLE_ITINERARY), 1200);
  };

  return (
    <LinearGradient colors={[Palette.background, '#0a0f1e']} style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={Palette.textSecondary} />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Upload Itinerary</Text>
        <Text style={styles.subtitle}>Select your Nusuk Hajj PDF file</Text>

        {status === 'idle' && (
          <>
            <TouchableOpacity style={styles.uploadArea} onPress={pickPdf} activeOpacity={0.7}>
              <View style={styles.pdfIconCircle}>
                <Ionicons name="document-text" size={40} color={Palette.gold} />
              </View>
              <Text style={styles.uploadTitle}>Tap to select PDF</Text>
              <Text style={styles.uploadHint}>From hajj.nusuk.sa download</Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.sampleBtn} onPress={loadSample} activeOpacity={0.7}>
              <Ionicons name="play-circle" size={20} color={Palette.gold} />
              <Text style={styles.sampleBtnText}>Load Demo Itinerary</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'loading' && (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color={Palette.gold} />
            <Text style={styles.loadingText}>Reading your itinerary...</Text>
            <Text style={styles.loadingSubtext}>Extracting flight, hotel & visa details</Text>
          </View>
        )}

        {status === 'success' && (
          <Animated.View
            style={[
              styles.successArea,
              {
                transform: [
                  { scale: bounceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
                ],
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={64} color={Palette.green} />
            <Text style={styles.successText}>Itinerary Loaded!</Text>
            <Text style={styles.successSubtext}>Preparing your Hajj dashboard...</Text>
          </Animated.View>
        )}

        {status === 'error' && (
          <View style={styles.errorArea}>
            <Ionicons name="alert-circle" size={48} color={Palette.red} />
            <Text style={styles.errorText}>Could not read PDF</Text>
            <Text style={styles.errorSubtext}>Try again or load the demo itinerary</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => setStatus('idle')}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 8 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  title: { fontFamily: RawafFonts.display, fontSize: 36, color: Palette.textPrimary, marginBottom: 6 },
  subtitle: { fontFamily: RawafFonts.body, fontSize: 14, color: Palette.textSecondary, marginBottom: 40 },
  uploadArea: {
    width: width - 60,
    paddingVertical: 50,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Palette.goldBorder,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(201,168,76,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: { fontFamily: RawafFonts.bodySemiBold, fontSize: 17, color: Palette.textPrimary },
  uploadHint: { fontFamily: RawafFonts.body, fontSize: 13, color: Palette.textMuted, marginTop: 6 },
  orContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  orLine: { width: 50, height: 1, backgroundColor: Palette.border },
  orText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 12,
    color: Palette.textMuted,
    marginHorizontal: 12,
    letterSpacing: 2,
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  sampleBtnText: { fontFamily: RawafFonts.bodySemiBold, fontSize: 15, color: Palette.gold, marginLeft: 8 },
  loadingArea: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontFamily: RawafFonts.bodySemiBold, fontSize: 18, color: Palette.textPrimary, marginTop: 20 },
  loadingSubtext: { fontFamily: RawafFonts.body, fontSize: 13, color: Palette.textSecondary, marginTop: 8 },
  successArea: { alignItems: 'center', paddingVertical: 40 },
  successText: { fontFamily: RawafFonts.display, fontSize: 28, color: Palette.green, marginTop: 16 },
  successSubtext: { fontFamily: RawafFonts.body, fontSize: 14, color: Palette.textSecondary, marginTop: 8 },
  errorArea: { alignItems: 'center', paddingVertical: 40 },
  errorText: { fontFamily: RawafFonts.bodySemiBold, fontSize: 18, color: Palette.red, marginTop: 12 },
  errorSubtext: { fontFamily: RawafFonts.body, fontSize: 13, color: Palette.textSecondary, marginTop: 6 },
  retryBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  retryBtnText: { fontFamily: RawafFonts.bodySemiBold, fontSize: 14, color: Palette.gold },
});
