import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, RefreshCw, TrendingUp, TrendingDown, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function Portfolio() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [investmentType, setInvestmentType] = useState<"stock" | "fii" | "cdb" | "tesouro_direto" | "fundo_imobiliario" | "outro">("stock");

  const utils = trpc.useUtils();
  const { data: investments = [], isLoading: investmentsLoading } = trpc.investments.list.useQuery();
  const { data: expectedReturns, isLoading: returnsLoading } = trpc.investments.getExpectedMonthlyReturn.useQuery();

  const createMutation = trpc.investments.create.useMutation({
    onSuccess: () => {
      toast.success("Investimento adicionado com sucesso!");
      utils.investments.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.investments.getExpectedMonthlyReturn.invalidate();
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar investimento");
    },
  });

  const updateMutation = trpc.investments.update.useMutation({
    onSuccess: () => {
      toast.success("Investimento atualizado com sucesso!");
      utils.investments.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.investments.getExpectedMonthlyReturn.invalidate();
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar investimento");
    },
  });

  const deleteMutation = trpc.investments.delete.useMutation({
    onSuccess: () => {
      toast.success("Investimento removido com sucesso!");
      utils.investments.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.investments.getExpectedMonthlyReturn.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover investimento");
    },
  });

  const updateValuesMutation = trpc.investments.updateValues.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Valores atualizados com sucesso!");
      utils.investments.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.investments.getExpectedMonthlyReturn.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar valores");
    },
  });

  const resetForm = () => {
    setSelectedTicker("");
    setSearchQuery("");
    setQuantity("");
    setNotes("");
    setInvestmentType("stock");
    setEditingInvestment(null);
  };

  const { data: searchResults = [], isLoading: isSearching } = trpc.stocks.search.useQuery(
    { 
      query: searchQuery, 
      limit: 10,
      investmentType: investmentType === "fundo_imobiliario" ? "fii" : investmentType === "outro" ? "all" : investmentType,
    },
    {
      enabled: searchQuery.length >= 2 && (investmentType === "stock" || investmentType === "fii" || investmentType === "fundo_imobiliario" || investmentType === "outro"),
      refetchOnWindowFocus: false,
    }
  );

  const handleAddInvestment = () => {
    // Para CDB e Tesouro Direto, o ticker pode ser o nome do investimento
    if (!selectedTicker && investmentType !== "cdb" && investmentType !== "tesouro_direto" && investmentType !== "outro") {
      toast.error("Selecione um investimento");
      return;
    }
    
    if (!quantity) {
      toast.error("Preencha a quantidade ou valor");
      return;
    }

    const qty = parseFloat(quantity);

    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantidade ou valor inválido");
      return;
    }
    
    // Para CDB e Tesouro Direto, usa o searchQuery como ticker se selectedTicker não estiver definido
    const ticker = selectedTicker || searchQuery || "MANUAL";

    createMutation.mutate({
      ticker: ticker,
      quantity: qty,
      type: investmentType,
      notes: notes || undefined,
    });
  };

  const handleEditInvestment = (investment: any) => {
    setEditingInvestment(investment);
    setSelectedTicker(investment.ticker);
    setSearchQuery(investment.ticker);
    setQuantity(investment.quantity.toString());
    setNotes(investment.notes || "");
    setInvestmentType(investment.type || "stock");
    setIsEditDialogOpen(true);
  };

  const handleUpdateInvestment = () => {
    if (!editingInvestment || !quantity) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const qty = parseFloat(quantity);

    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    // Ao atualizar, busca o preço atual da ação e recalcula
    // O backend já faz isso automaticamente se quantity for atualizado
    updateMutation.mutate({
      id: editingInvestment.id,
      quantity: qty,
      notes: notes || undefined,
    });
  };

  const handleDeleteInvestment = (id: number) => {
    if (confirm("Tem certeza que deseja remover este investimento?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleUpdateValues = () => {
    updateValuesMutation.mutate();
  };

  if (investmentsLoading || returnsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Investments Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Meus Investimentos</CardTitle>
              <CardDescription>Gerencie seus investimentos em ações</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateValues}
                disabled={updateValuesMutation.isPending || investments.length === 0}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${updateValuesMutation.isPending ? 'animate-spin' : ''}`} />
                Atualizar Valores
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Investimento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Adicionar Investimento</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Pesquise a ação e informe a quantidade de cotas que você comprou. Os valores serão calculados automaticamente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 bg-white">
                    <div className="space-y-2">
                      <Label htmlFor="investment-type">Tipo de Investimento *</Label>
                      <Select
                        value={investmentType}
                        onValueChange={(value: "stock" | "fii" | "cdb" | "tesouro_direto" | "fundo_imobiliario" | "outro") => {
                          setInvestmentType(value);
                          setSearchQuery("");
                          setSelectedTicker("");
                        }}
                      >
                        <SelectTrigger className="w-full bg-white border-gray-300">
                          <SelectValue placeholder="Selecione o tipo de investimento" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="stock">Ação</SelectItem>
                          <SelectItem value="fii">Fundo Imobiliário (FII)</SelectItem>
                          <SelectItem value="cdb">CDB</SelectItem>
                          <SelectItem value="tesouro_direto">Tesouro Direto</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {investmentType === "stock" && "Ações negociadas na B3 (ex: PETR4, VALE3)"}
                        {investmentType === "fii" && "Fundos Imobiliários negociados na B3 (ex: HGLG11, XPLG11)"}
                        {investmentType === "cdb" && "CDB - Certificado de Depósito Bancário"}
                        {investmentType === "tesouro_direto" && "Títulos do Tesouro Direto"}
                        {investmentType === "outro" && "Outros tipos de investimento"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticker-search">
                        {investmentType === "stock" ? "Ação" : investmentType === "fii" ? "FII" : investmentType === "cdb" ? "CDB" : investmentType === "tesouro_direto" ? "Título" : "Investimento"} *
                      </Label>
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="ticker-search"
                            type="text"
                            placeholder={
                              investmentType === "stock" 
                                ? "Digite o código da ação (ex: PETR4, VALE3)"
                                : investmentType === "fii"
                                ? "Digite o código do FII (ex: HGLG11, XPLG11)"
                                : investmentType === "cdb"
                                ? "Digite o nome ou código do CDB"
                                : investmentType === "tesouro_direto"
                                ? "Digite o nome do título (ex: TESOURO SELIC 2026)"
                                : "Digite o nome ou código do investimento"
                            }
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value.toUpperCase());
                              if (e.target.value.length >= 2) {
                                // Se o usuário digitar um ticker válido diretamente, seleciona
                                const trimmed = e.target.value.trim().toUpperCase();
                                if (trimmed.length >= 2 && !trimmed.includes(' ')) {
                                  setSelectedTicker(trimmed);
                                }
                              }
                            }}
                            className={`uppercase pl-10 ${investmentType === "cdb" || investmentType === "tesouro_direto" || investmentType === "outro" ? "" : ""}`}
                            disabled={false}
                            onBlur={() => {
                              // Quando perder foco, se não selecionou nenhum resultado, usa o que foi digitado
                              if (searchQuery && !selectedTicker && (investmentType === "cdb" || investmentType === "tesouro_direto" || investmentType === "outro")) {
                                setSelectedTicker(searchQuery);
                              }
                            }}
                          />
                          {isSearching && (investmentType === "stock" || investmentType === "fii" || investmentType === "fundo_imobiliario") && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            </div>
                          )}
                        </div>
                        {searchQuery.length >= 2 && (investmentType === "stock" || investmentType === "fii" || investmentType === "fundo_imobiliario" || investmentType === "outro") && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {isSearching ? (
                              <div className="px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                Pesquisando...
                              </div>
                            ) : searchResults.length > 0 ? (
                              searchResults.map((stock: { ticker: string; name: string; type?: string }) => (
                                <button
                                  key={stock.ticker}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTicker(stock.ticker);
                                    setSearchQuery(stock.ticker);
                                  }}
                                  className={`w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors ${
                                    selectedTicker === stock.ticker ? 'bg-emerald-100' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-sm">{stock.ticker}</div>
                                      <div className="text-xs text-gray-600">{stock.name}</div>
                                    </div>
                                    {stock.type && (
                                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                                        {stock.type === "fii" ? "FII" : "Ação"}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : searchQuery.length >= 2 && !isSearching ? (
                              <div className="px-4 py-2 text-sm text-gray-600">
                                Nenhum resultado encontrado para "{searchQuery}"
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                      {(selectedTicker || (searchQuery && (investmentType === "cdb" || investmentType === "tesouro_direto" || investmentType === "outro"))) && (
                        <p className="text-xs text-emerald-600 font-medium">
                          ✓ {investmentType === "stock" ? "Ação" : investmentType === "fii" ? "FII" : "Investimento"} selecionado: {selectedTicker || searchQuery}
                        </p>
                      )}
                      {(investmentType === "cdb" || investmentType === "tesouro_direto") && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-900">
                            <strong>Nota:</strong> Para {investmentType === "cdb" ? "CDB" : "Tesouro Direto"}, digite o nome do investimento no campo acima e informe o <strong>valor total investido</strong> no campo abaixo. O sistema não busca preços automaticamente para estes tipos de investimento.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">
                        {investmentType === "stock" || investmentType === "fii" || investmentType === "fundo_imobiliario" 
                          ? "Quantidade de Cotas *" 
                          : investmentType === "cdb" || investmentType === "tesouro_direto"
                          ? "Valor Total Investido (R$) *"
                          : "Quantidade/Valor *"}
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder={
                          investmentType === "stock" || investmentType === "fii" || investmentType === "fundo_imobiliario"
                            ? "Ex: 100"
                            : investmentType === "cdb" || investmentType === "tesouro_direto"
                            ? "Ex: 5000.00"
                            : "Ex: 100 ou 5000.00"
                        }
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="0"
                        step={investmentType === "cdb" || investmentType === "tesouro_direto" ? "0.01" : "1"}
                      />
                      <p className="text-xs text-muted-foreground">
                        {investmentType === "stock" || investmentType === "fii" || investmentType === "fundo_imobiliario"
                          ? "Quantidade de cotas que você comprou. O preço será buscado automaticamente."
                          : investmentType === "cdb" || investmentType === "tesouro_direto"
                          ? "Valor total investido em reais. Informe o valor que você investiu neste CDB ou título do Tesouro Direto."
                          : "Quantidade ou valor do investimento"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Input
                        id="notes"
                        type="text"
                        placeholder="Observações opcionais"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddInvestment}
                      disabled={createMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {createMutation.isPending ? "Adicionando..." : "Adicionar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Nenhum investimento
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece a adicionar investimentos ao seu portfólio
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Investimento
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investimento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Médio</TableHead>
                    <TableHead>Total Investido</TableHead>
                    <TableHead>Valor Atual</TableHead>
                    <TableHead>Rendimento</TableHead>
                    <TableHead>Rendimento Mensal Esperado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((investment) => {
                    const invested = investment.totalInvested / 100;
                    const currentValue = investment.currentValue / 100;
                    const returnValue = currentValue - invested;
                    const returnPercent = invested > 0 ? (returnValue / invested) * 100 : 0;
                    const expectedReturnData = expectedReturns?.investments?.find(
                      (inv) => inv.ticker === investment.ticker
                    );
                    const expectedReturnPercent = expectedReturnData?.expectedReturnPercent || 0;
                    
                    // Mapeia o tipo de investimento para um label amigável
                    const getInvestmentTypeLabel = (type: string) => {
                      switch (type) {
                        case "stock": return "Ação";
                        case "fii": return "FII";
                        case "cdb": return "CDB";
                        case "tesouro_direto": return "Tesouro Direto";
                        case "fundo_imobiliario": return "FII";
                        case "outro": return "Outro";
                        default: return type;
                      }
                    };
                    
                    // Para CDB e Tesouro Direto, quantidade é 1 (valor total está em totalInvested)
                    const displayQuantity = (investment.type === "cdb" || investment.type === "tesouro_direto" || investment.type === "outro") 
                      ? "-" 
                      : investment.quantity;
                    
                    // Para CDB e Tesouro Direto, não mostra preço médio (usa valor total)
                    const displayAveragePrice = (investment.type === "cdb" || investment.type === "tesouro_direto" || investment.type === "outro")
                      ? "-"
                      : `R$ ${(investment.averagePrice / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`;

                    return (
                      <TableRow key={investment.id}>
                        <TableCell className="font-semibold">
                          {investment.ticker}
                          {investment.name && (
                            <div className="text-xs text-muted-foreground">{investment.name}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {getInvestmentTypeLabel(investment.type || "stock")}
                          </span>
                        </TableCell>
                        <TableCell>{displayQuantity}</TableCell>
                        <TableCell>{displayAveragePrice}</TableCell>
                        <TableCell>
                          R$ {invested.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          R$ {currentValue.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${returnPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {returnPercent >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span>
                              {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {returnValue >= 0 ? '+' : ''}R$ {returnValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${expectedReturnPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {expectedReturnPercent >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span>
                              {expectedReturnPercent >= 0 ? '+' : ''}{expectedReturnPercent.toFixed(2)}%
                            </span>
                          </div>
                          {expectedReturnData && (
                            <div className="text-xs text-muted-foreground">
                              Esperado: R$ {expectedReturnData.expectedValue.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditInvestment(investment)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvestment(investment.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Editar Investimento</DialogTitle>
            <DialogDescription className="text-gray-600">
              Atualize a quantidade de cotas. O valor atual será recalculado automaticamente com o preço atual da ação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 bg-white">
            <div className="space-y-2">
              <Label htmlFor="edit-ticker">Ação</Label>
              <Input
                id="edit-ticker"
                type="text"
                value={selectedTicker}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-muted-foreground">
                A ação não pode ser alterada. Para adicionar uma nova ação, crie um novo investimento.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">
                {editingInvestment?.type === "cdb" || editingInvestment?.type === "tesouro_direto" || editingInvestment?.type === "outro"
                  ? "Valor Total Investido (R$) *"
                  : "Quantidade de Cotas *"}
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                placeholder={
                  editingInvestment?.type === "cdb" || editingInvestment?.type === "tesouro_direto" || editingInvestment?.type === "outro"
                    ? "Ex: 5000.00"
                    : "Ex: 100"
                }
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step={editingInvestment?.type === "cdb" || editingInvestment?.type === "tesouro_direto" || editingInvestment?.type === "outro" ? "0.01" : "1"}
              />
              <p className="text-xs text-muted-foreground">
                {editingInvestment?.type === "cdb" || editingInvestment?.type === "tesouro_direto" || editingInvestment?.type === "outro"
                  ? "Valor total investido em reais"
                  : "Quantidade de cotas que você possui. O valor atual será recalculado automaticamente."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações (opcional)</Label>
              <Input
                id="edit-notes"
                type="text"
                placeholder="Observações opcionais"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateInvestment}
              disabled={updateMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {updateMutation.isPending ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

