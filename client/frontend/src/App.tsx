import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Conectando...");

  useEffect(() => {
    fetch("https://sistema-cadastro-o7x0.onrender.com/")
      .then((res) => res.json())
      .then(() => setStatus("Backend conectado com sucesso ✅"))
      .catch(() => setStatus("Erro ao conectar no backend ❌"));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Frontend no Vite 🚀</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
