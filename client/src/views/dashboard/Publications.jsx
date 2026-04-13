import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE    from "../../assets/nere.jpg";
const PUBLICATIONS_MOCK = [
  {
    id: 1, categorie: "Rapport", date: "28 Fév. 2025", accessLevel: 0,
    titre: "Enquête sur le commerce de détail au Burkina Faso",
    extrait: "Analyse des tendances du commerce informel et formel dans les principales villes. Cette étude couvre les régions du Centre, des Hauts-Bassins et du Nord.",
    tags: ["Commerce", "Ouagadougou", "2025"],
  },
  {
    id: 2, categorie: "Étude", date: "15 Fév. 2025", accessLevel: 0,
    titre: "Indice PME – T4 2024 : Reprise prudente",
    extrait: "Les petites et moyennes entreprises montrent des signes de stabilisation. L'indice global remonte de 2,3 points par rapport au trimestre précédent.",
    tags: ["PME", "Économie", "T4 2024"],
  },
  {
    id: 3, categorie: "Classement", date: "10 Fév. 2025", accessLevel: 1,
    titre: "Top 100 entreprises BTP – Burkina Faso 2024",
    extrait: "Classement exclusif des entreprises du secteur BTP par chiffre d'affaires déclaré au NERE. Méthodologie et données complètes incluses.",
    tags: ["BTP", "Classement", "2024"],
  },
  {
    id: 4, categorie: "Communiqué", date: "5 Fév. 2025", accessLevel: 0,
    titre: "CCI-BF : Lancement du Programme d'Appui aux Exportateurs",
    extrait: "La Chambre de Commerce annonce un nouveau programme destiné à accompagner les entreprises burkinabè dans leurs démarches d'exportation vers la sous-région.",
    tags: ["Export", "CCI-BF", "Programme"],
  },
  {
    id: 5, categorie: "Note technique", date: "1 Fév. 2025", accessLevel: 2,
    titre: "Données financières secteur Agriculture 2024",
    extrait: "Analyse détaillée des chiffres d'affaires et des effectifs des entreprises agricoles enregistrées au NERE sur l'ensemble du territoire national.",
    tags: ["Agriculture", "Finance", "Pro+"],
  },
  {
    id: 6, categorie: "Rapport", date: "20 Jan. 2025", accessLevel: 0,
    titre: "Bilan économique 2024 – CCI-BF",
    extrait: "Rétrospective complète de l'activité économique du Burkina Faso en 2024. Chiffres clés, tendances et perspectives pour 2025.",
    tags: ["Bilan", "2024", "Économie"],
  },
];

const CATEGORIES = ["Toutes", "Rapport", "Étude", "Classement", "Note technique", "Communiqué"];

const ACCESS_LABELS = {
  0: { label: "Public",  color: "#22A052", bg: "rgba(34,160,82,0.1)"  },
  1: { label: "Basic+",  color: "#1A7A40", bg: "rgba(26,122,64,0.1)"  },
  2: { label: "Pro+",    color: "#D4A830", bg: "rgba(212,168,48,0.1)" },
  3: { label: "Premium", color: "#E85555", bg: "rgba(232,85,85,0.1)"  },
};

function masquerTout(texte) {
  return texte.replace(/[^\s]/g, "X");
}

function masquerPartiel(texte) {
  const mots = texte.split(" ");
  return mots.map((mot, i) => i < 2 ? mot : mot.replace(/[^\s]/g, "X")).join(" ");
}

