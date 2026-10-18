import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiCloudRain,
  FiCpu,
  FiFileText,
  FiMessageSquare,
  FiMic,
  FiMicOff,
  FiPlay,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiSun,
  FiThermometer,
} from "react-icons/fi";

import assistantAPI from "../../api/assistant";

const quickPrompts = [
  "My tomato leaves are turning yellow.",
  "When should I irrigate?",
  "Which crop is best this season?",
  "Why is my crop growing slowly?",
];

const tabs = [
  { id: "chat", label: "Ask Assistant", icon: FiMessageSquare },
  { id: "weather", label: "Weather", icon: FiCloudRain },
  { id: "search", label: "Smart Search", icon: FiSearch },
  { id: "description", label: "Descriptions", icon: FiFileText },
];

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const FeatureCard = ({ title, value, description, icon: Icon, tone = "emerald" }) => {
  const tones = {
    emerald: "from-[#dff7d8] to-[#b8f0b0] text-[#0f4c1e]",
    gold: "from-[#fdf4c7] to-[#f7df8c] text-[#7a5600]",
    sand: "from-[#f5efe5] to-[#e8dcc7] text-[#5b4630]",
    mint: "from-[#ecfbf2] to-[#d3f4df] text-[#135b33]",
  };

  return (
    <div className={`rounded-3xl border border-white/60 bg-linear-to-br ${tones[tone]} p-5 shadow-[0_18px_50px_rgba(8,63,24,0.08)]`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{value}</h3>
          <p className="mt-2 text-sm leading-6 opacity-80">{description}</p>
        </div>
        <div className="rounded-2xl bg-white/55 p-3 shadow-sm">
          <Icon className="text-2xl" />
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] rounded-[28px] px-5 py-4 shadow-sm ${isUser ? "bg-[#012d1d] text-white" : "bg-white text-[#1d3328] border border-emerald-100"}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] opacity-70">
          {isUser ? "You" : "Assistant"}
          {message.intent?.label ? <span>• {message.intent.label}</span> : null}
        </div>
        <p className="mt-2 whitespace-pre-line text-[15px] leading-7">{message.content}</p>

        {message.entities && Object.keys(message.entities).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(message.entities).map(([key, value]) => (
              <span key={key} className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium capitalize text-inherit">
                {key.replace(/_/g, " ")}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SmartAgriAssistant = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Ask me about crop diseases, irrigation timing, weather, semantic marketplace search, or product descriptions.",
      intent: { label: "Ready", slug: "general_farming" },
      entities: {},
    },
  ]);
  const [chatDetails, setChatDetails] = useState(null);
  const [weatherForm, setWeatherForm] = useState({ location: "" });
  const [weatherResult, setWeatherResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [descriptionForm, setDescriptionForm] = useState({
    title: "Organic Tomato",
    category: "Fresh Vegetables",
    tone: "trusted",
    highlights: "Fresh, no pesticides, handpicked, farm grown",
  });
  const [generatedDescription, setGeneratedDescription] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages]);

  const speak = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startVoice = () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setChatDetails({ error: "Voice input is not supported in this browser." });
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) setChatInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const sendChat = async (message) => {
    const nextMessage = (message || chatInput).trim();
    if (!nextMessage || chatLoading) return;

    setChatLoading(true);
    setChatInput("");
    setChatMessages((current) => [...current, { role: "user", content: nextMessage }]);

    try {
      const response = await assistantAPI.chat({ message: nextMessage });
      const assistantText = response?.response || "I could not generate a response right now.";

      setChatDetails(response);
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: assistantText,
          intent: response?.intent,
          entities: response?.entities || {},
        },
      ]);
    } catch (error) {
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error?.response?.data?.detail || "The assistant could not answer that request right now.",
          intent: { label: "Error", slug: "error" },
          entities: {},
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const loadWeather = async () => {
    if (!weatherForm.location.trim()) return;
    setWeatherLoading(true);

    try {
      const result = await assistantAPI.weather({ location: weatherForm.location.trim() });
      setWeatherResult(result);
    } catch (error) {
      setWeatherResult({ detail: error?.response?.data?.detail || "Weather lookup failed." });
    } finally {
      setWeatherLoading(false);
    }
  };

  const runSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);

    try {
      const result = await assistantAPI.search(searchQuery.trim());
      setSearchResults(Array.isArray(result?.results) ? result.results : []);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const generateDescription = async () => {
    if (!descriptionForm.title.trim()) return;
    setDescriptionLoading(true);

    try {
      const result = await assistantAPI.generateDescription(descriptionForm);
      setGeneratedDescription(result?.generated_description || "");
    } catch (error) {
      setGeneratedDescription(error?.response?.data?.detail || "Description generation failed.");
    } finally {
      setDescriptionLoading(false);
    }
  };

  const featureStats = useMemo(
    () => [
      { title: "Natural Language", value: "NLP", description: "Intent detection and entity extraction for farmer questions.", icon: FiCpu, tone: "emerald" },
      { title: "Weather-aware", value: "Live", description: "Forecast-driven irrigation guidance with rainfall probability.", icon: FiCloudRain, tone: "gold" },
      { title: "Marketplace Search", value: "Semantic", description: "Find products by benefit, use case, and crop need.", icon: FiSearch, tone: "sand" },
      { title: "Product Copy", value: "Auto-write", description: "Generate polished descriptions for listings in seconds.", icon: FiFileText, tone: "mint" },
    ],
    []
  );

  return (
    <div className="relative pb-20">
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-[40px]">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#a4f792]/30 blur-3xl" />
        <div className="absolute -right-16 top-32 h-96 w-96 rounded-full bg-[#f8d97d]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#dbeed3]/25 blur-3xl" />
      </div>

      <section className="relative overflow-hidden rounded-[34px] border border-white/70 bg-linear-to-br from-[#0b2f1f] via-[#154c2f] to-[#1f6d1a] px-8 py-10 text-white shadow-[0_30px_100px_rgba(12,54,28,0.28)]">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            <FiSun /> Smart Agricultural Assistant
          </div>
          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight md:text-6xl">
            Ask in plain language. Get farm-ready answers.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
            Use one assistant for crop health, irrigation timing, weather, semantic marketplace search, voice input, and automatic product descriptions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setChatInput(prompt);
                  setActiveTab("chat");
                }}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-white/15"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {featureStats.map((item) => (
          <FeatureCard key={item.title} {...item} />
        ))}
      </div>

      <div className="mt-8 rounded-[34px] border border-white/60 bg-white/80 p-4 shadow-[0_20px_70px_rgba(13,43,22,0.08)] backdrop-blur">
        <div className="flex flex-wrap gap-3 border-b border-emerald-100 px-2 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[#012d1d] text-white shadow-lg shadow-emerald-950/20"
                    : "bg-[#f6fbf6] text-[#345243] hover:bg-[#edf7ed]"
                }`}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-2 md:p-4">
          {activeTab === "chat" && (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[30px] border border-emerald-100 bg-[#fbfefb] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1f6d1a]">Conversation</p>
                    <h2 className="mt-2 text-3xl font-black text-[#012d1d]">Farmer AI chat</h2>
                  </div>
                  <button
                    type="button"
                    onClick={startVoice}
                    className="inline-flex items-center gap-2 rounded-full bg-[#e9f7e6] px-4 py-2 text-sm font-semibold text-[#135b33] transition hover:bg-[#def1d9]"
                  >
                    {listening ? <FiMicOff /> : <FiMic />}
                    {listening ? "Listening..." : "Voice"}
                  </button>
                </div>

                <div className="mt-6 space-y-4 rounded-[28px] bg-white p-4 shadow-inner shadow-emerald-50">
                  <div className="max-h-115 space-y-4 overflow-y-auto pr-1">
                    {chatMessages.map((message, index) => (
                      <MessageBubble key={`${message.role}-${index}`} message={message} />
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="rounded-[26px] border border-emerald-100 bg-[#f8fbf8] p-4">
                    <textarea
                      rows="4"
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder="Ask anything like: My tomato leaves are turning yellow."
                      className="w-full resize-none rounded-[22px] border border-emerald-100 bg-white px-4 py-4 text-[#143326] outline-none transition focus:border-[#1f6d1a]"
                    />

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => sendChat()}
                        disabled={chatLoading}
                        className="inline-flex items-center gap-2 rounded-full bg-[#012d1d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3d28] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {chatLoading ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                        Ask Assistant
                      </button>

                      <button
                        type="button"
                        onClick={() => speak(chatDetails?.response || chatMessages.at(-1)?.content || "")}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-[#135b33] transition hover:bg-[#f1fbef]"
                      >
                        <FiPlay />
                        Speak Result
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 rounded-[30px] border border-emerald-100 bg-white p-5">
                <div className="rounded-[26px] bg-linear-to-br from-[#0b2f1f] to-[#1f6d1a] p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/15 p-3">
                      <FiCpu />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/70">Intent</p>
                      <h3 className="mt-1 text-2xl font-black">{chatDetails?.intent?.label || "Ready for a query"}</h3>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-white/60">Confidence</p>
                      <p className="mt-1 text-2xl font-black">{chatDetails?.intent?.confidence || 0}%</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-white/60">Pipeline</p>
                      <p className="mt-1 text-2xl font-black">6 steps</p>
                    </div>
                  </div>
                </div>

                <SectionBlock title="Possible Causes" items={chatDetails?.possible_causes || []} emptyText="Ask about crop symptoms to see likely causes." />
                <SectionBlock title="Recommended Actions" items={chatDetails?.recommended_actions || []} emptyText="The assistant will return next steps here." accent="green" />
                <SectionBlock title="Knowledge Base Matches" items={(chatDetails?.support_articles || []).map((item) => `${item.question} - ${item.category}`)} emptyText="Related support articles will appear here." />
              </div>
            </div>
          )}

          {activeTab === "weather" && (
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[30px] border border-emerald-100 bg-[#fbfefb] p-6">
                <h2 className="text-3xl font-black text-[#012d1d]">Weather-aware irrigation</h2>
                <p className="mt-3 text-sm leading-7 text-gray-600">Use a city name or village to fetch tomorrow&apos;s rain probability and a watering recommendation.</p>

                <div className="mt-6 space-y-4">
                  <input
                    value={weatherForm.location}
                    onChange={(event) => setWeatherForm({ location: event.target.value })}
                    placeholder="Enter city or location"
                    className="w-full rounded-[22px] border border-emerald-100 bg-white px-4 py-4 outline-none focus:border-[#1f6d1a]"
                  />
                  <button
                    type="button"
                    onClick={loadWeather}
                    disabled={weatherLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#012d1d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3d28] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {weatherLoading ? <FiRefreshCw className="animate-spin" /> : <FiCloudRain />}
                    Get Forecast
                  </button>
                </div>
              </div>

              <div className="rounded-[30px] border border-emerald-100 bg-white p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <WeatherCard title="Rain chance" value={weatherResult?.rain_probability ?? "--"} unit="%" icon={FiCloudRain} />
                  <WeatherCard title="High temp" value={weatherResult?.temperature_max ?? "--"} unit="°C" icon={FiThermometer} />
                  <WeatherCard title="Low temp" value={weatherResult?.temperature_min ?? "--"} unit="°C" icon={FiSun} />
                </div>

                <div className="mt-6 rounded-[28px] bg-[#f8fbf8] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1f6d1a]">Recommendation</p>
                  <p className="mt-3 text-lg leading-8 text-[#203a2d]">
                    {weatherResult?.recommendation || weatherResult?.detail || "Enter a location to see live rain guidance for tomorrow."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded-[30px] border border-emerald-100 bg-[#fbfefb] p-6">
                <h2 className="text-3xl font-black text-[#012d1d]">Marketplace smart search</h2>
                <p className="mt-3 text-sm leading-7 text-gray-600">Search by need, benefit, or use case instead of only product names.</p>

                <div className="mt-6 space-y-4">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="e.g. protein rich grains or vegetables good for diabetes"
                    className="w-full rounded-[22px] border border-emerald-100 bg-white px-4 py-4 outline-none focus:border-[#1f6d1a]"
                  />
                  <button
                    type="button"
                    onClick={runSearch}
                    disabled={searchLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#012d1d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3d28] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {searchLoading ? <FiRefreshCw className="animate-spin" /> : <FiSearch />}
                    Search Products
                  </button>
                </div>
              </div>

              <div className="rounded-[30px] border border-emerald-100 bg-white p-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <article key={product.id} className="overflow-hidden rounded-[26px] border border-emerald-100 bg-[#f8fbf8]">
                        <div className="aspect-4/3 bg-linear-to-br from-[#dff7d8] to-[#f7efd6]">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-black text-[#012d1d]">{product.title}</h3>
                              <p className="mt-1 text-sm text-gray-500">{product.category?.name || "Uncategorized"}</p>
                            </div>
                            <span className="rounded-full bg-[#eaf7e7] px-3 py-1 text-xs font-bold text-[#1f6d1a]">
                              {product.match_confidence}%
                            </span>
                          </div>
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{product.description || "Fresh marketplace product."}</p>
                          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[#012d1d]">
                            <span>₹{product.price}</span>
                            <span>{product.quantity_available} available</span>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="col-span-full rounded-[26px] border border-dashed border-emerald-200 bg-[#fbfefb] p-8 text-center text-gray-500">
                      Run a semantic search to see ranked products here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "description" && (
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[30px] border border-emerald-100 bg-[#fbfefb] p-6">
                <h2 className="text-3xl font-black text-[#012d1d]">Automatic product description</h2>
                <p className="mt-3 text-sm leading-7 text-gray-600">Create polished listings from a title, category, tone, and a few highlights.</p>

                <div className="mt-6 space-y-4">
                  <input
                    value={descriptionForm.title}
                    onChange={(event) => setDescriptionForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Product title"
                    className="w-full rounded-[22px] border border-emerald-100 bg-white px-4 py-4 outline-none focus:border-[#1f6d1a]"
                  />
                  <input
                    value={descriptionForm.category}
                    onChange={(event) => setDescriptionForm((current) => ({ ...current, category: event.target.value }))}
                    placeholder="Category"
                    className="w-full rounded-[22px] border border-emerald-100 bg-white px-4 py-4 outline-none focus:border-[#1f6d1a]"
                  />
                  <input
                    value={descriptionForm.tone}
                    onChange={(event) => setDescriptionForm((current) => ({ ...current, tone: event.target.value }))}
                    placeholder="Tone"
                    className="w-full rounded-[22px] border border-emerald-100 bg-white px-4 py-4 outline-none focus:border-[#1f6d1a]"
                  />
                  <textarea
                    rows="5"
                    value={descriptionForm.highlights}
                    onChange={(event) => setDescriptionForm((current) => ({ ...current, highlights: event.target.value }))}
                    placeholder="Fresh, pesticide-free, handpicked, farm grown"
                    className="w-full resize-none rounded-[22px] border border-emerald-100 bg-white px-4 py-4 outline-none focus:border-[#1f6d1a]"
                  />
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={descriptionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#012d1d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3d28] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {descriptionLoading ? <FiRefreshCw className="animate-spin" /> : <FiFileText />}
                    Generate Description
                  </button>
                </div>
              </div>

              <div className="rounded-[30px] border border-emerald-100 bg-white p-6">
                <div className="rounded-[28px] bg-[#f8fbf8] p-6">
                  <div className="flex items-center gap-3 text-[#1f6d1a]">
                    <FiArrowRight />
                    <span className="text-xs font-semibold uppercase tracking-[0.22em]">Generated copy</span>
                  </div>
                  <h3 className="mt-3 text-3xl font-black text-[#012d1d]">{descriptionForm.title}</h3>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-[#30453b]">
                    {generatedDescription || "The generated description will appear here after you click the button."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionBlock = ({ title, items, emptyText, accent = "olive" }) => {
  const accentClass = accent === "green" ? "text-[#1f6d1a]" : "text-[#012d1d]";

  return (
    <div className="rounded-[26px] border border-emerald-100 bg-[#fdfefe] p-5">
      <h3 className={`text-sm font-semibold uppercase tracking-[0.22em] ${accentClass}`}>{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="rounded-2xl bg-[#f7fbf7] px-4 py-3 text-sm leading-6 text-[#203a2d]">
              {item}
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-[#f7fbf7] px-4 py-3 text-sm leading-6 text-gray-500">{emptyText}</p>
        )}
      </div>
    </div>
  );
};

const WeatherCard = ({ title, value, unit, icon: Icon }) => (
  <div className="rounded-[26px] bg-linear-to-br from-[#eaf8e6] to-[#f7fbef] p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-3xl font-black text-[#012d1d]">
          {value}
          <span className="text-lg font-semibold text-gray-500">{unit}</span>
        </p>
      </div>
      <div className="rounded-2xl bg-white p-3 text-[#1f6d1a] shadow-sm">
        <Icon className="text-xl" />
      </div>
    </div>
  </div>
);

export default SmartAgriAssistant;