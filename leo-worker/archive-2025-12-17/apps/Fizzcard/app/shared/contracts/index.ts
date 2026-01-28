// Export all contracts for easy importing
export { authContract } from './auth.contract';
export { fizzCardsContract } from './fizzCards.contract';
export { socialLinksContract } from './socialLinks.contract';
export { contactExchangesContract } from './contactExchanges.contract';
export { connectionsContract } from './connections.contract';
export { fizzCoinContract } from './fizzCoin.contract';
export { cryptoWalletContract } from './cryptoWallet.contract';
export { leaderboardContract } from './leaderboard.contract';
export { introductionsContract } from './introductions.contract';
export { eventsContract } from './events.contract';
export { badgesContract } from './badges.contract';
export { searchContract } from './search.contract';
export { networkContract } from './network.contract';
export { uploadContract } from './upload.contract';

// Combined API contract
import { initContract } from '@ts-rest/core';
import { authContract } from './auth.contract';
import { fizzCardsContract } from './fizzCards.contract';
import { socialLinksContract } from './socialLinks.contract';
import { contactExchangesContract } from './contactExchanges.contract';
import { connectionsContract } from './connections.contract';
import { fizzCoinContract } from './fizzCoin.contract';
import { cryptoWalletContract } from './cryptoWallet.contract';
import { leaderboardContract } from './leaderboard.contract';
import { introductionsContract } from './introductions.contract';
import { eventsContract } from './events.contract';
import { badgesContract } from './badges.contract';
import { searchContract } from './search.contract';
import { networkContract } from './network.contract';
import { uploadContract } from './upload.contract';

const c = initContract();

export const apiContract = c.router({
  auth: authContract,
  fizzCards: fizzCardsContract,
  socialLinks: socialLinksContract,
  contactExchanges: contactExchangesContract,
  connections: connectionsContract,
  fizzCoin: fizzCoinContract,
  cryptoWallet: cryptoWalletContract,
  leaderboard: leaderboardContract,
  introductions: introductionsContract,
  events: eventsContract,
  badges: badgesContract,
  search: searchContract,
  network: networkContract,
  upload: uploadContract,
});
