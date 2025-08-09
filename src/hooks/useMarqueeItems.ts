import { useEffect, useState } from 'react';
import { marqueeProjectionService, MarqueeItem } from '../services/MarqueeProjectionService';

export function useMarqueeItems() {
  const [items, setItems] = useState<MarqueeItem[]>(() => marqueeProjectionService.getItems());
  useEffect(() => {
    const unsubscribe = marqueeProjectionService.subscribe(() => {
      setItems(marqueeProjectionService.getItems());
    });
    return () => { unsubscribe(); };
  }, []);
  return items;
}
