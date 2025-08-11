import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAICredentials } from "../utils/googleSheet";

const Dashboard = () => {
  const [currentGame, setCurrentGame] = useState('');
  const [level, setLevel] = useState('beginner');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '👉 Click a game to begin! Choose from Vocabulary, Grammar, or Speaking.' },
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
  const [isFetching, setIsFetching] = useState(false); 
  const [hasSpokenOnce, setHasSpokenOnce] = useState(false);

  const chatBoxRef = useRef(null);
  const navigate = useNavigate();

  // const apiKey = "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";
  // const model = "sonar-pro";
  // const apiUrl = "https://api.perplexity.ai/chat/completions";

  const apiKey = "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";
  const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  // const model = "mistralai/mistral-7b-instruct:free";
  const model = "openai/gpt-3.5-turbo";
  
//  const { apiKey, apiUrl, model } = getAICredentials();

   


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
    setHasSpokenOnce(false); 
    setMessages([
      { sender: 'ai', text: `🕹️ Starting the ${game} game at ${level} level. Please wait while I generate a question...` }
    ]);
    getDynamicQuestion(game);
  };

  //  const startGame = (game) => {
  //     if (!game) {
  //       alert('Please select a game before starting.');
  //       return;
  //     }
  //     setScore(0);
  //     setAskedQuestions(new Set());
  //     setCurrentGame(game);
  //     setHasSpokenOnce(false);
  //     setMessages([
  //       { sender: 'ai', text: `🕹️ Starting the ${game} game at ${level} level. Please wait while I generate a question...` }
  //     ]);
  //     getDynamicQuestion(game);
  //   };


  const getDynamicQuestion = async (type) => {
    if (isFetching) return; // ✅ prevent duplicate API calls
    setIsFetching(true);    // ✅ lock the request

    const levelPrompts = {
      vocab: {
        beginner: 'Give a beginner vocabulary question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        intermediate: 'Give an intermediate vocabulary question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        advanced: 'Give an advanced vocabulary question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...'
      },
      grammar: {
        beginner: 'Give a beginner grammar question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        intermediate: 'Give an intermediate grammar question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        advanced: 'Give an advanced grammar question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...'
      },
      speaking: {
        beginner: 'Give a beginner speaking question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        intermediate: 'Give an intermediate speaking question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
        advanced: 'Give an advanced speaking question with 4 options and correct answer in format:\nQ: ...?\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: ...',
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
        const rawAnswer = answerLine.replace(/^Answer:\s*/i, '').trim();
        const cleanedAnswer = rawAnswer
          .replace(/[\[\(]?\d+[\]\)]?/g, '')
          .replace(/^[A-Da-d][\)\.\:\-\s]*/, '')
          .replace(/\s+/g, ' ')
          .toLowerCase()
          .trim();

        const answer = cleanedAnswer;

        if (!question || !answer || askedQuestions.has(question)) {
          setIsFetching(false);
          return getDynamicQuestion(type);
        }

        setPreviousQuestion(currentQuestion);
        setCurrentQuestion(question);
        setCurrentAnswer(answer);
        setOptions(optionLines);
        setAskedQuestions(prev => new Set(prev).add(question));
        setShowOptions(false);

        addMessage("ai", `AI:Questions❓: ${question}\n${optionLines.join('\n')}`);
        speakText(question);

        //  addMessage("ai", (
        //   <div>
        //     <span style={{ color: '#00cec9', fontWeight: 'bold' }}>AI: Questions:</span> {question}
        //     <br />
        //     {optionLines.map((opt, i) => (
        //       <div key={i} style={{ marginLeft: '12px' }}>{opt}</div>
        //     ))}
        //   </div>
        // ));

        addMessage("ai", (
          <div>
            <span style={{ color: '#00cec9'}}>AI:  </span ><span style={{ color: '#c0ce00ff', fontWeight: 'bold' }}>{question}</span >
            <br />
            {optionLines.map((opt, i) => {
              const colors = [
                'linear-gradient(to right, #fbfcfcff, #00cec9ff)',
                'linear-gradient(90deg, #dfe6e6ff, #c0ce00ff)',
                'linear-gradient(to right, #fbfcfcff, #00cec9ff)',
                'linear-gradient(90deg, #dfe6e6ff, #c0ce00ff)'
              ];


              return (
                <div
                  key={i}
                  style={{
                    marginLeft: '12px',
                    background: colors[i % colors.length],
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '600',
                    fontSize: '1rem',
                    marginBottom: '6px',
                    cursor: 'default',
                    userSelect: 'none',
                  }}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        ));


        if (defaultLang !== "english") {
          const translated = await translateToDefaultLang(question);
          addMessage("ai", `🈳 (${languageMap[defaultLang]}): ${translated}`);
        }
      } else {
        addMessage("ai", "❌ Failed to get question. Try again.");
      }
    } catch (error) {
      addMessage("ai", "❌ Network error while generating question.");
    } finally {
      setIsFetching(false); // ✅ always release lock
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
    if (!isFetching) {
      setShowOptions(false);
      addMessage("ai", "⏳ Generating your next question...");
      getDynamicQuestion(currentGame);
    }
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
    background: isActiveButton(game)
      ? 'linear-gradient(to right, #00b894, #00cec9)'
      : 'linear-gradient(to right, #6c5ce7, #341f97)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: '0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  });

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      minHeight: '100vh',
      color: '#ecf0f1'
    }}>
      <div style={{ textAlign: 'right' }}>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </div>

      <h1 style={{ textAlign: 'center', color: '#ffeaa7', fontSize: '32px' }}>🧠 AI Hero Learning Game</h1>

      <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '10px 16px',borderRadius: '8px', background: 'linear-gradient(145deg, #2c3e50, #34495e)', color: '#ecf0f1', border: '1px solid #7f8c8d', fontSize: '16px', boxShadow: '0 4px 12px rgba(250, 250, 250, 0.2)', cursor: 'pointer' }}>
          <option style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }} value="beginner">Beginner</option>
          <option style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }} value="intermediate">Intermediate</option>
          <option style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }} value="advanced">Advanced</option>
        </select>

        <select value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)} style={{ padding: '10px 16px',borderRadius: '8px', background: 'linear-gradient(145deg, #2c3e50, #34495e)', color: '#ecf0f1', border: '1px solid #7f8c8d', fontSize: '16px', boxShadow: '0 4px 12px rgba(250, 250, 250, 0.2)', cursor: 'pointer'  }}>
          <option style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }} value="english">English</option>
          <option style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }} value="tamil">தமிழ்</option>
          <option style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }} value="telugu">తెలుగు</option>
          <option style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }} value="kannada">ಕನ್ನಡ</option>
          <option style={{ backgroundColor: '#2c3e50', color: '#ecf0f1' }} value="malayalam">മലയാളം</option>
        </select>
      </div>


      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', margin: '20px 0' }}>
        <button onClick={() => startGame('vocab')} style={getButtonStyle('vocab')}>Vocabulary</button>
        <button onClick={() => startGame('grammar')} style={getButtonStyle('grammar')}>Grammar</button>
        <button onClick={() => startGame('speaking')} style={getButtonStyle('speaking')}>Speaking</button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '18px', color: '#f1f1f1', padding: '12px 24px', borderRadius: '12px',margin: '20px auto 10px', maxWidth: '90%', letterSpacing: '0.5px',fontWeight: 500 }}>
        {/* 🎯 <strong>Game:</strong> {currentGame} | <strong>Level:</strong> {level} | <strong>Lang:</strong> {languageMap[defaultLang]} */}

            <span style={{ color: '#bdc3c7' }}>Game:</span>
            <span style={{ color: '#00cec9', fontWeight: 'bold' }}> {currentGame || 'None'}</span> |
            <span style={{ color: '#bdc3c7' }}> Level:</span>
            <span style={{ color: '#00cec9', fontWeight: 'bold' }}> {level}</span> |
            <span style={{ color: '#bdc3c7' }}> Translate:</span>
            <span style={{ color: '#00cec9', fontWeight: 'bold'}}> {languageMap[defaultLang]}</span>
      </div>

      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>
        🧮 Score: {score}
      </div>

      <div id="chat-box" ref={chatBoxRef} style={{
        background: 'linear-gradient(145deg, #1e1e2f, #121212)',
        padding: '20px',
        borderRadius: '16px',
        maxWidth: '800px',
        margin: '20px auto',
        height: '400px',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        color: '#ecf0f1'
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', margin: '10px 0' }}>
              <div style={{
                background: isUser ? 'linear-gradient(135deg, #00b894, #0984e3)' : 'linear-gradient(135deg, #636e72, #2d3436)',
                color: '#f1f2f6',
                padding: '12px 16px',
                borderRadius: '18px',
                maxWidth: '75%',
                fontWeight: 500,
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                whiteSpace: 'pre-wrap'
              }}>{msg.text}</div>
            </div>
          );
        })}
      </div>

      {showOptions && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleNextQuestion} style={getButtonStyle('')}>✅ Next Question</button>
          <button onClick={handleRepeatQuestion} style={getButtonStyle('')}>🔁 Repeat</button>
          <button onClick={handleRetryPreviousQuestion} style={getButtonStyle('')}>♻️ Retry</button>
          
        </div>
      )}

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        maxWidth: '800px',
        margin: '20px auto',
        background: 'linear-gradient(to right, #2c3e50, #4ca1af)',
        padding: '15px',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
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
            border: '1px solid #555',
            fontSize: '16px',
            backgroundColor: '#2d3436',
            color: '#ecf0f1'
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
