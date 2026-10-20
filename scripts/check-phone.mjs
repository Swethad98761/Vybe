#!/usr/bin/env node
/**
 * Probe the live Niji Supabase project for Phone OTP.
 * Does not send SMS. Uses the public anon key only.
 */

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nujtalyynchxkgrvurwo.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51anRhbHl5bmNoeGtncnZ1cndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTEyOTQsImV4cCI6MjEwNDIyNzI5NH0.fRZ7LkzwgWS8LG1yGP91rfXzyHMslwqaImudGHbDs8A";

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

const settings = await fetch(`${url}/auth/v1/settings`, { headers }).then((r) => r.json());
const phoneOn = Boolean(settings.external?.phone);
const sms = settings.sms_provider ?? "none";

console.log(`project:  ${url}`);
console.log(`phone:    ${phoneOn ? "ON" : "OFF"}`);
console.log(`sms:      ${sms}`);
console.log(`signups:  ${settings.disable_signup ? "disabled" : "open"}`);

if (!phoneOn) {
  console.log("");
  console.log("Enable Phone here (then add a test phone + fixed OTP, or Twilio):");
  console.log("https://supabase.com/dashboard/project/nujtalyynchxkgrvurwo/auth/providers");
  process.exit(1);
}

console.log("");
console.log("Phone is on. Sign up in the app with a test number, or a real number if Twilio is set.");
