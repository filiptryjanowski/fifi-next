"use client"
import { useState, useEffect } from "react";
import Link from "next/link";



const defaultColors: Record<string, string> = {
  bg: "#000000",
  home: "#c0392b",
  onas: "#27ae60",
  kontakt: "#21618c",
  lock: "#b7950b",
  settings: "#c0392b",
  serviceCategory: "#444",
  serviceBtn: "#222",
};

export default function Home() {
  const [svgScales, setSvgScales] = useState<number[]>([1, 1, 1]);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [lockClosed, setLockClosed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [colors, setColors] = useState<Record<string, string>>({ ...defaultColors });
  const [services, setServices] = useState<{ id: number; name: string; price: string }[]>([]);
  // Koszyk: [{ name, price, qty }]
  const [cart, setCart] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");

  // Funkcja do parsowania ceny z tekstu (np. "250 zł / z fakturą 320 zł" -> 250)
  const parsePrice = (cennik: string) => {
    const match = cennik.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Obsługa kliknięcia usługi
  const handleServiceClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) return;
    const name = e.currentTarget.textContent || "";
    const cennik = e.currentTarget.getAttribute("data-cennik") || "";
    const price = parsePrice(cennik);
    setCart((prev) => {
      const idx = prev.findIndex(s => s.name === name);
      if (idx !== -1) {
        // Usługa już w koszyku: zwiększ qty i sumuj cenę
        return prev.map((s, i) => i === idx ? { ...s, qty: s.qty + 1 } : s);
      } else {
        return [...prev, { name, price, qty: 1 }];
      }
    });
  };

  // Usuwanie usługi z koszyka (zmniejsz qty lub usuń)
  const removeFromCart = (idx: number) => {
    setCart((prev) => {
      if (prev[idx].qty > 1) {
        return prev.map((s, i) => i === idx ? { ...s, qty: s.qty - 1 } : s);
      } else {
        return prev.filter((_, i) => i !== idx);
      }
    });
  };

  // Suma cen
  const total = cart.reduce((sum, s) => sum + s.price * s.qty, 0);

  // Wysyłka zamówienia
  const handleOrder = async () => {
    setOrderStatus("Wysyłanie...");
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user,
          subject: "Potwierdzenie zamówienia usług",
          text: `Zamówione usługi:\n${cart.map(s => `- ${s.name}: ${s.price} zł x ${s.qty}`).join("\n")}\nSuma: ${total} zł`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderStatus("Potwierdzenie wysłane na Twój e-mail!");
        setCart([]);
        setShowSummary(false);
      } else {
        setOrderStatus("Błąd wysyłki e-maila: " + (data.message || "Nie udało się wysłać"));
      }
    } catch (err) {
      setOrderStatus("Błąd połączenia z serwerem");
    }
  };

  useEffect(() => {
    const stored: Record<string, string> = {};
    Object.keys(defaultColors).forEach((key) => {
      const val = localStorage.getItem(key);
      if (val) stored[key] = val;
    });
    setColors((c) => ({ ...c, ...stored }));
    const user = localStorage.getItem("loggedUser");
    if (user) {
      setUser(user);
      setLockClosed(true);
    } else {
      setShowAuth(true);
      setLockClosed(false);
    }
  }, []);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("loggedUser");
      if (storedUser) {
        setUser(storedUser);
        setShowAuth(false);
        setLockClosed(true);
      } else {
        setShowAuth(true);
        setLockClosed(false);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  useEffect(() => {
    document.body.style.background = "#fff";
  }, []);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  const handleSvg = (idx: number, type: string) => {
    setSvgScales((prev) => {
      const arr = [...prev];
      if (type === "enter") arr[idx] = 1.2;
      if (type === "leave") arr[idx] = 1;
      if (type === "down") arr[idx] = 0.9;
      if (type === "up") arr[idx] = 1.2;
      return arr;
    });
  };

  const handleLoginBtn = () => {
    if (user) {
      setShowLogout(true);
    } else {
      setShowAuth(true);
    }
  };
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStatus(authMode === 'login' ? "Logowanie..." : "Rejestracja...");
    try {
      if (authMode === 'register') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success) {
          setAuthStatus("Rejestracja zakończona sukcesem. Możesz się zalogować.");
          setAuthMode('login');
        } else {
          setAuthStatus("Błąd: " + (data.message || "Nie udało się zarejestrować"));
        }
      } else {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success) {
          setUser(email);
          localStorage.setItem("loggedUser", email);
          setShowAuth(false);
          setLockClosed(true);
          setAuthStatus("");
        } else {
          setAuthStatus("Błąd: " + (data.message || "Nie udało się zalogować"));
        }
      }
    } catch (err) {
      setAuthStatus("Błąd połączenia z serwerem");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("loggedUser");
    setLockClosed(false);
    setShowLogout(false);
    setShowAuth(true);
  };

 

  const handleLockClick = () => {
    if (user) {
      setShowLogout(true);
    } else {
      setShowAuth(true);
    }
  };

  return (
    <>
      {showAuth && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000 }}>
          <form onSubmit={handleAuth} style={{ background: "#fff", border: "2px solid #000", borderRadius: 12, padding: "2rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.2rem", minWidth: 270, boxShadow: "0 0 24px 4px hsl(0, 0%, 16%)" }}>
            <h2 style={{ color: '#000', textAlign: 'center' }}>{authMode === 'login' ? 'Logowanie' : 'Rejestracja'}</h2>
            <label style={{ color: '#000', fontWeight: 'bold' }}>
              E-mail:
              <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={{ background: "#fff", color: "#000", border: "1px solid #000", borderRadius: 6, padding: "0.5rem", fontSize: "1rem", marginTop: "0.3rem" }} />
            </label>
            <label style={{ color: '#000', fontWeight: 'bold' }}>
              Hasło:
              <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={{ background: "#fff", color: "#000", border: "1px solid #000", borderRadius: 6, padding: "0.5rem", fontSize: "1rem", marginTop: "0.3rem" }} />
            </label>
            <button type="submit" style={{ background: "#000", color: "#fff", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }}>{authMode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}</button>
            <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ background: "#fff", color: "#000", border: "1px solid #000", borderRadius: 6, padding: "0.6rem 1.2rem", fontSize: "1rem", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}>{authMode === 'login' ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}</button>
            {authStatus && <div style={{ color: authStatus.includes("Błąd") ? "red" : "green", textAlign: 'center' }}>{authStatus}</div>}
          </form>
        </div>
      )}
      {showLogout && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000 }}>
          <div style={{ background: "#fff", border: "2px solid #000", borderRadius: 12, padding: "2rem 2.5rem", minWidth: 270, boxShadow: "0 0 24px 4px hsl(0, 0%, 16%)", display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
            <div style={{ color: '#000', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>Czy chcesz się wylogować?</div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleLogout} style={{ background: "#000", color: "#fff", border: "none", borderRadius: 6, padding: "0.6rem 1.2rem", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}>Tak</button>
              <button onClick={() => setShowLogout(false)} style={{ background: "#fff", color: "#000", border: "1px solid #000", borderRadius: 6, padding: "0.6rem 1.2rem", fontSize: "1rem", cursor: "pointer" }}>Nie</button>
            </div>
          </div>
        </div>
      )}
      <header>
        <nav>
          <ul
            style={{
              display: "flex",
              gap: "20px",
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            <li>
              <Link href="/" title="Strona główna">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    transition: "transform 0.2s",
                    transform: `scale(${svgScales[0]})`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => handleSvg(0, "enter")}
                  onMouseLeave={() => handleSvg(0, "leave")}
                  onMouseDown={() => handleSvg(0, "down")}
                  onMouseUp={() => handleSvg(0, "up")}
                >
                  <path d="M3 10L12 3L21 10V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10Z" stroke="#000" strokeWidth="2" fill="#fff" />
                  <rect x="8" y="14" width="8" height="7" fill="#fff" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="/o-nas" title="O nas">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    transition: "transform 0.2s",
                    transform: `scale(${svgScales[1]})`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => handleSvg(1, "enter")}
                  onMouseLeave={() => handleSvg(1, "leave")}
                  onMouseDown={() => handleSvg(1, "down")}
                  onMouseUp={() => handleSvg(1, "up")}
                >
                  <circle cx="12" cy="8" r="4" fill="#fff" stroke="#000" strokeWidth="2" />
                  <rect x="6" y="14" width="12" height="7" rx="6" fill="#fff" stroke="#000" strokeWidth="2" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="/kontakt" title="Kontakt">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    transition: "transform 0.2s",
                    transform: `scale(${svgScales[2]})`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => handleSvg(2, "enter")}
                  onMouseLeave={() => handleSvg(2, "leave")}
                  onMouseDown={() => handleSvg(2, "down")}
                  onMouseUp={() => handleSvg(2, "up")}
                >
                  <rect width="24" height="24" fill="none" />
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.36 11.36 0 003.54.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.54 1 1 0 01-.21 1.11l-2.2 2.2z" fill="#fff" stroke="#000" strokeWidth="2" />
                </svg>
              </Link>
            </li>
            <li>
              <button
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={handleLockClick}
              >
                <svg id="lock-icon" width="50" height="50" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="8" rx="2" fill="#fff" stroke="#000" strokeWidth="2" />
                  <path
                    id="lock-path"
                    d={lockClosed ? "M8 11V8a4 4 0 1 1 8 0v3" : "M16 8a4 4 0 0 0-8 0v3"}
                    stroke="#000"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section style={{ color: '#000' }}>
          <h2 style={{ color: '#000' }}>Wybierz kategorię usług</h2>
          <div className="kategorie-uslug">
            <div className="kategoria-blok">
              <button className="kategoria-btn" type="button">Usługi budowlane</button>
              <div className="uslugi-lista">
                <button className="service-btn" data-cennik="Malowanie: 250 zł / z fakturą 320 zł" onClick={handleServiceClick} disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>Malowanie</button>
                <button className="service-btn" data-cennik="Układanie płytek: 299 zł / z fakturą 350 zł" onClick={handleServiceClick} disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>Układanie płytek</button>
                <button className="service-btn" data-cennik="Montaż drzwi: 280 zł / z fakturą 330 zł" onClick={handleServiceClick} disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>Montaż drzwi</button>
                <button className="service-btn" data-cennik="Gładzie gipsowe: 300 zł / z fakturą 360 zł" onClick={handleServiceClick} disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>Gładzie gipsowe</button>
              </div>
            </div>
            <div className="kategoria-blok">
              <button className="kategoria-btn" type="button">Usługi egzorcystyczne</button>
              <div className="uslugi-lista">
                <button className="service-btn" data-cennik="Egzorcyzmy: 300 zł / z fakturą 350 zł" onClick={handleServiceClick} disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>Egzorcyzmy</button>
                <button className="service-btn" data-cennik="Usuwanie duchów: 250 zł / z fakturą 320 zł" onClick={handleServiceClick} disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>Usuwanie duchów</button>
                <button className="service-btn" data-cennik="Konsultacje paranormalne: 200 zł / z fakturą 310 zł" onClick={handleServiceClick} disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>Konsultacje paranormalne</button>
                <button className="service-btn" data-cennik="Szkolenia: 299 zł / z fakturą 399 zł" onClick={handleServiceClick} disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>Szkolenia z zakresu ochrony</button>
              </div>
            </div>
          </div>
          {/* Koszyk i zamówienie */}
          {user && cart.length > 0 && (
            <div style={{ marginTop: 32, background: '#fff', border: '2px solid #000', borderRadius: 12, padding: '1.2rem 2rem', boxShadow: '0 0 16px 2px hsl(0,0%,80%)', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              <h3 style={{ color: '#000', margin: 0, marginBottom: 12 }}>Twój wybór:</h3>
              <ul style={{ color: '#000', padding: 0, margin: 0, listStyle: 'none' }}>
                {cart.map((s, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span>{s.name} — {s.price} zł x {s.qty} = {s.price * s.qty} zł</span>
                    <button onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', color: '#c00', fontWeight: 'bold', cursor: 'pointer', fontSize: 18 }}>×</button>
                  </li>
                ))}
              </ul>
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>Suma: {total} zł</div>
              <button onClick={() => setShowSummary(true)} style={{ marginTop: 16, background: '#000', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.2rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}>Zamów</button>
            </div>
          )}
          {showSummary && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
              <div style={{ background: '#fff', border: '2px solid #000', borderRadius: 12, padding: '2rem 2.5rem', minWidth: 320, boxShadow: '0 0 24px 4px hsl(0, 0%, 16%)', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'stretch' }}>
                <h2 style={{ color: '#000', textAlign: 'center', margin: 0, fontWeight: 700, fontSize: '1.2rem' }}>Podsumowanie zamówienia</h2>
                <ul style={{ color: '#000', padding: 0, margin: 0, listStyle: 'none' }}>
                  {cart.map((s, idx) => (
                    <li key={idx}>{s.name} — {s.price} zł x {s.qty} = {s.price * s.qty} zł</li>
                  ))}
                </ul>
                <div style={{ fontWeight: 'bold', marginTop: 8 }}>Suma: {total} zł</div>
                <button onClick={handleOrder} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.2rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}>Potwierdź zamówienie</button>
                <button onClick={() => setShowSummary(false)} style={{ background: '#fff', color: '#000', border: '1px solid #000', borderRadius: 6, padding: '0.6rem 1.2rem', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}>Anuluj</button>
                {orderStatus && <div style={{ color: orderStatus.includes("Błąd") ? "red" : "green", textAlign: 'center' }}>{orderStatus}</div>}
              </div>
            </div>
          )}
        </section>
      </main>
      <div
        style={{ position: "fixed", top: "1.2rem", left: "2rem", color: "white", fontWeight: "bold", zIndex: 2000 }}
      >
        {user}
      </div>
      <footer></footer>
    </>
  );
}

