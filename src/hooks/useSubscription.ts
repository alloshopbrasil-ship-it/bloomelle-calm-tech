import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SupportedCurrency = 'eur' | 'usd';
export type BillingInterval = 'month' | 'year';

// Stripe product/price mapping (allowlisted server-side too)
export const STRIPE_PLANS = {
  premium: {
    month: {
      eur: {
        product_id: 'prod_Tt9Z1gHWsxpDK7',
        price_id: 'price_1SvNGmDIX4T0C71HKIICjjcD',
        amount: 1499,
      },
      usd: {
        product_id: 'prod_Tv24S3LpYgZ0qg',
        price_id: 'price_1SxC0aDIX4T0C71Hfv5vHJzp',
        amount: 1500,
      },
    },
    year: {
      eur: {
        product_id: 'prod_Tt9cXzhKiD4i9k',
        price_id: 'price_1SvNJDDIX4T0C71HW0xfOcIE',
        amount: 12500,
      },
      usd: {
        product_id: 'prod_Tv1zsgqeqf2w04',
        price_id: 'price_1SxBvoDIX4T0C71HzbmeUFQd',
        amount: 12500,
      },
    },
  },
} as const;

type RegionPricingState = {
  currency: SupportedCurrency;
  countryCode: string | null;
  loading: boolean;
};

const inferCurrencyFromLocale = (): SupportedCurrency => {
  if (typeof navigator === 'undefined') return 'eur';
  const locale = (navigator.language || '').toLowerCase();
  return locale.includes('en-us') ? 'usd' : 'eur';
};

const detectRegionPricing = async (signal?: AbortSignal): Promise<{ currency: SupportedCurrency; countryCode: string | null }> => {
  // Default to EUR, but try IP-based lookup for better accuracy.
  const fallbackCurrency = inferCurrencyFromLocale();

  try {
    const res = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!res.ok) throw new Error('geo lookup failed');
    const data = (await res.json()) as { country_code?: string; country?: string };
    const countryCode = (data.country_code || '').toUpperCase() || null;
    const currency: SupportedCurrency = countryCode === 'US' ? 'usd' : 'eur';
    return { currency, countryCode };
  } catch {
    return { currency: fallbackCurrency, countryCode: null };
  }
};

interface SubscriptionState {
  subscribed: boolean;
  planType: string | null;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [regionPricing, setRegionPricing] = useState<RegionPricingState>({
    currency: 'eur',
    countryCode: null,
    loading: true,
  });
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    planType: null,
    productId: null,
    subscriptionEnd: null,
    loading: false,
    error: null,
  });

  // Detect user's region once (used to pick currency for display + checkout)
  useEffect(() => {
    const controller = new AbortController();
    detectRegionPricing(controller.signal)
      .then(({ currency, countryCode }) => {
        setRegionPricing({ currency, countryCode, loading: false });
      })
      .catch(() => {
        setRegionPricing({ currency: inferCurrencyFromLocale(), countryCode: null, loading: false });
      });
    return () => controller.abort();
  }, []);

  const getPremiumPricing = useCallback(
    (interval: BillingInterval, currency?: SupportedCurrency) => {
      const curr = currency ?? regionPricing.currency;
      const byInterval = STRIPE_PLANS.premium[interval];
      return byInterval[curr] ?? byInterval.eur;
    },
    [regionPricing.currency]
  );

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setState({
        subscribed: data.subscribed || false,
        planType: data.plan_type || null,
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription',
      }));
    }
  }, [session?.access_token]);

  const createCheckout = useCallback(async (params: { interval: BillingInterval; currency?: SupportedCurrency }) => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    const currency = params.currency ?? regionPricing.currency;

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { interval: params.interval, currency },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.open(data.url, '_blank');
    }

    return data;
  }, [session?.access_token, regionPricing.currency]);

  const openCustomerPortal = useCallback(async () => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.open(data.url, '_blank');
    }

    return data;
  }, [session?.access_token]);

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user && session) {
      checkSubscription();
    }
  }, [user, session, checkSubscription]);

  // Auto-refresh subscription status every minute
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [user, session, checkSubscription]);

  return {
    ...state,
    currency: regionPricing.currency,
    countryCode: regionPricing.countryCode,
    pricingLoading: regionPricing.loading,
    getPremiumPricing,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isLoading: state.loading,
  };
};
