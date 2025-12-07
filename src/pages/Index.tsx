import { useState } from "react";
import { FileText, DollarSign, Info, Download, MessageCircle } from "lucide-react";
// Removemos a importação do LoadingScreen pois não vamos mais usar aqui
// import LoadingScreen from "@/components/LoadingScreen"; 
import ServiceCard from "@/components/ServiceCard";
import QuestionCard from "@/components/QuestionCard";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import caioAvatar from "@/assets/caio-avatar.jpeg";

interface IndexProps {
  userContext?: {
    name: string;
    area: string;
  };
}

const Index = ({ userContext }: IndexProps) => {
  // Removemos o estado isLoading que causava a tela vermelha de "Carregando..."
  // const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState("");

  const services = [
    {
      title: "Notas Fiscais",
      description: "Consulta, emissão e histórico completo de NFs",
      icon: FileText,
    },
    {
      title: "Status de Pagamentos",
      description: "Verifique boletos, débitos e liberações",
      icon: DollarSign,
    },
    {
      title: "Fornecedores",
      description: "Dados cadastrais, contratos e contatos",
      icon: Info,
    },
    {
      title: "IFSP",
      description: "Informações sobre nossos processos",
      icon: Info,
    },
    {
      title: "DWL",
      description: "Downloads relatório de pagamento",
      icon: Download,
    },
  ];

  const questions = [
    {
      question: "Nota está na esteira?",
      icon: FileText,
      response: "Vou verificar o status da sua nota fiscal na esteira de processamento.",
    },
    {
      question: "O pagamento foi sequenciado?",
      icon: DollarSign,
      response: "Consultando o sequenciamento do seu pagamento.",
    },
    {
      question: "Preciso de informações sobre o processo de pagamentos.",
      icon: Info,
      response: "Claro! Vou te explicar sobre nosso processo de pagamentos.",
    },
    {
      question: "Desejo baixar as notas pagas nessa semana!",
      icon: Download,
      response: "Preparando o relatório de notas pagas desta semana.",
    },
  ];

  const handleQuestionClick = (question: typeof questions[0]) => {
    setChatInitialMessage(question.response);
    setIsChatOpen(true);
  };

  const handleServiceClick = (service: typeof services[0]) => {
    setChatInitialMessage(`Você selecionou: ${service.title}. Como posso ajudá-lo com este serviço?`);
    setIsChatOpen(true);
  };

  // REMOVIDO: O bloco que retornava o LoadingScreen
  /* if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  } */

  return (
    <div className="min-h-screen p-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Sidebar - Services Panel */}
        <aside className="bg-muted/50 p-6 rounded-lg border-r-4 border-primary shadow-md">
          <h2 className="text-xl font-bold text-primary mb-5 pb-3 border-b-2 border-primary">
            Serviços Disponíveis
          </h2>
          <div>
            {services.map((service, idx) => (
              <ServiceCard
                key={idx}
                title={service.title}
                description={service.description}
                icon={service.icon}
                onClick={() => handleServiceClick(service)}
              />
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="bg-card rounded-lg shadow-md p-6 flex flex-col">
          {/* Profile Header */}
          <header className="flex items-center gap-5 mb-8 pb-6 border-b border-border">
            <div className="relative group">
              <img
                src={caioAvatar}
                alt="Caio - Assistente Virtual"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              />
              <div className="absolute inset-0 rounded-full border-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">Caio</h1>
              <p className="text-muted-foreground">Assistente Virtual de Pagamentos</p>
              {/* Exibe quem está logado */}
              {userContext && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Logado como: {userContext.name} ({userContext.area})
                </div>
              )}
            </div>
          </header>

          {/* Questions Section */}
          <section className="flex-1 relative">
            {!isChatOpen ? (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Como posso ajudá-lo hoje?
                </h2>
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <QuestionCard
                      key={idx}
                      question={q.question}
                      icon={q.icon}
                      onClick={() => handleQuestionClick(q)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <ChatInterface
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                initialMessage={chatInitialMessage}
                userDepartment={userContext?.area || "Visitante"}
              />
            )}

            {/* Floating Chat Button */}
            {!isChatOpen && (
              <Button
                onClick={() => {
                  setChatInitialMessage("");
                  setIsChatOpen(true);
                }}
                size="lg"
                className="fixed bottom-8 right-8 w-20 h-20 rounded-full shadow-2xl bg-primary hover:bg-primary/90 animate-pulse"
                style={{
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              >
                <MessageCircle size={32} />
              </Button>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;