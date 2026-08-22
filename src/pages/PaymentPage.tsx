import { useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Lock,
  ShoppingBag,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartItem, Utils } from '@/shared';
import { useCart } from '@/shared';
import MainLayout from '../components/MainLayout';
import NeonBadge from '../components/neon/NeonBadge';
import NeonButton from '../components/neon/NeonButton';
import NeonCard from '../components/neon/NeonCard';
import SePayPaymentForm from '../components/payment/SePayPaymentForm';
import SectionHeader from '../components/neon/SectionHeader';
import { ProductService } from '@/api/productApi';
import { toast } from 'react-toastify';

export default function PaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { items, itemCount, clearCart, removeItem } = useCart();
  const isSuccess = pathname === '/payment/success';

  // Reset pagination state to page 1 when visiting PaymentPage
  useEffect(() => {
    localStorage.setItem("products_current_page", "1");
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const price = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleFinish = () => {
    clearCart();
    navigate('/library');
  };

  const handleSubmit = async () => {
    try {
      const productIds = Array.from(new Set(items.map((item) => item.id)));
      const response = await ProductService.purchase({ productIds });
      const failedPurchase = !response?.success || response?.statusCode >= 400;

      if (failedPurchase) {
        throw new Error(response?.message || "Purchase failed");
      }

      clearCart();
      toast.success("Purchase completed successfully!");
      navigate("/payment/success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Purchase failed";
      toast.error(message);
    }
  }

  const handleRemove = (item: CartItem) => {
    removeItem(item.id);
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SectionHeader
            eyebrow={t('desktop.paymentPage.eyebrow')}
            title={isSuccess ? t('desktop.paymentPage.successTitle') : t('desktop.paymentPage.title')}
          />
          <NeonBadge color={isSuccess ? 'green' : 'cyan'}>
            {isSuccess ? <CheckCircle2 size={12} /> : <Lock size={12} />}
            {isSuccess
              ? t('desktop.paymentPage.successBadge')
              : t('desktop.paymentPage.secureBadge')}
          </NeonBadge>
        </div>

        {isSuccess ? (
          <NeonCard glow="cyan" padding="lg" className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-[#00FF8859] bg-[#00FF8814]">
              <CheckCircle2 size={32} style={{ color: '#00ff88' }} />
            </div>
            <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed" style={{ color: '#E8E8FF8C' }}>
              {t('desktop.paymentPage.successMessage')}
            </p>
            <NeonButton variant="primary" size="lg" onClick={handleFinish}>
              {t('desktop.paymentPage.goToLibrary')}
            </NeonButton>
          </NeonCard>
        ) : items.length === 0 ? (
          <NeonCard glow="cyan" padding="lg" className="text-center">
            <ShoppingBag size={34} className="mx-auto mb-4" style={{ color: '#00D4FF8C' }} />
            <p className="mb-5 text-sm" style={{ color: '#E8E8FF8C' }}>
              {t('desktop.paymentPage.emptyCart')}
            </p>
            <Link to="/cart">
              <NeonButton variant="primary" startIcon={<ArrowLeft size={15} />}>
                {t('desktop.paymentPage.backToCart')}
              </NeonButton>
            </Link>
          </NeonCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
            {/* Payment Section (70% width / 7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <NeonCard glow="cyan" padding="md">
                <h3 className="mb-4 text-base font-bold" style={{ color: 'var(--system-color-mist-lavender)' }}>
                  {t('desktop.paymentPage.confirmPurchase')}
                </h3>
                <SePayPaymentForm
                  amount={subtotal}
                  onSubmit={handleSubmit}
                />
              </NeonCard>

              <p className="flex items-center gap-2 text-sm text-text-primary/70">
                <Lock size={14} className="text-neon-cyan" />
                {t('desktop.paymentPage.secureNote')}
              </p>
            </div>

            {/* Product Summary Section (30% width / 3 cols) */}
            <NeonCard glow="purple" padding="md" className="lg:col-span-3 self-start lg:sticky lg:top-24">
              <div className="mb-5 flex items-center justify-between gap-3 pb-3 border-b border-text-primary/10">
                <h3 className="text-base font-bold" style={{ color: 'var(--system-color-mist-lavender)' }}>
                  {t('desktop.paymentPage.cartTitle', { count: itemCount })}
                </h3>
                <NeonButton
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/cart')}
                  startIcon={<Pencil size={13} />}
                >
                  {t('desktop.paymentPage.editCart')}
                </NeonButton>
              </div>

              <div className="flex flex-col gap-3">
                <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
                  {items.map((item) => {
                    const finalPrice = item.discount
                      ? item.price * (1 - item.discount / 100)
                      : item.price;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-text-primary/8 bg-bg-dark/45 p-3 shrink-0"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-14 w-18 rounded-lg object-cover shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-xs font-bold text-text-primary">
                            {item.name}
                          </h4>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-neon-cyan">
                              {Utils.convert.currency(finalPrice, "vi")}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-text-primary/60">
                                x{item.quantity}
                              </span>
                            )}
                          </div>
                        </div>

                        <NeonButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item)}
                          className="h-7 w-7 p-0 border-text-primary/10 text-text-primary/45 hover:border-neon-pink/40 hover:text-neon-pink shrink-0"
                        >
                          <Trash2 size={13} />
                        </NeonButton>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 rounded-xl border border-neon-cyan/15 bg-neon-cyan/5 p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-lg font-semibold text-text-primary">
                      {t('desktop.cartPage.total')}
                    </span>
                    <span className="text-3xl font-black text-neon-cyan">
                      {Utils.convert.currency(subtotal, "vi")}
                    </span>
                  </div>
                </div>

                <NeonButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-start border-transparent bg-transparent px-1 text-left text-text-primary/60 hover:border-transparent hover:bg-transparent hover:text-text-primary"
                  startIcon={<TicketPercent size={17} />}
                >
                  {t('desktop.paymentPage.promoQuestion')}
                </NeonButton>
              </div>

              <NeonButton
                variant="ghost"
                fullWidth
                className="mt-6"
                onClick={() => navigate('/cart')}
                startIcon={<ArrowLeft size={14} />}
              >
                {t('desktop.paymentPage.backToCart')}
              </NeonButton>
            </NeonCard>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
