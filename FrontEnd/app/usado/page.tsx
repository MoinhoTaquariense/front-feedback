"use client";
import React, { useEffect, useState } from "react";
import styles from "../../styles/questionarioCQ.module.css";

export default function UsadoPage() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShow(true), 300);
  }, []);

  return (
    <div
      className="usado-container"
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
      <style>{`
        @media (max-width: 600px) {
          .usado-container {
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .usado-header {
            position: static !important;
            margin-top: 0 !important;
            margin-bottom: 8px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .navbar {
            margin-top: 0 !important;
            margin-bottom: 8px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .usado-main {
            min-height: auto !important;
            padding-top: 0 !important;
            justify-content: center !important;
            margin-bottom: 8px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .usado-footer {
            position: static !important;
            margin-top: 8px !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>
      <header
        className="usado-header"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 0,
          marginBottom: 0,
        }}
      >
        <nav
          className="navbar"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#4E2A1E",
            width: "96%",
            maxWidth: 1000,
            borderRadius: "32px",
            color: "#fff",
            height: 96,
            minHeight: 96,
            padding: "0 18px",
            boxShadow: "0 2px 12px rgba(78,42,30,0.10)",
          }}
        >
          <img src="/images/logo.png" alt="Logo Motasa" style={{ height: 60, width: 120, borderRadius: 10, objectFit: "contain", margin: "0 auto" }} />
        </nav>
      </header>
      <main
        className="usado-main"
        style={{
          width: "100%",
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          padding: "2px 0 0 0",
          paddingTop: "0px"
        }}
      >
        <div
          style={{
            marginBottom: 2,
            width: "100%",
            maxWidth: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 160,
            background: "linear-gradient(135deg, #ffe6e6 0%, #f5d7d7 100%)",
            borderRadius: 32,
            boxShadow: "0 8px 32px rgba(200,50,50,0.14)",
            position: "relative",
            overflow: "hidden",
            animation: show ? "fadeInUp 0.7s" : "none"
          }}
        >
          <div style={{ marginTop: 32, marginBottom: 12, animation: show ? "pop 0.7s" : "none" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
              <circle cx="40" cy="40" r="36" fill="#dc3545" stroke="#fff" strokeWidth="4" />
              <path d="M28 28L52 52M52 28L28 52" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', textAlign: 'center', marginTop: 8, marginBottom: 18, fontWeight: 700, textTransform: 'uppercase', fontSize: 24, color: '#dc3545', letterSpacing: 1 }}>
            Link Expirado
          </h2>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 19, color: '#4E2A1E', marginBottom: 10, fontWeight: 500, lineHeight: 1.5 }}>
            <span style={{ fontSize: 'clamp(18px, 6vw, 24px)', fontWeight: 500, marginLeft: 16, marginRight: 16, display: 'block' }}>
              Este link já foi utilizado ou expirou.<br />
            </span>
            <style>{`
              @media (max-width: 600px) {
                .usado-main h2 {
                  font-size: 6vw !important;
                }
                .usado-main span {
                  font-size: 5vw !important;
                }
              }
            `}</style>
          </div>
        </div>
      </main>
      <footer
        className="usado-footer"
        style={{
          position: "relative",
          width: "100%",
          marginTop: 2,
          paddingBottom: 8,
        }}
      >
      <style>{`
        @media (max-width: 600px) {
          .usado-header {
            position: static !important;
            margin-bottom: 8px !important;
          }
          .usado-main {
            min-height: auto !important;
            padding-top: 0 !important;
            justify-content: center !important;
          }
          .usado-footer {
            position: static !important;
            margin-top: 8px !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>
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
          Se precisar de ajuda, entre em contato com nossa equipe.
        </div>
        <div className={`selos ${styles['selos-mobile-hide']}`}
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
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
