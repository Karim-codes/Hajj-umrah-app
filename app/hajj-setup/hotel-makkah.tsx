import { DateField } from '@/components/hajj-setup/date-time-field';
import { Field, Input, Row, Section } from '@/components/hajj-setup/form-primitives';
import { OnboardingShell } from '@/components/hajj-setup/onboarding-shell';
import { Palette } from '@/constants/rawaf-theme';
import { useHajjSetup } from '@/context/hajj-setup-context';
import { useRouter } from 'expo-router';

export default function HajjMakkahScreen() {
  const router = useRouter();
  const { draft, updateMakkah } = useHajjSetup();

  const canContinue =
    draft.makkahHotel.name.trim().length > 0 &&
    draft.makkahHotel.checkIn.length > 0 &&
    draft.makkahHotel.checkOut.length > 0;

  return (
    <OnboardingShell
      step={4}
      total={7}
      title={'Where you\u2019re\nstaying in Makkah'}
      subtitle="Hotel, apartment, or Airbnb — anywhere you'll rest your head."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push('/hajj-setup/hotel-madinah')}
    >
      <Section icon="business" tint={Palette.gold} title="Stay in Makkah">
        <Field label="Place name" required>
          <Input
            value={draft.makkahHotel.name}
            onChangeText={(v) => updateMakkah({ name: v })}
            placeholder="e.g. Sw\u00EFssotel Al Maqam"
          />
        </Field>
        <Row>
          <Field label="Check-in" flex={1} required>
            <DateField
              value={draft.makkahHotel.checkIn}
              onChange={(v) => updateMakkah({ checkIn: v })}
            />
          </Field>
          <Field label="Check-out" flex={1} required>
            <DateField
              value={draft.makkahHotel.checkOut}
              onChange={(v) => updateMakkah({ checkOut: v })}
            />
          </Field>
        </Row>
      </Section>
    </OnboardingShell>
  );
}
