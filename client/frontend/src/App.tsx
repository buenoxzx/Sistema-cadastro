import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Carregando...");

  useEffect(() => {
    fetch("https://sistema-cadastro-o7x0.onrender.com")
      .then(() => setStatus("Backend conectado com sucesso ✅"))
      .catch(() => setStatus("Erro ao conectar no backend ❌"));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Frontend no Vite 🚀</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
