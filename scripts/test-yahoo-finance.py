#!/usr/bin/env python3
"""
Script para testar a API do Yahoo Finance e diagnosticar problemas
"""

import yfinance as yf
import pandas as pd
import json
from datetime import datetime, timedelta
import time
import sys

def test_ticker(ticker: str, normalized: str):
    """Testa um ticker específico"""
    print(f"\n{'='*60}")
    print(f"Testando: {ticker} -> {normalized}")
    print(f"{'='*60}")
    
    try:
        stock = yf.Ticker(normalized)
        print(f"✓ Ticker criado: {normalized}")
        
        # Teste 1: Info básica
        print("\n[TESTE 1] Buscando info básica...")
        try:
            info = stock.info
            if info:
                print(f"✓ Info obtida: {len(info)} chaves")
                print(f"  - Symbol: {info.get('symbol', 'N/A')}")
                print(f"  - Name: {info.get('longName', info.get('shortName', 'N/A'))}")
                print(f"  - Currency: {info.get('currency', 'N/A')}")
                print(f"  - Market: {info.get('exchange', 'N/A')}")
            else:
                print("✗ Info vazia")
        except Exception as e:
            print(f"✗ Erro ao buscar info: {e}")
        
        # Teste 2: History com period
        print("\n[TESTE 2] Buscando history com period='5d'...")
        try:
            time.sleep(0.5)
            hist = stock.history(period='5d', timeout=60)
            if hist is not None and not hist.empty:
                print(f"✓ History obtido: {len(hist)} linhas")
                print(f"  - Último close: {hist['Close'].iloc[-1]:.2f}")
                print(f"  - Data: {hist.index[-1]}")
                print(f"  - Colunas: {list(hist.columns)}")
            else:
                print("✗ History vazio")
        except Exception as e:
            print(f"✗ Erro ao buscar history: {e}")
        
        # Teste 3: History com start/end
        print("\n[TESTE 3] Buscando history com start/end...")
        try:
            time.sleep(0.5)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)
            hist = stock.history(start=start_date, end=end_date, timeout=60)
            if hist is not None and not hist.empty:
                print(f"✓ History obtido: {len(hist)} linhas")
                print(f"  - Último close: {hist['Close'].iloc[-1]:.2f}")
            else:
                print("✗ History vazio")
        except Exception as e:
            print(f"✗ Erro ao buscar history: {e}")
        
        # Teste 4: Download direto
        print("\n[TESTE 4] Buscando com yf.download...")
        try:
            time.sleep(0.5)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            hist = yf.download(
                normalized,
                start=start_date.strftime("%Y-%m-%d"),
                end=end_date.strftime("%Y-%m-%d"),
                progress=False,
                timeout=60
            )
            if hist is not None and not hist.empty:
                print(f"✓ Download obtido: {len(hist)} linhas")
                if isinstance(hist.columns, pd.MultiIndex):
                    print(f"  - MultiIndex detectado, colunas: {hist.columns.levels[0].tolist()}")
                    hist = hist.iloc[:, 0:6]
                print(f"  - Último close: {hist['Close'].iloc[-1]:.2f}")
            else:
                print("✗ Download vazio")
        except Exception as e:
            print(f"✗ Erro no download: {e}")
        
        # Teste 5: Verificar se ticker existe
        print("\n[TESTE 5] Verificando se ticker é válido...")
        try:
            # Tenta buscar apenas informações básicas
            fast_info = stock.fast_info
            if fast_info:
                print(f"✓ Fast info disponível")
                print(f"  - Last price: {fast_info.get('lastPrice', 'N/A')}")
            else:
                print("✗ Fast info não disponível")
        except Exception as e:
            print(f"✗ Erro ao buscar fast_info: {e}")
            
    except Exception as e:
        print(f"✗ Erro geral: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Função principal"""
    print("="*60)
    print("TESTE DA API YAHOO FINANCE")
    print("="*60)
    
    # Testar vários tickers
    tickers = [
        ("PETR4", "PETR4.SA"),
        ("VALE3", "VALE3.SA"),
        ("ITUB4", "ITUB4.SA"),
        ("BBDC4", "BBDC4.SA"),
    ]
    
    for ticker, normalized in tickers:
        test_ticker(ticker, normalized)
        time.sleep(2)  # Delay entre testes
    
    print(f"\n{'='*60}")
    print("TESTE CONCLUÍDO")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()

