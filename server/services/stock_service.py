#!/usr/bin/env python3
"""
Serviço para buscar dados de ações da bolsa de valores.
Usa Brapi API (brasileira, gratuita) como principal e Yahoo Finance como fallback.
Suporta ações brasileiras (B3) e internacionais.
"""

import os
import yfinance as yf
import pandas as pd
import requests
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import json
import time


class StockService:
    """Serviço para busca de dados de ações."""
    
    def __init__(self):
        """Inicializa o serviço de ações."""
        # Brapi API (brasileira, gratuita, com autenticação)
        self.brapi_base_url = "https://brapi.dev/api"
        # API Key da Brapi (deve ser configurada na variável de ambiente BRAPI_API_KEY)
        self.brapi_api_key = os.getenv("BRAPI_API_KEY")
        if not self.brapi_api_key:
            print("[Brapi] AVISO: BRAPI_API_KEY não configurada. Algumas ações podem não funcionar.")
        # Yahoo Finance como fallback (desabilitado para ações brasileiras)
        self.use_yahoo_fallback = False
    
    def _normalize_ticker(self, ticker: str) -> str:
        """
        Normaliza o ticker removendo sufixos desnecessários.
        Ações brasileiras na Brapi não precisam de .SA
        """
        ticker = ticker.upper().strip()
        # Remove .SA se existir (Brapi não precisa)
        if ticker.endswith('.SA'):
            ticker = ticker[:-3]
        return ticker
    
    def _is_brazilian_ticker(self, ticker: str) -> bool:
        """Verifica se é uma ação brasileira."""
        ticker = ticker.upper().strip()
        # Ações brasileiras geralmente têm número no final
        if ticker and ticker[-1].isdigit():
            return True
        return False
    
    def _get_stock_info_brapi(self, ticker: str) -> Dict[str, Any]:
        """
        Busca informações de uma ação usando Brapi API.
        
        Args:
            ticker: Código da ação (ex: PETR4, VALE3)
        
        Returns:
            Dict com informações da ação ou None se falhar
        """
        try:
            normalized_ticker = self._normalize_ticker(ticker)
            url = f"{self.brapi_base_url}/quote/{normalized_ticker}"
            
            # Adiciona API key como parâmetro token se disponível
            params = {}
            if self.brapi_api_key:
                params['token'] = self.brapi_api_key
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'results' in data and len(data['results']) > 0:
                    result = data['results'][0]
                    
                    # Extrai informações básicas
                    symbol = result.get('symbol', normalized_ticker)
                    name = result.get('longName') or result.get('shortName') or normalized_ticker
                    price = result.get('regularMarketPrice')
                    change = result.get('regularMarketChange', 0)
                    change_percent = result.get('regularMarketChangePercent', 0)
                    previous_close = price - change if price else None
                    
                    # Dados do dia
                    day_high = result.get('regularMarketDayHigh')
                    day_low = result.get('regularMarketDayLow')
                    volume = result.get('regularMarketVolume')
                    
                    # Informações adicionais
                    currency = result.get('currency', 'BRL')
                    market_cap = result.get('marketCap')
                    sector = result.get('sector')
                    industry = result.get('industry')
                    
                    return {
                        "success": True,
                        "ticker": normalized_ticker,
                        "normalized_ticker": normalized_ticker,
                        "symbol": symbol,
                        "name": name,
                        "current_price": round(price, 2) if price else None,
                        "previous_close": round(previous_close, 2) if previous_close else None,
                        "change": round(change, 2) if change else 0,
                        "change_percent": round(change_percent, 2) if change_percent else 0,
                        "day_high": round(day_high, 2) if day_high else None,
                        "day_low": round(day_low, 2) if day_low else None,
                        "volume": int(volume) if volume else None,
                        "currency": currency,
                        "market": "B3" if self._is_brazilian_ticker(normalized_ticker) else "NYSE/NASDAQ",
                        "sector": sector,
                        "industry": industry,
                        "market_cap": str(market_cap) if market_cap else None,
                        "timestamp": datetime.now().isoformat(),
                        "source": "brapi"
                    }
                else:
                    print(f"[Brapi] Nenhum resultado encontrado para {ticker}")
                    return None
            elif response.status_code == 401:
                # Não autorizado (rate limit ou precisa de autenticação)
                print(f"[Brapi] 401 Unauthorized para {ticker} - pode ser rate limit")
                error_data = response.json() if response.text else {}
                error_msg = error_data.get('message', 'Não autorizado')
                return {
                    "success": False,
                    "error": f"Rate limit da Brapi API atingido para {ticker}. Aguarde alguns segundos e tente novamente.",
                    "ticker": normalized_ticker,
                    "rate_limited": True
                }
            elif response.status_code == 429:
                # Rate limit
                print(f"[Brapi] 429 Rate Limit para {ticker}")
                return {
                    "success": False,
                    "error": f"Rate limit da Brapi API atingido para {ticker}. Aguarde alguns segundos e tente novamente.",
                    "ticker": normalized_ticker,
                    "rate_limited": True
                }
            else:
                print(f"[Brapi] Status {response.status_code} para {ticker}")
                error_data = response.json() if response.text else {}
                error_msg = error_data.get('message', f'Erro HTTP {response.status_code}')
                return {
                    "success": False,
                    "error": f"Erro ao buscar {ticker} na Brapi API: {error_msg}",
                    "ticker": normalized_ticker
                }
                
        except Exception as e:
            print(f"[Brapi] Erro ao buscar {ticker}: {e}")
            return {
                "success": False,
                "error": f"Erro ao buscar {ticker} na Brapi API: {str(e)}",
                "ticker": normalized_ticker
            }
    
    def _get_stock_history_brapi(self, ticker: str, period: str = "1mo", interval: str = "1d") -> Dict[str, Any]:
        """
        Busca histórico de uma ação usando Brapi API.
        
        Args:
            ticker: Código da ação
            period: Período (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: Intervalo (1d, 1wk, 1mo)
        
        Returns:
            Dict com histórico ou None se falhar
        """
        try:
            normalized_ticker = self._normalize_ticker(ticker)
            url = f"{self.brapi_base_url}/quote/{normalized_ticker}"
            
            # Mapeia período para parâmetros da Brapi
            period_map = {
                "1d": "1d",
                "5d": "5d",
                "1mo": "1mo",
                "3mo": "3mo",
                "6mo": "6mo",
                "1y": "1y",
                "2y": "2y",
                "5y": "5y",
                "10y": "10y",
                "ytd": "ytd",
                "max": "max"
            }
            
            params = {
                "interval": interval,
                "range": period_map.get(period, "1mo"),
            }
            
            # Adiciona API key como parâmetro token se disponível
            if self.brapi_api_key:
                params['token'] = self.brapi_api_key
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'results' in data and len(data['results']) > 0:
                    result = data['results'][0]
                    
                    if 'historicalDataPrice' in result:
                        history_data = result['historicalDataPrice']
                        
                        # Converte timestamps para datas
                        history = []
                        for item in history_data:
                            timestamp = item.get('date')
                            if timestamp:
                                # Converte timestamp para data
                                date_obj = datetime.fromtimestamp(timestamp)
                                history.append({
                                    "date": date_obj.strftime("%Y-%m-%d"),
                                    "open": round(item.get('open', 0), 2),
                                    "high": round(item.get('high', 0), 2),
                                    "low": round(item.get('low', 0), 2),
                                    "close": round(item.get('close', 0), 2),
                                    "volume": int(item.get('volume', 0)) if item.get('volume') else None,
                                    "adj_close": round(item.get('adjClose', item.get('close', 0)), 2),
                                })
                        
                        if history:
                            # Calcula variação
                            first_close = history[0]['close']
                            last_close = history[-1]['close']
                            period_change = last_close - first_close
                            period_change_percent = (period_change / first_close * 100) if first_close else 0
                            
                            # Estatísticas
                            prices = [d['close'] for d in history]
                            high_price = max(prices) if prices else None
                            low_price = min(prices) if prices else None
                            avg_price = sum(prices) / len(prices) if prices else None
                            
                            currency = result.get('currency', 'BRL')
                            
                            return {
                                "success": True,
                                "ticker": normalized_ticker,
                                "normalized_ticker": normalized_ticker,
                                "period": period,
                                "interval": interval,
                                "data_points": len(history),
                                "first_date": history[0]['date'] if history else None,
                                "last_date": history[-1]['date'] if history else None,
                                "first_close": round(first_close, 2) if first_close else None,
                                "last_close": round(last_close, 2) if last_close else None,
                                "period_change": round(period_change, 2),
                                "period_change_percent": round(period_change_percent, 2),
                                "high_price": round(high_price, 2) if high_price else None,
                                "low_price": round(low_price, 2) if low_price else None,
                                "avg_price": round(avg_price, 2) if avg_price else None,
                                "history": history,
                                "currency": currency,
                                "timestamp": datetime.now().isoformat(),
                                "source": "brapi"
                            }
                    
                    print(f"[Brapi] Histórico não disponível para {ticker}")
                    return None
                else:
                    print(f"[Brapi] Nenhum resultado encontrado para histórico de {ticker}")
                    return None
            elif response.status_code == 401:
                # Não autorizado (rate limit ou precisa de autenticação)
                print(f"[Brapi] 401 Unauthorized para histórico de {ticker} - pode ser rate limit")
                error_data = response.json() if response.text else {}
                error_msg = error_data.get('message', 'Não autorizado')
                return {
                    "success": False,
                    "error": f"Rate limit da Brapi API atingido para {ticker}. Aguarde alguns segundos e tente novamente.",
                    "ticker": normalized_ticker,
                    "rate_limited": True
                }
            elif response.status_code == 429:
                # Rate limit
                print(f"[Brapi] 429 Rate Limit para histórico de {ticker}")
                return {
                    "success": False,
                    "error": f"Rate limit da Brapi API atingido para {ticker}. Aguarde alguns segundos e tente novamente.",
                    "ticker": normalized_ticker,
                    "rate_limited": True
                }
            else:
                print(f"[Brapi] Status {response.status_code} para histórico de {ticker}")
                error_data = response.json() if response.text else {}
                error_msg = error_data.get('message', f'Erro HTTP {response.status_code}')
                return {
                    "success": False,
                    "error": f"Erro ao buscar histórico de {ticker} na Brapi API: {error_msg}",
                    "ticker": normalized_ticker
                }
                
        except Exception as e:
            print(f"[Brapi] Erro ao buscar histórico de {ticker}: {e}")
            return {
                "success": False,
                "error": f"Erro ao buscar histórico de {ticker} na Brapi API: {str(e)}",
                "ticker": normalized_ticker
            }
    
    def _normalize_ticker_yahoo(self, ticker: str) -> str:
        """
        Normaliza o ticker para o formato do Yahoo Finance.
        
        Ações brasileiras no Yahoo Finance terminam com .SA (ex: PETR4.SA, VALE3.SA)
        Ações americanas não precisam de sufixo (ex: AAPL, MSFT)
        """
        ticker = ticker.upper().strip()
        
        # Se já tem .SA, retorna como está
        if ticker.endswith('.SA'):
            return ticker
        
        # Se não tem sufixo e parece ser ação brasileira (número no final), adiciona .SA
        if ticker and ticker[-1].isdigit():
            brazilian_tickers = ['PETR', 'VALE', 'ITUB', 'BBDC', 'ABEV', 'WEGE', 'RENT', 
                               'SUZB', 'RADL', 'ELET', 'ELET3', 'ELET6', 'BBAS', 'SANB',
                               'CMIG', 'EMBR', 'HAPV', 'VIVT', 'KLBN', 'UGPA', 'CCRO',
                               'CYRE', 'EGIE', 'FLRY', 'GGBR', 'GOAU', 'HYPE', 'JBSS',
                               'LREN', 'MULT', 'PCAR', 'QUAL', 'RAIL', 'SBSP', 'SMLE',
                               'TIMP', 'USIM', 'VALE3', 'VIVT3']
            
            if any(ticker.startswith(prefix) for prefix in brazilian_tickers) or len(ticker) <= 6:
                return f"{ticker}.SA"
        
        return ticker
    
    def _get_stock_info_yahoo(self, ticker: str) -> Dict[str, Any]:
        """
        Busca informações de uma ação usando Yahoo Finance (fallback).
        
        Args:
            ticker: Código da ação
        
        Returns:
            Dict com informações da ação ou None se falhar
        """
        try:
            normalized_ticker = self._normalize_ticker_yahoo(ticker)
            stock = yf.Ticker(normalized_ticker)
            
            # Tenta buscar info, mas pode falhar por rate limit
            try:
                info = stock.info
            except Exception as e:
                info = {}
                error_msg = str(e)
                if "429" in error_msg or "Too Many Requests" in error_msg:
                    return None
            
            # Busca dados históricos recentes
            hist = None
            periods_to_try = ["5d", "1d", "1mo", "3mo"]
            for period in periods_to_try:
                try:
                    time.sleep(0.5)
                    hist = stock.history(period=period, timeout=60, raise_errors=False)
                    if hist is not None and not hist.empty and len(hist) > 0:
                        break
                except Exception as e:
                    error_msg = str(e).lower()
                    if "429" in error_msg or "too many requests" in error_msg or "rate limit" in error_msg:
                        return None
                    continue
            
            # Se history() falhou, tenta download()
            if hist is None or hist.empty:
                try:
                    time.sleep(1)
                    end_date = datetime.now()
                    start_date = end_date - timedelta(days=30)
                    
                    hist = yf.download(
                        normalized_ticker,
                        start=start_date.strftime("%Y-%m-%d"),
                        end=end_date.strftime("%Y-%m-%d"),
                        progress=False,
                        timeout=60,
                        raise_errors=False
                    )
                    
                    if not hist.empty and isinstance(hist.columns, pd.MultiIndex):
                        hist = hist.iloc[:, 0:6]
                        hist.columns = ['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']
                        
                except Exception as e:
                    error_msg = str(e).lower()
                    if "429" in error_msg or "too many requests" in error_msg:
                        return None
                    pass
            
            # Se ainda não conseguiu dados, retorna None
            if hist is None or hist.empty or len(hist) == 0:
                return None
            
            # Preço atual (último fechamento)
            current_price = float(hist['Close'].iloc[-1]) if not hist.empty else None
            previous_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
            
            # Variação
            change = current_price - previous_close if previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close else 0
            
            # Dados do dia
            latest = hist.iloc[-1]
            day_high = float(latest['High']) if 'High' in latest else None
            day_low = float(latest['Low']) if 'Low' in latest else None
            volume = int(latest['Volume']) if 'Volume' in latest else None
            
            return {
                "success": True,
                "ticker": ticker,
                "normalized_ticker": normalized_ticker,
                "symbol": info.get("symbol", normalized_ticker),
                "name": info.get("longName") or info.get("shortName") or ticker,
                "current_price": round(current_price, 2) if current_price else None,
                "previous_close": round(previous_close, 2) if previous_close else None,
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "day_high": round(day_high, 2) if day_high else None,
                "day_low": round(day_low, 2) if day_low else None,
                "volume": volume,
                "currency": info.get("currency", "BRL" if ".SA" in normalized_ticker else "USD"),
                "market": "B3" if ".SA" in normalized_ticker else "NYSE/NASDAQ",
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "market_cap": str(info.get("marketCap")) if info.get("marketCap") else None,
                "timestamp": datetime.now().isoformat(),
                "source": "yahoo"
            }
            
        except Exception as e:
            print(f"[Yahoo] Erro ao buscar {ticker}: {e}")
            return None
    
    def get_stock_info(self, ticker: str) -> Dict[str, Any]:
        """
        Busca informações básicas de uma ação.
        Usa APENAS Brapi API para ações brasileiras.
        Para ações internacionais, pode usar Yahoo Finance como fallback.
        
        Args:
            ticker: Código da ação (ex: PETR4, VALE3, AAPL)
        
        Returns:
            Dict com informações da ação
        """
        # Para ações brasileiras, usa APENAS Brapi API
        if self._is_brazilian_ticker(ticker):
            result = self._get_stock_info_brapi(ticker)
            # Se result é None ou não tem success, já retornou erro do _get_stock_info_brapi
            if result is not None:
                return result
            # Se retornou None (caso antigo), retorna erro
            return {
                "success": False,
                "error": f"Ação {ticker} não encontrada ou dados indisponíveis na Brapi API. Verifique se o ticker está correto.",
                "ticker": ticker
            }
        
        # Para ações internacionais, pode usar Yahoo Finance como fallback
        # Mas por enquanto, vamos usar apenas Brapi para tudo
        result = self._get_stock_info_brapi(ticker)
        if result and result.get("success"):
            return result
        
        # Se não é brasileira e Brapi falhou, retorna erro
        return {
            "success": False,
            "error": f"Ação {ticker} não encontrada ou dados indisponíveis. Verifique se o ticker está correto.",
            "ticker": ticker
        }
    
    def get_stock_history(self, ticker: str, period: str = "1mo", interval: str = "1d") -> Dict[str, Any]:
        """
        Busca histórico de preços de uma ação.
        Usa APENAS Brapi API para ações brasileiras.
        Para ações internacionais, pode usar Yahoo Finance como fallback.
        
        Args:
            ticker: Código da ação
            period: Período (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: Intervalo (1d, 1wk, 1mo)
        
        Returns:
            Dict com histórico de preços
        """
        # Para ações brasileiras, usa APENAS Brapi API
        if self._is_brazilian_ticker(ticker):
            result = self._get_stock_history_brapi(ticker, period, interval)
            # Se result é None ou não tem success, já retornou erro do _get_stock_history_brapi
            if result is not None:
                return result
            # Se retornou None (caso antigo), retorna erro
            return {
                "success": False,
                "error": f"Histórico não disponível para {ticker} na Brapi API. Verifique se o ticker está correto.",
                "ticker": ticker
            }
        
        # Para ações internacionais, pode usar Yahoo Finance como fallback
        # Mas por enquanto, vamos usar apenas Brapi para tudo
        result = self._get_stock_history_brapi(ticker, period, interval)
        if result and result.get("success"):
            return result
        
        # Se não é brasileira e Brapi falhou, retorna erro
        return {
            "success": False,
            "error": f"Histórico não disponível para {ticker}. Verifique se o ticker está correto.",
            "ticker": ticker
        }
    
    def get_stock_variation(self, ticker: str, period: str = "1mo") -> Dict[str, Any]:
        """
        Busca variação de uma ação em um período específico.
        Usa get_stock_history e extrai apenas a variação.
        
        Args:
            ticker: Código da ação
            period: Período (1d, 5d, 1mo, 3mo, 6mo, 1y)
        
        Returns:
            Dict com variação da ação
        """
        try:
            history = self.get_stock_history(ticker, period, "1d")
            if not history.get("success"):
                return {
                    "success": False,
                    "error": history.get("error", f"Dados não disponíveis para {ticker}"),
                    "ticker": ticker
                }
            
            info = self.get_stock_info(ticker)
            name = info.get("name", ticker) if info.get("success") else ticker
            currency = history.get("currency", "BRL")
            
            return {
                "success": True,
                "ticker": ticker,
                "normalized_ticker": history.get("normalized_ticker", ticker),
                "name": name,
                "period": period,
                "start_price": history.get("first_close"),
                "end_price": history.get("last_close"),
                "change": history.get("period_change", 0),
                "change_percent": history.get("period_change_percent", 0),
                "currency": currency,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao calcular variação da ação {ticker}: {str(e)}",
                "ticker": ticker
            }
    
    def search_stocks(self, query: str, limit: int = 10, investment_type: str = "stock") -> Dict[str, Any]:
        """
        Busca ações, FIIs e outros ativos por nome ou símbolo.
        Tenta usar Brapi API /available endpoint, com fallback para lista local.
        
        Args:
            query: Termo de busca
            limit: Número máximo de resultados
            investment_type: Tipo de investimento ("stock", "fii", "all")
        
        Returns:
            Dict com sugestões de ativos
        """
        try:
            # Tenta usar Brapi API /available endpoint (v2)
            url = f"{self.brapi_base_url}/v2/available"
            params = {
                "search": query,
                "limit": limit
            }
            
            if self.brapi_api_key:
                params['token'] = self.brapi_api_key
            
            # Filtra por tipo se especificado
            if investment_type == "fii":
                params['type'] = "real-estate-investment-funds"  # FIIs na Brapi
            elif investment_type == "stock":
                params['type'] = "stocks"  # Ações na Brapi
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Brapi v2 retorna 'stocks' como array
                if 'stocks' in data and len(data['stocks']) > 0:
                    results = []
                    for stock in data['stocks'][:limit]:
                        # Determina o tipo baseado no ticker ou dados retornados
                        ticker_str = stock.get('stock', '') or stock.get('symbol', '')
                        stock_type = "fii" if ticker_str.endswith('11') else "stock"
                        
                        results.append({
                            "ticker": ticker_str,
                            "name": stock.get('name', stock.get('longName', ticker_str)),
                            "market": stock.get('exchange', "B3"),
                            "type": stock_type
                        })
                    
                    return {
                        "success": True,
                        "query": query,
                        "results": results,
                        "count": len(results),
                        "source": "brapi"
                    }
        except Exception as e:
            print(f"[Brapi] Erro ao buscar ativos via /available: {e}")
            # Continua para fallback local
        
        # Fallback: Lista local de ações brasileiras conhecidas
        brazilian_stocks = {
            "PETR4": "Petrobras",
            "VALE3": "Vale",
            "ITUB4": "Itaú Unibanco",
            "BBDC4": "Bradesco",
            "ABEV3": "Ambev",
            "WEGE3": "Weg",
            "RENT3": "Localiza",
            "SUZB3": "Suzano",
            "RADL3": "Raia Drogasil",
            "ELET3": "Eletrobras",
            "BBAS3": "Banco do Brasil",
            "SANB11": "Santander",
            "CMIG4": "Cemig",
            "EMBR3": "Embraer",
            "VIVT3": "Telefônica Brasil",
            "KLBN11": "Klabin",
            "UGPA3": "Ultrapar",
            "CCRO3": "CCR",
            "CYRE3": "Cyrela",
            "EGIE3": "Engie Brasil",
            "FLRY3": "Fleury",
            "GGBR4": "Gerdau",
            "HYPE3": "Hypera",
            "JBSS3": "JBS",
            "LREN3": "Lojas Renner",
            "MULT3": "Multiplan",
            "PCAR3": "Companhia Brasileira de Distribuição",
            "QUAL3": "Qualicorp",
            "RAIL3": "Rumo",
            "SBSP3": "Sabesp",
            "USIM5": "Usinas Siderúrgicas",
        }
        
        # Lista de FIIs conhecidos
        fiis = {
            "HGLG11": "CSHG Logística",
            "XPLG11": "XP Log",
            "VISC11": "Vinci Shopping Centers",
            "BRCR11": "BTG Pactual Corporate",
            "HGRU11": "CSHG Recebíveis Imobiliários",
            "XPML11": "XP Malls",
            "KNRI11": "Kinea Renda Imobiliária",
            "HFOF11": "Hedge Top FOFII",
            "VILG11": "Vinci Logística",
            "BTLG11": "BTG Pactual Logística",
            "HGCR11": "CSHG Real Estate",
            "XPIN11": "XP Industrial",
            "RBRF11": "RBR Desenvolvimento",
            "HCTR11": "Hectare CE",
            "KNIP11": "Kinea Índices de Preços",
        }
        
        # Lista combinada baseada no tipo
        all_assets = {}
        if investment_type == "fii":
            all_assets = fiis
        elif investment_type == "stock":
            all_assets = brazilian_stocks
        else:  # all
            all_assets = {**brazilian_stocks, **fiis}
        
        query_upper = query.upper().strip()
        results = []
        
        # Busca exata
        if query_upper in all_assets:
            asset_type = "fii" if query_upper in fiis else "stock"
            results.append({
                "ticker": query_upper,
                "name": all_assets[query_upper],
                "market": "B3",
                "type": asset_type
            })
        
        # Busca parcial
        for ticker, name in all_assets.items():
            if query_upper in ticker or query_upper in name.upper():
                if ticker not in [r["ticker"] for r in results]:
                    asset_type = "fii" if ticker in fiis else "stock"
                    results.append({
                        "ticker": ticker,
                        "name": name,
                        "market": "B3",
                        "type": asset_type
                    })
                    if len(results) >= limit:
                        break
        
        return {
            "success": True,
            "query": query,
            "results": results,
            "count": len(results),
            "source": "local"
        }


