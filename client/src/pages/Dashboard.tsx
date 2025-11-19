import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { StockGrid } from "@/components/StockGrid";
import { Portfolio } from "@/components/Portfolio";
import { ExpectedReturnCard } from "@/components/ExpectedReturnCard";
import { BolsinhoHelp } from "@/components/BolsinhoHelp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, TrendingUp, DollarSign, BarChart3, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

/**
 * Dashboard principal do Bolsinho
 */
export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Você é o Bolsinho, assistente financeiro pessoal e especialista em investimentos e finanças.",
    },
  ]);
  
  // TODOS OS HOOKS DEVEM SER CHAMADOS ANTES DE QUALQUER RETURN CONDICIONAL
  // Check authentication - redirect to login if not authenticated
  const { data: authData, isLoading: authLoading } = trpc.auth.me.useQuery();
  
  // Mutations - devem estar antes dos returns condicionais
  const uploadMutation = trpc.upload.file.useMutation();
  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.content,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.content || "Desculpe, ocorreu um erro. Tente novamente.",
          },
        ]);
      }
    },
    onError: (error) => {
      console.error("Erro no chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        },
      ]);
    },
  });
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/login");
    },
  });
  
  const { data: stats } = trpc.dashboard.stats.useQuery();
  
  // useEffect após todos os hooks
  useEffect(() => {
    if (!authLoading && authData && !authData.isAuthenticated) {
      setLocation("/login");
    }
  }, [authData, authLoading, setLocation]);
  
  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Don't render if not authenticated (will redirect)
  if (!authData?.isAuthenticated) {
    return null;
  }

  const handleUploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1] || reader.result as string;
          const result = await uploadMutation.mutateAsync({
            file: base64String,
            filename: file.name,
            mimeType: file.type,
          });
          
          if (result.success && result.url) {
            resolve(result.url);
          } else {
            reject(new Error("Erro ao fazer upload do arquivo"));
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Erro desconhecido ao fazer upload"));
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = (content: string, images?: string[], audio?: string, pdfs?: string[]) => {
    let userMessageContent: Message["content"];
    
    if (images && images.length > 0 || audio) {
      const contentParts: Array<{ type: "text" } | { type: "image_url" } | { type: "file_url" }> = [];
      
      if (content.trim()) {
        contentParts.push({ type: "text", text: content });
      }
      
      if (images && images.length > 0) {
        images.forEach((imgUrl) => {
          contentParts.push({
            type: "image_url",
            image_url: { url: imgUrl },
          });
        });
      }
      
      if (audio) {
        const audioMimeType = audio.includes('.mp3') ? 'audio/mpeg' :
                             audio.includes('.wav') ? 'audio/wav' :
                             audio.includes('.m4a') ? 'audio/mp4' :
                             audio.includes('.webm') ? 'audio/webm' :
                             audio.includes('.ogg') ? 'audio/ogg' :
                             'audio/mpeg';
        
        contentParts.push({
          type: "file_url",
          file_url: { url: audio, mime_type: audioMimeType },
        });
      }
      
      userMessageContent = contentParts.length === 1 && contentParts[0].type === "text"
        ? contentParts[0].text
        : contentParts;
    } else {
      userMessageContent = content;
    }
    
    const userMessage: Message = { role: "user", content: userMessageContent };
    setMessages((prev) => [...prev, userMessage]);

    const conversationHistory = messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => {
        if (typeof msg.content === "string") {
          return {
            role: msg.role as "user" | "assistant",
            content: msg.content,
          };
        }
        return {
          role: msg.role as "user" | "assistant",
          content: msg.content,
        };
      });

    chatMutation.mutate({
      message: content || undefined,
      images: images && images.length > 0 ? images : undefined,
      audio: audio || undefined,
      pdfs: pdfs && pdfs.length > 0 ? pdfs : undefined,
      conversationHistory,
    });
  };

  const suggestedPrompts = [
    "Quais são as principais notícias financeiras de hoje?",
    "Como está a PETR4 hoje?",
    "Me explique sobre investimentos para iniciantes",
    "Como criar um orçamento mensal?",
    "Quero investir 2 mil reais, como distribuir?",
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  Bolsinho
                </h1>
                <p className="text-sm text-gray-600">Seu assistente financeiro pessoal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Disclaimer */}
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-900 font-medium mb-1">
                  Aviso Importante
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  O <strong>Bolsinho</strong> é uma inteligência artificial e pode cometer erros. 
                  As informações fornecidas são apenas para fins educacionais e informativos. 
                  <strong className="font-semibold"> Antes de realizar qualquer investimento, consulte um profissional qualificado.</strong> 
                  O intuito do Bolsinho é te ajudar e ensinar sobre finanças, não substituir o aconselhamento financeiro profissional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Portfólio Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {stats?.portfolioTotal && typeof stats.portfolioTotal === 'number' 
                  ? (stats.portfolioTotal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                  : '0,00'}
              </div>
              <p className="text-xs opacity-75 mt-1">
                {stats && stats.investmentsCount > 0 ? `${stats.investmentsCount} investimento(s)` : 'Comece a investir hoje'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Rendimento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(stats?.monthlyReturn ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {(stats?.monthlyReturn ?? 0) >= 0 ? '+' : ''}{typeof stats?.monthlyReturn === 'number' ? stats.monthlyReturn.toFixed(2) : '0.00'}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Média (30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpectedReturnCard />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Ações Monitoradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.monitoredStocks || 6}</div>
              <p className="text-xs text-muted-foreground mt-1">Principais ações</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md h-12 p-1">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md px-6"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat com Bolsinho
            </TabsTrigger>
            <TabsTrigger 
              value="stocks" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md px-6"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Ações
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md px-6"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Portfólio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-emerald-600" />
                      Conversar com Bolsinho
                    </CardTitle>
                    <CardDescription className="text-base">
                      Pergunte sobre investimentos, ações, notícias financeiras e muito mais
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">
                    <BolsinhoHelp />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AIChatBox
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onUploadFile={handleUploadFile}
                  isLoading={chatMutation.isPending || uploadMutation.isPending}
                  placeholder="Pergunte ao Bolsinho sobre investimentos, finanças, orçamento..."
                  height="600px"
                  emptyStateMessage="Olá! Eu sou o Bolsinho, seu assistente financeiro pessoal e especialista em investimentos e finanças. Como posso ajudar você hoje? Você pode me enviar textos, imagens de recibos/documentos ou áudio."
                  suggestedPrompts={suggestedPrompts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stocks" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Mercado de Ações</h2>
              <p className="text-gray-600 mb-6">
                Acompanhe as principais ações da bolsa em tempo real
              </p>
            </div>
            <StockGrid />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <Portfolio />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

