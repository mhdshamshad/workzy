import { buildRoute } from './routeBuilder';

const wallet = buildRoute('/wallet');
const payout = buildRoute('/payouts');

export const WALLET_API = {
  ROOT: wallet(`/`),
  TRANSACTIONS: wallet('/transactions'),
};

export const PAYOUT_API = {
  ROOT: payout(`/`),
  REQUEST: payout(`/request`),
  BANK: payout('/settings/bank'),
  UPI: payout('/settings/upi'),
  PRIMARY: payout('/settings/primary'),
};
