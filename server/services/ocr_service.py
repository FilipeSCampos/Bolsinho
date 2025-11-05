#!/usr/bin/env python3
"""
Serviço de OCR usando Tesseract para extração de texto de documentos financeiros.
"""

import os
import re
from typing import Dict, Any, Optional, List
import pytesseract
from PIL import Image
import cv2
import numpy as np


class OCRService:
    """Serviço para OCR de documentos financeiros."""
    
    def __init__(self):
        """Inicializa o serviço de OCR."""
        # Configura idiomas (português e inglês)
        self.languages = "por+eng"
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Pré-processa imagem para melhorar OCR.
        
        Args:
            image_path: Caminho da imagem
            
        Returns:
            Imagem processada
        """
        # Lê imagem
        img = cv2.imread(image_path)
        
        # Converte para escala de cinza
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Aplica threshold adaptativo
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Remove ruído
        denoised = cv2.fastNlMeansDenoising(thresh)
        
        return denoised
    
    def extract_text(self, image_path: str, preprocess: bool = True) -> str:
        """
        Extrai texto de uma imagem.
        
        Args:
            image_path: Caminho da imagem
            preprocess: Se deve pré-processar a imagem
            
        Returns:
            Texto extraído
        """
        try:
            if preprocess:
                img = self.preprocess_image(image_path)
            else:
                img = Image.open(image_path)
            
            # Extrai texto
            text = pytesseract.image_to_string(img, lang=self.languages)
            
            return text.strip()
        except Exception as e:
            return f"Erro ao extrair texto: {str(e)}"
    
    def extract_structured_data(self, image_path: str) -> Dict[str, Any]:
        """
        Extrai dados estruturados de uma imagem.
        
        Args:
            image_path: Caminho da imagem
            
        Returns:
            Dicionário com dados extraídos
        """
        try:
            if image_path.startswith("http"):
                # Download da imagem se for URL
                import requests
                from io import BytesIO
                
                response = requests.get(image_path)
                img = Image.open(BytesIO(response.content))
                
                # Salva temporariamente
                temp_path = "/tmp/temp_ocr_image.jpg"
                img.save(temp_path)
                image_path = temp_path
            
            img = self.preprocess_image(image_path)
            
            # Extrai dados com informações de posição
            data = pytesseract.image_to_data(
                img, lang=self.languages, output_type=pytesseract.Output.DICT
            )
            
            return data
        except Exception as e:
            return {"error": str(e)}
    
    def extract_boleto_data(self, image_path: str) -> Dict[str, Any]:
        """
        Extrai dados específicos de um boleto.
        
        Args:
            image_path: Caminho da imagem do boleto
            
        Returns:
            Dados do boleto
        """
        text = self.extract_text(image_path)
        
        result = {
            "linha_digitavel": None,
            "codigo_barras": None,
            "valor": None,
            "vencimento": None,
            "beneficiario": None,
            "raw_text": text
        }
        
        # Padrões regex para extração
        
        # Linha digitável (47 ou 48 dígitos com pontos e espaços)
        linha_pattern = r'\d{5}\.\d{5}\s\d{5}\.\d{6}\s\d{5}\.\d{6}\s\d\s\d{14}'
        linha_match = re.search(linha_pattern, text.replace('\n', ' '))
        if linha_match:
            result["linha_digitavel"] = linha_match.group(0)
        
        # Valor (R$ seguido de número)
        valor_pattern = r'R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})'
        valor_matches = re.findall(valor_pattern, text)
        if valor_matches:
            # Pega o maior valor encontrado
            valores = [float(v.replace('.', '').replace(',', '.')) for v in valor_matches]
            result["valor"] = max(valores)
        
        # Data de vencimento (DD/MM/YYYY)
        vencimento_pattern = r'(\d{2}/\d{2}/\d{4})'
        vencimento_matches = re.findall(vencimento_pattern, text)
        if vencimento_matches:
            result["vencimento"] = vencimento_matches[0]
        
        return result
    
    def extract_receipt_data(self, image_path: str) -> Dict[str, Any]:
        """
        Extrai dados de um recibo/cupom fiscal.
        
        Args:
            image_path: Caminho da imagem do recibo
            
        Returns:
            Dados do recibo
        """
        text = self.extract_text(image_path)
        
        result = {
            "estabelecimento": None,
            "cnpj": None,
            "data": None,
            "hora": None,
            "valor_total": None,
            "itens": [],
            "raw_text": text
        }
        
        lines = text.split('\n')
        
        # CNPJ
        cnpj_pattern = r'CNPJ[:\s]*(\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2})'
        cnpj_match = re.search(cnpj_pattern, text, re.IGNORECASE)
        if cnpj_match:
            result["cnpj"] = cnpj_match.group(1)
        
        # Data
        data_pattern = r'(\d{2}/\d{2}/\d{4})'
        data_match = re.search(data_pattern, text)
        if data_match:
            result["data"] = data_match.group(1)
        
        # Hora
        hora_pattern = r'(\d{2}:\d{2}:\d{2})'
        hora_match = re.search(hora_pattern, text)
        if hora_match:
            result["hora"] = hora_match.group(1)
        
        # Valor total
        total_patterns = [
            r'TOTAL[:\s]*R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})',
            r'VALOR TOTAL[:\s]*R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})',
        ]
        
        for pattern in total_patterns:
            total_match = re.search(pattern, text, re.IGNORECASE)
            if total_match:
                valor_str = total_match.group(1)
                result["valor_total"] = float(valor_str.replace('.', '').replace(',', '.'))
                break
        
        # Tenta extrair itens (padrão: descrição seguida de valor)
        item_pattern = r'(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})'
        for line in lines:
            item_match = re.search(item_pattern, line)
            if item_match:
                descricao = item_match.group(1).strip()
                valor_str = item_match.group(2)
                valor = float(valor_str.replace('.', '').replace(',', '.'))
                
                # Filtra linhas que parecem itens válidos
                if len(descricao) > 3 and valor > 0:
                    result["itens"].append({
                        "descricao": descricao,
                        "valor": valor
                    })
        
        return result
    
    def extract_invoice_data(self, image_path: str) -> Dict[str, Any]:
        """
        Extrai dados de uma nota fiscal.
        
        Args:
            image_path: Caminho da imagem da nota fiscal
            
        Returns:
            Dados da nota fiscal
        """
        text = self.extract_text(image_path)
        
        result = {
            "numero_nf": None,
            "serie": None,
            "data_emissao": None,
            "cnpj_emitente": None,
            "razao_social": None,
            "valor_total": None,
            "chave_acesso": None,
            "raw_text": text
        }
        
        # Número da NF
        nf_pattern = r'N[FºªÚ°]\s*(\d+)'
        nf_match = re.search(nf_pattern, text, re.IGNORECASE)
        if nf_match:
            result["numero_nf"] = nf_match.group(1)
        
        # Série
        serie_pattern = r'S[EÉ]RIE[:\s]*(\d+)'
        serie_match = re.search(serie_pattern, text, re.IGNORECASE)
        if serie_match:
            result["serie"] = serie_match.group(1)
        
        # Data de emissão
        data_pattern = r'EMISS[ÃA]O[:\s]*(\d{2}/\d{2}/\d{4})'
        data_match = re.search(data_pattern, text, re.IGNORECASE)
        if data_match:
            result["data_emissao"] = data_match.group(1)
        
        # CNPJ
        cnpj_pattern = r'CNPJ[:\s]*(\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2})'
        cnpj_match = re.search(cnpj_pattern, text, re.IGNORECASE)
        if cnpj_match:
            result["cnpj_emitente"] = cnpj_match.group(1)
        
        # Valor total
        valor_pattern = r'TOTAL[:\s]*R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})'
        valor_match = re.search(valor_pattern, text, re.IGNORECASE)
        if valor_match:
            valor_str = valor_match.group(1)
            result["valor_total"] = float(valor_str.replace('.', '').replace(',', '.'))
        
        # Chave de acesso (44 dígitos)
        chave_pattern = r'(\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4})'
        chave_match = re.search(chave_pattern, text)
        if chave_match:
            result["chave_acesso"] = chave_match.group(1).replace(' ', '')
        
        return result


# Instância global do serviço
ocr_service = OCRService()
