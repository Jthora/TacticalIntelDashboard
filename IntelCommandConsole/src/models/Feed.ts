export interface Feed {
  id: string;
  name: string;
  url: string;
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  content?: string;
  feedListId: string; // Add this line
}