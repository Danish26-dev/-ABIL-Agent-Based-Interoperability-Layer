import {
  AuditLogEntry,
  CanonicalBusinessRecord,
  ConflictRecord,
  PolicyMap,
  ReplaySession,
  SyncEvent,
  SystemName,
  SystemSnapshot,
} from '../domain/types';

const now = () => new Date().toISOString();

const canonicalSeed: CanonicalBusinessRecord = {
  ubid: 'KA-1023-7841',
  businessName: 'Kaveri Industries Pvt. Ltd.',
  address: 'No. 47, Industrial Estate, Peenya, Bangalore, Karnataka - 560058',
  owner: 'Rajesh Kumar Shetty',
  powerLoad: '125 kW',
  pollutionCategory: 'Orange',
  employeeCount: 78,
  phone: '+91 80 4567 8901',
  category: 'Medium Manufacturing',
  approvalStatus: 'APPROVED',
  updatedAt: now(),
  version: 1,
  origin: 'sws',
};

const systemSeeds: Record<SystemName, SystemSnapshot> = {
  sws: {
    system: 'sws',
    ubid: canonicalSeed.ubid,
    version: 1,
    updatedAt: now(),
    origin: 'sws',
    data: {
      ubid: canonicalSeed.ubid,
      businessName: canonicalSeed.businessName,
      address: canonicalSeed.address,
      owner: canonicalSeed.owner,
      phone: canonicalSeed.phone,
      category: canonicalSeed.category,
      approvalStatus: canonicalSeed.approvalStatus,
    },
  },
  bescom: {
    system: 'bescom',
    ubid: canonicalSeed.ubid,
    version: 1,
    updatedAt: now(),
    origin: 'sws',
    data: {
      ubid: canonicalSeed.ubid,
      consumerAddress: canonicalSeed.address,
      powerLoad: canonicalSeed.powerLoad,
      connectionStatus: 'Active',
      sanctionDate: '2021-03-14',
      accountNumber: 'BES-2278813',
    },
  },
  kspcb: {
    system: 'kspcb',
    ubid: canonicalSeed.ubid,
    version: 1,
    updatedAt: now(),
    origin: 'sws',
    data: {
      enterpriseId: canonicalSeed.ubid,
      facilityAddress: canonicalSeed.address,
      pollutionCategory: canonicalSeed.pollutionCategory,
      consentValidity: '2026-12-31',
      effluentDischarge: 'Within Limits',
      lastInspection: '2024-09-22',
    },
  },
  labour: {
    system: 'labour',
    ubid: canonicalSeed.ubid,
    version: 1,
    updatedAt: now(),
    origin: 'sws',
    data: {
      establishmentId: canonicalSeed.ubid,
      registeredAddress: canonicalSeed.address,
      employeeCount: canonicalSeed.employeeCount,
      pfRegistration: 'KN/BNG/0046721',
      esiCode: '53-12345-678',
      lastReturnFiled: '2025-01-15',
    },
  },
};

const policySeed: PolicyMap = {
  address: 'sws',
  owner: 'sws',
  phone: 'sws',
  category: 'sws',
  powerLoad: 'bescom',
  pollutionCategory: 'kspcb',
  employeeCount: 'labour',
};

export const store = {
  systems: systemSeeds,
  canonical: canonicalSeed,
  events: [] as SyncEvent[],
  conflicts: [] as ConflictRecord[],
  auditLogs: [] as AuditLogEntry[],
  replaySessions: [] as ReplaySession[],
  policies: policySeed,
};
