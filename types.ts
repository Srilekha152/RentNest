
export enum UserRole {
  OWNER = 'OWNER',
  RENTER = 'RENTER',
}

export enum FurnishingStatus {
  FURNISHED = 'Furnished',
  SEMI_FURNISHED = 'Semi-Furnished',
  UNFURNISHED = 'Unfurnished',
}

export enum PropertyType {
  APARTMENT = 'Apartment',
  HOUSE = 'House',
  VILLA = 'Villa',
  CONDO = 'Condo',
  STUDIO = 'Studio',
}

export interface UserPreferences {
  minPrice?: number;
  maxPrice?: number;
  minSqft?: number;
  preferredArea?: string;
  minBedrooms?: number;
  propertyType?: PropertyType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferences?: UserPreferences;
  contactNumber?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  area: string;
  location: string;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  furnishingStatus: FurnishingStatus;
  propertyType: PropertyType;
  images: string[];
  contactDetails: string;
  createdAt: string;
}

export interface RentalRequest {
  id: string;
  propertyId: string;
  renterId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string;
  createdAt: string;
  renterName: string;
}
