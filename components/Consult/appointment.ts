// config/appointment.ts
export const APPOINTMENT_CONFIG = {
  pricing: {
    day: {
      chat: 200,   // Day chat consultation
      voice: 500   // Day voice consultation
    },
    night: {
      chat: 500,   // Night chat consultation
      voice: 700   // Night voice consultation
    }
  },
  reschedule: {
    freeRescheduleCount: 1,  // First reschedule is free
    halfPriceThreshold: 2,    // From second reschedule onwards, pay half
    cutoffHours: 4,           // Cannot reschedule within 4 hours
    slotDuration: 24          // Booking lasts 24 hours
  },
  slots: {
    morning: ['08:00', '09:00', '10:00', '11:00'],
    midDay: ['12:00', '13:00', '14:00', '15:00'],
    night: ['18:00', '19:00', '20:00', '21:00']
  },
  maxSlotsPerDay: 12
};

// Helper functions for pricing
export const getBasePrice = (time: string, serviceType: 'chat' | 'voice'): number => {
  const isNightTime = APPOINTMENT_CONFIG.slots.night.includes(time);
  const pricing = isNightTime ? APPOINTMENT_CONFIG.pricing.night : APPOINTMENT_CONFIG.pricing.day;
  return pricing[serviceType];
};

export const getReschedulePrice = (rescheduleCount: number, basePrice: number): number => {
  if (rescheduleCount < APPOINTMENT_CONFIG.reschedule.freeRescheduleCount) {
    return 0; // Free reschedule
  }
  return Math.floor(basePrice / 2); // Half price for subsequent reschedules
};