"use client"
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function ONas() {
    const [showAuth, setShowAuth] = useState(true);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authStatus, setAuthStatus] = useState("");
    const [user, setUser] = useState<string | null>(null);
    const [lockClosed, setLockClosed] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const loginModalRef = useRef<HTMLDivElement>(null);

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
                <div id="clock" style={{ color: "white", fontSize: "2rem", letterSpacing: "2px" }}></div>
                <nav>
                    <ul style={{ display: "flex", gap: "20px", listStyle: "none", padding: 0, margin: 0 }}>
                        <li>
                            <Link href="/" title="Strona główna">
                                {/* Ikona HOME */}
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 10L12 3L21 10V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10Z" stroke="#000" strokeWidth="2" fill="#fff" />
                                    <rect x="8" y="14" width="8" height="7" fill="#fff" />
                                </svg>
                            </Link>
                        </li>
                        <li>
                            <Link href="/o-nas" title="O nas">
                                {/* Ikona CZŁOWIEK */}
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="8" r="4" fill="#fff" stroke="#000" strokeWidth="2" />
                                    <rect x="6" y="14" width="12" height="7" rx="6" fill="#fff" stroke="#000" strokeWidth="2" />
                                </svg>
                            </Link>
                        </li>
                        <li>
                            <Link href="/kontakt" title="Kontakt">
                                {/* Ikona TELEFON */}
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                                    <rect width="24" height="24" fill="none" />
                                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.36 11.36 0 003.54.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.54 1 1 0 01-.21 1.11l-2.2 2.2z" fill="#fff" stroke="#000" strokeWidth="2" />
                                </svg>
                            </Link>
                        </li>
                        <li>
                            <button id="login-btn" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={handleLockClick}>
                                <svg id="lock-icon" width="50" height="50" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="8" rx="2" fill="#fff" stroke="#000" strokeWidth="2" />
                                    <path id="lock-path" d={lockClosed ? "M8 11V8a4 4 0 1 1 8 0v3" : "M16 8a4 4 0 0 0-8 0v3"} stroke="#000" strokeWidth="2" fill="none" />
                                </svg>
                            </button>
                        </li>
                    </ul>
                </nav>
            </header>
            <main>
                <section style={{ color: '#000' }}>
                    <h2 style={{ color: '#000' }}>O nas</h2>
                    <p>Jesteśmy zespołem profesjonalistów łapiących siły nieczyste oraz pomagających w ich egzorcyzmowaniu.</p>
                    <p>Nasza misja to zapewnienie bezpieczeństwa i spokoju naszym klientom poprzez skuteczne usuwanie niepożądanych bytów.</p>
                    <h2 style={{ color: '#000' }}>Nasze usługi</h2>
                    <ul style={{ color: '#000' }}>
                        <li>Egzorcyzmy</li>
                        <li>Usuwanie duchów</li>
                        <li>Konsultacje paranormalne</li>
                        <li>Szkolenia z zakresu ochrony przed siłami nieczystymi</li>
                    </ul>
                    <h2 style={{ color: '#000' }}>Nasza historia</h2>
                    <p>Nasza firma została założona w 1990 roku przez Bogdana Bonera, który od lat zajmuje się egzorcyzmami i ochroną przed siłami nieczystymi. Z biegiem lat zespół się powiększył, a my zdobyliśmy doświadczenie w pracy z różnymi przypadkami.</p>
                    <p>Współpracujemy z lokalnymi duchownymi oraz specjalistami z dziedziny parapsychologii, aby zapewnić naszym klientom kompleksową pomoc.</p>
                    <h2 style={{ color: '#000' }}>Nasi pracownicy</h2>
                    <ul style={{ color: '#000' }}>
                        <li>Bogdan Boner - założyciel i główny egzorcysta</li>
                        <li>Marcin Łopian - młodszy egzorcysta</li>
                        <li>Domino Jahaś - debil </li>
                    </ul>
                </section>
            </main>
            <div id="logged-user" style={{ position: "fixed", top: "1.2rem", left: "2rem", color: "white", fontWeight: "bold", zIndex: 2000 }}>{user}</div>
            <footer></footer>
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
        </>
    );
} 