import React, { createContext, useCallback, useContext, useState } from 'react';

type SidePanelContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  deleteAction: (() => void) | null;
  setDeleteAction: (fn: (() => void) | null) => void;
};

const SidePanelContext = createContext<SidePanelContextValue | null>(null);

export function SidePanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);

  const open   = useCallback(() => setIsOpen(true),  []);
  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // useState setter can't store a function directly without wrapping
  const setDeleteActionStable = useCallback((fn: (() => void) | null) => {
    setDeleteAction(() => fn);
  }, []);

  return (
    <SidePanelContext.Provider value={{ isOpen, open, close, toggle, deleteAction, setDeleteAction: setDeleteActionStable }}>
      {children}
    </SidePanelContext.Provider>
  );
}

export function useSidePanel(): SidePanelContextValue {
  const ctx = useContext(SidePanelContext);
  if (!ctx) throw new Error('useSidePanel must be used within SidePanelProvider');
  return ctx;
}
