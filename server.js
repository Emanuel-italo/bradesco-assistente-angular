import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
// Simulação de base de dados/Excel
const MOCK_ORCAMENTO_AREAS = [
    { area: 'TI', nota: 'NF-1001', status: 'Paga', data: '2023-10-25', valor: 5000 },
    { area: 'RH', nota: 'NF-2002', status: 'Em processamento', data: '2023-10-26', valor: 12000 },
];

const MOCK_MATERIAIS = [
    { conta: '05.06-3', descricao: 'Manutenção Predial', codigo: 'MAT-998877' },
    { conta: '05.06-3', descricao: 'Serviço de Limpeza', codigo: 'MAT-112233' },
];

dotenv.config();

const app = express();
app.use(cors()); // Permite que o seu Frontend React fale com este servidor
app.use(express.json());

// Configure a sua chave da OpenAI no arquivo .env como OPENAI_API_KEY
// Se não tiver chave, o código usará um modo de "Regras Fixas" para testes.
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// --- PROMPT DO SISTEMA (A "Mente" da IA) ---
const SYSTEM_PROMPT = `
Você é o Caio, assistente virtual de pagamentos do Bradesco.
Sua persona é profissional e direta.

REGRAS RÍGIDAS DE NEGÓCIO:
1. Pagamento de Nota Fiscal: Ocorre em 15 dias úteis após recebimento na caixa genérica ou SharePoint.
2. Compra Pontual: Limite de 5 pagamentos ao mesmo fornecedor. Valor MÁXIMO de R$ 10.000,00.
3. Ativo Imobilizado: Pedidos devem ser submetidos ao Compras (meninas de contratos).

SEGURANÇA DE DADOS:
- Se perguntarem sobre "notas pagas" ou "status da área", VOCÊ NÃO PODE RESPONDER DIRETAMENTE. Você deve usar a ferramenta 'consultar_planilha_confidencial'.
- Se perguntarem sobre "código de material" para a conta '05.06-3', PERGUNTE PRIMEIRO: "Qual o tipo de serviço prestado?". Só depois use a ferramenta 'consultar_material'.
`;

// --- FUNÇÕES DE "FERRAMENTAS" (O que a IA pode fazer) ---

function consultarPlanilhaConfidencial(userDepartment) {
    // Aqui entraria a leitura real do Excel com a biblioteca 'exceljs'
    // Simulando filtro por segurança:
    const dadosFiltrados = MOCK_ORCAMENTO_AREAS.filter(item => item.area === userDepartment);

    if (dadosFiltrados.length === 0) {
        return "Não encontrei registros para a sua área nesta planilha.";
    }
    return JSON.stringify(dadosFiltrados);
}

function consultarMaterial(conta, tipoServico) {
    // Simula busca na planilha de materiais
    const material = MOCK_MATERIAIS.find(m =>
        m.conta === conta &&
        tipoServico.toLowerCase().includes(m.descricao.toLowerCase().split(' ')[0].toLowerCase())
    );

    if (material) return `Encontrei: O código para ${material.descricao} é ${material.codigo}.`;
    return "Não encontrei um código de material específico para esse serviço nesta conta.";
}

// --- ROTA PRINCIPAL DO CHAT ---
app.post('/api/chat', async (req, res) => {
    const { message, userId, userDepartment } = req.body;

    console.log(`Recebido de ${userId} (${userDepartment}): ${message}`);

    // 1. Lógica de "Regras Fixas" (Caso não tenha OpenAI configurado ou para respostas rápidas)
    const lowerMsg = message.toLowerCase();

    // INTERCEPTAÇÃO: Regra de Código de Material (O Chat pergunta de volta)
    if (lowerMsg.includes('05.06-3') && !lowerMsg.includes('serviço')) {
        return res.json({
            reply: "Para a conta 05.06-3, preciso que me informe: Qual é o tipo de serviço prestado?"
        });
    }

    // INTERCEPTAÇÃO: Consulta de Material (Resposta do usuário)
    if (lowerMsg.includes('manutenção') || lowerMsg.includes('limpeza')) {
        const respostaMaterial = consultarMaterial('05.06-3', message);
        return res.json({ reply: respostaMaterial });
    }

    // INTERCEPTAÇÃO: Dados Confidenciais (Planilha da Área)
    if (lowerMsg.includes('minha nota') || lowerMsg.includes('paga') || lowerMsg.includes('orçamento')) {
        if (!userDepartment) {
            return res.json({ reply: "Não consegui identificar seu departamento para consultar os dados sigilosos." });
        }
        const dados = consultarPlanilhaConfidencial(userDepartment);
        return res.json({
            reply: `Consultei a planilha confidencial da área ${userDepartment}. Aqui está o que encontrei: ${dados}`
        });
    }

    // 2. Se não caiu nas regras fixas, enviamos para a IA (se configurada)
    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: message }
                ],
                model: "gpt-4-turbo", // ou gpt-3.5-turbo
            });

            return res.json({ reply: completion.choices[0].message.content });
        } catch (error) {
            console.error("Erro na OpenAI:", error);
            return res.status(500).json({ reply: "Desculpe, tive um erro ao processar sua solicitação inteligente." });
        }
    }

    // 3. Fallback se não tiver IA nem regra específica
    if (lowerMsg.includes('prazo')) return res.json({ reply: "O pagamento ocorre em 15 dias úteis após recebimento." });
    if (lowerMsg.includes('pontual')) return res.json({ reply: "Compras pontuais: limite de 5 pagamentos e valor máximo de R$ 10mil." });

    res.json({ reply: "Entendido. Como posso ajudar com pagamentos, notas ou códigos de material?" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Backend do Caio rodando na porta ${PORT}`);
});