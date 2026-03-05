import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: {
    fontFamily: "'Inter', Arial, sans-serif",
    backgroundColor: '#ffffff',
    color: '#111111',
    minHeight: '100vh',
  },
  container: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '48px 24px',
  },
  header: {
    marginBottom: 40,
  },
  logo: {
    textDecoration: 'none',
    color: '#111111',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  logoAccent: {
    color: '#3B82F6',
  },
  breadcrumb: {
    fontSize: 13,
    color: '#888888',
    marginTop: 16,
    marginBottom: 24,
  },
  breadcrumbLink: {
    color: '#888888',
    textDecoration: 'none',
  },
  breadcrumbSeparator: {
    margin: '0 8px',
  },
  breadcrumbCurrent: {
    color: '#444444',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#111111',
    marginBottom: 8,
    letterSpacing: '-0.01em',
  },
  lastUpdated: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 32,
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #e5e5e5',
    margin: '32px 0',
  },
  tocTitle: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#444444',
    marginBottom: 12,
  },
  tocList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 32px 0',
  },
  tocItem: {
    marginBottom: 6,
  },
  tocLink: {
    fontSize: 14,
    color: '#111111',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#444444',
    marginTop: 32,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 1.75,
    textAlign: 'justify',
    color: '#111111',
    marginBottom: 0,
  },
  footer: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid #e5e5e5',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 12,
  },
  backLink: {
    fontSize: 14,
    color: '#111111',
    textDecoration: 'underline',
  },
};

const LegalPage = ({ title, lastUpdated, sections, metaDescription }) => {
  useEffect(() => {
    document.title = `${title} — BoosterPay`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', metaDescription || title);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = metaDescription || title;
      document.head.appendChild(newMeta);
    }
    window.scrollTo(0, 0);
  }, [title, metaDescription]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <Link to="/" style={styles.logo}>
            Booster<span style={styles.logoAccent}>Pay</span>
          </Link>
        </div>

        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadcrumbLink}>Accueil</Link>
          <span style={styles.breadcrumbSeparator}>&gt;</span>
          <span style={styles.breadcrumbCurrent}>{title}</span>
        </div>

        {/* Document title */}
        <h1 style={styles.documentTitle}>{title}</h1>
        <p style={styles.lastUpdated}>Derniere mise a jour : {lastUpdated}</p>

        <hr style={styles.hr} />

        {/* Table of contents */}
        <p style={styles.tocTitle}>Sommaire</p>
        <ul style={styles.tocList}>
          {sections.map((section) => (
            <li key={section.id} style={styles.tocItem}>
              <a href={`#${section.id}`} style={styles.tocLink}>
                {section.number} — {section.title}
              </a>
            </li>
          ))}
        </ul>

        <hr style={styles.hr} />

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.id} id={section.id}>
            <h2 style={styles.sectionTitle}>
              {section.number} — {section.title}
            </h2>
            <div
              style={styles.sectionContent}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>&copy; 2026 Booster-Pay.com — Tous droits réservés</p>
          <Link to="/" style={styles.backLink}>Retour a l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