export default function Publications() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [filtre, setFiltre]       = useState("Toutes");
  const [recherche, setRecherche] = useState("");
  const [selected, setSelected]   = useState(null);
  const [pubs, setPubs]           = useState(PUBLICATIONS_MOCK);
  const [loading, setLoading]     = useState(true);
  const [menuOpen, setMenuOpen]   = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const chargerPubs = async () => {
    try {
      const res  = await fetch("http://localhost:5000/api/publications");
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const pubsFormatees = data.data.map(p => ({
          id:          p._id,
          titre:       p.titre,
          extrait:     p.extrait || (p.contenu ? p.contenu.substring(0, 150) + "..." : ""),
          contenu:     p.contenu || "",
          categorie:   p.categorie || "Rapport",
          date:        new Date(p.createdAt).toLocaleDateString("fr-FR", {day:"2-digit", month:"long", year:"numeric"}),
          tags:        [p.categorie || "Rapport"],
          accessLevel: (p.accesPack || 1) - 1,
          vues:        p.vues || 0,
        }));
        setPubs(pubsFormatees);
      }
    } catch(e) {
      console.warn("⚠️ API indisponible, utilisation des données mock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    chargerPubs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
  };

  const initiales = user
    ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase()
    : "";

  const isVisiteur = !user;
  const packLevel  = user ? 1 : 0;

  const pubsFiltrees = pubs.filter((p) => {
    const matchCat    = filtre === "Toutes" || p.categorie === filtre;
    const matchSearch = p.titre.toLowerCase().includes(recherche.toLowerCase()) ||
                        (p.tags || []).some(t => t.toLowerCase().includes(recherche.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* ── FOND ── */}
      <div className="dash-bg">
        <div className="grid" />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ══ NAVBAR ══ */}
        <nav className="dash-navbar">

      <div className="dash-logo">
  <img src={logoNERE} alt="NERE" />
  <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
    <span style={{ fontSize:"11px", fontWeight:800, letterSpacing:"0.06em", textTransform:"uppercase", color:"#fff" }}>
      Fichier NERE
    </span>
    <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.85)", lineHeight:1.4 }}>
      Registre national des entreprises<br/>Du Burkina Faso
    </span>
  </div>
</div>
          {/* LIENS */}
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link active">Publications</span>
            <span className="dash-nav-link" onClick={() => navigate("/rechercheacc")}>Recherche</span>
            <span className="dash-nav-link" onClick={() => navigate("/contact")}>Contact</span>
            <span className="dash-nav-link" onClick={() => navigate("/chat")}>Chat</span>
          </div>

          {/* ACTIONS */}
          <div className="dash-nav-actions">
            {user ? (
              <div style={{ position: "relative" }}>
                <div className="user-chip" onClick={() => setMenuOpen(o => !o)}>
                  <div className="user-avatar">{initiales}</div>
                  <span>{user.prenom} {user.nom}</span>
                  <span style={{ fontSize: "10px", opacity: 0.5, marginLeft: "2px" }}>▾</span>
                </div>
                {menuOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(false)} />
                    <div style={{
                      position: "absolute", zIndex: 9999,
                      background: "#00904C",
                      top: "calc(100% + 8px)", right: 0,
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      minWidth: "200px",
                      overflow: "hidden",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
                    }} onClick={e => e.stopPropagation()}>
                      <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: "14px" }}>{user.prenom} {user.nom}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{user.email || "—"}</div>
                        <div style={{ fontSize: "11px", color: "#4DC97A", marginTop: "4px", fontWeight: 600 }}>
                          {user.role === "admin" ? "Administrateur" : "Pack · Actif"}
                        </div>
                      </div>
                      {[
                        { label: "Mon Profil",      path: "/profil" },
                        { label: "Mon Abonnement",  path: "/paiement" },
                        { label: "Historique",      path: "/profil" },
                        { label: "Sécurité",        path: "/profil" },
                        { label: "Notifications",   path: "/profil" },
                      ].map(item => (
                        <div key={item.label}
                          style={{ padding: "11px 16px", color: "rgba(255,255,255,0.85)", fontSize: "13px", cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                          {item.label}
                        </div>
                      ))}
                      {user.role === "admin" && (
                        <div style={{ padding: "11px 16px", color: "rgba(255,255,255,0.85)", fontSize: "13px", cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                          Tableau de bord
                        </div>
                      )}
                      {user.role === "manager" && (
                        <div style={{ padding: "11px 16px", color: "rgba(255,255,255,0.85)", fontSize: "13px", cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}>
                          Tableau de bord
                        </div>
                      )}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ padding: "11px 16px", color: "#FF6B6B", fontSize: "13px", cursor: "pointer", fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,107,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          onClick={handleLogout}>
                          Déconnexion
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button className="btn-nav-outline" onClick={() => navigate("/connexion")}>Connexion</button>
                <button className="btn-nav-primary" onClick={() => navigate("/inscription")}>S'inscrire</button>
              </>
            )}
          </div>
        </nav>

        {/* ── BANNIÈRE VISITEUR ── */}
       {isVisiteur && (
  <div style={{
    background: "rgba(237,28,36,0.85)",
    padding: "10px 0",
    borderBottom: "3px solid var(--green-light)",
    overflow: "hidden",
    whiteSpace: "nowrap",
  }}>
    <div style={{
      display: "inline-block",
      animation: "defilement 18s linear infinite",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 600,
    }}>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      Contenu masqué — inscrivez-vous pour accéder aux informations complètes
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      Contenu masqué — inscrivez-vous pour accéder aux informations complètes
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      Contenu masqué — inscrivez-vous pour accéder aux informations complètes
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </div>

    <style>{`
      @keyframes defilement {
        0%   { transform: translateX(100vw); }
        100% { transform: translateX(-100%); }
      }
    `}</style>
  </div>
)}

        {/* ── HERO ── */}
        <div className="pub-page-hero">
          <div className="pub-page-tag">Publications CCI-BF</div>
          <h1 className="pub-page-title">Actualités et Études économiques</h1>
          <p className="pub-page-desc">
            Rapports, classements et analyses sur l'économie du Burkina Faso
          </p>
          <div className="pub-search-bar">
            <span className="pub-search-icon"></span>
            <input
              className="pub-search-input"
              placeholder="Rechercher par titre, catégorie, mot-clé..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
            />
            {recherche && (
              <span className="pub-search-clear" onClick={() => setRecherche("")}>✕</span>
            )}
          </div>
        </div>

        {/* ── FILTRES ── */}
        <div className="pub-filtres">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`pub-filtre-btn ${filtre === cat ? "active" : ""}`}
              onClick={() => setFiltre(cat)}
            >
              {cat}
            </button>
          ))}
          <span className="pub-count">
            {pubsFiltrees.length} publication{pubsFiltrees.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* ── GRILLE ── */}
        <div className="pub-page-grid">
          {pubsFiltrees.map((pub) => {
            const locked = pub.accessLevel > packLevel;
            const access = ACCESS_LABELS[pub.accessLevel];

            return (
              <div
                key={pub.id}
                className={`pub-page-card ${locked || isVisiteur ? "locked" : ""}`}
                onClick={() => !locked && !isVisiteur && setSelected(pub)}
              >
                <div className="pub-access-badge"
                  style={{ background: access.bg, color: access.color, border: `1px solid ${access.color}44` }}>
                  {locked || isVisiteur ? " " : " "}{access.label}
                </div>

                <div className="pub-card-cat">{pub.categorie}</div>

                <div className="pub-card-date" style={isVisiteur ? { fontFamily: "monospace" } : {}}>
                  {isVisiteur ? masquerTout(pub.date) : pub.date}
                </div>

                <div className="pub-card-title" style={isVisiteur ? { fontFamily: "monospace", letterSpacing: "0.03em" } : {}}>
                  {isVisiteur ? masquerPartiel(pub.titre) : pub.titre}
                </div>

                {isVisiteur ? (
                  <>
                    <div className="pub-card-extrait" style={{
                      fontFamily: "monospace", letterSpacing: "0.04em",
                      color: "var(--text-muted)", userSelect: "none", lineHeight: "1.8",
                    }}>
                      {masquerTout(pub.extrait)}
                    </div>
                    <div className="pub-card-footer" style={{ marginTop: "auto" }}>
                      <div className="pub-card-tags">
                        {pub.tags.map((t, i) => (
                          <span key={i} className="pub-tag" style={{
                            fontFamily: "monospace", letterSpacing: "0.05em", color: "var(--text-muted)",
                          }}>
                            {masquerTout(t)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="btn-upgrade"
                      style={{ marginTop: "14px", width: "100%", padding: "10px" }}
                      onClick={e => { e.stopPropagation(); navigate("/inscription"); }}>
                      S'inscrire pour lire
                    </button>
                  </>
                ) : locked ? (
                  <div className="pub-card-locked-msg">
                    <div className="lock-icon"></div>
                    <div>Réservé aux abonnés <strong>{access.label}</strong></div>
                    <button className="btn-upgrade"
                      onClick={e => { e.stopPropagation(); navigate("/inscription"); }}>
                      S'abonner
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="pub-card-extrait">{pub.extrait}</div>
                    <div className="pub-card-footer">
                      <div className="pub-card-tags">
                        {pub.tags.map(t => <span key={t} className="pub-tag">{t}</span>)}
                      </div>
                      <span className="pub-card-read">Lire →</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ── MODAL ── */}
        {selected && !isVisiteur && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              <div className="modal-cat">{selected.categorie} · {selected.date}</div>
              <h2 className="modal-title">{selected.titre}</h2>
              <div className="modal-tags">
                {selected.tags.map(t => <span key={t} className="pub-tag">{t}</span>)}
              </div>
              <div className="modal-body">
                <p>{selected.extrait}</p>
                <p style={{ marginTop: "16px", opacity: 0.5, fontSize: "13px" }}>
                  [Contenu complet — sera chargé depuis l'API backend]
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="dash-footer">
          <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <span>Tarifs officiels CCI-BF</span>
            <span>+226 25 30 61 22</span>
          </div>
        </footer>

      </div>
    </div>
  );
}