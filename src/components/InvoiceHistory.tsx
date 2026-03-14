import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, FileText, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Invoice {
  id: string;
  date: string | null;
  amount: number;
  currency: string;
  status: string | null;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  description: string | null;
}

export const InvoiceHistory = () => {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.access_token) {
      fetchInvoices();
    }
  }, [session?.access_token]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("list-invoices", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (fnError) throw fnError;
      setInvoices(data?.invoices || []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar faturas");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(currency === "usd" ? "en-US" : "pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10">{t("billing.paid") || "Paga"}</Badge>;
      case "open":
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30">{t("billing.open") || "Aberta"}</Badge>;
      case "void":
        return <Badge variant="secondary">{t("billing.void") || "Cancelada"}</Badge>;
      case "draft":
        return <Badge variant="secondary">{t("billing.draft") || "Rascunho"}</Badge>;
      case "uncollectible":
        return <Badge variant="destructive">{t("billing.uncollectible") || "Inadimplente"}</Badge>;
      default:
        return <Badge variant="secondary">{status || "—"}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        <p className="text-sm">{error}</p>
        <Button variant="ghost" size="sm" onClick={fetchInvoices} className="mt-2">
          {t("common.tryAgain") || "Tentar novamente"}
        </Button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center p-6">
        <Receipt className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          {t("billing.noInvoices") || "Nenhuma fatura encontrada"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <FileText className="w-4 h-4" />
        {t("billing.invoiceHistory") || "Histórico de Faturas"}
      </h4>
      <div className="space-y-2">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium truncate">
                  {invoice.description || "Bloomelle Premium"}
                </span>
                {getStatusBadge(invoice.status)}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(invoice.date)}</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </span>
              </div>
            </div>
            {(invoice.hosted_invoice_url || invoice.invoice_pdf) && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 shrink-0"
                onClick={() => window.open(invoice.hosted_invoice_url || invoice.invoice_pdf || "", "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
