import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line, ComposedChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useMemo } from "react";

interface StockChartProps {
  ticker: string;
  period?: string;
  interval?: string;
  height?: number;
  showTrendLine?: boolean;
}

export function StockChart({ ticker, period = "1mo", interval = "1d", height = 300, showTrendLine = false }: StockChartProps) {
  const { data: history, isLoading, error } = trpc.stocks.history.useQuery(
    {
      ticker,
      period,
      interval,
    },
    {
      staleTime: 4 * 60 * 60 * 1000, // 4 horas - dados considerados frescos por 4 horas
      cacheTime: 24 * 60 * 60 * 1000, // 24 horas - mantém no cache por 24 horas
      refetchOnMount: false, // Não refaz a query quando o componente é montado
      refetchOnWindowFocus: false, // Não refaz a query quando a janela ganha foco
      refetchOnReconnect: false, // Não refaz a query quando reconecta
    }
  );

  // Calcula a linha de tendência usando regressão linear simples
  // IMPORTANTE: useMemo deve ser chamado sempre, mesmo quando history não existe
  const trendLineData = useMemo(() => {
    if (!history?.success || !history.history || history.history.length === 0) {
      return [];
    }

    const data = history.history.map((item: any, index: number) => ({
      x: index,
      y: item.close,
      date: item.date,
    }));

    // Regressão linear: y = a + b*x
    const n = data.length;
    if (n === 0) return [];

    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (Math.abs(denominator) < 0.0001) {
      // Se o denominador é muito pequeno, retorna uma linha horizontal na média
      const avg = sumY / n;
      return history.history.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: avg,
        fullDate: item.date,
      }));
    }

    const b = (n * sumXY - sumX * sumY) / denominator;
    const a = (sumY - b * sumX) / n;

    // Calcula pontos da linha de tendência (mesma quantidade de pontos que os dados)
    const trendPoints = history.history.map((item: any, index: number) => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: a + b * index,
      fullDate: item.date,
    }));

    return trendPoints;
  }, [history]);

  // Determina se a tendência é crescente ou decrescente
  const isTrendUp = useMemo(() => {
    if (trendLineData.length < 2) return false;
    const first = trendLineData[0]?.value;
    const last = trendLineData[trendLineData.length - 1]?.value;
    if (first === undefined || last === undefined) return false;
    return last > first;
  }, [trendLineData]);

  // Prepara os dados do gráfico
  const chartData = useMemo(() => {
    if (!history?.success || !history.history) return [];
    
    const data = (history.history || []).map((item: any, index: number) => {
      const dateStr = new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      // O valor de tendência está no mesmo índice
      const trendValue = showTrendLine && trendLineData[index] ? trendLineData[index].value : null;
      
      return {
        date: dateStr,
        value: item.close,
        fullDate: item.date,
        trend: trendValue,
      };
    });
    
    return data;
  }, [history, trendLineData, showTrendLine]);

  // Calcula valores para exibição (deve ser chamado sempre, antes dos returns condicionais)
  // Usa valores padrão quando history não está disponível para evitar erros
  const firstPrice = history?.success ? (history.first_close || 0) : 0;
  const lastPrice = history?.success ? (history.last_close || 0) : 0;
  const change = lastPrice - firstPrice;
  const changePercent = history?.success ? (history.period_change_percent || 0) : 0;
  const isPositive = change >= 0;

  // Early returns devem vir DEPOIS de todos os hooks
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error(`[StockChart] Erro ao carregar ${ticker}:`, error);
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground font-semibold">
            Erro ao carregar gráfico
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {error?.message || "Erro desconhecido"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!history || !history.success) {
    console.warn(`[StockChart] Dados não disponíveis para ${ticker}:`, history?.error);
    const isRateLimited = (history as any)?.rate_limited;
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-[300px]">
          <p className={`font-semibold ${isRateLimited ? 'text-yellow-800' : 'text-muted-foreground'}`}>
            {isRateLimited ? "⚠️ Limite de requisições" : `Dados não disponíveis para ${ticker}`}
          </p>
          {history?.error && (
            <p className={`text-sm mt-2 ${isRateLimited ? 'text-yellow-700' : 'text-muted-foreground'}`}>
              {history.error}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold">{ticker}</CardTitle>
            <CardDescription className="mt-1">
              {history.normalized_ticker || ticker} • {period}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {history.currency === 'USD' ? '$' : 'R$'} {lastPrice.toFixed(2)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id={`color${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `${history.currency === 'USD' ? '$' : 'R$'} ${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Tendência') {
                  return [`${history.currency === 'USD' ? '$' : 'R$'} ${value.toFixed(2)}`, 'Tendência'];
                }
                return [`${history.currency === 'USD' ? '$' : 'R$'} ${value.toFixed(2)}`, 'Preço'];
              }}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill={`url(#color${ticker})`}
            />
            {showTrendLine && trendLineData.length > 0 && (
              <Line
                type="linear"
                dataKey="trend"
                stroke={isTrendUp ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Tendência"
                legendType="line"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {history.timestamp && (
          <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-4 pt-4 border-t">
            <Clock className="w-3 h-3" />
            <span>
              Atualizado em {new Date(history.timestamp).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