# Instância global do serviço
_stock_service: Optional[StockService] = None


def get_stock_service() -> StockService:
    """Retorna a instância do serviço de ações (lazy initialization)."""
    global _stock_service
    if _stock_service is None:
        _stock_service = StockService()
    return _stock_service


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 2:
        print("Uso: python stock_service.py <método> [args...]")
        print("Métodos: get_stock_info, get_stock_history, get_stock_variation, search_stocks")
        sys.exit(1)
    
    method = sys.argv[1]
    service = get_stock_service()
    
    try:
        if method == "get_stock_info":
            if len(sys.argv) < 3:
                print("Uso: python stock_service.py get_stock_info <ticker>")
                sys.exit(1)
            ticker = sys.argv[2]
            result = service.get_stock_info(ticker)
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        elif method == "get_stock_history":
            if len(sys.argv) < 3:
                print("Uso: python stock_service.py get_stock_history <ticker> [period] [interval]")
                sys.exit(1)
            ticker = sys.argv[2]
            period = sys.argv[3] if len(sys.argv) > 3 else "1mo"
            interval = sys.argv[4] if len(sys.argv) > 4 else "1d"
            result = service.get_stock_history(ticker, period, interval)
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        elif method == "get_stock_variation":
            if len(sys.argv) < 3:
                print("Uso: python stock_service.py get_stock_variation <ticker> [period]")
                sys.exit(1)
            ticker = sys.argv[2]
            period = sys.argv[3] if len(sys.argv) > 3 else "1mo"
            result = service.get_stock_variation(ticker, period)
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        elif method == "search_stocks":
            if len(sys.argv) < 3:
                print("Uso: python stock_service.py search_stocks <query>")
                sys.exit(1)
            query = sys.argv[2]
            result = service.search_stocks(query)
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        else:
            print(f"Método desconhecido: {method}")
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }, indent=2, ensure_ascii=False))
        sys.exit(1)
