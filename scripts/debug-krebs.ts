const KREBS_RSS2JSON_URL =
  'https://rss2json.vercel.app/api?url=' + encodeURIComponent('https://krebsonsecurity.com/feed/');

async function main() {
  const response = await fetch(KREBS_RSS2JSON_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const sample = (data.items || []).slice(0, 3).map((item: any) => ({
    title: item.title,
    url: item.url,
    link: item.link,
    guid: item.guid
  }));

  console.log(JSON.stringify(sample, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
