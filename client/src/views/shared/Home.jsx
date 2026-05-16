import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logoCCI               from "../../assets/ccibf.png";
import logoNERE              from "../../assets/nere.png";
import logoCEFORE            from "../../assets/cefore.png";
import logoDouanes           from "../../assets/douanes.png";
import logoCNSS              from "../../assets/cnss.png";
import logoJustice           from "../../assets/justice.png";
import logoCommerce          from "../../assets/tribunal.jpg";
import logoDGI               from "../../assets/impots.jpg";
import logoINSD              from "../../assets/INSD.png";
import logoSONABEL           from "../../assets/SONABEL.jpg";
import logoLA_POSTE          from "../../assets/LaPoste.jpg";
import logoMAISON_ENTREPRISE from "../../assets/MDE.png";

const PARTENAIRES = [
  { logo: logoCCI,              nom: "CCI-BF",                  type: "Institution consulaire",   contribution: "Gestion et mise à jour du fichier NERE.",    badge: "Partenaire principal",     lien: "https://www.cci.bf/" },
  { logo: logoCEFORE,           nom: "CEFORE",                  type: "Centre de formalités",     contribution: "Facilite la création d'entreprises.",         badge: "Création entreprise",      lien: "https://creerentreprise.me.bf/" },
  { logo: logoDouanes,          nom: "Douanes",                 type: "Administration douanière", contribution: "Données import/export.",                      badge: "Commerce certifié",        lien: "https://www.douanes.gov.bf/" },
  { logo: logoCNSS,             nom: "CNSS",                    type: "Sécurité sociale",         contribution: "Données sociales des employés.",              badge: "Emploi vérifié",           lien: "https://www.cnss.bf/" },
  { logo: logoJustice,          nom: "Ministère de la Justice", type: "Institution judiciaire",   contribution: "Validation juridique des entreprises.",       badge: "Conformité légale",        lien: "https://www.justice.gov.bf/" },
  { logo: logoCommerce,         nom: "Tribunal de Commerce",    type: "Institution judiciaire",   contribution: "Enregistrement légal des entreprises.",       badge: "RCCM validé",              lien: "#" },
  { logo: logoDGI,              nom: "DGI",                     type: "Administration fiscale",   contribution: "Validation des numéros IFU.",                 badge: "IFU vérifié",              lien: "https://www.impots.gov.bf/" },
  { logo: logoINSD,             nom: "INSD",                    type: "Statistique nationale",    contribution: "Fournit les indicateurs économiques.",        badge: "Statistiques officielles", lien: "https://www.insd.bf/" },
  { logo: logoSONABEL,          nom: "SONABEL",                 type: "Entreprise publique",      contribution: "Fourniture d'électricité.",                   badge: "Service énergétique",      lien: "https://www.sonabel.bf/" },
  { logo: logoLA_POSTE,         nom: "La Poste BF",             type: "Service postal",           contribution: "Services postaux et financiers.",             badge: "Service postal",           lien: "https://laposte.bf/" },
  { logo: logoMAISON_ENTREPRISE,nom: "Maison de l'Entreprise",  type: "Accompagnement",           contribution: "Appui aux entreprises.",                      badge: "Support PME",              lien: "#" },
];

const NAV_LINKS = [
  { label: "Accueil",      path: "/",            key: "accueil"      },
  { label: "Publications", path: "/publications", key: "publications" },
  { label: "Recherche",    path: "/rechercheacc", key: "recherche"    },
  { label: "Contact",      path: "/contact",      key: "contact"      },
  { label: "Messages",     path: "/chat",         key: "messages"     },
];

const API = "/api";
const getToken = () => localStorage.getItem("token");
const TUTORIEL_KEY = "nere_tutoriel_vu";

/* ══════════════════════════════════════════════════
   ÉTAPES DU TUTORIEL
══════════════════════════════════════════════════ */
const ETAPES_TUTORIEL = [
  {
    id: 1,
    titre: "Bienvenue sur la plateforme NERE CCI-BF !",
    description: "Ce guide rapide va vous montrer comment tirer le meilleur parti de la plateforme en quelques étapes simples.",
    action: null,
    couleur: "#00904C",
  },
  {
    id: 2,
    titre: "Recherchez une entreprise ou association",
    description: "Utilisez la page Recherche pour trouver n'importe quelle entreprise ou association enregistrée au Burkina Faso. Recherchez par RCCM, IFU ou raison sociale. Coût : 250 FCFA par recherche.",
    action: { label: "Essayer la recherche →", path: "/rechercheacc" },
    couleur: "#1E60CC",
  },
  {
    id: 3,
    titre: "Faites une demande de données officielles",
    description: "Besoin d'une liste d'entreprises, de statistiques sectorielles ou d'une fiche complète ? Rendez-vous sur la page Demande pour obtenir des données officielles de la CCI-BF.",
    action: { label: "Voir les demandes →", path: "/demande-document" },
    couleur: "#D4A830",
  },
  {
    id: 4,
    titre: "Rechargez votre solde",
    description: "Toutes les requêtes sont payantes au solde. Rechargez votre compte à partir de 5 000 FCFA pour accéder aux données. Plus votre solde est élevé, plus vous avez accès à des fonctionnalités avancées.",
    action: { label: "Voir les formules →", path: "/formules" },
    couleur: "#00904C",
  },
  {
    id: 5,
    titre: "La messagerie intégrée",
    description: "Vous avez une question ou besoin d'un document spécial ? Contactez directement un agent CCI-BF via la messagerie. Les demandes de Fiche et de Répertoire Thématique sont traitées par ce canal.",
    action: { label: "Ouvrir la messagerie →", path: "/chat" },
    couleur: "#7C3AED",
  },
  {
    id: 6,
    titre: "Vous êtes prêt !",
    description: "Vous connaissez maintenant l'essentiel de la plateforme. Rechargez votre solde pour commencer à accéder aux données économiques officielles du Burkina Faso.",
    action: { label: "Recharger mon solde →", path: "/formules" },
    couleur: "#00904C",
  },
];

