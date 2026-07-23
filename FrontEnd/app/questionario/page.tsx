"use client";
import React, { useState } from "react";

// Importe o CSS externo se necessário, ou adapte para globals.css
// import "./style-css__indexPage.css";

export default function QuestionarioPage() {
  const [rating, setRating] = useState(0);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [setor, setSetor] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");
    // Simulação de envio
    setTimeout(() => {
      setLoading(false);
      setMessage("Feedback enviado com sucesso!");
      setMessageType("success");
      setRating(0);
      setNomeEmpresa("");
      setSetor("");
      setFeedback("");
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", backgroundImage: "url(/images/Fundo.png)", backgroundSize: "100%", backgroundRepeat: "no-repeat", display: "flex", flexDirection: "column", alignItems: "center", color: "#4E2A1E", overflowX: "hidden" }}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossOrigin="anonymous" />
      </head>
      <header style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 25 }}>
        <nav className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#4E2A1E", width: 1000, borderRadius: 10, marginTop: 10, color: "#fff", height: 90 }}>
          <img src="/images/logo.png" alt="Logo Motasa" style={{ height: 100, width: 180, borderRadius: 10, marginLeft: 40 }} />
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', color: '#fff', margin: 0, fontSize: 32, fontWeight: 700, textAlign: 'center', width: '100%', marginRight: 100 }}>
            PESQUISA DE SATISFAÇÃO
          </h1>
        </nav>
      </header>
      <main style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: 20 }}>
        <div className="div-main" style={{ marginBottom: 20 }}>
          {/* Estrelas acima do texto e do formulário */}
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', textAlign: 'center', marginTop: 25, marginBottom: 20, fontWeight: 700, textTransform: 'uppercase', fontSize: 14, color: '#4E2A1E' }}>
            Gostaríamos muito de contar com a sua participação em nossa<br />pesquisa de satisfação sobre o atendimento
          </h2>
          <div className="rating-box" style={{ display: 'flex', flexDirection: 'row', gap: 14, justifyContent: 'center', marginBottom: 20, marginTop: 0 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                <input
                  type="radio"
                  id={`rating-${star}`}
                  name="rating"
                  value={star}
                  checked={rating === star}
                  onChange={() => setRating(star)}
                  style={{ display: 'none' }}
                />
                <i
                  className={`fa-solid fa-star`}
                  style={{ fontSize: 38, cursor: 'pointer', color: rating >= star ? '#eead2d' : '#d4b080', transition: 'color 0.3s, transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  onClick={() => setRating(star)}
                ></i>
              </span>
            ))}
          </div>
          <form style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 32, boxShadow: '0 2px 16px rgba(78,42,30,0.08)' }}>
            <div style={{ fontSize: 20, color: '#4E2A1E', textAlign: 'center', width: '100%' }}>
              formulario aqui
            </div>
            <button
              className="submit-btn"
              type="submit"
              style={{ marginTop: 8, padding: "15px 30px", fontSize: 18, fontWeight: "bold", color: "#fff", backgroundColor: "#4E2A1E", border: "none", borderRadius: 30, cursor: "pointer", transition: "0.3s", boxShadow: "0px 5px 15px rgba(78,42,30,0.3)" }}
            >
              Enviar Feedback
            </button>
          </form>
        </div>
      </main>
      <footer style={{ position: 'relative', width: '100%', marginTop: 25, paddingBottom: 30 }}>
        <div className="messageFooter" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 22, textAlign: 'center', fontWeight: 'normal', maxWidth: 900, margin: '0 auto', padding: '0 15px' }}>
          Agradecemos pelo tempo dedicado à nossa pesquisa <br />e pela <strong>confiança em nosso trabalho.</strong>
        </div>
        <div className="selos" style={{ position: 'absolute', bottom: 0, right: 20 }}>
          <img src="/images/Selos.png" alt="selos" style={{ height: 230, width: 'auto' }} />
        </div>
      </footer>
    </div>
  );
}
