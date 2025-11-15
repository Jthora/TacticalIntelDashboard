import { modernAPIService } from '../src/services/ModernAPIService.ts';
import { INVESTIGATIVE_RSS_API } from '../src/constants/APIEndpoints.ts';

async function main() {
  const path = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://krebsonsecurity.com/feed/');
  const data = await modernAPIService.fetchIntelligenceData(
    INVESTIGATIVE_RSS_API,
    path,
    'normalizeCyberSecurityRSS',
    { cache: false, timeout: 15000 }
  );
  console.log('Items count:', data.length);
  console.log('Sample:', data.slice(0, 2));
}

main().catch(err => {
  console.error('Error running inspect-modern-api', err);
  process.exit(1);
});
