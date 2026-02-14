
echo "Checking Ollama..."
ollama list

echo "Pulling models..."
ollama pull nomic-embed-text
ollama pull gemma:2b

echo "Setup complete. Please restart your backend server."
