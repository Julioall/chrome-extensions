const typingIndicator = document.getElementById("typing-indicator");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatTab = document.getElementById("chat-tab");
const settingsTab = document.getElementById("settings-tab");
const chatSection = document.getElementById("chat-section");
const settingsSection = document.getElementById("settings-section");

// Alternar abas
chatTab.addEventListener("click", () => switchTab(chatTab, chatSection));
settingsTab.addEventListener("click", () => switchTab(settingsTab, settingsSection));

function switchTab(tabBtn, section) {
  document.querySelectorAll(".ios-tab").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".ios-section").forEach(sec => sec.classList.remove("active"));
  tabBtn.classList.add("active");
  section.classList.add("active");
}

// Carregar configurações salvas
chrome.storage.sync.get(["apiKey", "contexto"], (data) => {
  if (data.apiKey) document.getElementById("api-key").value = data.apiKey;
  if (data.contexto) document.getElementById("contexto").value = data.contexto;
});

// Salvar configurações
document.getElementById("save-settings").addEventListener("click", () => {
  const apiKey = document.getElementById("api-key").value;
  const contexto = document.getElementById("contexto").value;

  chrome.storage.sync.set({ apiKey, contexto }, () => {
    document.getElementById("status").textContent = "✅ Configurações salvas!";
    setTimeout(() => document.getElementById("status").textContent = "", 2000);
  });
});

// Enviar mensagens
sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const messageText = userInput.value.trim();
  if (!messageText) return;

  appendMessage(messageText, "user-msg");

  userInput.disabled = true;
  sendBtn.disabled = true;
  typingIndicator.style.display = "flex";

  chrome.storage.sync.get(["apiKey", "contexto"], async (data) => {
    if (!data.apiKey || !data.contexto) {
      appendMessage("⚠️ Configure API Key e contexto na aba ⚙️", "bot-msg");
      typingIndicator.style.display = "none";
      userInput.disabled = false;
      sendBtn.disabled = false;
      return;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${data.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: data.contexto },
            { role: "user", content: messageText }
          ]
        })
      });

      const result = await response.json();
      const botReply = result.choices[0].message.content;
      appendMessage(botReply, "bot-msg");
    } catch (error) {
      appendMessage("Erro ao conectar com o servidor", "bot-msg");
    }

    typingIndicator.style.display = "none";
    userInput.value = "";
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  });
}

function appendMessage(text, className) {
  const output = document.getElementById("chat-output");
  const message = document.createElement("div");
  message.className = `message ${className}`;
  message.textContent = text;
  output.appendChild(message);
  output.scrollTop = output.scrollHeight;
}
