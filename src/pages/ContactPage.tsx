import { ArrowRight, Mail, Share2, Users } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_CONFIG } from '@/shared';
import { openExternalLink } from '@/shared';
import MainLayout from '../components/MainLayout';
import NeonBadge from '../components/neon/NeonBadge';
import NeonCard from '../components/neon/NeonCard';

function ContactCard({
  title,
  description,
  text,
  buttonText,
  icon,
  href,
}: {
  title: string;
  description: string;
  text: string;
  buttonText: string;
  icon: ReactNode;
  href?: string;
}) {
  const handleClick = () => {
    if (!href || href === '#') return;
    openExternalLink(href);
  };

  return (
    <NeonCard glow="cyan" hoverable padding="md">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            background: '#00D4FF1A',
            border: '1px solid #00D4FF33',
            color: '#00d4ff',
          }}
        >
          {icon}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className="text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: '#00D4FF99' }}
          >
            {title}
          </span>
          <h3 className="font-bold text-sm" style={{ color: 'var(--system-color-mist-lavender)' }}>
            {description}
          </h3>
          <p className="text-sm truncate" style={{ color: '#E8E8FF8C' }}>
            {text}
          </p>
          <button
            onClick={handleClick}
            className="mt-2 flex items-center gap-1 text-xs font-semibold transition-colors text-left"
            style={{ color: '#00D4FF99' }}
          >
            {buttonText}
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </NeonCard>
  );
}

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 animate-fade-in-up">
        {/* Hero */}
        <section>
          <NeonCard glow="cyan" padding="lg">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1">
                <NeonBadge color="cyan" dot className="mb-4">
                  {t('desktop.contactPage.contact')} {APP_CONFIG.name}
                </NeonBadge>
                <h1
                  className="font-black text-3xl md:text-5xl tracking-tight mb-4"
                  style={{ color: 'var(--system-color-mist-lavender)' }}
                >
                  {t('desktop.contactPage.desc')}
                </h1>
                <p className="text-sm leading-relaxed max-w-lg mb-6" style={{ color: '#E8E8FF8C' }}>
                  {t('desktop.contactPage.hint')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openExternalLink(APP_CONFIG.contact.discord)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      background: '#00D4FF1A',
                      border: '1px solid #00D4FF4C',
                      color: '#00d4ff',
                    }}
                  >
                    <Users size={15} />
                    {APP_CONFIG.contact.discordTitle}
                  </button>
                  <button
                    onClick={() => openExternalLink(APP_CONFIG.contact.facebook)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      background: '#3B82F61A',
                      border: '1px solid #3B82F64C',
                      color: '#60A5FA',
                    }}
                  >
                    <Share2 size={15} />
                    Facebook Fanpage
                  </button>
                  <button
                    onClick={() => openExternalLink(`mailto:${APP_CONFIG.contact.email}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      background: '#7B2FBE1F',
                      border: '1px solid #7B2FBE4C',
                      color: '#c084fc',
                    }}
                  >
                    <Mail size={15} />
                    {APP_CONFIG.contact.email}
                  </button>
                </div>
              </div>

              {/* Info summary */}
              <div
                className="w-full lg:w-72 rounded-xl p-5 shrink-0"
                style={{
                  background: '#00D4FF0A',
                  border: '1px solid #00D4FF1A',
                }}
              >
                {[
                  {
                    label: t('desktop.contactPage.discord'),
                    value: APP_CONFIG.contact.discordTitle,
                  },
                  {
                    label: t('desktop.contactPage.facebook'),
                    value: `${APP_CONFIG.contact.tag} Fanpage`,
                  },
                  {
                    label: t('desktop.contactPage.email'),
                    value: APP_CONFIG.contact.email,
                  },
                  {
                    label: t('desktop.contactPage.website'),
                    value: APP_CONFIG.contact.tag,
                  },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className={`py-3 ${i < arr.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: '#00D4FF14' }}
                  >
                    <span
                      className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                      style={{ color: '#00D4FF8C' }}
                    >
                      {label}
                    </span>
                    <p className="text-sm font-medium" style={{ color: 'var(--system-color-mist-lavender)' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </NeonCard>
        </section>

        {/* Contact cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ContactCard
            title={t('desktop.contactPage.discord')}
            description={t('desktop.contactPage.cardDirect')}
            text={APP_CONFIG.contact.discordTitle}
            buttonText={t('desktop.contactPage.actJoin')}
            icon={<Users size={18} />}
            href={`${APP_CONFIG.contact.discord}`}
          />
          <ContactCard
            title={t('desktop.contactPage.email')}
            description={t('desktop.contactPage.cardEmail')}
            text={APP_CONFIG.contact.email}
            buttonText={t('desktop.contactPage.actMail')}
            icon={<Mail size={18} />}
            href={`mailto:${APP_CONFIG.contact.email}`}
          />
          <ContactCard
            title={t('desktop.contactPage.facebook')}
            description={t('desktop.contactPage.cardFacebook')}
            text={`${APP_CONFIG.contact.tag} Fanpage`}
            buttonText={t('desktop.contactPage.actFacebook')}
            icon={<Share2 size={18} />}
            href={APP_CONFIG.contact.facebook}
          />
        </div>
      </div>
    </MainLayout>
  );
}