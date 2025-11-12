import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpectedReturnCard() {
  const { data: expectedReturns, isLoading } = trpc.investments.getExpectedMonthlyReturn.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  const expectedReturn = expectedReturns?.portfolioExpectedReturn || 0;
  const expectedValue = expectedReturns?.portfolioExpectedValue || 0;

  return (
    <>
      <div className={`text-3xl font-bold ${expectedReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {expectedReturn >= 0 ? '+' : ''}{expectedReturn.toFixed(2)}%
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Valor esperado: R$ {expectedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </>
  );
}

