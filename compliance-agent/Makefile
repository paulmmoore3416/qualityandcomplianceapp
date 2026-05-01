.PHONY: help install test lint format clean docker-build docker-up docker-down run validate

# Default target
help:
	@echo "Compliance Agent - Available Commands"
	@echo "======================================"
	@echo "validate       - Validate integration with main app"
	@echo "install        - Install dependencies"
	@echo "test           - Run tests"
	@echo "test-cov       - Run tests with coverage"
	@echo "lint           - Run linters"
	@echo "format         - Format code"
	@echo "clean          - Clean generated files"
	@echo "docker-build   - Build Docker image"
	@echo "docker-up      - Start Docker containers"
	@echo "docker-down    - Stop Docker containers"
	@echo "docker-logs    - View Docker logs"
	@echo "run            - Run agent locally"
	@echo "setup          - Initial setup (install + config)"
	@echo "search         - Search compliance reports"
	@echo "git-diff       - Analyze git changes"

# Installation
install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements.txt
	pip install pytest pytest-cov black flake8 mypy isort

# Setup
setup: install
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file - please configure it"; \
	fi
	@echo "Setup complete!"

# Testing
test:
	pytest tests/ -v

test-cov:
	pytest tests/ --cov=. --cov-report=html --cov-report=term

# Code quality
lint:
	flake8 *.py --max-line-length=100 --ignore=E501,W503
	mypy *.py --ignore-missing-imports

format:
	black *.py
	isort *.py

# Cleaning
clean:
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf htmlcov
	rm -rf .coverage
	rm -rf *.egg-info
	rm -rf dist
	rm -rf build
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

clean-all: clean
	rm -rf chroma_db/
	rm -rf compliance-reports/
	rm -rf logs/
	rm -f compliance-agent.log

# Docker
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-restart: docker-down docker-up

# Running
run:
	python3 main.py

# Search reports
search:
	python3 search_reports.py $(ARGS)

search-stats:
	python3 search_reports.py --stats

# Git analysis
git-diff:
	python3 git_analyzer.py $(ARGS)

git-summary:
	python3 git_analyzer.py --summary

# Ollama setup
ollama-setup:
	@echo "Pulling required Ollama models..."
	ollama pull granite-code:8b
	ollama pull mistral-nemo:12b
	ollama pull mxbai-embed-large
	@echo "Ollama models ready!"

# Validation
validate:
	@python3 validate_integration.py

validate-config:
	@python3 -c "from config import Config; Config.validate(); print('✓ Configuration valid')"

# Statistics
stats:
	@echo "Code Statistics"
	@echo "==============="
	@find . -name "*.py" -not -path "./venv/*" -not -path "./.venv/*" | xargs wc -l
	@echo ""
	@echo "Test Coverage"
	@echo "============="
	@pytest tests/ --cov=. --cov-report=term-missing --quiet

# Development
dev: install-dev setup
	@echo "Development environment ready!"
	@echo "Run 'make run' to start the agent"