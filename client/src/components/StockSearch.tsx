import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StockSearchProps {
  onStockAdded?: () => void;
}

export function StockSearch({ onStockAdded }: StockSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: monitoredStocks = [] } = trpc.stocks.monitored.list.useQuery();
  const addStockMutation = trpc.stocks.monitored.add.useMutation({
    onSuccess: () => {
      toast.success("Ação adicionada com sucesso!");
      setSearchQuery("");
      onStockAdded?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar ação");
    },
  });

  const removeStockMutation = trpc.stocks.monitored.remove.useMutation({
    onSuccess: () => {
      toast.success("Ação removida com sucesso!");
      onStockAdded?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover ação");
    },
  });

  const { data: searchResults = [], isLoading: isSearchingStocks } = trpc.stocks.search.useQuery(
    { query: searchQuery, limit: 10, investmentType: "stock" },
    {
      enabled: searchQuery.length >= 2 && !isSearching,
      refetchOnWindowFocus: false,
    }
  );

  const handleAddStock = async (ticker: string) => {
    if (monitoredStocks.length >= 6) {
      toast.error("Limite de 6 ações monitoradas atingido");
      return;
    }

    if (monitoredStocks.includes(ticker.toUpperCase())) {
      toast.error("Esta ação já está sendo monitorada");
      return;
    }

    setIsSearching(true);
    try {
      await addStockMutation.mutateAsync({ ticker });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveStock = async (ticker: string) => {
    setIsSearching(true);
    try {
      await removeStockMutation.mutateAsync({ ticker });
    } finally {
      setIsSearching(false);
    }
  };

  const isStockMonitored = (ticker: string) => {
    return monitoredStocks.includes(ticker.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Ações</CardTitle>
          <CardDescription>
            Pesquise e adicione até 6 ações para monitorar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barra de busca */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Digite o código da ação (ex: PETR4, VALE3)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  className="pl-10"
                  disabled={isSearching}
                />
                {isSearchingStocks && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Resultados da busca */}
            {searchQuery.length >= 2 && (
              <div className="border rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto">
                {isSearchingStocks ? (
                  <div className="px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    Pesquisando ações...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((stock: { ticker: string; name: string; type?: string }) => (
                    <div
                      key={stock.ticker}
                      className={cn(
                        "flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors",
                        isStockMonitored(stock.ticker) && "bg-emerald-50"
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{stock.ticker}</div>
                        <div className="text-xs text-gray-600">{stock.name}</div>
                      </div>
                      {isStockMonitored(stock.ticker) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStock(stock.ticker)}
                          disabled={isSearching}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddStock(stock.ticker)}
                          disabled={isSearching || monitoredStocks.length >= 6}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          {isSearching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                ) : searchQuery.length >= 2 && !isSearchingStocks ? (
                  <div className="px-4 py-2 text-sm text-gray-600">
                    Nenhuma ação encontrada para "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}

            {/* Ações monitoradas */}
            {monitoredStocks.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2">
                  Ações Monitoradas ({monitoredStocks.length}/6)
                </div>
                <div className="flex flex-wrap gap-2">
                  {monitoredStocks.map((ticker) => (
                    <div
                      key={ticker}
                      className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{ticker}</span>
                      <button
                        onClick={() => handleRemoveStock(ticker)}
                        disabled={isSearching}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem quando não há ações */}
            {monitoredStocks.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Nenhuma ação monitorada. Use a busca acima para adicionar ações.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

