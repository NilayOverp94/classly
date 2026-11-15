import { Booking, ReviewItem, GroupClass } from '../types';

// All bookings, reviews, and group classes are dynamically retrieved from Supabase.
// Mock data has been completely eliminated.
export const mockBookings: Booking[] = [];
export const mockReviews: Record<string, ReviewItem[]> = {};
export const mockGroupClasses: GroupClass[] = [];
