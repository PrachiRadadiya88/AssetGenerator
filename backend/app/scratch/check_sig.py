
from google.genai import operations
import inspect

# Note: google.genai client operations might be different
from google.genai import client
c = client.Client(api_key="test")
print("Operations.get signature:", inspect.signature(c.operations.get))
