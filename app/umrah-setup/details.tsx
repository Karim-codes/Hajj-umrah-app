import { DateField } from '@/components/hajj-setup/date-time-field';
import { Field, Input, Row, Section } from '@/components/hajj-setup/form-primitives';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette } from '@/constants/rawaf-theme';
import { routeMadinahFirst, routeVisitsMadinah, useUmrahSetup } from '@/context/umrah-setup-context';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

export default function UmrahDetailsScreen() {
  const router = useRouter();
  const { draft, update, updateMakkah, updateMadinah } = useUmrahSetup();

  const visitsMadinah = routeVisitsMadinah(draft.route);
  const madinahFirst = routeMadinahFirst(draft.route);

  const canContinue =
    draft.pilgrimName.trim().length > 0 && draft.makkahHotel.name.trim().length > 0;

  // Derive minimumDate from the departure date so hotel pickers can't go into the past
  const tripMinDate = useMemo(() => {
    if (!draft.departureDate) return new Date();
    const [y, m, d] = draft.departureDate.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
    return new Date();
  }, [draft.departureDate]);

  const makkahSection = (
    <Section icon="business" tint={Palette.gold} title="Stay in Makkah">
      <Field label="Hotel or place name" required>
        <Input
          value={draft.makkahHotel.name}
          onChangeText={(v) => updateMakkah({ name: v })}
          placeholder="e.g. Swissotel Al Maqam"
        />
      </Field>
      <Row>
        <Field label="Check-in" flex={1}>
          <DateField
            value={draft.makkahHotel.checkIn}
            onChange={(v) => updateMakkah({ checkIn: v })}
            minimumDate={tripMinDate}
          />
        </Field>
        <Field label="Check-out" flex={1}>
          <DateField
            value={draft.makkahHotel.checkOut}
            onChange={(v) => updateMakkah({ checkOut: v })}
            minimumDate={tripMinDate}
          />
        </Field>
      </Row>
    </Section>
  );

  const madinahSection = visitsMadinah ? (
    <Section icon="moon" tint={Palette.gold} title="Stay in Madinah">
      <Field label="Hotel or place name">
        <Input
          value={draft.madinahHotel.name}
          onChangeText={(v) => updateMadinah({ name: v })}
          placeholder="e.g. Anwar Al Madinah Mövenpick"
        />
      </Field>
      <Row>
        <Field label="Check-in" flex={1}>
          <DateField
            value={draft.madinahHotel.checkIn}
            onChange={(v) => updateMadinah({ checkIn: v })}
            minimumDate={tripMinDate}
          />
        </Field>
        <Field label="Check-out" flex={1}>
          <DateField
            value={draft.madinahHotel.checkOut}
            onChange={(v) => updateMadinah({ checkOut: v })}
            minimumDate={tripMinDate}
          />
        </Field>
      </Row>
    </Section>
  ) : null;

  return (
    <OnboardingShell
      step={3}
      total={4}
      title={'A few\ndetails'}
      subtitle="Just your name and where you'll be staying — everything else we handle."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/umrah-setup/review')}
    >
      <Section icon="person" tint={Palette.gold} title="Pilgrim">
        <Field label="Your name" required>
          <Input
            value={draft.pilgrimName}
            onChangeText={(v) => update({ pilgrimName: v })}
            placeholder="e.g. Abdikarim Ahmed"
            returnKeyType="done"
          />
        </Field>
      </Section>

      {madinahFirst ? (
        <>
          {madinahSection}
          {makkahSection}
        </>
      ) : (
        <>
          {makkahSection}
          {madinahSection}
        </>
      )}
    </OnboardingShell>
  );
}
