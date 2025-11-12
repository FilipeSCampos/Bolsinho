import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockCardProps {
  ticker: string;
  name?: string;
  className?: string;
}

export function StockCard({ ticker, name, className }: StockCardProps) {
  const { data: info, isLoading, error } = trpc.stocks.info.useQuery(
    { ticker },
    {
      staleTime: 4 * 60 * 60 * 1000, // 4 horas - dados considerados frescos por 4 horas
      cacheTime: 24 * 60 * 60 * 1000, // 24 horas - mantém no cache por 24 horas
      refetchOnMount: false, // Não refaz a query quando o componente é montado
      refetchOnWindowFocus: false, // Não refaz a query quando a janela ganha foco
      refetchOnReconnect: false, // Não refaz a query quando reconecta
    }
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24 mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error(`[StockCard] Erro ao carregar ${ticker}:`, error);
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="p-4">
          <p className="text-sm text-red-600">Erro ao carregar {ticker}</p>
          <p className="text-xs text-red-500 mt-1">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!info) {
    return (
      <Card className={cn("border-gray-200 bg-gray-50", className)}>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Carregando {ticker}...</p>
        </CardContent>
      </Card>
    );
  }

  if (!info.success) {
    console.warn(`[StockCard] Dados não disponíveis para ${ticker}:`, info.error);
    const isRateLimited = (info as any).rate_limited;
    return (
      <Card className={cn(
        isRateLimited ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50", 
        className
      )}>
        <CardContent className="p-4">
          <p className={`text-sm ${isRateLimited ? 'text-yellow-800' : 'text-gray-600'}`}>
            {isRateLimited ? "⚠️ Limite de requisições" : `Dados não disponíveis para ${ticker}`}
          </p>
          {info.error && (
            <p className={`text-xs mt-1 ${isRateLimited ? 'text-yellow-700' : 'text-gray-500'}`}>
              {info.error}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const change = info.change || 0;
  const changePercent = info.change_percent || 0;
  const isPositive = change >= 0;

  return (
    <Card className={cn("hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{info.name || ticker}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {info.ticker} • {info.market || 'B3'}
            </CardDescription>
          </div>
          {isPositive ? (
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
          ) : (
            <ArrowDownRight className="w-5 h-5 text-red-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {info.currency === 'USD' ? '$' : 'R$'} {info.current_price?.toFixed(2) || 'N/A'}
          </div>
          <div className={cn(
            "flex items-center gap-2 text-sm font-semibold",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
          {info.volume && (
            <div className="text-xs text-muted-foreground">
              Volume: {info.volume.toLocaleString('pt-BR')}
            </div>
          )}
          {info.timestamp && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 pt-2 border-t">
              <Clock className="w-3 h-3" />
              <span>
                Atualizado em {new Date(info.timestamp).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

