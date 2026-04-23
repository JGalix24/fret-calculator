import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type PaywallCtx = {
  isOpen: boolean;
  page?: string;
  openPaywall: (page?: string) => void;
  closePaywall: () => void;
};

const Ctx = createContext<PaywallCtx | null>(null);

export function PaywallProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState<string | undefined>(undefined);

  const openPaywall = useCallback((p?: string) => {
    setPage(p);
    setIsOpen(true);
  }, []);
  const closePaywall = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, page, openPaywall, closePaywall }), [isOpen, page, openPaywall, closePaywall]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePaywall() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePaywall must be used within PaywallProvider");
  return c;
}
