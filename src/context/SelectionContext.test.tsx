import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SelectionProvider, useSelection } from './SelectionContext';

function wrapper({ children }: { children: ReactNode }) {
  return <SelectionProvider>{children}</SelectionProvider>;
}

describe('SelectionContext', () => {
  it('throws when useSelection is called outside SelectionProvider', () => {
    expect(() => renderHook(() => useSelection())).toThrow(
      'useSelection must be used within SelectionProvider',
    );
  });

  it('initializes with selectedId: null', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    expect(result.current.selectedId).toBeNull();
  });

  it('updates selectedId when setSelectedId is called with a string', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    act(() => {
      result.current.setSelectedId('abc');
    });
    expect(result.current.selectedId).toBe('abc');
  });

  it('resets selectedId to null when setSelectedId is called with null', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    act(() => {
      result.current.setSelectedId('abc');
    });
    act(() => {
      result.current.setSelectedId(null);
    });
    expect(result.current.selectedId).toBeNull();
  });
});
