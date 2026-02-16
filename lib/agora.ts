// lib/agora.ts
import type { IAgoraRTC } from 'agora-rtc-sdk-ng';

// 1. Initialize variables as null for the server
let AgoraRTC: any = null;

// 2. Only require the SDK if we are in the browser
if (typeof window !== 'undefined') {
  AgoraRTC = require('agora-rtc-sdk-ng').default;
}

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';

export const createAgoraClient = () => {
  // Prevent crash if AgoraRTC isn't loaded or App ID is missing
  if (!AgoraRTC || !AGORA_APP_ID) return null;
  
  return AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
};

export const AGORA_CONFIG = {
  appId: AGORA_APP_ID,
  token: null,
  channel: 'doctor-consultation',
  uid: null,
};