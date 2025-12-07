import pandas as pd
from typing import List, Optional

# --- IMPORTAÇÕES PARA RODAR LOCALMENTE ---
# Usamos langchain_ollama para conectar com a IA que está rodando na sua máquina
from langchain_ollama import ChatOllama
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor

# --- SERVIDOR API ---
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------
# 1. DADOS MOCKADOS (SUAS PLANILHAS SEGURAS)
# ---------------------------------------------------------

PERMISSOES_USUARIOS = {
    "joao.silva@empresa.com": "MARKETING",
    "maria.souza@empresa.com": "TI",
    "ana.financeiro@empresa.com": "FINANCEIRO"
}

df_notas_pagas = pd.DataFrame({
    "area": ["MARKETING", "TI", "MARKETING", "RH"],
    "fornecedor": ["Agencia X", "Tech Soft", "Eventos Y", "Consultoria Z"],
    "valor": [5000, 12000, 3000, 8000],
    "status": ["PAGO", "PAGO", "EM PROCESSAMENTO", "PAGO"],
    "data_pagamento": ["2023-10-01", "2023-10-02", "-", "2023-10-05"]
})

df_materiais = pd.DataFrame({
    "conta_contabil": ["05.06-3", "05.06-3", "01.02-1"],
    "descricao_servico": ["Manutenção Predial", "Limpeza", "Consultoria TI"],
    "codigo_material": ["MAT-9988", "MAT-7766", "MAT-1122"],
    "permite_pagamento": [True, True, False]
})

# ---------------------------------------------------------
# 2. FERRAMENTAS (TOOLS)
# ---------------------------------------------------------

@tool
def consultar_notas_pagas(user_email: str) -> str:
    """
    Consulta as notas fiscais pagas da área do usuário.
    Use esta ferramenta OBRIGATORIAMENTE quando o usuário perguntar sobre status de pagamentos, orçamentos ou notas da área dele.
    """
    print(f"--- FERRAMENTA ACIONADA: Consultar Notas para {user_email} ---")
    area_usuario = PERMISSOES_USUARIOS.get(user_email)
    
    if not area_usuario:
        return "Acesso negado. Não identifiquei permissão de visualização para o seu usuário."
    
    notas_filtradas = df_notas_pagas[df_notas_pagas['area'] == area_usuario]
    
    if notas_filtradas.empty:
        return f"Não encontrei notas pagas registradas para a área: {area_usuario}."
    
    return notas_filtradas.to_markdown(index=False)

@tool
def verificar_codigo_material(conta: str, tipo_servico: str) -> str:
    """
    Verifica o código do material e se o pagamento é possível baseado na conta e tipo de serviço.
    IMPORTANTE: Só use se tiver 'conta' E 'tipo_servico'. Se faltar um, pergunte ao usuário antes.
    """
    print(f"--- FERRAMENTA ACIONADA: Verificar Material {conta} / {tipo_servico} ---")
    filtro = df_materiais[
        (df_materiais['conta_contabil'] == conta) & 
        (df_materiais['descricao_servico'].str.contains(tipo_servico, case=False))
    ]
    
    if filtro.empty:
        return "Não encontrei um código de material para essa combinação de conta e serviço."
    
    resultado = filtro.iloc[0]
    if resultado['permite_pagamento']:
        return f"Encontrado! Código: {resultado['codigo_material']}. O pagamento é permitido nesta conta."
    else:
        return f"Código: {resultado['codigo_material']}, mas ATENÇÃO: O pagamento NÃO é permitido para esta conta/serviço."

# ---------------------------------------------------------
# 3. AGENTE (CÉREBRO LOCAL)
# ---------------------------------------------------------

# Aqui está o segredo: Conectamos no Ollama rodando localmente na porta padrão 11434
# O modelo 'llama3.1' deve ter sido baixado previamente (passo 1)
llm = ChatOllama(
    model="llama3.1",
    temperature=0,
    # Aumentar o num_predict pode ajudar a não cortar respostas, mas deixa mais lento
    # num_predict=256 
)

system_prompt = """
Você é o Caio, um assistente virtual de pagamentos da empresa.
TODA sua operação é local e segura. Você não envia dados para fora.

SUAS REGRAS DE OURO (Siga estritamente):
1. Prazo: Pagamento de NF ocorre em 15 dias úteis após recebimento.
2. Compra Pontual: Máximo 5 vezes ao mesmo fornecedor. Limite R$ 10.000,00.
3. Ativo Imobilizado: Pedido deve ser feito com a área de Compras (contratos).

INSTRUÇÕES DE FERRAMENTAS:
- Se o usuário perguntar de "minhas notas" ou "status", CHAME a ferramenta 'consultar_notas_pagas'.
- Se o usuário perguntar de código de material, CHAME 'verificar_codigo_material'. Se ele não disser o serviço, PERGUNTE.

Responda sempre em português do Brasil, de forma cordial e executiva.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools = [consultar_notas_pagas, verificar_codigo_material]

# Agente capaz de chamar ferramentas locais
agent = create_tool_calling_agent(llm, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# ---------------------------------------------------------
# 4. API (ENDPOINT)
# ---------------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_email: str

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        print(f"Recebendo pergunta de: {req.user_email}")
        input_text = f"Usuário Email: {req.user_email}. Mensagem: {req.message}"
        
        # Inicia o pensamento do Agente Local
        response = agent_executor.invoke({"input": input_text})
        
        return {"reply": response['output']}
    except Exception as e:
        print(f"Erro Crítico no Servidor Local: {e}")
        # Em caso de erro com o modelo local (comum se o PC for fraco), damos um fallback
        return {"reply": "Desculpe, meu sistema local está sobrecarregado no momento. Tente novamente em instantes."}

if __name__ == "__main__":
    print(">>> Servidor CAIO (Modo 100% Local/Seguro) Iniciado na porta 8000 <<<")
    print("Certifique-se que o aplicativo Ollama está rodando no fundo.")
    uvicorn.run(app, host="0.0.0.0", port=8000)