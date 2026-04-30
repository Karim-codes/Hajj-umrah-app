import EditableField from '@/components/editable-field';
import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { useItinerary } from '@/context/itinerary-context';
import { formatDate } from '@/lib/date-helpers';
import type { DocStatus, Itinerary } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface DocItem {
  key: keyof Itinerary['documents'];
  title: string;
  icon: IoniconName;
  detail: string;
}

const DOC_LIST: DocItem[] = [
  { key: 'hajjVisa', title: 'Hajj Visa', icon: 'document-text', detail: 'visa' },
  { key: 'hajjPermit', title: 'Hajj Permit', icon: 'shield-checkmark', detail: 'permit' },
  { key: 'outboundTicket', title: 'Outbound Flight Ticket', icon: 'airplane', detail: 'outbound' },
  { key: 'returnTicket', title: 'Return Flight Ticket', icon: 'airplane', detail: 'return' },
  { key: 'hotel1Confirmation', title: 'Hotel 1 Confirmation', icon: 'bed', detail: 'hotel1' },
  { key: 'hotel2Confirmation', title: 'Hotel 2 Confirmation', icon: 'bed', detail: 'hotel2' },
  { key: 'minaCamp', title: 'Mina Camp Assignment', icon: 'flag', detail: 'camp' },
  { key: 'bagTags', title: 'Bag Tags', icon: 'pricetag', detail: 'bagTags' },
  { key: 'passport', title: 'Passport', icon: 'card', detail: 'passport' },
];

function StatusBadge({ status }: { status: DocStatus }) {
  const isApproved = status === 'approved' || status === 'confirmed';
  const isPending = status === 'pending';
  return (
    <View
      style={[
        styles.statusBadge,
        isApproved && { backgroundColor: Palette.greenMuted },
        isPending && { backgroundColor: Palette.orangeMuted },
      ]}
    >
      <View
        style={[
          styles.statusDot,
          isApproved && { backgroundColor: Palette.green },
          isPending && { backgroundColor: Palette.orange },
        ]}
      />
      <Text
        style={[
          styles.statusText,
          isApproved && { color: Palette.green },
          isPending && { color: Palette.orange },
        ]}
      >
        {isApproved ? 'Approved' : 'Pending'}
      </Text>
    </View>
  );
}

