import { Palette, RawafFonts } from '@/constants/rawaf-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

export function Section({
  icon,
  tint,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <View style={[s.sectionIcon, { backgroundColor: tint + '22' }]}>
          <Ionicons name={icon} size={16} color={tint} />
        </View>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function Field({
  label,
  required,
  flex,
  children,
}: {
  label: string;
  required?: boolean;
  flex?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={[s.field, flex !== undefined && { flex }]}>
      <Text style={s.label}>
        {label}
        {required && <Text style={{ color: Palette.gold }}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <View style={s.row}>{children}</View>;
}

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={Palette.textMuted}
      autoCapitalize="words"
      autoCorrect={false}
      {...props}
      style={[s.input, props.style]}
    />
  );
}

const s = StyleSheet.create({
  section: {
    backgroundColor: Palette.cardBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontFamily: RawafFonts.bodySemiBold,
    fontSize: 14,
    color: Palette.textPrimary,
    letterSpacing: 0.3,
  },
  row: { flexDirection: 'row', gap: 10 },
  field: { marginBottom: 10 },
  label: {
    fontFamily: RawafFonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Palette.cardBgLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontFamily: RawafFonts.body,
    fontSize: 14,
    color: Palette.textPrimary,
    borderWidth: 1,
    borderColor: Palette.border,
  },
});
