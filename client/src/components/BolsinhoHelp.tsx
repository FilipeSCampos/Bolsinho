import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, BookOpen, TrendingUp, DollarSign, Calculator, Newspaper, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BolsinhoHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
        >
          <HelpCircle className="w-4 h-4" />
          Como usar o Bolsinho
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            Documentação do Bolsinho
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Descubra todas as funcionalidades do Bolsinho e como usar palavras-chave para ativá-las
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Introdução */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-emerald-900">Sobre o Bolsinho</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                O Bolsinho é seu assistente financeiro pessoal e especialista em investimentos e finanças. 
                Ele pode ajudar você com análises de ações, informações sobre seu portfolio, notícias financeiras, 
                cálculos financeiros e muito mais!
              </p>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Portfólio e Investimentos
              </CardTitle>
              <CardDescription>Pergunte sobre seu portfolio e investimentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Palavras-chave:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>meu portfólio / meu portfolio</li>
                  <li>minha carteira / minha carteira de investimentos</li>
                  <li>meus investimentos</li>
                  <li>portfólio total / portfolio total</li>
                  <li>quanto tenho investido</li>
                  <li>quanto investi / quanto eu investi</li>
                  <li>rendimento do portfólio / rendimento do portfolio</li>
                  <li>performance do portfólio / performance do portfolio</li>
                  <li>retorno do portfólio / retorno do portfolio</li>
                  <li>minhas ações / minhas acoes</li>
                  <li>resumo do portfólio / resumo do portfolio</li>
                  <li>como está meu portfólio / como esta meu portfolio</li>
                  <li>status do portfólio / status do portfolio</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">O que o Bolsinho pode fazer:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Mostrar o total investido e valor atual do seu portfolio</li>
                  <li>Calcular o rendimento mensal (últimos 30 dias)</li>
                  <li>Calcular o rendimento esperado mensal baseado na variação histórica das ações</li>
                  <li>Listar todos os seus investimentos com detalhes (ações, quantidade, preço médio, valor atual, rendimento individual)</li>
                  <li>Fornecer análises e recomendações sobre seu portfolio</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Exemplo:</strong> "Meu portfólio", "Quanto tenho investido?", "Rendimento do portfólio"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Ações e Mercado de Capitais
              </CardTitle>
              <CardDescription>Pergunte sobre ações brasileiras (B3) em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Palavras-chave:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>ação / acoes / ações</li>
                  <li>stock / stocks</li>
                  <li>variação / variacao / variação da / variacao da</li>
                  <li>como está / como esta / como ta</li>
                  <li>preço / preco / cotação / cotacao</li>
                  <li>valor da ação / valor da acao</li>
                  <li>histórico / historico</li>
                  <li>gráfico / grafico</li>
                  <li>performance / rentabilidade / retorno</li>
                  <li>Nomes de empresas: Petrobras, Vale, Itaú, Bradesco, Ambev, Weg, etc.</li>
                  <li>Tickers: PETR4, VALE3, ITUB4, BBDC4, ABEV3, WEGE3, etc.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">O que o Bolsinho pode fazer:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Buscar informações de ações em tempo real através da API Brapi</li>
                  <li>Mostrar preço atual, variação do dia, máxima e mínima</li>
                  <li>Calcular variação em períodos específicos (dia, semana, mês, trimestre, semestre, ano)</li>
                  <li>Mostrar histórico de preços e performance</li>
                  <li>Fornecer análises sobre tendências e variações</li>
                  <li>Explicar o significado das variações e fornecer contexto sobre o desempenho</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Exemplos:</strong> "Como está a PETR4?", "Variação da VALE3 no mês", "Preço da ITUB4", "Histórico da WEGE3"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notícias */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-emerald-600" />
                Notícias Financeiras
              </CardTitle>
              <CardDescription>Pergunte sobre notícias financeiras e atualidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Palavras-chave:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>notícias / noticia / noticias / news</li>
                  <li>manchetes / manchete</li>
                  <li>últimas notícias / ultimas noticias</li>
                  <li>o que está acontecendo / o que esta acontecendo</li>
                  <li>o que aconteceu / o que aconteceu hoje</li>
                  <li>notícias de hoje / noticias de hoje</li>
                  <li>atualidades / atualidade</li>
                  <li>notícias de investimento / noticias de investimento</li>
                  <li>notícias de ações / noticias de acoes</li>
                  <li>notícias de bolsa / noticias de bolsa</li>
                  <li>notícias de setor / noticias de setor</li>
                  <li>indicadores: IBOVESPA, dólar, Selic, inflação, IPCA, PIB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">O que o Bolsinho pode fazer:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Buscar notícias financeiras atualizadas</li>
                  <li>Mostrar manchetes principais do mercado</li>
                  <li>Filtrar notícias por categoria (investimentos, setores, indicadores)</li>
                  <li>Fornecer análises sobre o impacto das notícias</li>
                  <li>Citir fontes e fornecer contexto relevante</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Exemplos:</strong> "Notícias de hoje", "Últimas notícias de investimento", "Notícias sobre o dólar"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cálculos */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-600" />
                Cálculos Financeiros
              </CardTitle>
              <CardDescription>Pergunte sobre cálculos financeiros precisos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Palavras-chave:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>calcular / calcule</li>
                  <li>somar / soma / total</li>
                  <li>distribuir / dividir / alocar / investir</li>
                  <li>percentual / porcentagem / % / porcento</li>
                  <li>juros / rendimento / juros compostos</li>
                  <li>quanto / quanto é / quanto dá</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">O que o Bolsinho pode fazer:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Distribuir investimentos por percentuais ou valores específicos</li>
                  <li>Calcular percentuais e proporções</li>
                  <li>Calcular juros compostos e rendimentos</li>
                  <li>Realizar cálculos financeiros precisos (usando valores exatos, sem arredondamentos)</li>
                  <li>Verificar se os valores somam corretamente o total</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Exemplos:</strong> "Distribuir 2000 reais em 3 investimentos", "Calcular 30% de 5000", "Quanto é 15% de 10000?"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Multimodal */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Funcionalidades Multimodais
              </CardTitle>
              <CardDescription>O Bolsinho também pode processar imagens, áudio e PDFs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">O que o Bolsinho pode fazer:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Imagens:</strong> Analisar recibos, notas fiscais, extratos bancários e outros documentos financeiros</li>
                  <li><strong>Áudio:</strong> Transcrever e responder a mensagens de áudio</li>
                  <li><strong>PDFs:</strong> Extrair texto de PDFs e documentos financeiros</li>
                  <li><strong>Texto:</strong> Responder perguntas sobre investimentos, finanças e economia</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Dica:</strong> Você pode enviar uma imagem de um recibo e pedir para o Bolsinho analisar os gastos, ou enviar um PDF de um extrato bancário para análise.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-emerald-900">💡 Dicas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>O Bolsinho usa dados em tempo real da API Brapi para informações sobre ações brasileiras</li>
                <li>Os cálculos financeiros são precisos e verificados (sem arredondamentos)</li>
                <li>O Bolsinho sempre menciona os riscos envolvidos em investimentos</li>
                <li>Você pode combinar múltiplas perguntas em uma única mensagem</li>
                <li>O Bolsinho mantém o contexto da conversa para respostas mais precisas</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

