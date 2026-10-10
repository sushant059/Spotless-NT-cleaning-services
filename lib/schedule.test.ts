import { test } from "node:test";
import assert from "node:assert/strict";
import { calendarItems, dayAvailability, isSlotFull, slotOccupants } from "./schedule";
import type { Booking, Job } from "./types";

const booking = (patch: Partial<Booking>): Booking => ({
  id: "b1", reference: "SNT-100001", status: "new", name: "Ann", phone: "0400000000", email: "a@b.co", services: [], details: {},
  summary: "Carpet", date: "2026-11-02", timeWindow: "7-10", address: "1 St", suburb: "Parap", notes: "", internalNotes: "",
  promoCode: "", promoMessage: "", createdAt: "2026-10-01T00:00:00Z", ...patch,
});
const job = (patch: Partial<Job>): Job => ({
  id: "j1", reference: "JOB-10001", customerId: "c1", services: "Carpet", address: "", scheduledDate: "2026-11-02", timeWindow: "10-1",
  completedDate: "", price: "", status: "scheduled", notes: "", beforePhotos: [], afterPhotos: [], history: [], sourceRef: "",
  createdAt: "", updatedAt: "", ...patch,
});
const db = (patch: Record<string, unknown> = {}) => ({
  jobs: [] as Job[], bookings: [] as Booking[], customers: [], blockedDates: [], settings: { slotCapacity: 1 } as never, ...patch,
});

test("a booking request fills its slot, a lost one frees it", () => {
  assert.equal(isSlotFull(db({ bookings: [booking({})] }), "2026-11-02", "7-10"), true);
  assert.equal(isSlotFull(db({ bookings: [booking({ status: "lost" })] }), "2026-11-02", "7-10"), false);
  assert.equal(isSlotFull(db({ bookings: [booking({})] }), "2026-11-02", "10-1"), false);
});

test("a cancelled job frees its slot; editing a job ignores itself", () => {
  assert.equal(isSlotFull(db({ jobs: [job({ status: "cancelled" })] }), "2026-11-02", "10-1"), false);
  assert.equal(isSlotFull(db({ jobs: [job({})] }), "2026-11-02", "10-1"), true);
  assert.equal(isSlotFull(db({ jobs: [job({})] }), "2026-11-02", "10-1", { jobId: "j1" }), false);
});

test("a booking converted to a job is only counted once", () => {
  const data = db({ bookings: [booking({ timeWindow: "10-1" })], jobs: [job({ sourceRef: "SNT-100001" })] });
  assert.deepEqual(slotOccupants(data, "2026-11-02", "10-1"), ["JOB-10001"]);
  assert.equal(calendarItems(data, "2026-11-01", "2026-11-30").length, 1);
});

test("capacity of 2 allows two jobs per slot", () => {
  const data = db({ bookings: [booking({})], settings: { slotCapacity: 2 } });
  assert.equal(isSlotFull(data, "2026-11-02", "7-10"), false);
  const both = db({ bookings: [booking({}), booking({ id: "b2", reference: "SNT-100002" })], settings: { slotCapacity: 2 } });
  assert.equal(isSlotFull(both, "2026-11-02", "7-10"), true);
});

test("day availability reports blocked days and full slots", () => {
  const data = db({ bookings: [booking({})], blockedDates: [{ id: "x", date: "2026-11-03", reason: "" }] });
  assert.deepEqual(dayAvailability(data, "2026-11-02"), { blocked: false, full: ["7-10"], allFull: false });
  assert.equal(dayAvailability(data, "2026-11-03").blocked, true);
});
