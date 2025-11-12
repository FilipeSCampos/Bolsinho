#!/usr/bin/env python3
"""
Script para testar a API Brapi (API brasileira gratuita para ações)
"""

import requests
import json
from datetime import datetime, timedelta

def test_brapi_ticker(ticker: str):
    """Testa um ticker específico na Brapi API"""
    print(f"\n{'='*60}")
    print(f"Testando: {ticker} na Brapi API")
    print(f"{'='*60}")
    
    try:
        # Brapi API endpoint
        base_url = "https://brapi.dev/api"
        
        # Teste 1: Cotação atual
        print("\n[TESTE 1] Buscando cotação atual...")
        try:
            url = f"{base_url}/quote/{ticker}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Resposta recebida: {len(data)} chaves")
                if 'results' in data and len(data['results']) > 0:
                    result = data['results'][0]
                    print(f"  - Symbol: {result.get('symbol', 'N/A')}")
                    print(f"  - Name: {result.get('longName', result.get('shortName', 'N/A'))}")
                    print(f"  - Price: {result.get('regularMarketPrice', 'N/A')}")
                    print(f"  - Change: {result.get('regularMarketChange', 'N/A')}")
                    print(f"  - Change %: {result.get('regularMarketChangePercent', 'N/A')}")
                    print(f"  - Currency: {result.get('currency', 'N/A')}")
                else:
                    print("✗ Nenhum resultado encontrado")
            else:
                print(f"✗ Erro HTTP {response.status_code}: {response.text}")
        except Exception as e:
            print(f"✗ Erro ao buscar cotação: {e}")
        
        # Teste 2: Histórico
        print("\n[TESTE 2] Buscando histórico (últimos 30 dias)...")
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            url = f"{base_url}/quote/{ticker}"
            params = {
                "interval": "1d",
                "range": "1mo",
            }
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'results' in data and len(data['results']) > 0:
                    result = data['results'][0]
                    if 'historicalDataPrice' in result:
                        history = result['historicalDataPrice']
                        print(f"✓ Histórico obtido: {len(history)} pontos")
                        if len(history) > 0:
                            last = history[-1]
                            print(f"  - Última data: {last.get('date', 'N/A')}")
                            print(f"  - Último close: {last.get('close', 'N/A')}")
                    else:
                        print("✗ Histórico não disponível")
                else:
                    print("✗ Nenhum resultado encontrado")
            else:
                print(f"✗ Erro HTTP {response.status_code}: {response.text}")
        except Exception as e:
            print(f"✗ Erro ao buscar histórico: {e}")
        
        # Teste 3: Busca de ações
        print("\n[TESTE 3] Buscando ações disponíveis...")
        try:
            url = f"{base_url}/available"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'stocks' in data:
                    stocks = data['stocks']
                    print(f"✓ Ações disponíveis: {len(stocks)}")
                    # Mostra algumas ações brasileiras
                    br_stocks = [s for s in stocks if any(x in s for x in ['PETR', 'VALE', 'ITUB', 'BBDC'])]
                    if br_stocks:
                        print(f"  - Ações BR encontradas: {br_stocks[:5]}")
                else:
                    print("✗ Lista de ações não disponível")
            else:
                print(f"✗ Erro HTTP {response.status_code}: {response.text}")
        except Exception as e:
            print(f"✗ Erro ao buscar ações: {e}")
            
    except Exception as e:
        print(f"✗ Erro geral: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Função principal"""
    print("="*60)
    print("TESTE DA API BRAPI")
    print("="*60)
    
    # Testar vários tickers
    tickers = [
        "PETR4",
        "VALE3",
        "ITUB4",
        "BBDC4",
    ]
    
    for ticker in tickers:
        test_brapi_ticker(ticker)
        import time
        time.sleep(1)  # Delay entre testes
    
    print(f"\n{'='*60}")
    print("TESTE CONCLUÍDO")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()

