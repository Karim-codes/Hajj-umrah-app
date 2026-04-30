import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Itinerary } from './types';

const ITINERARY_KEY = '@rawaf_itinerary';
const ORIGINAL_KEY = '@rawaf_itinerary_original';

export async function saveItinerary(data: Itinerary): Promise<boolean> {
  try {
    await AsyncStorage.setItem(ITINERARY_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save itinerary:', e);
    return false;
  }
}

export async function saveOriginalItinerary(data: Itinerary): Promise<boolean> {
  try {
    await AsyncStorage.setItem(ORIGINAL_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

export async function loadItinerary(): Promise<Itinerary | null> {
  try {
    const json = await AsyncStorage.getItem(ITINERARY_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
}

export async function loadOriginalItinerary(): Promise<Itinerary | null> {
  try {
    const json = await AsyncStorage.getItem(ORIGINAL_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
}

export async function clearItinerary(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([ITINERARY_KEY, ORIGINAL_KEY]);
  } catch (e) {
    console.error(e);
  }
}
