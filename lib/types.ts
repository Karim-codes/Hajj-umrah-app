export type DocStatus = 'approved' | 'confirmed' | 'pending';

export interface Flight {
  airline: string;
  flightNumbers: string[];
  departureCity: string;
  departureDate: string;
  departureTime: string;
  departureAirport?: string;
  arrivalCity: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalAirport?: string;
  stopoverCity: string;
  layoverDuration: string;
  bookingRef: string;
}

export interface Hotel {
  name: string;
  city: string;
  checkIn: string;
  checkOut: string;
}

export interface Itinerary {
  pilgrim: {
    name: string;
    packageName: string;
    packageNumber: string;
    pilgrimType: string;
  };
  guide: {
    name: string;
    phone: string;
  };
  camp: {
    name: string;
  };
  transportation: string;
  flights: {
    outbound: Flight;
    return: Flight;
  };
  hotels: {
    hotel1: Hotel;
    hotel2: Hotel;
  };
  visa: {
    fullName: string;
    nationality: string;
    visaStatus: string;
    hajjPermitStatus: string;
    imageUri?: string;
  };
  documents: {
    hajjVisa: DocStatus;
    hajjPermit: DocStatus;
    outboundTicket: DocStatus;
    returnTicket: DocStatus;
    hotel1Confirmation: DocStatus;
    hotel2Confirmation: DocStatus;
    minaCamp: DocStatus;
    bagTags: DocStatus;
    passport: DocStatus;
  };
}
