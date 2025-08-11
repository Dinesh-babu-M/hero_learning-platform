import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [currentGame, setCurrentGame] = useState('');
  const [level, setLevel] = useState('beginner');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '👉 Click a game to begin!' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [defaultLang, setDefaultLang] = useState('english');
  const [score, setScore] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [askedQuestions, setAskedQuestions] = useState(new Set());

  const [previousQuestion, setPreviousQuestion] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  const chatBoxRef = useRef(null);
  const navigate = useNavigate();

  const apiKey = "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";
  const model = "sonar-pro";
  const apiUrl = "https://api.perplexity.ai/chat/completions";

  const languageMap = {
    english: 'English',
    tamil: 'தமிழ்',
    telugu: 'తెలుగు',
    kannada: 'ಕನ್ನಡ',
    malayalam: 'മലയാളം',
  };

  useEffect(() => {
    document.title = "Hero - AI English Learning Game";
    const user = localStorage.getItem("currentUser");
    if (!user) navigate("/login");
  }, [navigate]);

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const startGame = (game) => {
    setScore(0);
    setAskedQuestions(new Set());
    setCurrentGame(game);
    setMessages([
      { sender: 'ai', text: `🕹️ Starting the ${game} game at ${level} level. Please wait while I generate a question...` }
    ]);
    getDynamicQuestion(game);
  };

  const getDynamicQuestion = async (type) => {
    const levelPrompts = {
      vocab: {
        beginner: 'Give a beginner vocabulary question with 4 options and correct answer in this format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        intermediate: 'Give an intermediate vocabulary question with 4 options and correct answer in this format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        advanced: 'Give an advanced vocabulary question with 4 options and correct answer in this format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
      },
      grammar: {
        beginner: 'Give a beginner grammar question with 4 options and correct answer in this format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        intermediate: 'Give an intermediate grammar question with 4 options and correct answer in this format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        advanced: 'Give an advanced grammar question with 4 options and correct answer in this format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
      },
      speaking: {
        beginner: 'Give a beginner speaking prompt in format: "Q: ...? | A: ..."',
        intermediate: 'Give an intermediate speaking prompt in format: "Q: ...? | A: ..."',
        advanced: 'Give an advanced speaking prompt in format: "Q: ...? | A: ..."',
      },
    };

    const prompt = levelPrompts[type][level];

    const payload = {
      model,
      messages: [{ role: "user", content: prompt }]
    };

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        const content = data?.choices?.[0]?.message?.content?.trim() || "No content.";
        const lines = content.split('\n').map(line => line.trim());
        const questionLine = lines.find(line => line.startsWith('Q:')) || '';
        const optionLines = lines.filter(line => /^[A-D]\)/.test(line));
        const answerLine = lines.find(line => /^Answer:/.test(line)) || '';

        const question = questionLine.replace(/^Q:\s*/i, '').trim();

        // ✅ FIXED: Remove "A)", "1.", "B:" etc. from answer
        const rawAnswer = answerLine.replace(/^Answer:\s*/i, '').trim();
        // const cleanedAnswer = rawAnswer.replace(/^(\[\d+\]|\(\d+\)|\d+[\.\:\-\s]*|[A-Da-d][\)\.\:\-\s]*)/, '').replace(/^(\.?\s*\[\d+\]|\(\d+\)|\d+[\.\:\-\s]*|[A-Da-d][\)\.\:\-\s]*)/, '').replace(/(\.?\s*\[\d+\]|\(\d+\)|\d+[\.\:\-\s]*|[A-Da-d][\)\.\:\-\s]*)$/, '').replace(/[\[\(]?\d+[\]\)]?/g, '').toLowerCase().trim();
        const cleanedAnswer = rawAnswer
        .replace(/[\[\(]?\d+[\]\)]?/g, '')        // removes [1], (2), 3, etc.
        .replace(/^[A-Da-d][\)\.\:\-\s]*/, '')     // removes A), B., etc.
        .replace(/\s+/g, ' ')                      // trims extra whitespace
        .toLowerCase()
        .trim();
        const answer = cleanedAnswer;

        if (!question || !answer || askedQuestions.has(question)) return getDynamicQuestion(type);

        setPreviousQuestion(currentQuestion);
        setCurrentQuestion(question);
        setCurrentAnswer(answer);
        setOptions(optionLines);
        setAskedQuestions(prev => new Set(prev).add(question));
        setShowOptions(false);

        addMessage("ai", `❓ ${question}\n${optionLines.join('\n')}`);
        speakText(question);

        if (defaultLang !== "english") {
          const translated = await translateToDefaultLang(question);
          addMessage("ai", `🈳 (${languageMap[defaultLang]}): ${translated}`);
        }
      } else {
        addMessage("ai", "❌ Failed to get question. Try again.");
      }
    } catch (error) {
      addMessage("ai", "❌ Network error while generating question.");
    }
  };

  const translateToDefaultLang = async (text) => {
    if (!text || defaultLang === 'english') return text;

    const prompt = `Translate the following English text to ${languageMap[defaultLang]}:\n"${text}"`;
    const payload = { model, messages: [{ role: "user", content: prompt }] };

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      return res.ok ? data?.choices?.[0]?.message?.content?.trim() : "❌ Translation failed.";
    } catch {
      return "❌ Translation error.";
    }
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    const input = userInput.trim();
    addMessage('user', input);

    const normalize = (text) =>
      text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    const normalizedInput = normalize(input);
    const normalizedAnswer = normalize(currentAnswer);

    const isCorrect =
      normalizedInput === normalizedAnswer ||
      normalizedInput === normalizedAnswer.split(' ').slice(1).join(' ');

    if (isCorrect) {
      setScore(prev => prev + 10);
      addMessage('ai', '✅ Correct!\n🎉 You earned +10 points');
      speakText("That's correct! Great job!");
    } else {
      setScore(prev => prev - 1);
      addMessage('ai', `❌ Oops! That's not correct.\n🧠 Correct Answer: ${currentAnswer}\n📉 You lost -1 point`);
      speakText(`That's not correct. The correct answer is ${currentAnswer}`);
    }

    if (defaultLang !== 'english') {
      const translated = await translateToDefaultLang(input);
      addMessage('ai', `🈳 (${languageMap[defaultLang]}): ${translated}`);
    }

    setUserInput('');
    setShowOptions(true);
  };

  const handleNextQuestion = () => {
    setShowOptions(false);
    addMessage("ai", "generating_next"); // use a keyword to apply special style
    getDynamicQuestion(currentGame);
  };

  const handleRepeatQuestion = () => {
    if (currentQuestion && options.length) {
      addMessage("ai", `🔁 Repeating: ${currentQuestion}\n${options.join('\n')}`);
      speakText(currentQuestion);
    }
  };

  const handleRetryPreviousQuestion = () => {
    if (previousQuestion && options.length) {
      addMessage("ai", `♻️ Retrying previous: ${previousQuestion}\n${options.join('\n')}`);
      speakText(previousQuestion);
      setCurrentQuestion(previousQuestion);
    }
  };

  const startSpeech = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = function (event) {
      const spoken = event.results[0][0].transcript;
      setUserInput(spoken);
      setTimeout(() => handleSubmit(), 100);
    };

    recognition.onerror = function () {
      alert('Could not recognize speech.');
    };
  };

  const isActiveButton = (game) => game === currentGame;

  const getButtonStyle = (game) => ({
    padding: '12px 24px',
    backgroundColor: isActiveButton(game) ? '#2ecc71' : '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: '0.3s'
  });

  return (
      <div style={{ padding: '20px', background: 'linear-gradient(to right, #dff9fb, #f9fbe7)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight: '100vh' }}>
      <div style={{ textAlign: 'right' }}>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </div>

      <h1 style={{ textAlign: 'center', color: '#2c3e50', fontSize: '32px' }}>🧠 AI Hero Learning Game</h1>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '10px', marginRight: '10px' }}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)} style={{ padding: '10px' }}>
          <option value="english">English</option>
          <option value="tamil">தமிழ்</option>
          <option value="telugu">తెలుగు</option>
          <option value="kannada">ಕನ್ನಡ</option>
          <option value="malayalam">മലയാളം</option>
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <button onClick={() => startGame('vocab')} style={getButtonStyle('vocab')}>Vocabulary</button>
        <button onClick={() => startGame('grammar')} style={getButtonStyle('grammar')}>Grammar</button>
        <button onClick={() => startGame('speaking')} style={getButtonStyle('speaking')}>Speaking</button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '18px', color: '#34495e', marginBottom: '10px' }}>
        🎯 <strong>Game:</strong> {currentGame} | <strong>Level:</strong> {level} | <strong>Lang:</strong> {languageMap[defaultLang]}
      </div>

      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>
        🧮 Score: {score}
      </div>

      <div id="chat-box" ref={chatBoxRef} style={{
        background: 'rgba(255, 255, 255, 0.7)',
        padding: '20px',
        borderRadius: '16px',
        maxWidth: '800px',
        margin: '20px auto',
        height: '400px',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', margin: '10px 0' }}>
              <div style={{
                background: isUser ? 'linear-gradient(135deg, #81ecec, #6c5ce7)' : 'linear-gradient(135deg, #ffeaa7, #fab1a0)',
                color: '#2d3436',
                padding: '12px 16px',
                borderRadius: '18px',
                maxWidth: '75%',
                fontWeight: 500,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                whiteSpace: 'pre-wrap'
              }}>{msg.text}</div>
            </div>
          );
        })}
      </div>

      {showOptions && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          <button onClick={handleNextQuestion} style={getButtonStyle('')}>✅ Next Question</button>
          <button onClick={handleRepeatQuestion} style={getButtonStyle('')}>🔁 Repeat Same</button>
          <button onClick={handleRetryPreviousQuestion} style={getButtonStyle('')}>♻️ Retry Previous</button>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        maxWidth: '800px',
        margin: '20px auto',
        background: 'white',
        padding: '15px',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <input
          type="text"
          placeholder="🎯 Type your answer..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
        <button onClick={handleSubmit} style={{
          padding: '12px 18px',
          backgroundColor: '#00cec9',
          color: 'white',
          borderRadius: '10px',
          border: 'none',
          fontWeight: 'bold'
        }}>Send</button>
        <button onClick={startSpeech} style={{
          padding: '12px 18px',
          backgroundColor: '#fd79a8',
          color: 'white',
          borderRadius: '10px',
          border: 'none',
          fontWeight: 'bold'
        }}>🎤 Speak</button>
      </div>
    </div>
  );
};

export default Dashboard;
