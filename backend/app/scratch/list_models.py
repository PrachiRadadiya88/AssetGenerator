
import os
from google import genai
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)
print("Listing models...")
for model in client.models.list():
    if "veo" in model.name.lower():
        print(f"Name: {model.name}, Supported: {model.supported_actions}")
