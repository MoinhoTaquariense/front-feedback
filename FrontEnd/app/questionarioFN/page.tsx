"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/questionarioCQ.module.css";

export default function QuestionarioFNPage() {
  const router = useRouter();
  const [urlToken, setUrlToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setUrlToken(token);
      }
    }
  }, []);

  const perguntas = [
    {
      key: "identificar",
      texto: "Você deseja se identificar?",
      opcoes: ["Sim", "Não"]
    },
    {
      key: "nomeAvaliador",
      texto: "Por favor, informe seu nome ou empresa:",
      opcoes: null,
      condicional: (respostas: Record<string, string>) => respostas.identificar === "Sim"
    },
    {
      key: "atendimento",
      texto: "Como você avalia o atendimento prestado pela equipe do Financeiro?",
      opcoes: ["Excelente", "Bom", "Regular", "Ruim", "Muito ruim"]
    },
    {
      key: "prazosatisfatorio",
      texto: "Como você avalia a agilidade no atendimento do setor financeiro?",
      opcoes: ["Excelente", "Boa", "Regular", "Ruim", "Muito ruim"]
    },
    {
      key: "comunicacaoefetiva",
      texto: "A comunicação do setor (clareza nas informações, retorno de e-mails, WhatsApp etc.) é satisfatória?",
      opcoes: [
        "Sempre clara e eficiente",
        "Geralmente boa, com pequenas falhas",
        "Confusa ou demorada em alguns casos",
        "Parcialmente Insatisfatória",
        "Totalmente Insatisfatória"
      ]
    },
    {
      key: "eficiencia",
      texto: "Quando você entra em contato com o financeiro, sente que suas dúvidas são resolvidas com eficiência?",
      opcoes: [
        "Sempre",
        "Na maioria das vezes",
        "Parcialmente",
        "Raramente",
        "Nunca"
      ]
    },
    {
      key: "mensagem",
      texto: "Que melhorias você acredita que poderiam ser feitas para aprimorar o atendimento ou os processos financeiros?",
      opcoes: null
    }
  ];
  type RespostaKey = "identificar" | "nomeAvaliador" | "atendimento" | "prazosatisfatorio" | "comunicacaoefetiva" | "eficiencia" | "mensagem";
  const [respostas, setRespostas] = useState<Record<RespostaKey, string>>({
    identificar: "",
    nomeAvaliador: "",
    atendimento: "",
    prazosatisfatorio: "",
    comunicacaoefetiva: "",
    eficiencia: "",
    mensagem: ""
  });
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRespostas(prev => ({ ...prev, [name]: value }));
  };

  const nextQuestion = () => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      let next = current + 1;
      while (
        next < perguntas.length &&
        typeof perguntas[next].condicional === 'function' && !(perguntas[next].condicional as (r: Record<string, string>) => boolean)(respostas)
      ) {
        next++;
      }
      setCurrent(Math.min(next, perguntas.length - 1));
    }, 400);
  };

  const prevQuestion = () => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      let prev = current - 1;
      while (
        prev > 0 &&
        typeof perguntas[prev].condicional === 'function' && !(perguntas[prev].condicional as (r: Record<string, string>) => boolean)(respostas)
      ) {
        prev--;
      }
      setCurrent(Math.max(prev, 0));
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const estrelasMap: Record<string, number> = {
      "Excelente": 5,
      "Bom": 4,
      "Regular": 3,
      "Ruim": 2,
      "Muito ruim": 1
    };
    const comunicacaoMap: Record<string, number> = {
      "Sempre clara e eficiente": 5,
      "Geralmente boa, com pequenas falhas": 4,
      "Confusa ou demorada em alguns casos": 3,
      "Parcialmente Insatisfatória": 2,
      "Totalmente Insatisfatória": 1
    };
    const eficienciaMap: Record<string, number> = {
      "Sempre": 5,
      "Na maioria das vezes": 4,
      "Parcialmente": 3,
      "Raramente": 2,
      "Nunca": 1
    };
    const estrelas = estrelasMap[respostas.atendimento] || 0;
    const prazosatisfatorio = estrelasMap[respostas.prazosatisfatorio] || 0;
    const comunicacaoefetiva = comunicacaoMap[respostas.comunicacaoefetiva] || 0;
    const eficiencia = eficienciaMap[respostas.eficiencia] || 0;
    const nomeAvaliador = respostas.identificar === "Sim" ? respostas.nomeAvaliador : "";
    const mensagem = respostas.mensagem;

    const apiUrl = urlToken 
      ? "/api/backend/feedbacks/unicos" 
      : "/api/backend/feedbacks/";

    const payload: any = {
      id: 1,
      NomeAvaliador: nomeAvaliador,
      Estrelas: estrelas,
      prazosatisfatorio,
      comunicacaoefetiva,
      eficiencia,
      Mensagem: mensagem,
      setorId: 3,
      colaboradorId: "1"
    };

    if (urlToken) {
      payload.token = urlToken;
    }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        setLoading(false);
        router.push("http://avaliacao.motasa.com.br:6545/usado");
        return;
      }
      
      const result = await res.json();
      setLoading(false);
      console.log("Mensagem do backend:", result);
      setTimeout(() => {
        router.push("http://avaliacao.motasa.com.br:6545/obrigado");
      }, 800);
    } catch (err) {
      setLoading(false);
      router.push("http://avaliacao.motasa.com.br:6545/usado");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url(/images/Fundo.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#4E2A1E",
        overflowX: "hidden"
      }}
    >
      <header
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
          marginTop: 0,
        }}
      >
        <nav
          className="navbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#4E2A1E",
            width: "100%",
            maxWidth: 1000,
            borderRadius: 0,
            marginTop: 0,
            color: "#fff",
            height: 64,
            minHeight: 48,
            padding: "0 10px",
          }}
        >
          <img
            src="/images/logo.png"
            alt="Logo Motasa"
            style={{
              height: 60,
              width: 120,
              borderRadius: 10,
              marginLeft: 10,
              objectFit: "contain",
            }}
          />
          <h1
            style={{
              fontFamily: "Montserrat, sans-serif",
              color: "#fff",
              margin: 0,
              fontSize: "clamp(20px, 5vw, 32px)",
              fontWeight: 700,
              textAlign: "center",
              width: "100%",
              marginRight: 10,
              lineHeight: 1.1,
            }}
          >
            PESQUISA DE SATISFAÇÃO
          </h1>
        </nav>
      </header>
      <main
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "clamp(10px, 4vw, 20px)",
          paddingTop: "56px"
        }}
      >
        <div
          className="div-main"
          style={{
            marginBottom: 20,
            width: "100%",
            maxWidth: 500,
          }}
        >
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', textAlign: 'center', marginTop: 25, marginBottom: 20, fontWeight: 700, textTransform: 'uppercase', fontSize: 16, color: '#4E2A1E' }}>
            Gostaríamos muito de contar com a sua participação em nossa<br />pesquisa de satisfação
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              maxWidth: 500,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.85)",
              borderRadius: 16,
              padding: "clamp(16px, 6vw, 32px)",
              boxShadow: "0 2px 16px rgba(78,42,30,0.08)",
              minHeight: 320,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                textAlign: "right",
                fontSize: "clamp(12px, 3vw, 14px)",
                color: "#d4b080",
                marginBottom: 8,
              }}
            >
              {/* Progresso removido conforme solicitado */}
            </div>
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: "clamp(16px, 4vw, 20px)",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.4s",
                opacity: animating ? 0 : 1,
                transform: animating ? "translateX(60px)" : "translateX(0)",
              }}
            >
              <label
                style={{
                  fontWeight: 700,
                  marginBottom: 18,
                  fontSize: "clamp(18px, 5vw, 22px)",
                  color: "#4E2A1E",
                }}
              >
                {perguntas[current].texto}
              </label>
              {perguntas[current].opcoes ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  {perguntas[current].opcoes.map((opcao) => {
                    const key = perguntas[current].key as RespostaKey;
                    return (
                      <label
                        key={opcao}
                        style={{
                          cursor: "pointer",
                          fontSize: "clamp(16px, 4vw, 18px)",
                          borderRadius: 8,
                          padding: "8px 18px",
                          background: respostas[key] === opcao ? "#eead2d" : "#f5f5f5",
                          color: respostas[key] === opcao ? "#4E2A1E" : "#4E2A1E",
                          boxShadow: respostas[key] === opcao ? "0 2px 8px #eead2d55" : "none",
                          transition: "all 0.3s",
                          marginBottom: 2,
                        }}
                      >
                        <input type="radio" name={key} value={opcao} checked={respostas[key] === opcao} onChange={handleChange} style={{ display: "none" }} />
                        {opcao}
                      </label>
                    );
                  })}
                </div>
              ) : perguntas[current].key === "nomeAvaliador" ? (
                <div style={{ width: "100%", marginTop: 10 }}>
                  <input
                    type="text"
                    name="nomeAvaliador"
                    value={respostas.nomeAvaliador}
                    onChange={handleChange}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); nextQuestion(); } }}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      padding: 8,
                      fontSize: "clamp(15px, 4vw, 16px)",
                    }}
                    placeholder="Digite seu nome ou empresa..."
                  />
                </div>
              ) : (
                <textarea
                  name="mensagem"
                  value={respostas.mensagem}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    padding: 8,
                    fontSize: "clamp(15px, 4vw, 16px)",
                    marginTop: 10,
                    resize: "vertical",
                  }}
                  placeholder="Digite aqui sua sugestão, elogio ou comentário..."
                />
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                marginTop: 24,
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={prevQuestion}
                disabled={current === 0 || animating}
                style={{
                  padding: "10px 22px",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  borderRadius: 30,
                  background: "#d4b080",
                  color: "#fff",
                  border: "none",
                  cursor: current === 0 ? "not-allowed" : "pointer",
                  opacity: current === 0 ? 0.5 : 1,
                  fontWeight: 600,
                  transition: "all 0.3s",
                  flex: 1,
                  minWidth: 120,
                  maxWidth: 180,
                }}
              >
                Anterior
              </button>
              {current < perguntas.length - 1 ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={!respostas[perguntas[current].key as RespostaKey] || animating}
                  style={{
                    padding: "10px 22px",
                    fontSize: "clamp(14px, 3vw, 16px)",
                    borderRadius: 30,
                    background: "#eead2d",
                    color: "#fff",
                    border: "none",
                    cursor: !respostas[perguntas[current].key as RespostaKey] ? "not-allowed" : "pointer",
                    opacity: !respostas[perguntas[current].key as RespostaKey] ? 0.5 : 1,
                    fontWeight: 600,
                    transition: "all 0.3s",
                    flex: 1,
                    minWidth: 120,
                    maxWidth: 180,
                  }}
                >
                  Próxima
                </button>
              ) : (
                <button
                  className="submit-btn"
                  type="submit"
                  disabled={loading || animating || !respostas.mensagem}
                  style={{
                    padding: "10px 22px",
                    fontSize: "clamp(14px, 3vw, 16px)",
                    borderRadius: 30,
                    backgroundColor: "#4E2A1E",
                    color: "#fff",
                    border: "none",
                    cursor: loading || animating || !respostas.mensagem ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    transition: "all 0.3s",
                    flex: 1,
                    minWidth: 120,
                    maxWidth: 180,
                  }}
                >
                  {loading ? "Enviando..." : "Enviar Feedback"}
                </button>
              )}
            </div>
            {message && (
              <div style={{ color: messageType === "success" ? "green" : "red", marginTop: 18, fontWeight: 700, fontSize: 18 }}>{message}</div>
            )}
            {/* Progresso movido para o topo do formulário */}
            {/* Campo de progresso removido conforme solicitado */}
          </form>
        </div>
      </main>
      <footer
        style={{
          position: "relative",
          width: "100%",
          marginTop: 25,
          paddingBottom: 30,
        }}
      >
        <div
          className="messageFooter"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(16px, 5vw, 22px)",
            textAlign: "center",
            fontWeight: "normal",
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 15px",
          }}
        >
          Agradecemos pelo tempo dedicado à nossa pesquisa <br />e pela <strong>confiança em nosso trabalho.</strong>
        </div>
        <div
          className={`selos ${styles['selos-mobile-hide']}`}
          style={{
            position: "absolute",
            bottom: 0,
            right: 20,
            height: "auto",
            maxWidth: "40vw",
            minWidth: 120,
          }}
        >
          <img src="/images/Selos.png" alt="selos" style={{ height: "clamp(80px, 30vw, 230px)", width: "auto" }} />
        </div>
      </footer>
    </div>
  );
}
