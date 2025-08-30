import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ResultsDisplay from './ResultsDisplay';
import { SAMPLE_SUCCESS_RESPONSE } from '../../mocks/sampleData';

describe('ResultsDisplay stability', () => {
  it('renders without maximum update depth exceeded warnings', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(
      <ResultsDisplay
        results={SAMPLE_SUCCESS_RESPONSE}
        consultationText={'note'}
      />
    );
    unmount();
    const logged = spy.mock.calls.map(args => args.join(' ')).join(' ');
    expect(logged.toLowerCase()).not.toContain('maximum update depth exceeded');
    spy.mockRestore();
  });
});