function DocumentDetailSheet({
  visible,
  onClose,
  docKey,
  itinerary,
  onPickImage,
}: {
  visible: boolean;
  onClose: () => void;
  docKey: string | null;
  itinerary: Itinerary;
  onPickImage: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const close = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(onClose);
  };

  const renderContent = () => {
    switch (docKey) {
      case 'visa':
        return (
          <>
            {itinerary.visa?.imageUri ? (
              <TouchableOpacity onPress={onPickImage} activeOpacity={0.85} style={styles.visaImageContainer}>
                <Image source={{ uri: itinerary.visa.imageUri }} style={styles.visaImage} resizeMode="cover" />
                <View style={styles.visaImageOverlay}>
                  <Ionicons name="camera" size={14} color="#fff" />
                  <Text style={styles.visaImageOverlayText}>Replace</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onPickImage} activeOpacity={0.7} style={styles.uploadVisaBtn}>
                <Ionicons name="cloud-upload-outline" size={28} color={Palette.gold} />
                <Text style={styles.uploadVisaText}>Upload Hajj Visa</Text>
                <Text style={styles.uploadVisaHint}>Photo or screenshot</Text>
              </TouchableOpacity>
            )}
            <EditableField label="Full Name" value={itinerary.visa?.fullName} path="visa.fullName" style={styles.sheetField} />
            <EditableField label="Nationality" value={itinerary.visa?.nationality} path="visa.nationality" style={styles.sheetField} />
            <EditableField label="Visa Status" value={itinerary.visa?.visaStatus} path="visa.visaStatus" style={styles.sheetField} />
            <EditableField label="Permit Status" value={itinerary.visa?.hajjPermitStatus} path="visa.hajjPermitStatus" style={styles.sheetField} />
          </>
        );
      case 'permit':
        return (
          <>
            <EditableField label="Full Name" value={itinerary.visa?.fullName} path="visa.fullName" style={styles.sheetField} />
            <EditableField label="Hajj Permit Status" value={itinerary.visa?.hajjPermitStatus} path="visa.hajjPermitStatus" style={styles.sheetField} />
          </>
        );
      case 'outbound': {
        const ob = itinerary.flights.outbound;
        return (
          <>
            <EditableField label="Airline" value={ob.airline} path="flights.outbound.airline" style={styles.sheetField} />
            <EditableField label="Flight" value={ob.flightNumbers?.join(', ')} path="flights.outbound.flightNumbers" style={styles.sheetField} />
            <EditableField label="From" value={ob.departureCity} path="flights.outbound.departureCity" style={styles.sheetField} />
            <EditableField label="To" value={ob.arrivalCity} path="flights.outbound.arrivalCity" style={styles.sheetField} />
            <EditableField label="Date" value={formatDate(ob.departureDate)} path="flights.outbound.departureDate" style={styles.sheetField} />
            <EditableField label="Booking Ref" value={ob.bookingRef} path="flights.outbound.bookingRef" style={styles.sheetField} />
          </>
        );
      }
      case 'return': {
        const rt = itinerary.flights.return;
        return (
          <>
            <EditableField label="Airline" value={rt.airline} path="flights.return.airline" style={styles.sheetField} />
            <EditableField label="Flight" value={rt.flightNumbers?.join(', ')} path="flights.return.flightNumbers" style={styles.sheetField} />
            <EditableField label="From" value={rt.departureCity} path="flights.return.departureCity" style={styles.sheetField} />
            <EditableField label="To" value={rt.arrivalCity} path="flights.return.arrivalCity" style={styles.sheetField} />
            <EditableField label="Date" value={formatDate(rt.departureDate)} path="flights.return.departureDate" style={styles.sheetField} />
            <EditableField label="Booking Ref" value={rt.bookingRef} path="flights.return.bookingRef" style={styles.sheetField} />
          </>
        );
      }
      case 'hotel1': {
        const h1 = itinerary.hotels.hotel1;
        return (
          <>
            <EditableField label="Hotel Name" value={h1.name} path="hotels.hotel1.name" style={styles.sheetField} />
            <EditableField label="City" value={h1.city} path="hotels.hotel1.city" style={styles.sheetField} />
            <EditableField label="Check-in" value={formatDate(h1.checkIn)} path="hotels.hotel1.checkIn" style={styles.sheetField} />
            <EditableField label="Check-out" value={formatDate(h1.checkOut)} path="hotels.hotel1.checkOut" style={styles.sheetField} />
          </>
        );
      }
      case 'hotel2': {
        const h2 = itinerary.hotels.hotel2;
        return (
          <>
            <EditableField label="Hotel Name" value={h2.name} path="hotels.hotel2.name" style={styles.sheetField} />
            <EditableField label="City" value={h2.city} path="hotels.hotel2.city" style={styles.sheetField} />
            <EditableField label="Check-in" value={formatDate(h2.checkIn)} path="hotels.hotel2.checkIn" style={styles.sheetField} />
            <EditableField label="Check-out" value={formatDate(h2.checkOut)} path="hotels.hotel2.checkOut" style={styles.sheetField} />
          </>
        );
      }
      case 'camp':
        return (
          <>
            <EditableField label="Camp Name" value={itinerary.camp?.name} path="camp.name" style={styles.sheetField} />
            <EditableField label="Guide" value={itinerary.guide?.name} path="guide.name" style={styles.sheetField} />
          </>
        );
      default:
        return (
          <Text style={styles.placeholderText}>
            No additional details available. Tap the edit icon to add information.
          </Text>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={close}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Document Details</Text>
            {renderContent()}
            <TouchableOpacity style={styles.closeSheetBtn} onPress={close}>
              <Text style={styles.closeSheetText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export default function DocumentsTab() {
  const { itinerary, updateField } = useItinerary();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const pickVisaImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload your visa.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      updateField('visa.imageUri', result.assets[0].uri);
      updateField('documents.hajjVisa', 'approved');
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  if (!itinerary) return null;

  const docs = itinerary.documents;
  const approvedCount = Object.values(docs).filter((s) => s === 'approved' || s === 'confirmed').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Documents</Text>
          <Text style={styles.screenSubtitle}>
            {approvedCount} of {DOC_LIST.length} confirmed
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(approvedCount / DOC_LIST.length) * 100}%` }]} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {DOC_LIST.map((doc) => {
            const status = docs[doc.key] || 'pending';
            return (
              <TouchableOpacity
                key={doc.key}
                style={styles.docCard}
                onPress={() => setSelectedDoc(doc.detail)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.docIcon,
                    status === 'pending' && { backgroundColor: Palette.orangeMuted },
                  ]}
                >
                  <Ionicons
                    name={doc.icon}
                    size={20}
                    color={status === 'pending' ? Palette.orange : Palette.gold}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                </View>
                <StatusBadge status={status} />
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Palette.textMuted}
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <DocumentDetailSheet
        visible={!!selectedDoc}
        docKey={selectedDoc}
        itinerary={itinerary}
        onClose={() => setSelectedDoc(null)}
        onPickImage={pickVisaImage}
      />
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
  headerSection: { marginBottom: 16, paddingRight: 56 },
  screenTitle: { fontFamily: RawafFonts.display, fontSize: 34, color: Palette.textPrimary, lineHeight: 40 },
  screenSubtitle: { fontFamily: RawafFonts.body, fontSize: 13, color: Palette.textSecondary, marginTop: 4 },
  progressBar: {
    height: 4,
    backgroundColor: Palette.border,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Palette.green, borderRadius: 2 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitle: { fontFamily: RawafFonts.bodyMedium, fontSize: 15, color: Palette.textPrimary },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontFamily: RawafFonts.bodySemiBold, fontSize: 11 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Palette.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.goldBorder,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.textMuted,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: RawafFonts.display,
    fontSize: 24,
    color: Palette.textPrimary,
    marginBottom: 20,
  },
  sheetField: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  placeholderText: {
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  closeSheetBtn: {
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: Palette.goldMuted,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeSheetText: { fontFamily: RawafFonts.bodySemiBold, fontSize: 15, color: Palette.gold },
  uploadVisaBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Palette.goldBorder,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(201,168,76,0.04)',
    marginBottom: 18,
  },
  uploadVisaText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 15,
    color: Palette.gold,
    marginTop: 8,
  },
  uploadVisaHint: {
    fontFamily: RawafFonts.body,
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  visaImageContainer: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.goldBorder,
  },
  visaImage: { width: '100%', height: '100%' },
  visaImageOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  visaImageOverlayText: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 11,
    color: '#fff',
    marginLeft: 4,
  },
});
