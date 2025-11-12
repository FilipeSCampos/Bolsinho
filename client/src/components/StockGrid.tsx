import { StockCard } from "./StockCard";
import { StockChart } from "./StockChart";
import { StockSearch } from "./StockSearch";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function StockGrid() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const utils = trpc.useUtils();
  const { data: monitoredStocks = [], refetch: refetchMonitored } = trpc.stocks.monitored.list.useQuery();
  const refreshMutation = trpc.stocks.refresh.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message || "Dados atualizados com sucesso!");
      // Invalida todas as queries de ações para forçar atualização
      await utils.stocks.info.invalidate();
      await utils.stocks.history.invalidate();
      setRefreshKey(prev => prev + 1);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar dados");
    },
  });

  const handleStockAdded = () => {
    refetchMonitored();
    setRefreshKey(prev => prev + 1);
  };

  const handleRefresh = async () => {
    if (monitoredStocks.length > 0) {
      toast.info("Atualizando dados das ações...");
      await refreshMutation.mutateAsync({ tickers: monitoredStocks });
    }
  };
  
  // Inicializa selectedStocks com as primeiras 2 ações monitoradas
  useEffect(() => {
    if (monitoredStocks.length > 0) {
      // Se não tem ações selecionadas, seleciona as primeiras 2
      if (selectedStocks.length === 0) {
        setSelectedStocks(monitoredStocks.slice(0, 2));
      } else {
        // Remove ações selecionadas que não estão mais monitoradas
        const validStocks = selectedStocks.filter(ticker => monitoredStocks.includes(ticker));
        if (validStocks.length !== selectedStocks.length) {
          setSelectedStocks(validStocks.length > 0 ? validStocks : monitoredStocks.slice(0, 2));
        }
      }
    }
  }, [monitoredStocks]); // Removido selectedStocks.length da dependência para evitar loop

  // Mostra apenas as ações monitoradas pelo usuário (sem lista padrão)
  const stocksToShow = monitoredStocks.map(ticker => ({ ticker, name: undefined }));

  return (
    <div className="space-y-8">
      {/* Busca de Ações */}
      <div>
        <StockSearch onStockAdded={handleStockAdded} />
      </div>

      {/* Grid de Cards de Ações */}
      {stocksToShow.length > 0 ? (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ações Monitoradas ({stocksToShow.length}/6)
              </h2>
              <p className="text-gray-600">
                Suas ações favoritas
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              {refreshMutation.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocksToShow.map((stock) => (
              <StockCard 
                key={`${stock.ticker}-${refreshKey}`} 
                ticker={stock.ticker} 
                name={stock.name} 
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhuma ação monitorada
            </h2>
            <p className="text-gray-600 mb-6">
              Use a busca acima para adicionar até 6 ações e começar a monitorar seus investimentos.
            </p>
          </div>
        </div>
      )}

          {/* Gráficos Principais */}
          {stocksToShow.length > 0 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Análise de Mercado</h2>
                    <p className="text-gray-600">Gráficos de performance das suas ações monitoradas</p>
                  </div>
                  {/* Seletor de ações para gráficos */}
                  <div className="flex gap-2">
                    {monitoredStocks.map((ticker) => (
                      <button
                        key={ticker}
                        onClick={() => {
                          if (selectedStocks.includes(ticker)) {
                            // Remove a ação selecionada
                            setSelectedStocks(selectedStocks.filter(t => t !== ticker));
                          } else if (selectedStocks.length < 2) {
                            // Adiciona a ação se ainda não atingiu o limite
                            setSelectedStocks([...selectedStocks, ticker]);
                          } else {
                            // Se já tem 2 ações, substitui a primeira pela nova
                            setSelectedStocks([ticker, selectedStocks[1]]);
                          }
                          setRefreshKey(prev => prev + 1);
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedStocks.includes(ticker)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {ticker}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedStocks.map((ticker) => (
                  <StockChart 
                    key={`chart-${ticker}-${refreshKey}`}
                    ticker={ticker} 
                    period="1mo" 
                    height={350}
                    showTrendLine={true}
                  />
                ))}
                {selectedStocks.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-500">Selecione até 2 ações para visualizar nos gráficos</p>
                  </div>
                )}
              </div>
            </div>
          )}
    </div>
  );
}

