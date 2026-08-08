import { Shield, Star, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MainLayout from '../components/MainLayout';
import NeonBadge from '../components/neon/NeonBadge';
import NeonCard from '../components/neon/NeonCard';

export default function IntroPage() {
  const { t } = useTranslation();

  const safetyItems = [
    t('desktop.introPage.safetyItems.dirtyKeys'),
    t('desktop.introPage.safetyItems.originalAccount'),
    t('desktop.introPage.safetyItems.systemRisk'),
  ];

  const experienceItems = [
    t('desktop.introPage.experienceItems.online'),
    t('desktop.introPage.experienceItems.achievements'),
    t('desktop.introPage.experienceItems.localSave'),
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in-up">
        {/* Hero */}
        <NeonCard glow="cyan" padding="lg">
          <NeonBadge color="cyan" dot className="mb-5">
            {t('desktop.introPage.aboutUsBadge')}
          </NeonBadge>
          <h1
            className="font-black text-3xl md:text-4xl tracking-tight mb-5"
            style={{ color: 'var(--system-color-mist-lavender)' }}
          >
            {t('desktop.introPage.title')}
          </h1>
          <div className="flex flex-col gap-4 text-sm leading-relaxed" style={{ color: '#E8E8FF8C' }}>
            <p>{t('desktop.introPage.paragraph1')}</p>
            <p>{t('desktop.introPage.paragraph2')}</p>
          </div>
        </NeonCard>

        {/* Safety */}
        <NeonCard glow="purple" padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#7B2FBE26', border: '1px solid #7B2FBE4C', color: '#c084fc' }}
            >
              <Shield size={18} />
            </div>
            <h2 className="font-bold text-xl" style={{ color: 'var(--system-color-mist-lavender)' }}>
              {t('desktop.introPage.safetyTitle')}
            </h2>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#E8E8FF8C' }}>
            {t('desktop.introPage.safetyIntro')}
          </p>
          <ul className="flex flex-col gap-2.5">
            {safetyItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#E8E8FF8C' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: '#c084fc', boxShadow: '0 0 6px #c084fc' }}
                />
                {item}
              </li>
            ))}
          </ul>
        </NeonCard>

        {/* Experience */}
        <NeonCard glow="cyan" padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#00D4FF1A', border: '1px solid #00D4FF40', color: '#00d4ff' }}
            >
              <Star size={18} />
            </div>
            <h2 className="font-bold text-xl" style={{ color: 'var(--system-color-mist-lavender)' }}>
              {t('desktop.introPage.experienceTitle')}
            </h2>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#E8E8FF8C' }}>
            {t('desktop.introPage.experienceIntro')}
          </p>
          <ul className="flex flex-col gap-2.5">
            {experienceItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#E8E8FF8C' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }}
                />
                {item}
              </li>
            ))}
          </ul>
        </NeonCard>

        {/* Operations */}
        <NeonCard
          padding="lg"
          style={{
            background: 'linear-gradient(135deg, #00D4FF0F 0%, #7B2FBE14 100%)',
            border: '1px solid #00D4FF26',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#00D4FF1A', border: '1px solid #00D4FF40', color: '#00d4ff' }}
            >
              <Zap size={18} />
            </div>
            <h2 className="font-bold text-xl" style={{ color: 'var(--system-color-mist-lavender)' }}>
              {t('desktop.introPage.operationsTitle')}
            </h2>
          </div>
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--system-color-mist-lavender)' }}>
            {t('desktop.introPage.operationsBody')}
          </p>
        </NeonCard>
      </div>
    </MainLayout>
  );
}