/* ══════════════════════════════════════════════════
   COMPOSANT TUTORIEL
══════════════════════════════════════════════════ */
function TutorielModal({ onFermer, navigate }) {
  const [etapeActuelle, setEtapeActuelle] = useState(0);
  const [animer, setAnimer] = useState(false);

  const etape = ETAPES_TUTORIEL[etapeActuelle];
  const estDerniere = etapeActuelle === ETAPES_TUTORIEL.length - 1;
  const progression = ((etapeActuelle + 1) / ETAPES_TUTORIEL.length) * 100;

  const allerEtapeSuivante = () => {
    if (estDerniere) { onFermer(); return; }
    setAnimer(true);
    setTimeout(() => { setEtapeActuelle(e => e + 1); setAnimer(false); }, 200);
  };

  const allerEtapePrecedente = () => {
    if (etapeActuelle === 0) return;
    setAnimer(true);
    setTimeout(() => { setEtapeActuelle(e => e - 1); setAnimer(false); }, 200);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:2000,
      background:"rgba(5,30,10,0.75)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px", animation:"fadeInOverlay 0.3s ease",
    }}>
      <style>{`
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideUpCard { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes fadeSlide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .tuto-card { animation: slideUpCard 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        .tuto-icon { animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .tuto-content { animation: fadeSlide 0.3s ease 0.15s both; }
        .tuto-btn-primary {
          flex:1; padding:13px 20px; border:none; border-radius:10px;
          font-size:14px; font-weight:700; cursor:pointer;
          font-family:'Sora',sans-serif; transition:all 0.18s;
        }
        .tuto-btn-primary:hover { filter:brightness(1.08); transform:translateY(-1px); }
        .tuto-btn-ghost {
          padding:13px 18px; border:1.5px solid #E0EAE2; border-radius:10px;
          background:transparent; color:#6B9A7A; font-size:14px; font-weight:600;
          cursor:pointer; font-family:'Sora',sans-serif; transition:all 0.18s;
        }
        .tuto-btn-ghost:hover { border-color:#00904C; color:#00904C; }
        .step-dot { width:8px; height:8px; border-radius:50%; cursor:pointer; transition:all 0.2s; }
      `}</style>

      <div className="tuto-card" style={{
        background:"#fff", borderRadius:"24px", width:"100%", maxWidth:"520px",
        boxShadow:"0 32px 80px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1)",
        overflow:"hidden", position:"relative",
      }}>
        {/* Barre de progression */}
        <div style={{ height:"4px", background:"#F0F4F1", position:"relative" }}>
          <div style={{
            position:"absolute", left:0, top:0, height:"100%",
            background:`linear-gradient(90deg, ${etape.couleur}, ${etape.couleur}CC)`,
            width:`${progression}%`,
            transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)",
            borderRadius:"0 2px 2px 0",
          }}/>
        </div>

        {/* En-tête coloré */}
        <div style={{
          background:`linear-gradient(135deg, ${etape.couleur}15, ${etape.couleur}08)`,
          borderBottom:`1px solid ${etape.couleur}20`,
          padding:"32px 36px 24px",
          display:"flex", flexDirection:"column", alignItems:"center",
          textAlign:"center",
        }}>
          {/* Icône */}
          <div className="tuto-icon" style={{
            width:"80px", height:"80px", borderRadius:"50%",
            background:`linear-gradient(135deg, ${etape.couleur}20, ${etape.couleur}10)`,
            border:`2px solid ${etape.couleur}30`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"36px", marginBottom:"16px",
          }}>
            {etape.icone}
          </div>

          {/* Étape */}
          <div style={{
            fontSize:"10px", fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.12em", color:etape.couleur, marginBottom:"10px",
          }}>
            Étape {etapeActuelle + 1} / {ETAPES_TUTORIEL.length}
          </div>

          {/* Titre */}
          <div className="tuto-content" style={{
            fontSize:"20px", fontWeight:800, color:"#0A2410", lineHeight:1.3,
          }}>
            {etape.titre}
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding:"24px 36px 28px" }}>
          <p className="tuto-content" style={{
            fontSize:"14px", color:"#4A6A4A", lineHeight:1.75,
            marginBottom:"24px", textAlign:"center",
          }}>
            {etape.description}
          </p>

          {/* Points de navigation */}
          <div style={{ display:"flex", justifyContent:"center", gap:"8px", marginBottom:"24px" }}>
            {ETAPES_TUTORIEL.map((_, i) => (
              <div key={i} className="step-dot"
                onClick={() => setEtapeActuelle(i)}
                style={{
                  background: i === etapeActuelle ? etape.couleur :
                              i < etapeActuelle   ? `${etape.couleur}60` : "#E0EAE2",
                  transform: i === etapeActuelle ? "scale(1.4)" : "scale(1)",
                }}/>
            ))}
          </div>

          {/* Boutons */}
          <div style={{ display:"flex", gap:"10px" }}>
            {etapeActuelle > 0 && (
              <button className="tuto-btn-ghost" onClick={allerEtapePrecedente}>
                 Retour
              </button>
            )}

            {etape.action && (
              <button className="tuto-btn-ghost"
                onClick={() => { navigate(etape.action.path); onFermer(); }}
                style={{ flex:1 }}>
                {etape.action.label}
              </button>
            )}

            <button className="tuto-btn-primary"
              onClick={allerEtapeSuivante}
              style={{
                background:`linear-gradient(135deg, ${etape.couleur}, ${etape.couleur}CC)`,
                color:"#fff",
                flex: etape.action ? "none" : 1,
              }}>
              {estDerniere ? " Commencer" : "Suivant "}
            </button>
          </div>

          {/* Lien ignorer */}
          <div style={{ textAlign:"center", marginTop:"14px" }}>
            <button onClick={onFermer}
              style={{ background:"none", border:"none", fontSize:"12px",
                color:"#9AB09A", cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
              Ignorer le tutoriel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   BOUTON RELANCER LE TUTORIEL
══════════════════════════════════════════════════ */
function BoutonTutoriel({ onClick }) {
  return (
    <button onClick={onClick}
      title="Revoir le tutoriel"
      style={{
        position:"fixed", bottom:"28px", left:"28px", zIndex:999,
        display:"flex", alignItems:"center", gap:"8px",
        padding:"10px 16px", borderRadius:"100px",
        background:"#00904C", border:"none", color:"#fff",
        fontSize:"13px", fontWeight:700, cursor:"pointer",
        boxShadow:"0 4px 20px rgba(0,144,76,0.35)",
        fontFamily:"'Sora',sans-serif",
        transition:"all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,144,76,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(0,144,76,0.35)"; }}>
       Guide
    </button>
  );
}

/* ══════════════════════════════════════════════════
   COMPOSANT PRINCIPAL HOME
══════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [adminPanel, setAdminPanel]   = useState(false);
  const [adminTab, setAdminTab]       = useState("stats");
  const [activeNav, setActiveNav]     = useState("accueil");
  const [showTutoriel, setShowTutoriel] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);

      /* Afficher tutoriel si nouvel utilisateur (pas encore vu) */
      const tutorielVu = localStorage.getItem(TUTORIEL_KEY);
      if (!tutorielVu) {
        /* Léger délai pour laisser la page se charger */
        setTimeout(() => setShowTutoriel(true), 800);
      }
    }
  }, []);

  const fermerTutoriel = useCallback(() => {
    setShowTutoriel(false);
    localStorage.setItem(TUTORIEL_KEY, "true");
  }, []);

  const relancerTutoriel = useCallback(() => {
    setShowTutoriel(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(TUTORIEL_KEY);
    setUser(null);
    setMenuOpen(false);
  };

  const initiales = user
    ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase()
    : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --green:      #00904C;
          --green-dark: #006635;
          --green-pale: #F0F9F4;
          --green-soft: #E2F4EA;
          --green-mid:  #4DC97A;
          --text:       #0D1F0D;
          --muted:      #6A7F6A;
          --border:     #E4EBE4;
          --white:      #ffffff;
          --off:        #F8FBF8;
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Sora', sans-serif; background: var(--white); color: var(--text); -webkit-font-smoothing: antialiased; }

        /* NAVBAR */
        .h-navbar { position: sticky; top: 0; z-index: 100; background: #00904C; height: 120px; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; border-bottom: 1px solid rgba(77,201,122,0.18); box-shadow: 0 4px 24px rgba(0,0,0,0.18); }
        .h-logo-zone { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .h-logo-zone img { height: 80px; width: auto; border-radius: 8px; background: #fff; padding: 4px; }
        .h-logo-text { display: flex; flex-direction: column; line-height: 1.35; }
        .h-logo-text strong { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: 0.08em; text-transform: uppercase; }
        .h-logo-text span { font-size: 10px; color: rgba(255,255,255,0.65); font-weight: 400; }
        .h-nav-links { display: flex; align-items: center; gap: 3px; margin-left: auto; margin-right: 16px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 5px 8px; }
        .h-nl { padding: 7px 16px; border-radius: 100px; font-size: 20px; font-weight: 600; color: rgba(255,255,255,0.75); cursor: pointer; border: none; background: transparent; font-family: 'Sora', sans-serif; white-space: nowrap; letter-spacing: 0.02em; }
        .h-nl:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .h-nl.active { color: #0A3D1F; background: #4DC97A; font-weight: 700; box-shadow: 0 2px 10px rgba(77,201,122,0.35); }
        .h-nav-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .h-btn-login { padding: 7px 18px; border-radius: 100px; border: 1.5px solid rgba(255,255,255,0.35); background: transparent; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Sora', sans-serif; }
        .h-btn-login:hover { background: rgba(255,255,255,0.12); }
        .h-btn-register { padding: 7px 18px; border-radius: 100px; border: none; background: #4DC97A; color: #0A3D1F; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; }
        .h-btn-register:hover { background: #5DD98A; box-shadow: 0 4px 14px rgba(77,201,122,0.35); }
        .h-user-chip { display: flex; align-items: center; gap: 8px; padding: 5px 12px 5px 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 100px; cursor: pointer; font-size: 13px; font-weight: 600; color: #fff; }
        .h-user-chip:hover { background: rgba(255,255,255,0.18); }
        .h-user-avatar { width: 30px; height: 30px; border-radius: 50%; background: #4DC97A; color: #0A3D1F; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; flex-shrink: 0; }
        .h-dropdown { position: absolute; top: calc(100% + 10px); right: 0; background: #fff; border: 1px solid #E2EDE6; border-radius: 16px; min-width: 220px; box-shadow: 0 16px 48px rgba(0,0,0,0.14); overflow: hidden; z-index: 9999; }
        .h-dh { padding: 16px 18px 12px; border-bottom: 1px solid #F0F4F1; background: linear-gradient(135deg,#F5FAF7,#fff); }
        .h-dh-name { font-weight: 800; font-size: 14px; color: #0A3D1F; }
        .h-dh-email { font-size: 12px; color: #6B9A7A; margin-top: 2px; }
        .h-dh-role { display: inline-flex; align-items: center; margin-top: 6px; background: #E8F5EE; color: #00904C; border-radius: 100px; padding: 3px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .h-di { padding: 11px 18px; font-size: 13px; color: #0A3D1F; cursor: pointer; display: flex; align-items: center; gap: 15px; font-weight: 500; }
        .h-di:hover { background: #F5FAF7; }
        .h-di.red { color: #CC3333; }
        .h-di.red:hover { background: #FFF0F0; }
        .h-dsep { height: 1px; background: #F0F4F1; margin: 8px 0; }

        /* HERO */
        .hero-section { border-bottom: 1px solid var(--border); background: var(--white); }
        .hero-wrap { max-width: 1280px; margin: 0 auto; padding: 96px 60px 88px; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .hero-pill { display: inline-flex; align-items: center; gap: 8px; background: var(--green-soft); color: var(--green-dark); border-radius: 100px; padding: 6px 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 28px; }
        .hero-pill-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; }
        .hero-h1 { font-family: 'Playfair Display', serif; font-size: clamp(36px, 4vw, 58px); line-height: 1.1; color: var(--text); margin-bottom: 22px; }
        .hero-h1 em { font-style: italic; color: var(--green); }
        .hero-p { font-size: 16px; color: var(--muted); line-height: 1.8; max-width: 420px; margin-bottom: 38px; font-weight: 400; }
        .hero-actions { display: flex; gap: 12px; }
        .btn-primary { padding: 14px 30px; background: var(--green); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; }
        .btn-primary:hover { background: var(--green-dark); }
        .btn-ghost { padding: 14px 26px; background: transparent; color: var(--text); border: 1.5px solid var(--border); border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Sora', sans-serif; }
        .btn-ghost:hover { border-color: var(--green); color: var(--green); }
        .hero-right { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .hstat { background: var(--off); border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column; gap: 6px; }
        .hstat.big { grid-column: span 2; background: var(--green); border-color: var(--green); flex-direction: row; align-items: center; justify-content: space-between; padding: 28px 32px; }
        .hstat.big .hstat-num { color: #fff; font-size: 40px; }
        .hstat.big .hstat-lbl { color: rgba(255,255,255,0.8); }
        .hstat.accent { background: var(--green-soft); border-color: var(--green-soft); }
        .hstat.accent .hstat-num { color: var(--green); }
        .hstat-num { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: var(--green-dark); line-height: 1; }
        .hstat-lbl { font-size: 12px; color: var(--muted); font-weight: 500; }

        /* FEATURES */
        .features-section { background: var(--off); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 60px; }
        .section-inner { max-width: 1280px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 52px; }
        .s-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--green); margin-bottom: 10px; }
        .s-title { font-family: 'Playfair Display', serif; font-size: clamp(26px, 3vw, 38px); color: var(--text); line-height: 1.2; margin-bottom: 10px; }
        .s-sub { font-size: 15px; color: var(--muted); max-width: 480px; margin: 0 auto; line-height: 1.7; }
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .feat-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 30px 26px; display: flex; flex-direction: column; gap: 12px; }
        .feat-card:hover { border-color: var(--green-mid); box-shadow: 0 4px 20px rgba(0,144,76,0.07); }
        .feat-title { font-size: 15px; font-weight: 700; color: var(--text); }
        .feat-desc { font-size: 13px; color: var(--muted); line-height: 1.7; }

        /* PARTENAIRES */
        .partners-section { background: var(--white); border-bottom: 1px solid var(--border); padding: 80px 60px; }
        @keyframes slide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .carousel-outer { overflow: hidden; position: relative; border-radius: 14px; border: 1px solid var(--border); background: var(--off); padding: 22px 0; }
        .carousel-outer::before, .carousel-outer::after { content:''; position: absolute; top:0; bottom:0; width:80px; z-index:2; pointer-events:none; }
        .carousel-outer::before { left:0; background: linear-gradient(90deg, var(--off), transparent); }
        .carousel-outer::after { right:0; background: linear-gradient(-90deg, var(--off), transparent); }
        .carousel-track { display: flex; gap: 12px; width: max-content; animation: slide 42s linear infinite; }
        .pcard { width: 228px; flex-shrink:0; background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; text-decoration: none; }
        .pcard:hover { border-color: var(--green); box-shadow: 0 4px 16px rgba(0,144,76,0.08); }
        .pcard-logo { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); background: var(--white); display: flex; align-items: center; justify-content: center; flex-shrink:0; }
        .pcard-logo img { width:100%; height:100%; object-fit:contain; padding:3px; }
        .pcard-name { font-size: 13px; font-weight: 700; color: var(--text); }
        .pcard-type { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .pcard-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }
        .pcard-badge { display: inline-flex; padding: 3px 10px; background: var(--green-soft); color: var(--green-dark); border-radius: 100px; font-size: 10px; font-weight: 700; width: fit-content; }

        /* FORMULES */
        .packs-section { background: var(--off); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 60px; }
        .packs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
        .pack { background: var(--white); border: 1.5px solid var(--border); border-radius: 18px; padding: 34px 28px; display: flex; flex-direction: column; gap: 14px; position: relative; }
        .pack.featured { border-color: var(--green); box-shadow: 0 0 0 4px rgba(0,144,76,0.06), 0 8px 32px rgba(0,144,76,0.1); }
        .pack-chip { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--green); color: #fff; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 16px; border-radius: 100px; white-space: nowrap; }
        .pack-tier { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--muted); }
        .pack-price { font-family: 'Playfair Display', serif; font-size: 32px; color: var(--text); line-height: 1; }
        .pack-price sub { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; color: var(--muted); vertical-align: baseline; }
        .pack-divider { height: 1px; background: var(--border); }
        .pack-feats { display: flex; flex-direction: column; gap: 8px; }
        .pack-feat { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text); font-weight: 500; }
        .pack-feat-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--green-soft); color: var(--green); display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink:0; font-weight: 700; }
        .pack-desc { font-size: 13px; color: var(--muted); line-height: 1.75; }
        .pack-btn { padding: 13px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Sora', sans-serif; border: 1.5px solid var(--border); background: var(--white); color: var(--text); margin-top: 4px; }
        .pack-btn:hover { border-color: var(--green); color: var(--green); }
        .pack-btn.filled { background: var(--green); border-color: var(--green); color: #fff; }
        .pack-btn.filled:hover { background: var(--green-dark); }

        /* SECTION TUTORIEL */
        .tuto-section { background: linear-gradient(135deg, #00904C08, #4DC97A05); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 60px; }
        .tuto-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 36px; }
        .tuto-step-card {
          background: var(--white); border: 1px solid var(--border); border-radius: 16px;
          padding: 24px 22px; display: flex; flex-direction: column; gap: 10px;
          transition: all 0.2s; cursor: default;
        }
        .tuto-step-card:hover { border-color: var(--green-mid); box-shadow: 0 4px 16px rgba(0,144,76,0.08); transform: translateY(-2px); }
        .tuto-step-num { width:28px; height:28px; border-radius:50%; background:var(--green); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; }

        /* CTA */
        .cta-band { background: var(--green); padding: 80px 60px; text-align: center; }
        .cta-band-inner { max-width: 620px; margin: 0 auto; }
        .cta-band h2 { font-family: 'Playfair Display', serif; font-size: clamp(26px, 3.5vw, 42px); color: #fff; margin-bottom: 14px; line-height: 1.2; }
        .cta-band p { font-size: 16px; color: rgba(255,255,255,0.78); line-height: 1.7; margin-bottom: 36px; }
        .cta-white { display: inline-block; padding: 15px 40px; background: #fff; color: var(--green-dark); border: none; border-radius: 10px; font-size: 15px; font-weight: 800; cursor: pointer; font-family: 'Sora', sans-serif; }
        .cta-white:hover { background: var(--green-soft); }

        /* FOOTER */
        .footer { background: var(--white); border-top: 1px solid var(--border); padding: 36px 60px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .footer-brand strong { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: 0.04em; }
        .footer-brand strong em { color: var(--green); font-style: normal; }
        .footer-copy { font-size: 12px; color: var(--muted); margin-top: 3px; }

        /* ADMIN FAB */
        .h-fab { position: fixed; bottom: 28px; right: 28px; z-index: 1000; width: 52px; height: 52px; border-radius: 50%; background: var(--green); border: 2px solid #fff; box-shadow: 0 4px 20px rgba(0,144,76,0.3); cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; color: #fff; }
        .h-fab.open { background: #CC3333; }

        /* BANNIÈRE BIENVENUE */
        @keyframes slideDownBanner { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        .welcome-banner {
          animation: slideDownBanner 0.5s cubic-bezier(0.34,1.56,0.64,1);
          background: linear-gradient(135deg, #00904C, #006635);
          padding: 14px 32px; display:flex; align-items:center; justify-content:space-between;
          gap:16px; flex-wrap:wrap;
        }
      `}</style>

      {/* TUTORIEL MODAL */}
      {showTutoriel && (
        <TutorielModal onFermer={fermerTutoriel} navigate={navigate}/>
      )}

      {/* BOUTON GUIDE (visible quand connecté et tutoriel fermé) */}
      {!showTutoriel && (
        <BoutonTutoriel onClick={relancerTutoriel}/>
      )}

      {/* NAVBAR */}
      <nav className="h-navbar">
        <div className="h-logo-zone">
          <img src={logoNERE} alt="NERE"
            style={{ height:"80px", width:"auto", borderRadius:"8px", backgroundColor:"#fff", padding:"4px", flexShrink:0 }}/>
          <div className="h-logo-text">
            <strong>Fichier NERE</strong>
            <span>Registre national des entreprises</span>
          </div>
        </div>

        <div className="h-nav-links">
          {NAV_LINKS.map(link => (
            <button key={link.key}
              className={`h-nl ${activeNav === link.key ? "active" : ""}`}
              onClick={() => { setActiveNav(link.key); navigate(link.path); }}>
              {link.label}
            </button>
          ))}
        </div>

        <div className="h-nav-actions">
          {user ? (
            <div style={{ position:"relative" }}>
              <div className="h-user-chip" onClick={() => setMenuOpen(o => !o)}>
                <div className="h-user-avatar">{initiales}</div>
                <span style={{ maxWidth:"90px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {user.prenom} {user.nom}
                </span>
                <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.5)" }}>▾</span>
              </div>
              {menuOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:50 }} onClick={() => setMenuOpen(false)}/>
                  <div className="h-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="h-dh">
                      <div className="h-dh-name">{user.prenom} {user.nom}</div>
                      <div className="h-dh-email">{user.email || "—"}</div>
                      <div className="h-dh-role">
                        {user.role === "admin" ? "Administrateur" : user.role === "manager" ? "Gestionnaire" : "Abonné"}
                      </div>
                    </div>
                    <div style={{ padding:"6px 0" }}>
                      <div className="h-di" onClick={() => { navigate("/profil");       setMenuOpen(false); }}>Mon Profil</div>
                      <div className="h-di" onClick={() => { navigate("/profil");       setMenuOpen(false); }}>Historique</div>
                      <div className="h-di" onClick={() => { navigate("/profil");       setMenuOpen(false); }}>Sécurité</div>
                      <div className="h-di" onClick={() => { relancerTutoriel(); setMenuOpen(false); }}> Revoir le guide</div>
                      {user.role === "admin"   && <div className="h-di" onClick={() => { navigate("/admin");        setMenuOpen(false); }}>Tableau de bord</div>}
                      {user.role === "manager" && <div className="h-di" onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}>Tableau de bord</div>}
                      <div className="h-dsep"/>
                      <div className="h-di red" onClick={handleLogout}>Déconnexion</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button className="h-btn-login"    onClick={() => navigate("/connexion")}>Connexion</button>
              <button className="h-btn-register" onClick={() => navigate("/inscription")}>S'inscrire</button>
            </>
          )}
        </div>
      </nav>

      {/* BANNIÈRE BIENVENUE (affiché uniquement si tout juste connecté) */}
      {user && !localStorage.getItem(TUTORIEL_KEY) && (
        <div className="welcome-banner">
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontSize:"20px" }}></span>
            <div>
              <span style={{ fontSize:"14px", fontWeight:700, color:"#fff" }}>
                Bienvenue {user.prenom} !
              </span>
              <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)", marginLeft:"8px" }}>
                Découvrez la plateforme avec notre guide interactif.
              </span>
            </div>
          </div>
          <button onClick={() => setShowTutoriel(true)}
            style={{ padding:"8px 20px", borderRadius:"100px",
              background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)",
              color:"#fff", fontSize:"13px", fontWeight:700, cursor:"pointer",
              fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap" }}>
            Lancer le guide 
          </button>
        </div>
      )}

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-wrap">
          <div>
            <div className="hero-pill">
              <span className="hero-pill-dot"/>
              Plateforme officielle — CCI-BF
            </div>
            <h1 className="hero-h1">
              Accédez aux données<br/>économiques du <em style={{ color: "#ED1C24" }}>Burkina Faso</em>
            </h1>
            <p className="hero-p">
              Consultez les informations officielles des entreprises enregistrées au NERE —
              secteur d'activité, chiffre d'affaires, localisation et bien plus.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/formules")}>Voir les formules</button>
                <button className="btn-ghost" onClick={() => setShowTutoriel(true)}>
                 Guide de démarrage
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hstat big">
              <div>
                <div className="hstat-num">233 000+</div>
                <div className="hstat-lbl">Entreprises indexées au Burkina Faso</div>
              </div>
            </div>
            <div className="hstat">
              <div className="hstat-num">17</div>
              <div className="hstat-lbl">Régions couvertes</div>
            </div>
            <div className="hstat">
              <div className="hstat-num">120+</div>
              <div className="hstat-lbl">Secteurs d'activité</div>
            </div>
            <div className="hstat accent" style={{ gridColumn:"span 2" }}>
              <div className="hstat-num">3</div>
              <div className="hstat-lbl">Formules d'abonnement flexibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TUTORIEL VISIBLE */}
      <section className="tuto-section">
        <div className="section-inner">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"16px" }}>
            <div>
              <div className="s-tag">Guide de démarrage</div>
              <div className="s-title" style={{ marginBottom:"6px" }}>Comment utiliser la plateforme ?</div>
              <p className="s-sub" style={{ textAlign:"left", margin:0 }}>
                Suivez ces 6 étapes pour tirer le meilleur parti de la plateforme NERE.
              </p>
            </div>
            <button onClick={() => setShowTutoriel(true)}
              style={{ padding:"12px 24px", borderRadius:"10px", background:"#00904C",
                border:"none", color:"#fff", fontSize:"14px", fontWeight:700,
                cursor:"pointer", fontFamily:"'Sora',sans-serif", flexShrink:0 }}>
               Lancer le tutoriel
            </button>
          </div>

          <div className="tuto-grid">
            {[
              { num:"1",  titre:"Rechercher",    desc:"Trouvez n'importe quelle entreprise ou association par RCCM, IFU ou raison sociale.", couleur:"#00904C" },
              { num:"2",  titre:"Demander",      desc:"Obtenez des listes, tableaux, statistiques ou fiches complètes selon vos besoins.", couleur:"#D4A830" },
              { num:"3", titre:"Recharger",     desc:"Rechargez votre solde à partir de 5 000 FCFA pour accéder aux données officielles.", couleur:"#1E60CC" },
              { num:"4",  titre:"Contacter",     desc:"Échangez avec un agent CCI-BF pour toute demande spéciale ou question sur les données.", couleur:"#7C3AED" },
              { num:"5", titre:"Publications",  desc:"Consultez les publications officielles : classements, études sectorielles et notes techniques.", couleur:"#00904C" },
              { num:"6", titre:"Mon profil",    desc:"Gérez votre compte, consultez votre historique et suivez votre solde depuis votre profil.", couleur:"#0F5C2E" },
            ].map((step, i) => (
              <div key={i} className="tuto-step-card">
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div className="tuto-step-num" style={{ background:step.couleur }}>{step.num}</div>
                  <span style={{ fontSize:"20px" }}>{step.icone}</span>
                  <span style={{ fontSize:"14px", fontWeight:700, color:"#0A2410" }}>{step.titre}</span>
                </div>
                <p style={{ fontSize:"12px", color:"#6B9A7A", lineHeight:1.6, margin:0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="s-tag">Pourquoi NERE ?</div>
            <div className="s-title">Une plateforme de référence nationale</div>
            <p className="s-sub">Des données officielles, fiables et actualisées sur l'écosystème entrepreneurial du Burkina Faso.</p>
          </div>
          <div className="feat-grid">
            {[
              { title:"Recherche avancée",   desc:"Filtrez par secteur, région, chiffre d'affaires, effectifs et bien d'autres critères." },
              { title:"Données certifiées",  desc:"Issues des registres officiels : RCCM, IFU, CNSS, DGI — toujours à jour et authentifiées." },
              { title:"Rapports & Études",   desc:"Accédez aux publications de la CCI-BF : classements, études sectorielles et notes techniques." },
              { title:"Accès sécurisé",      desc:"Trois formules d'abonnement adaptées à chaque profil : particulier, professionnel ou entreprise." },
              { title:"Messagerie intégrée", desc:"Échangez directement avec nos équipes pour toute question relative aux données." },
              { title:"Couverture nationale",desc:"Les 17 régions du Burkina Faso couvertes, de Ouagadougou aux zones périphériques." },
            ].map((f, i) => (
              <div key={i} className="feat-card">
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="partners-section">
        <div className="section-inner">
          <div style={{ display:"flex", alignItems:"flex-end", gap:"40px", marginBottom:"40px", flexWrap:"wrap" }}>
            <div>
              <img src={logoCCI} alt="CCI-BF"
                style={{ height:"120px", objectFit:"contain", marginBottom:"14px", display:"block" }}/>
              <div className="s-tag">Partenaires officiels</div>
              <div className="s-title">Des institutions qui garantissent la fiabilité</div>
              <p style={{ fontSize:"14px", color:"var(--muted)", lineHeight:1.7, maxWidth:"420px", marginTop:"6px" }}>
                Accédez en un clic aux sites de nos partenaires qui assurent l'authenticité des informations.
              </p>
            </div>
          </div>
          <div className="carousel-outer">
            <div className="carousel-track">
              {[...PARTENAIRES, ...PARTENAIRES].map((p, idx) => (
                <a key={`${p.nom}-${idx}`} href={p.lien || "#"}
                  target="_blank" rel="noopener noreferrer" className="pcard">
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div className="pcard-logo"><img src={p.logo} alt={p.nom}/></div>
                    <div>
                      <div className="pcard-name">{p.nom}</div>
                      <div className="pcard-type">{p.type}</div>
                    </div>
                  </div>
                  <div className="pcard-desc">{p.contribution}</div>
                  <div className="pcard-badge">{p.badge}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FORMULES */}
      <section className="packs-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="s-tag">Crédit Prépayé</div>
            <div className="s-title">Choisissez votre formule</div>
            <p className="s-sub">Rechargez votre compte et accédez aux données selon votre niveau.</p>
          </div>
          <div className="packs-grid">
            {[
              {
                tier:"Essentiel", prix:"5 000", sfx:"FCFA", featured:false, btn:"ghost",
                feats:["Communiqués publics","Recherche d'entreprises","Messagerie intégrée"],
                desc:"Idéal pour démarrer. Accédez aux communiqués, à la recherche de base et au chat.",
              },
              {
                tier:"Professionnel", prix:"5 001 – 14 999", sfx:"FCFA", featured:true, btn:"filled",
                feats:["Tout l'Essentiel","Notes techniques","Classements sectoriels","Export PDF"],
                desc:"Pour les professionnels. Notes techniques, classements et exports PDF inclus.",
              },
              {
                tier:"Entreprise", prix:"15 000 +", sfx:"FCFA", featured:false, btn:"ghost",
                feats:["Tout le Professionnel","Études & rapports","Données avancées","Support prioritaire"],
                desc:"Accès complet. Rapports d'études, données avancées et support dédié.",
              },
            ].map((pack, i) => (
              <div key={i} className={`pack ${pack.featured ? "featured" : ""}`}>
                {pack.featured && <div className="pack-chip"></div>}
                <div className="pack-tier">{pack.tier}</div>
                <div className="pack-price">{pack.prix} <sub>{pack.sfx}</sub></div>
                <div className="pack-divider"/>
                <div className="pack-feats">
                  {pack.feats.map(f => (
                    <div key={f} className="pack-feat">
                      <div className="pack-feat-dot"></div>{f}
                    </div>
                  ))}
                </div>
                <div className="pack-desc">{pack.desc}</div>
                <button className={`pack-btn ${pack.btn === "filled" ? "filled" : ""}`}
                  onClick={() => navigate("/formules")}>
                  Choisir ce pack
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — visible uniquement si non connecté */}
      {!user && (
        <section className="cta-band">
          <div className="cta-band-inner">
            <h2>Prêt à accéder aux données économiques du Burkina Faso ?</h2>
            <p>Inscrivez-vous gratuitement et explorez la plateforme dès aujourd'hui.</p>
            <button className="cta-white" onClick={() => navigate("/inscription")}>
              Créer mon compte
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
          <strong>NERE <em>CCI-BF</em></strong>
          <div className="footer-copy">Chambre de Commerce et d'Industrie du Burkina Faso</div>
        </div>
      </footer>

      {/* ADMIN FAB */}
      {user?.role === "admin" && (
        <button className={`h-fab ${adminPanel ? "open" : ""}`}
          onClick={() => setAdminPanel(o => !o)} title="Panneau Admin">
          {adminPanel ? "" : ""}
        </button>
      )}

      {/* PANNEAU ADMIN */}
      {user?.role === "admin" && (
        <>
          {adminPanel && (
            <div onClick={() => setAdminPanel(false)}
              style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.2)" }}/>
          )}
          <div style={{
            position:"fixed", top:0, right:0, bottom:0, zIndex:999,
            width:"420px", background:"#fff",
            boxShadow:"-4px 0 32px rgba(0,0,0,0.10)",
            transform: adminPanel ? "translateX(0)" : "translateX(100%)",
            transition:"transform 0.3s ease",
            display:"flex", flexDirection:"column",
            fontFamily:"'Sora', sans-serif",
          }}>
            <div style={{ background:"#00904C", padding:"20px 24px",
              display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div>
                <div style={{ fontSize:"16px", fontWeight:800, color:"#fff" }}>
                  NERE <span style={{ color:"#A8E8C4" }}>Admin</span>
                </div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.6)", marginTop:"2px" }}>
                  Panneau d'administration rapide
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={() => { setAdminPanel(false); navigate("/admin"); }}
                  style={{ padding:"6px 12px", borderRadius:"7px",
                    background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)",
                    color:"#fff", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                  Dashboard 
                </button>
                <button onClick={() => setAdminPanel(false)}
                  style={{ width:"30px", height:"30px", borderRadius:"7px",
                    background:"rgba(255,255,255,0.1)", border:"none",
                    color:"#fff", cursor:"pointer", fontSize:"16px" }}>
                </button>
              </div>
            </div>
            <div style={{ display:"flex", borderBottom:"1px solid #E8EDE9", flexShrink:0 }}>
              {[{key:"stats",label:"Stats"},{key:"pubs",label:"Publications"},{key:"users",label:"Utilisateurs"},{key:"chat",label:"Messages"}].map(t => (
                <button key={t.key} onClick={() => setAdminTab(t.key)}
                  style={{ flex:1, padding:"12px 4px", background:"transparent", border:"none",
                    borderBottom: adminTab===t.key ? "2px solid #00904C" : "2px solid transparent",
                    color: adminTab===t.key ? "#00904C" : "#7A9A85",
                    fontWeight: adminTab===t.key ? 700 : 500,
                    fontSize:"12px", cursor:"pointer", fontFamily:"inherit", marginBottom:"-1px" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
              {adminTab === "stats" && <AdminPanelStats navigate={navigate}/>}
              {adminTab === "pubs"  && <AdminPanelPubs  navigate={navigate}/>}
              {adminTab === "users" && <AdminPanelUsers navigate={navigate}/>}
              {adminTab === "chat"  && <AdminPanelChat  navigate={navigate}/>}
            </div>
            <div style={{ padding:"14px 20px", borderTop:"1px solid #E8EDE9",
              display:"flex", gap:"8px", flexShrink:0 }}>
              <button onClick={() => { setAdminPanel(false); navigate("/admin"); }}
                style={{ flex:1, padding:"11px", borderRadius:"9px", background:"#00904C",
                  border:"none", color:"#fff", fontWeight:700, fontSize:"13px",
                  cursor:"pointer", fontFamily:"inherit" }}>
                Dashboard complet
              </button>
              <button onClick={() => { setAdminPanel(false); navigate("/chatadmin"); }}
                style={{ flex:1, padding:"11px", borderRadius:"9px", background:"#E8F5EE",
                  border:"none", color:"#00904C", fontWeight:700, fontSize:"13px",
                  cursor:"pointer", fontFamily:"inherit" }}>
                Chat Admin
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ─── Panneaux admin ─── */
function AdminPanelStats({ navigate }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const token = getToken();
    Promise.all([
      fetch(`${API}/users`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
      fetch(`${API}/publications?all=true&limit=100`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()),
    ]).then(([u, p]) => {
      setStats({ users: u.success?u.data.length:0, abonnes: u.success?u.data.filter(x=>x.role==="subscriber").length:0, pubs: p.success?p.data.length:0, publiees: p.success?p.data.filter(x=>/^publi/i.test(x.statut)).length:0 });
    }).catch(()=>{});
  }, []);
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:"13px", color:"#0A2410", marginBottom:"16px" }}>Vue d'ensemble</div>
      {!stats ? <div style={{ textAlign:"center", padding:"24px", color:"#7A9A85" }}> Chargement...</div> : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"20px" }}>
          {[{label:"Utilisateurs",val:stats.users,color:"#00904C"},{label:"Abonnés actifs",val:stats.abonnes,color:"#D4A830"},{label:"Publications",val:stats.pubs,color:"#4A9EFF"},{label:"Publiées",val:stats.publiees,color:"#00904C"}].map(k=>(
            <div key={k.label} style={{ background:"#F7FAF8", borderRadius:"10px", padding:"14px", border:"1px solid #E8EDE9" }}>
              <div style={{ fontSize:"22px", fontWeight:900, color:k.color }}>{k.val}</div>
              <div style={{ fontSize:"10px", color:"#7A9A85", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:"2px" }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {[{label:"Gérer les publications",path:"/admin"},{label:"Gérer les utilisateurs",path:"/admin"},{label:"Répondre aux messages",path:"/chatadmin"}].map(a=>(
          <button key={a.label} onClick={()=>navigate(a.path)}
            style={{ padding:"10px 14px", borderRadius:"9px", background:"#fff", border:"1px solid #E8EDE9", color:"#0A2410", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
            {a.label} →
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminPanelPubs({ navigate }) {
  const [pubs, setPubs] = useState([]); const [loading, setLoad] = useState(true);
  useEffect(() => {
    fetch(`${API}/publications?all=true&limit=6`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r=>r.json()).then(d=>{if(d.success)setPubs(d.data);setLoad(false);}).catch(()=>setLoad(false));
  }, []);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div style={{ fontWeight:700, fontSize:"13px", color:"#0A2410" }}>Publications récentes</div>
        <button onClick={()=>navigate("/admin")} style={{ fontSize:"12px", color:"#00904C", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Gérer →</button>
      </div>
      {loading ? <div style={{ textAlign:"center", padding:"20px", color:"#7A9A85" }}></div> : pubs.length===0 ? <div style={{ textAlign:"center", padding:"20px", color:"#7A9A85", fontSize:"13px" }}>Aucune publication</div> : (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {pubs.map(p=>(
            <div key={p._id} style={{ padding:"10px 12px", background:"#F7FAF8", borderRadius:"9px", border:"1px solid #E8EDE9" }}>
              <div style={{ fontWeight:600, fontSize:"13px", color:"#0A2410", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:"4px" }}>{p.titre}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"11px", color:"#7A9A85" }}>{p.categorie}</span>
                <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 8px", borderRadius:"100px", background:/^publi/i.test(p.statut)?"#E8F5EE":"#FFF5E0", color:/^publi/i.test(p.statut)?"#00904C":"#CC6600" }}>{p.statut}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPanelUsers({ navigate }) {
  const [users, setUsers] = useState([]); const [loading, setLoad] = useState(true);
  useEffect(() => {
    fetch(`${API}/users`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r=>r.json()).then(d=>{if(d.success)setUsers(d.data.slice(0,6));setLoad(false);}).catch(()=>setLoad(false));
  }, []);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div style={{ fontWeight:700, fontSize:"13px", color:"#0A2410" }}>Derniers inscrits</div>
        <button onClick={()=>navigate("/admin")} style={{ fontSize:"12px", color:"#00904C", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Gérer</button>
      </div>
      {loading ? <div style={{ textAlign:"center", padding:"20px", color:"#7A9A85" }}></div> : (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {users.map(u=>(
            <div key={u._id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:"#F7FAF8", borderRadius:"9px", border:"1px solid #E8EDE9" }}>
              <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:"#E8F5EE", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"11px", color:"#00904C", flexShrink:0 }}>{u.prenom?.[0]}{u.nom?.[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:"13px", color:"#0A2410", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.prenom} {u.nom}</div>
                <div style={{ fontSize:"11px", color:"#7A9A85" }}>{u.role}</div>
              </div>
              <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 8px", borderRadius:"100px", background:u.isActive?"#E8F5EE":"#FFF0F0", color:u.isActive?"#00904C":"#CC3333" }}>{u.isActive?"actif":"inactif"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPanelChat({ navigate }) {
  return (
    <div>
      <div style={{ fontWeight:700, fontSize:"13px", color:"#0A2410", marginBottom:"16px" }}>Messagerie</div>
      <div style={{ textAlign:"center", padding:"32px 20px", background:"#F7FAF8", borderRadius:"12px", border:"1px dashed #C8D8CC" }}>
        <div style={{ fontSize:"36px", marginBottom:"12px" }}></div>
        <div style={{ fontSize:"13px", color:"#7A9A85", marginBottom:"16px" }}>Gérez toutes les conversations depuis l'interface dédiée.</div>
        <button onClick={()=>navigate("/chatadmin")} style={{ padding:"10px 20px", borderRadius:"9px", background:"#00904C", border:"none", color:"#fff", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>Ouvrir le Chat Admin</button>
      </div>
    </div>
  );
}