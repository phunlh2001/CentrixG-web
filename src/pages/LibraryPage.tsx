import { BookOpen, Check, ExternalLink, Lock, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Utils } from '@/shared';
import { AuthService } from '../api/authApi';
import { IUserGame, UserService } from '../api/userApi';
import MainLayout from '../components/MainLayout';
import NeonBadge from '../components/neon/NeonBadge';
import NeonButton from '../components/neon/NeonButton';
import NeonCard from '../components/neon/NeonCard';
import SectionHeader from '../components/neon/SectionHeader';

const formatLibraryDate = (date: string) => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString();
};

function NotLoggedIn() {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center py-24 gap-6 rounded-2xl"
      style={{
        background: '#7B2FBE0A',
        border: '1px solid #7B2FBE1F',
      }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: '#7B2FBE1A', border: '1px solid #7B2FBE40' }}
      >
        <Lock size={34} style={{ color: '#C084FC80' }} />
      </div>
      <div className="text-center">
        <p className="font-bold text-xl mb-2" style={{ color: 'var(--system-color-mist-lavender)' }}>
          {t('desktop.libraryPage.notLoggedInTitle')}
        </p>
        <p className="text-sm max-w-sm" style={{ color: '#E8E8FF8C' }}>
          {t('desktop.libraryPage.notLoggedInSub')}
        </p>
      </div>
      <Link to="/auth">
        <NeonButton variant="secondary" startIcon={<Lock size={14} />}>
          {t('desktop.libraryPage.signIn')}
        </NeonButton>
      </Link>
    </div>
  );
}

function EmptyLibrary() {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center py-24 gap-6 rounded-2xl"
      style={{
        background: '#00D4FF08',
        border: '1px solid #00D4FF14',
      }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: '#00D4FF14', border: '1px solid #00D4FF26' }}
      >
        <BookOpen size={34} style={{ color: '#00D4FF66' }} />
      </div>
      <div className="text-center">
        <p className="font-bold text-xl mb-2" style={{ color: 'var(--system-color-mist-lavender)' }}>
          {t('desktop.libraryPage.emptyTitle')}
        </p>
        <p className="text-sm" style={{ color: '#E8E8FF8C' }}>
          {t('desktop.libraryPage.emptySub')}
        </p>
      </div>
      <Link to="/">
        <NeonButton variant="primary">{t('desktop.libraryPage.browseGames')}</NeonButton>
      </Link>
    </div>
  );
}

function LibraryCard({ item }: { item: IUserGame }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const product = item.product;
  const categories = product.categories || [];

  return (
    <NeonCard
      glow={'cyan'}
      padding="none"
      className="group transition-all duration-200"
    >
      <div className="relative w-full aspect-video overflow-hidden rounded-t-xl">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #050510CC 0%, transparent 60%)' }}
        />

        <div className="absolute top-2.5 left-2.5">
          <NeonBadge color="green" dot>
            <Check size={9} />
            {t('desktop.libraryPage.active')}
          </NeonBadge>
        </div>
      </div>

      <div className="p-4">
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: '#00D4FF80' }}
        >
          {Utils.convert.category(categories[0] || 'game')} · {formatLibraryDate(item.rentedAt)}
        </p>
        <h3
          className="font-semibold text-sm line-clamp-2 leading-snug mb-3"
          style={{ color: 'var(--system-color-mist-lavender)' }}
        >
          {product.name}
        </h3>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.slice(0, 3).map((cat) => (
              <NeonBadge key={cat} color="cyan">
                {cat}
              </NeonBadge>
            ))}
          </div>
        )}
        <NeonButton
          variant="primary"
          fullWidth
          size="sm"
          startIcon={<ExternalLink size={12} />}
          onClick={() =>
            navigate(`/products/${product.id}?mode=activate`, {
              state: { isOwned: true },
            })
          }
        >
          {t('desktop.libraryPage.viewKey')}
        </NeonButton>
      </div>
    </NeonCard>
  );
}

export default function LibraryPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [library, setLibrary] = useState<IUserGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      setLibrary([]);
      return;
    }

    let mounted = true;

    const loadLibrary = async () => {
      setIsLoading(true);
      try {
        const response = await UserService.get();

        if (mounted && response?.success && response.statusCode === 200 && response.data) {
          setLibrary(response.data);
        } else if (mounted) {
          setLibrary([]);
        }
      } catch (error) {
        console.error('Error loading library games:', error);
        if (mounted) setLibrary([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadLibrary();

    return () => {
      mounted = false;
    };
  }, [currentUser?.id]);

  const filtered = useMemo(
    () =>
      library.filter((item) => {
        const matchesQuery = item.product.name.toLowerCase().includes(query.toLowerCase());
        return matchesQuery;
      }),
    [library, query],
  );

  if (!currentUser) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8 animate-fade-in-up">
          <SectionHeader eyebrow={t('desktop.libraryPage.eyebrow')} title={t('desktop.libraryPage.title')} />
          <NotLoggedIn />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 animate-fade-in-up">
        <NeonCard glow="cyan" padding="lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <NeonBadge color="cyan" dot className="mb-3">
                {t('desktop.libraryPage.userLibrary', { name: currentUser.username })}
              </NeonBadge>
              <h1
                className="font-black text-3xl md:text-4xl tracking-tight"
                style={{ color: 'var(--system-color-mist-lavender)' }}
              >
                {t('desktop.libraryPage.title')}
              </h1>
            </div>
          </div>
        </NeonCard>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div
            className="relative w-full sm:w-72"
            style={{ maxWidth: 320 }}
          >
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#00D4FF66' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('desktop.libraryPage.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                background: '#00D4FF0D',
                border: '1px solid #00D4FF26',
                color: 'var(--system-color-mist-lavender)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00D4FF66';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#00D4FF26';
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-text-primary/50 text-sm">
            Loading library...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <LibraryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
