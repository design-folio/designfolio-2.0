import React from 'react';

const ensureUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

// Shared UI tokens for Contact window (match existing styles)
const styles = {
  card: 'p-4 rounded-lg bg-[#f7f6f3] border border-[#e9e9e7] hover:bg-[#efeee9] transition-colors',
  cardInteractive: 'cursor-pointer group block no-underline text-inherit',
  sectionHeader: 'flex items-center gap-2 pb-2 border-b border-[#e9e9e7] mb-4',
  sectionTitle: 'text-lg font-semibold',
  label: 'text-[10px] uppercase tracking-wider opacity-50 mb-1',
  row: 'flex items-center gap-3 p-2 hover:bg-[#f7f6f3] rounded-md cursor-pointer transition-colors no-underline text-inherit',
};

function ContactEmptyState({ label, message, onClick }) {
  const baseClass = 'rounded-lg border-2 border-dashed border-[#e9e9e7] bg-[#f7f6f3]/60 text-left transition-colors';
  const interactiveClass = onClick
    ? 'cursor-pointer hover:bg-[#f7f6f3] hover:border-[#d1d0cc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37352f]/20'
    : 'cursor-default';

  const content = (
    <>
      {label && <div className={styles.label}>{label}</div>}
      <p className="text-sm text-[#37352f]/60 font-medium">{message}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${styles.card} min-h-[4rem] w-full ${baseClass} ${interactiveClass} flex flex-col justify-center p-4`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`min-h-[4rem] w-full ${baseClass} ${interactiveClass} p-4 flex flex-col justify-center`}>
      {content}
    </div>
  );
}

/**
 * Section-level empty state (e.g. Social Connect, Blogs when no items).
 */
function SectionEmptyState({ message, onClick }) {
  return (
    <ContactEmptyState
      message={message}
      onClick={onClick}
    />
  );
}

const ContactWindow = ({ contactInfo, fullName, onOpenPdf, edit, onEdit, hasResume = false }) => {
  const hasSocials = contactInfo.linkedin || contactInfo.twitter || contactInfo.instagram || contactInfo.dribbble;
  const hasBlogs = contactInfo.blogs;
  const hasContactDetails = contactInfo.contact_email || contactInfo.phone || hasResume;
  const showContactDetails = edit || hasContactDetails;
  const showSocials = edit || hasSocials;
  const showBlogs = edit || hasBlogs;

  return (
    <div className="w-full h-full bg-white flex flex-col font-azeretMono text-[#37352f]">
      {/* Header */}
      <div className="px-10 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-2 opacity-50 text-sm">
          <span>📂</span>
          <span>Contacts</span>
          <span>/</span>
          <span>contact.mdx</span>
        </div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#37352f]">Get in touch</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 pb-20 space-y-8">
        {/* Contact Details */}
        {showContactDetails && (
          <section>
            <div className={`${styles.sectionHeader}`}>
              <span className="text-xl">📧</span>
              <h2 className={styles.sectionTitle}>Contact Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactInfo.contact_email ? (
                <a
                  href={`mailto:${contactInfo.contact_email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.card} ${styles.cardInteractive} block`}
                >
                  <div className={styles.label}>Email</div>
                  <div className="font-medium">{contactInfo.contact_email}</div>
                </a>
              ) : edit ? (
                <ContactEmptyState
                  label="Email"
                  message="Add your email in Footer settings"
                  onClick={onEdit}
                />
              ) : null}

              {contactInfo.phone ? (
                <a
                  href={`tel:${contactInfo.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.card} ${styles.cardInteractive} block`}
                >
                  <div className={styles.label}>Phone</div>
                  <div className="font-medium">{contactInfo.phone}</div>
                </a>
              ) : edit ? (
                <ContactEmptyState
                  label="Phone"
                  message="Add Phone"
                  onClick={onEdit}
                />
              ) : null}

              {hasResume ? (
                <div
                  className={styles.card}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenPdf(`${fullName}_Resume.pdf`)}
                  onKeyDown={(e) => e.key === 'Enter' && onOpenPdf(`${fullName}_Resume.pdf`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.label}>Resume</div>
                  <div className="font-medium text-[#007aff] hover:underline">View Resume</div>
                </div>
              ) : edit ? (
                <ContactEmptyState
                  label="Resume"
                  message="Add Resume"
                  onClick={onEdit}
                />
              ) : null}
            </div>
          </section>
        )}

        {/* Social Connect */}
        {showSocials && (
          <section>
            <div className={styles.sectionHeader}>
              <span className="text-xl">🌐</span>
              <h2 className={styles.sectionTitle}>Social Connect</h2>
            </div>
            <div className="space-y-3">
              {hasSocials ? (
                <>
                  {contactInfo.linkedin && (
                    <a
                      href={ensureUrl(contactInfo.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.row}
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-[#0077b5] text-white rounded text-[10px] font-bold shrink-0">in</span>
                      <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.linkedin}</span>
                    </a>
                  )}
                  {contactInfo.twitter && (
                    <a
                      href={ensureUrl(contactInfo.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.row}
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded text-[10px] font-bold shrink-0">X</span>
                      <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.twitter}</span>
                    </a>
                  )}
                  {contactInfo.instagram && (
                    <a
                      href={ensureUrl(contactInfo.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.row}
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded text-[10px] font-bold shrink-0">IG</span>
                      <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.instagram}</span>
                    </a>
                  )}
                  {contactInfo.dribbble && (
                    <a
                      href={ensureUrl(contactInfo.dribbble)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.row}
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-[#ea4c89] text-white rounded text-[10px] font-bold shrink-0">Dr</span>
                      <span className="flex-1 border-b border-[#e9e9e7] pb-1">{contactInfo.dribbble}</span>
                    </a>
                  )}
                </>
              ) : (
                <SectionEmptyState
                  message="Add Social Links"
                  onClick={onEdit}
                />
              )}
            </div>
          </section>
        )}

        {/* Blogs */}
        {showBlogs && (
          <section>
            <div className={styles.sectionHeader}>
              <span className="text-xl">✍️</span>
              <h2 className={styles.sectionTitle}>Blogs</h2>
            </div>
            {hasBlogs ? (
              <a
                href={ensureUrl(contactInfo.blogs)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.row}
              >
                <span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded text-[10px] font-bold shrink-0">M</span>
                <span className="flex-1 border-b border-[#e9e9e7] pb-1 text-[#37352f]">{contactInfo.blogs}</span>
              </a>
            ) : (
              <SectionEmptyState
                message="Add Blog Link"
                onClick={onEdit}
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ContactWindow;
