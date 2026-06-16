import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

export interface Route {
  path: string;
  segments: string[];
  view: string;
  param?: string;
}

function parse(hash: string): Route {
  const clean = hash.replace(/^#/, "").replace(/^\//, "");
  const segments = clean.split("/").filter(Boolean);
  const view = segments[0] ?? "dashboard";
  return {
    path: clean,
    segments,
    view,
    param: segments[1],
  };
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    parse(window.location.hash || "#/")
  );
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash || "#/"));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function navigate(path: string) {
  const target = path.startsWith("#") ? path : "#" + (path.startsWith("/") ? path : "/" + path);
  if (window.location.hash === target) {
    // force re-render even if same hash
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = target;
  }
  window.scrollTo({ top: 0, behavior: "auto" });
}

interface NavContextValue {
  route: Route;
}
export const NavContext = createContext<NavContextValue>({ route: { path: "", segments: [], view: "dashboard" } });

export function useNav() {
  return useContext(NavContext);
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const handle = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      navigate(to);
      onClick?.(e);
    },
    [to, onClick]
  );
  const href = "#" + (to.startsWith("/") ? to : "/" + to);
  return (
    <a href={href} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
