import { useState, useEffect, useRef } from "react";
import { Send, X, Loader2, Search, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

// --- BASE DE DADOS FIDEDIGNA (SIMULAÇÃO DE SQL/EXCEL) ---
// CNPJs Reais (Fictícios para exemplo, mas formatados corretamente)
const DATABASE_FORNECEDORES = [
  {
    cnpj: "12345678000190", // Sem pontuação para facilitar a busca
    razaoSocial: "TECH SOLUTIONS LTDA",
    notas: [
      { numero: "1001", valor: "R$ 5.000,00", status: "Paga", dataPagamento: "25/10/2023" },
      { numero: "1002", valor: "R$ 2.500,00", status: "Em Aprovação", dataPagamento: "-" }
    ]
  },
  {
    cnpj: "98765432000100",
    razaoSocial: "SERVIÇOS GERAIS S.A.",
    notas: [
      { numero: "5544", valor: "R$ 15.000,00", status: "Paga", dataPagamento: "01/11/2023" }
    ]
  }
];

interface Message {
  text: string;
  isBot: boolean;
}

// ESTADOS DA MÁQUINA DE ESTADOS DO CHAT
type ChatState =
  | 'IDLE'
  | 'AGUARDANDO_CNPJ'
  | 'CONFIRMANDO_FORNECEDOR'
  | 'AGUARDANDO_NUMERO_NOTA';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  userDepartment?: string;
}

const ChatInterface = ({ isOpen, onClose, userDepartment = "Geral" }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Controle de Estado da Conversa
  const [currentState, setCurrentState] = useState<ChatState>('IDLE');
  const [tempData, setTempData] = useState<any>(null); // Armazena dados temporários (fornecedor encontrado)

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          text: `Olá! Sou o Caio. Estou autenticado no sistema da área ${userDepartment}. Posso consultar status de pagamento de forma segura. Digite "consultar nota" para começar.`,
          isBot: true,
        }]);
      }, 500);
    }
  }, [isOpen, userDepartment]);

  // --- FUNÇÕES AUXILIARES ---

  const limparCNPJ = (cnpj: string) => cnpj.replace(/\D/g, ''); // Remove pontos e traços

  // --- MÁQUINA DE LÓGICA DO ROBÔ ---
  const processarMensagem = async (textoUsuario: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay para naturalidade

    let resposta = "";
    const textoLimpo = textoUsuario.trim();
    const textoLower = textoLimpo.toLowerCase();

    switch (currentState) {
      case 'IDLE':
        if (textoLower.includes("consultar nota") || textoLower.includes("ver nota") || textoLower.includes("status")) {
          resposta = "Para iniciar a consulta segura, por favor, informe o número do CNPJ do fornecedor (apenas números ou com pontuação).";
          setCurrentState('AGUARDANDO_CNPJ');
        } else {
          resposta = "Desculpe, neste modo seguro só posso realizar consultas de notas fiscais. Digite 'Consultar Nota' para iniciar o processo.";
        }
        break;

      case 'AGUARDANDO_CNPJ':
        const cnpjDigitado = limparCNPJ(textoLimpo);

        // Validação básica de tamanho de CNPJ
        if (cnpjDigitado.length < 14) {
          resposta = "O CNPJ informado parece inválido ou incompleto. Por favor, digite novamente.";
          // Mantém no mesmo estado
        } else {
          // BUSCA EXATA NA PLANILHA (Simulação)
          const fornecedorEncontrado = DATABASE_FORNECEDORES.find(f => f.cnpj === cnpjDigitado);

          if (fornecedorEncontrado) {
            setTempData(fornecedorEncontrado); // Guarda o fornecedor na memória temporária
            resposta = `Localizei o fornecedor: **${fornecedorEncontrado.razaoSocial}**. \n\nConfirma que é esta a empresa? (Responda Sim ou Não)`;
            setCurrentState('CONFIRMANDO_FORNECEDOR');
          } else {
            resposta = "Não encontrei nenhuma empresa com este CNPJ na nossa base de dados autorizada. Por favor, verifique o número e tente novamente.";
            // Mantém no estado ou volta pro IDLE? Vamos manter para tentar de novo.
          }
        }
        break;

      case 'CONFIRMANDO_FORNECEDOR':
        if (textoLower === "sim" || textoLower === "s" || textoLower.includes("confirmo")) {
          resposta = `Perfeito. Agora, informe o **Número da Nota Fiscal** que deseja consultar para o fornecedor ${tempData.razaoSocial}.`;
          setCurrentState('AGUARDANDO_NUMERO_NOTA');
        } else {
          resposta = "Consulta cancelada. Se quiser tentar outro CNPJ, digite 'consultar nota'.";
          setTempData(null);
          setCurrentState('IDLE');
        }
        break;

      case 'AGUARDANDO_NUMERO_NOTA':
        // Busca a nota específica dentro do fornecedor que já achamos
        const notaEncontrada = tempData.notas.find((n: any) => n.numero === textoLimpo);

        if (notaEncontrada) {
          resposta = `📋 **Detalhes da Nota Fiscal**\n\n` +
            `• Fornecedor: ${tempData.razaoSocial}\n` +
            `• Nota: ${notaEncontrada.numero}\n` +
            `• Valor: ${notaEncontrada.valor}\n` +
            `• Status: ${notaEncontrada.status}\n` +
            `• Data Pagamento: ${notaEncontrada.dataPagamento}`;

          // Finaliza o fluxo com sucesso
          setTempData(null);
          setCurrentState('IDLE');

          // Adiciona mensagem extra de ajuda
          setTimeout(() => {
            setMessages(prev => [...prev, { text: "Deseja consultar outra nota? Basta pedir.", isBot: true }]);
          }, 2000);

        } else {
          resposta = `❌ Não encontrei a nota fiscal número "${textoLimpo}" para o fornecedor ${tempData.razaoSocial}.\n\nVerifique se o número está correto e tente novamente.`;
          // Mantém no estado para ele tentar outro número
        }
        break;
    }

    setMessages(prev => [...prev, { text: resposta, isBot: true }]);
    setIsTyping(false);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    processarMensagem(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:relative md:h-[600px] flex flex-col bg-card/95 backdrop-blur-lg rounded-xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 duration-500">
      {/* Header Seguro */}
      <div className="bg-gradient-to-r from-primary to-[hsl(var(--bradesco-dark-red))] text-primary-foreground p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Search size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold block text-sm">Consulta Corporativa</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80 flex items-center gap-1">
              <CheckCircle size={10} /> Conexão Segura
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/20 hover:rotate-90 transition-all duration-300"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 p-5 overflow-y-auto bg-gray-50/50 space-y-4">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg.text} isBot={msg.isBot} />
        ))}
        {isTyping && <TypingIndicator />}

        {/* Status Bar Contextual */}
        {currentState !== 'IDLE' && (
          <div className="flex justify-center mt-4">
            <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200 flex items-center gap-2 animate-pulse">
              <AlertCircle size={12} />
              Aguardando entrada de dados...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-border flex gap-2 shadow-lg">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSendMessage()}
          placeholder={
            currentState === 'AGUARDANDO_CNPJ' ? "Digite o CNPJ..." :
              currentState === 'AGUARDANDO_NUMERO_NOTA' ? "Digite o número da nota..." :
                "Digite sua mensagem..."
          }
          className="flex-1 focus-visible:ring-primary border-gray-300"
          disabled={isTyping}
          autoFocus
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          className="bg-primary hover:bg-primary/90 transition-all"
          disabled={isTyping || !input.trim()}
        >
          {isTyping ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;