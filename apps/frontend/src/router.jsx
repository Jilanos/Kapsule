import { createContext, useContext, useEffect, useMemo, useState } from "react";

const RouterContext = createContext(null);

function snapshot() {
  return { pathname: window.location.pathname, search: window.location.search };
}

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(snapshot);

  useEffect(() => {
    const onPopState = () => setLocation(snapshot());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const value = useMemo(
    () => ({
      location,
      navigate(to) {
        window.history.pushState({}, "", to);
        setLocation(snapshot());
      },
    }),
    [location],
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useLocation() {
  return useContext(RouterContext).location;
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function Link({ to, onClick, children, ...props }) {
  const navigate = useNavigate();
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

export function useParams() {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/decks\/([^/]+)$/);
  return { deckId: match ? decodeURIComponent(match[1]) : undefined };
}
