import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

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

// Remplace chaque caractère non-espace par X
function masquerTout(texte) {
  return texte.replace(/[^\s]/g, "X");
}

// Garde les 2 premiers mots lisibles, masque le reste
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
  const [showForm, setShowForm]   = useState(false);
  const [editPub, setEditPub]     = useState(null);
  const [formPub, setFormPub]     = useState({ titre:"", cat:"Rapport", contenu:"", statut:"brouillon" });
  const [pubError, setPubError]   = useState("");
  const [pubSaving, setPubSaving] = useState(false);

  const canEdit = user && ["admin","manager"].includes(user.role);

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

  const sauvegarderPub = async () => {
    if (!formPub.titre.trim()) {
      setPubError("Le titre est obligatoire.");
      return;
    }
    setPubError("");
    setPubSaving(true);
    try {
      const url    = editPub ? `http://localhost:5000/api/publications/${editPub.id}` : "http://localhost:5000/api/publications";
      const method = editPub ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          titre: formPub.titre,
          categorie: formPub.cat,
          contenu: formPub.contenu,
          statut: formPub.statut,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setPubError(data.message || "Erreur lors de la sauvegarde.");
      } else {
        await chargerPubs();
        setShowForm(false);
        setEditPub(null);
        setFormPub({ titre:"", cat:"Rapport", contenu:"", statut:"brouillon" });
      }
    } catch (err) {
      setPubError("Serveur indisponible.");
    } finally {
      setPubSaving(false);
    }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    chargerPubs();
  }, []);

  const isVisiteur = !user;
  const packLevel  = user ? 1 : 0;

  const pubsFiltrees = pubs.filter((p) => {
    const matchCat = filtre === "Toutes" || p.categorie === filtre;
    const matchSearch = p.titre.toLowerCase().includes(recherche.toLowerCase()) ||
                        (p.tags || []).some(t => t.toLowerCase().includes(recherche.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── FOND BLANC ── */}
      <div className="dash-bg">
        <div className="grid" />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── NAVBAR ── */}
        <nav className="dash-navbar">
          <div className="dash-logo" onClick={() => navigate("/")}>NERE <span>CCI-BF</span></div>
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link active">Publications</span>
            
          </div>
          <div className="dash-nav-actions">
            {user ? (
              <div className="user-chip" onClick={() => navigate("/profil")}>
                <div className="user-avatar">{user.prenom?.[0]}{user.nom?.[0]}</div>
                <span>{user.prenom} {user.nom}</span>
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
            background: "linear-gradient(90deg, var(--green-deep), var(--green-mid))",
            padding: "14px 48px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "3px solid var(--green-light)",
            flexWrap: "wrap", gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}></span>
              <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>
                Contenu masqué — inscrivez-vous pour accéder aux informations complètes
              </span>
            </div>
          
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
                {/* Badge accès */}
                <div className="pub-access-badge"
                  style={{ background: access.bg, color: access.color, border: `1px solid ${access.color}44` }}>
                  {locked || isVisiteur ? " " : " "}{access.label}
                </div>

                <div className="pub-card-cat">{pub.categorie}</div>

                {/* Date masquée */}
                <div className="pub-card-date" style={isVisiteur ? { fontFamily: "monospace" } : {}}>
                  {isVisiteur ? masquerTout(pub.date) : pub.date}
                </div>

                {/* Titre : 2 premiers mots lisibles, reste en XXXXX */}
                <div className="pub-card-title" style={isVisiteur ? { fontFamily: "monospace", letterSpacing: "0.03em" } : {}}>
                  {isVisiteur ? masquerPartiel(pub.titre) : pub.titre}
                </div>

                {/* Corps selon statut */}
                {isVisiteur ? (
                  /* ─── VISITEUR : tout masqué ─── */
                  <>
                    <div className="pub-card-extrait" style={{
                      fontFamily: "monospace",
                      letterSpacing: "0.04em",
                      color: "var(--text-muted)",
                      userSelect: "none",
                      lineHeight: "1.8",
                    }}>
                      {masquerTout(pub.extrait)}
                    </div>

                    <div className="pub-card-footer" style={{ marginTop: "auto" }}>
                      <div className="pub-card-tags">
                        {pub.tags.map((t, i) => (
                          <span key={i} className="pub-tag" style={{
                            fontFamily: "monospace",
                            letterSpacing: "0.05em",
                            color: "var(--text-muted)",
                          }}>
                            {masquerTout(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn-upgrade"
                      style={{ marginTop: "14px", width: "100%", padding: "10px" }}
                      onClick={e => { e.stopPropagation(); navigate("/inscription"); }}
                    >
                       S'inscrire pour lire
                    </button>
                  </>

                ) : locked ? (
                  /* ─── CONNECTÉ MAIS PACK INSUFFISANT ─── */
                  <div className="pub-card-locked-msg">
                    <div className="lock-icon"></div>
                    <div>Réservé aux abonnés <strong>{access.label}</strong></div>
                    <button className="btn-upgrade"
                      onClick={e => { e.stopPropagation(); navigate("/inscription"); }}>
                      S'abonner
                    </button>
                  </div>

                ) : (
                  /* ─── CONNECTÉ ET ACCÈS OK ─── */
                  <>
                    <div className="pub-card-extrait">{pub.extrait}</div>
                    <div className="pub-card-footer">
                      <div className="pub-card-tags">
                        {pub.tags.map(t => <span key={t} className="pub-tag">{t}</span>)}
                      </div>
                      <span className="pub-card-read">Lire </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ── MODAL LECTURE (connectés seulement) ── */}
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
          <div style={{display:"flex",gap:"20px"}}>
            <span>Tarifs officiels CCI-BF</span>
            <span>+226 25 30 61 22</span>
          </div>
        </footer>

      </div>
    </div>
  );
}