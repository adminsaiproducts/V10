from typing import Literal
import google.generativeai as genai
from openai import OpenAI
from anthropic import Anthropic
from .config import GOOGLE_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY

class AISquad:
    def __init__(self):
        # 🧠 Planner: Gemini
        if GOOGLE_API_KEY:
            genai.configure(api_key=GOOGLE_API_KEY)
            self.gemini = genai.GenerativeModel("gemini-pro")
        
        # 🔨 Builder: Claude
        if ANTHROPIC_API_KEY:
            self.claude = Anthropic(api_key=ANTHROPIC_API_KEY)
            
        # ⚖️ Auditor: ChatGPT
        if OPENAI_API_KEY:
            self.chatgpt = OpenAI(api_key=OPENAI_API_KEY)

    def call(self, role: Literal["planner", "builder", "auditor"], prompt: str) -> str:
        print(f"🤖 Calling {role.upper()}...")
        
        if role == "planner": # Gemini 3.0 Pro
            resp = self.gemini.generate_content(prompt)
            return resp.text
            
        elif role == "builder": # Claude Code (Sonnet 3.5)
            msg = self.claude.messages.create(
                model="claude-3-5-sonnet-latest",
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}]
            )
            return msg.content[0].text
            
        elif role == "auditor": # ChatGPT (GPT-4o)
            resp = self.chatgpt.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}]
            )
            return resp.choices[0].message.content
        
        return "Error: Unknown Role"
