import React, { useState } from "react";

const Dashboard = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const apiKey = "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";
      const url = "https://api.perplexity.ai/chat/completions";

      const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      };

      const payload = {
        model: "sonar-pro",
        messages: [
          { role: "user", content: question }
        ]
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data?.choices?.[0]?.message?.content || "No response content.");
      } else {
        setError(data?.error?.message || "Unknown error occurred.");
      }

    } catch (err) {
      setError("Network error or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Ask Perplexity AI</h2>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        style={{ width: "100%", marginBottom: "10px" }}
        placeholder="Type your question here..."
      />
      <button onClick={askQuestion} disabled={loading}>
        {loading ? "Asking..." : "Ask"}
      </button>

      {response && (
        <div style={{ marginTop: "20px", color: "green" }}>
          <h4>AI Response:</h4>
          <p>{response}</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h4>Error:</h4>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
