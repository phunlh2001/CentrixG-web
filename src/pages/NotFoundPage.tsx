import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import NeonButton from '../components/neon/NeonButton';
import NFP from './../assets/404.png';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8 text-center animate-fade-in">
        <div className="relative">
          {/* Glow behind image */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #00D4FF1F, transparent 70%)',
              filter: 'blur(32px)',
            }}
          />
          <img
            src={NFP}
            alt="Page not found"
            className="relative z-10 w-72 h-60 object-contain mx-auto animate-float"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1
            className="font-black text-6xl"
            style={{
              color: '#00d4ff',
              textShadow: '0 0 32px #00D4FF80',
            }}
          >
            404
          </h1>
          <p className="font-bold text-xl" style={{ color: 'var(--system-color-mist-lavender)' }}>
            {t('notFoundPage.title')}
          </p>
          <p className="text-sm" style={{ color: '#E8E8FF8C' }}>
            {t('notFoundPage.sub')}
          </p>
        </div>

        <NeonButton
          variant="primary"
          size="lg"
          startIcon={<Home size={16} />}
          onClick={() => navigate('/')}
        >
          {t('notFoundPage.back')}
        </NeonButton>
      </div>
    </MainLayout>
  );
}
