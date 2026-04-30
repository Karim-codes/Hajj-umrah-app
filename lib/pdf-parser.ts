import * as FileSystem from 'expo-file-system/legacy';
import { EMPTY_ITINERARY } from './sample-data';
import type { Itinerary } from './types';

const AIRLINE_CODES: Record<string, string> = {
  EK: 'Emirates',
  SV: 'Saudia',
  QR: 'Qatar Airways',
  TK: 'Turkish Airlines',
  BA: 'British Airways',
  MS: 'EgyptAir',
  PK: 'PIA',
  WY: 'Oman Air',
  GF: 'Gulf Air',
  FZ: 'flydubai',
};

function guessAirline(flightCode: string): string {
  const code = flightCode.substring(0, 2);
  return AIRLINE_CODES[code] || code;
}

function extractFlightNumbers(text: string): string[] {
  const matches = text.match(/[A-Z]{2}\d{2,4}/g);
  return matches || [];
}

function extractTextFromPdfBase64(base64: string): string {
  try {
    // atob is available in modern JS engines (Hermes supports it)
    const binary =
      typeof atob !== 'undefined'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('binary');
    let text = '';

    const btMatches = binary.match(/BT[\s\S]*?ET/g);
    if (btMatches) {
      for (const block of btMatches) {
        const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g);
        if (tjMatches) {
          for (const tj of tjMatches) {
            const content = tj.match(/\(([^)]*)\)/);
            if (content) text += content[1] + ' ';
          }
        }
        const tjArrayMatches = block.match(/\[([^\]]*)\]\s*TJ/g);
        if (tjArrayMatches) {
          for (const tja of tjArrayMatches) {
            const contents = tja.match(/\(([^)]*)\)/g);
            if (contents) {
              for (const c of contents) {
                const content = c.match(/\(([^)]*)\)/);
                if (content) text += content[1];
              }
              text += ' ';
            }
          }
        }
      }
    }

    const readableMatches = binary.match(/[\x20-\x7E]{10,}/g);
    if (readableMatches) text += ' ' + readableMatches.join(' ');

    return text;
  } catch (e) {
    return '';
  }
}

function parseItineraryText(text: string): Itinerary {
  const data: Itinerary = JSON.parse(JSON.stringify(EMPTY_ITINERARY));

  const namePatterns = [
    /(?:Pilgrim|Passenger|Name)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /(?:Mr|Mrs|Ms|Miss)[.\s]+([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
  ];
  for (const p of namePatterns) {
    const match = text.match(p);
    if (match) {
      data.pilgrim.name = match[1].trim();
      data.visa.fullName = match[1].trim().toUpperCase();
      break;
    }
  }

  const pkgMatch = text.match(/(\d{3})\s+(\w+(?:\s\w+)?)\s*(?:package|pkg)/i);
  if (pkgMatch) {
    data.pilgrim.packageNumber = pkgMatch[1];
    data.pilgrim.packageName = pkgMatch[2];
  }

  const typeMatch = text.match(/(B2[CB]|B2B)/i);
  if (typeMatch) data.pilgrim.pilgrimType = typeMatch[1].toUpperCase();

  const guideMatch = text.match(/(?:Guide|Mutawwif)[:\s]+([A-Za-z\s]+?)(?:\n|\r|Phone|Tel)/i);
  if (guideMatch) data.guide.name = guideMatch[1].trim();

  const phoneMatch = text.match(/(?:Guide|Mutawwif)[\s\S]*?(\+?\d[\d\s-]{8,})/i);
  if (phoneMatch) data.guide.phone = phoneMatch[1].trim();

  const campMatch = text.match(/(?:Camp|Mina)[:\s]+([A-Za-z\s]+?)(?:\n|\r|Trans)/i);
  if (campMatch) data.camp.name = campMatch[1].trim();

  const allFlights = extractFlightNumbers(text);
  if (allFlights.length >= 2) {
    data.flights.outbound.flightNumbers = allFlights.slice(0, 2);
    data.flights.outbound.airline = guessAirline(allFlights[0]);
    if (allFlights.length >= 4) {
      data.flights.return.flightNumbers = allFlights.slice(2, 4);
      data.flights.return.airline = guessAirline(allFlights[2]);
    }
  }

  const refMatch = text.match(/(?:Booking|Reference|PNR|Ref)[:\s]+([A-Z0-9]{5,8})/i);
  if (refMatch) {
    data.flights.outbound.bookingRef = refMatch[1];
    data.flights.return.bookingRef = refMatch[1];
  }

  if (/visa[\s\S]*?approved/i.test(text)) data.visa.visaStatus = 'Approved';
  if (/permit[\s\S]*?approved/i.test(text)) data.visa.hajjPermitStatus = 'Approved';

  const natMatch = text.match(/(?:Nationality|Citizen)[:\s]+([A-Za-z]+)/i);
  if (natMatch) data.visa.nationality = natMatch[1];

  return data;
}

export async function parsePdfText(fileUri: string): Promise<Itinerary | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) throw new Error('File not found');

    const base64Content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const text = extractTextFromPdfBase64(base64Content);
    if (text && text.length > 50) {
      const parsed = parseItineraryText(text);
      if (parsed.pilgrim.name || parsed.flights.outbound.flightNumbers.length > 0) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return null;
  }
}
