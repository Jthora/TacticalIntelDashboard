import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MarqueeBar from '../MarqueeBar';
import { marqueeProjectionService, MarqueeItem } from '../../services/MarqueeProjectionService';

// Helper to inject test items
function seedItems(items: Partial<MarqueeItem>[]) {
  (marqueeProjectionService as any)._testReset();
  (marqueeProjectionService as any)._testDirectAdd(items.map((p,i)=>({
    id: p.id || `item-${i}`,
    sourceId: 'test',
    text: p.text || `Headline ${i}`,
    category: p.category || 'GENERIC',
    importance: (p.importance as any) || 2,
    timestamp: p.timestamp || new Date(),
    link: p.link
  })));
}

describe('MarqueeBar', () => {
  beforeEach(() => {
    const svc: any = marqueeProjectionService;
    if (svc.store) svc.store.clear();
  });

  test('renders nothing when no items are available', () => {
    render(<MarqueeBar speed={30} />);
    expect(document.querySelector('.marquee-bar')).toBeNull();
  });

  test('renders marquee segments when items present', () => {
    seedItems([{ text: 'Alpha' }, { text: 'Bravo' }, { text: 'Charlie' }]);
    render(<MarqueeBar speed={30} />);
    const alpha = screen.getAllByText(/Alpha/);
    expect(alpha.length).toBeGreaterThan(0);
  });

  test('slows on hover', async () => {
    seedItems(new Array(10).fill(0).map((_,i)=>({ text: `Item ${i}` })));
    render(<MarqueeBar speed={36} />);
    const container = document.querySelector('.marquee-bar') as HTMLElement;
    expect(container).toBeInTheDocument();

    await act(async () => { await new Promise(r => setTimeout(r, 300)); });
    const baseSpeed = Number(container.dataset.baseSpeed);
    const runningSpeed = Number(container.dataset.currentSpeed);
    expect(runningSpeed).toBeGreaterThan(baseSpeed * 0.8);

    await act(async () => { await userEvent.hover(container); await new Promise(r => setTimeout(r, 600)); });
    const slowed = Number(container.dataset.currentSpeed);
    expect(slowed).toBeLessThanOrEqual(baseSpeed / 2.5); // should approach ~1/3 of baseline
  });

  test('pause button reduces speed toward zero', async () => {
    seedItems([{ text: 'Gamma' }, { text: 'Delta' }]);
    render(<MarqueeBar speed={30} />);
    const container = document.querySelector('.marquee-bar') as HTMLElement;
  await act(async () => { await new Promise(r => setTimeout(r, 250)); });
  const baseSpeed = Number(container.dataset.baseSpeed);
  const before = Number(container.dataset.currentSpeed);
  expect(before).toBeGreaterThan(baseSpeed * 0.8);
    const btn = container.querySelector('.marquee-pause-btn') as HTMLButtonElement;
    await act(async () => { userEvent.click(btn); await new Promise(r => setTimeout(r, 500)); });
    const after = Number(container.dataset.currentSpeed);
    expect(after).toBeLessThan(before / 4);
  });
});
