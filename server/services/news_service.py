#!/usr/bin/env python3
"""
Serviço de notícias financeiras usando NewsAPI.
"""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from newsapi import NewsApiClient


class NewsService:
    """Serviço para busca de notícias financeiras."""
    
    def __init__(self):
        """Inicializa o cliente NewsAPI."""
        api_key = os.getenv("NEWS_API_KEY")
        if not api_key:
            raise ValueError("NEWS_API_KEY não configurada")
        
        self.client = NewsApiClient(api_key=api_key)
        
        # Fontes brasileiras de notícias financeiras
        self.brazilian_sources = [
            "infomoney",
            "valor-economico", 
            "exame"
        ]
    
    def get_top_headlines(
        self,
        category: str = "business",
        country: str = "br",
        page_size: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Busca principais manchetes financeiras.
        
        Args:
            category: Categoria de notícias
            country: Código do país (br para Brasil)
            page_size: Número de resultados
            
        Returns:
            Lista de notícias
        """
        try:
            response = self.client.get_top_headlines(
                category=category,
                country=country,
                page_size=page_size
            )
            
            return self._format_articles(response.get("articles", []))
        except Exception as e:
            return [{"error": str(e)}]
    
    def search_news(
        self,
        query: str,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        language: str = "pt",
        sort_by: str = "relevancy",
        page_size: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Busca notícias por palavra-chave.
        
        Args:
            query: Termo de busca
            from_date: Data inicial
            to_date: Data final
            language: Idioma das notícias
            sort_by: Ordenação (relevancy, popularity, publishedAt)
            page_size: Número de resultados
            
        Returns:
            Lista de notícias
        """
        try:
            # Define período padrão (últimos 7 dias)
            if not from_date:
                from_date = datetime.now() - timedelta(days=7)
            if not to_date:
                to_date = datetime.now()
            
            response = self.client.get_everything(
                q=query,
                from_param=from_date.strftime("%Y-%m-%d"),
                to=to_date.strftime("%Y-%m-%d"),
                language=language,
                sort_by=sort_by,
                page_size=page_size
            )
            
            return self._format_articles(response.get("articles", []))
        except Exception as e:
            return [{"error": str(e)}]
    
    def get_investment_news(
        self,
        asset_type: Optional[str] = None,
        page_size: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Busca notícias sobre investimentos.
        
        Args:
            asset_type: Tipo de ativo (acoes, fundos, cripto, renda_fixa)
            page_size: Número de resultados
            
        Returns:
            Lista de notícias
        """
        queries = {
            "acoes": "ações OR bolsa OR B3 OR Ibovespa",
            "fundos": "fundos de investimento OR fundos imobiliários OR FII",
            "cripto": "criptomoedas OR bitcoin OR ethereum OR crypto",
            "renda_fixa": "renda fixa OR tesouro direto OR CDB OR LCI",
            None: "investimentos OR mercado financeiro OR economia"
        }
        
        query = queries.get(asset_type, queries[None])
        return self.search_news(query, page_size=page_size)
    
    def get_sector_news(
        self,
        sector: str,
        page_size: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Busca notícias por setor econômico.
        
        Args:
            sector: Setor (tecnologia, energia, saude, financeiro, etc.)
            page_size: Número de resultados
            
        Returns:
            Lista de notícias
        """
        sector_queries = {
            "tecnologia": "tecnologia OR tech OR startups OR inovação",
            "energia": "energia OR petróleo OR Petrobras OR energia renovável",
            "saude": "saúde OR farmacêutica OR hospitais",
            "financeiro": "bancos OR fintech OR sistema financeiro",
            "varejo": "varejo OR e-commerce OR consumo",
            "agronegocio": "agronegócio OR agricultura OR commodities",
            "construcao": "construção civil OR imóveis OR incorporadoras"
        }
        
        query = sector_queries.get(sector.lower(), sector)
        return self.search_news(query, page_size=page_size)
    
    def get_market_indicators_news(self, page_size: int = 15) -> List[Dict[str, Any]]:
        """
        Busca notícias sobre indicadores de mercado.
        
        Args:
            page_size: Número de resultados
            
        Returns:
            Lista de notícias
        """
        query = "Ibovespa OR dólar OR SELIC OR inflação OR IPCA OR PIB"
        return self.search_news(query, page_size=page_size)
    
    def analyze_news_impact(
        self,
        news_list: List[Dict[str, Any]],
        portfolio_sectors: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Analisa o impacto potencial de notícias no portfólio.
        
        Args:
            news_list: Lista de notícias
            portfolio_sectors: Setores do portfólio do usuário
            
        Returns:
            Análise de impacto
        """
        if not portfolio_sectors:
            portfolio_sectors = []
        
        # Análise básica de sentimento por palavras-chave
        positive_keywords = [
            "crescimento", "lucro", "alta", "valorização", "expansão",
            "otimista", "positivo", "recuperação", "ganho"
        ]
        
        negative_keywords = [
            "queda", "prejuízo", "crise", "recessão", "baixa",
            "pessimista", "negativo", "perda", "declínio"
        ]
        
        analysis = {
            "total_news": len(news_list),
            "positive_count": 0,
            "negative_count": 0,
            "neutral_count": 0,
            "relevant_to_portfolio": [],
            "sentiment_score": 0.0
        }
        
        for news in news_list:
            title = news.get("title", "").lower()
            description = news.get("description", "").lower()
            content = f"{title} {description}"
            
            # Análise de sentimento simples
            positive_score = sum(1 for kw in positive_keywords if kw in content)
            negative_score = sum(1 for kw in negative_keywords if kw in content)
            
            if positive_score > negative_score:
                analysis["positive_count"] += 1
                sentiment = "positivo"
            elif negative_score > positive_score:
                analysis["negative_count"] += 1
                sentiment = "negativo"
            else:
                analysis["neutral_count"] += 1
                sentiment = "neutro"
            
            # Verifica relevância para o portfólio
            for sector in portfolio_sectors:
                if sector.lower() in content:
                    analysis["relevant_to_portfolio"].append({
                        "title": news.get("title"),
                        "sector": sector,
                        "sentiment": sentiment,
                        "url": news.get("url")
                    })
        
        # Calcula score geral de sentimento (-1 a 1)
        total = analysis["total_news"]
        if total > 0:
            analysis["sentiment_score"] = (
                (analysis["positive_count"] - analysis["negative_count"]) / total
            )
        
        return analysis
    
    def _format_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Formata artigos para um formato consistente.
        
        Args:
            articles: Lista de artigos da API
            
        Returns:
            Lista de artigos formatados
        """
        formatted = []
        
        for article in articles:
            formatted.append({
                "title": article.get("title"),
                "description": article.get("description"),
                "url": article.get("url"),
                "source": article.get("source", {}).get("name"),
                "published_at": article.get("publishedAt"),
                "image_url": article.get("urlToImage"),
                "content": article.get("content")
            })
        
        return formatted


# Instância global do serviço
news_service = NewsService()
