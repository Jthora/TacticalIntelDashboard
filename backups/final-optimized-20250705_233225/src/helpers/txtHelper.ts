interface TxtFeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content: string;
  author: string;
  categories: string[];
  media: { url: string, type: string }[];
}

export const parseTxtContent = (txtData: string): TxtFeedItem[] => {
  const lines = txtData.split('\n');
  const items: TxtFeedItem[] = [];

  lines.forEach(line => {
    const parts = line.split('|');
    if (parts.length >= 5) {
      const item: TxtFeedItem = {
        title: parts[0],
        link: parts[1],
        pubDate: parts[2],
        description: parts[3],
        content: parts[4],
        author: parts[5] || "",
        categories: parts[6] ? parts[6].split(',') : [],
        media: parts[7] ? parts[7].split(',').map(media => {
          const [url, type] = media.split(';');
          return { url, type };
        }) : [],
      };
      items.push(item);
    }
  });

  return items;
};