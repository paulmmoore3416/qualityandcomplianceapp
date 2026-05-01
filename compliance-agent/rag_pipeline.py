import os
import logging
import hashlib
import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.schema import Document
from config import Config

logger = logging.getLogger(__name__)


class RAGPipelineError(Exception):
    """Raised when RAG pipeline encounters an error."""
    pass


class RAGPipeline:
    """Enhanced RAG pipeline with caching, incremental updates, and better error handling."""
    
    def __init__(self):
        """Initialize RAG pipeline with embeddings and vector store."""
        try:
            self.embeddings = OllamaEmbeddings(
                base_url=Config.OLLAMA_BASE_URL,
                model=Config.EMBEDDING_MODEL
            )
            
            self.vectorstore = Chroma(
                persist_directory=str(Config.CHROMA_DB_PATH),
                embedding_function=self.embeddings
            )
            
            self.cache_file = Config.CHROMA_DB_PATH / "ingestion_cache.json"
            self.cache = self._load_cache()
            
            logger.info("RAG pipeline initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize RAG pipeline: {e}")
            raise RAGPipelineError(f"RAG initialization failed: {e}")
    
    def _load_cache(self) -> Dict[str, str]:
        """Load ingestion cache to track processed files."""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Could not load cache: {e}")
        return {}
    
    def _save_cache(self):
        """Save ingestion cache."""
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save cache: {e}")
    
    def _get_file_hash(self, file_path: Path) -> str:
        """Calculate hash of file content for change detection."""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except Exception as e:
            logger.warning(f"Could not hash file {file_path}: {e}")
            return ""
    
    def _should_process_file(self, file_path: Path) -> bool:
        """Check if file should be processed based on cache."""
        if not Config.ENABLE_CACHING:
            return True
        
        file_str = str(file_path)
        current_hash = self._get_file_hash(file_path)
        
        if file_str not in self.cache:
            return True
        
        return self.cache[file_str] != current_hash
    
    def _update_cache(self, file_path: Path):
        """Update cache with file hash."""
        if Config.ENABLE_CACHING:
            self.cache[str(file_path)] = self._get_file_hash(file_path)
    
    def ingest_repo(self, repo_path: Path, force: bool = False):
        """
        Ingest repository with incremental updates.
        
        Args:
            repo_path: Path to repository
            force: Force re-ingestion of all files
        """
        logger.info(f"Starting repository ingestion: {repo_path}")
        
        if force:
            logger.info("Force mode: clearing cache")
            self.cache = {}
        
        # Define file patterns to ingest
        patterns = {
            "**/*.ts": "TypeScript",
            "**/*.tsx": "TypeScript React",
            "**/*.js": "JavaScript",
            "**/*.jsx": "JavaScript React",
            "**/*.py": "Python",
            "**/*.md": "Markdown",
            "**/*.java": "Java",
            "**/*.cpp": "C++",
            "**/*.c": "C",
            "**/*.h": "Header",
            "**/*.cs": "C#",
            "**/*.go": "Go",
            "**/*.rs": "Rust",
            "**/*.vue": "Vue",
            "**/*.swift": "Swift",
            "**/*.kt": "Kotlin",
            "**/*.rb": "Ruby",
            "**/*.php": "PHP",
            "**/*.scala": "Scala"
        }
        
        all_docs = []
        processed_count = 0
        skipped_count = 0
        error_count = 0
        
        for pattern, file_type in patterns.items():
            try:
                files = list(Path(repo_path).glob(pattern))
                logger.info(f"Found {len(files)} {file_type} files")
                
                for file_path in files:
                    # Skip ignored patterns
                    if self._should_ignore(file_path):
                        continue
                    
                    # Check cache
                    if not force and not self._should_process_file(file_path):
                        skipped_count += 1
                        continue
                    
                    try:
                        docs = self._load_file(file_path, file_type)
                        all_docs.extend(docs)
                        self._update_cache(file_path)
                        processed_count += 1
                    except Exception as e:
                        logger.warning(f"Error loading {file_path}: {e}")
                        error_count += 1
                        
            except Exception as e:
                logger.error(f"Error processing pattern {pattern}: {e}")
        
        # Split documents
        if all_docs:
            logger.info(f"Splitting {len(all_docs)} documents into chunks")
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=Config.CHUNK_SIZE,
                chunk_overlap=Config.CHUNK_OVERLAP,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            splits = text_splitter.split_documents(all_docs)
            
            logger.info(f"Adding {len(splits)} chunks to vector store")
            try:
                self.vectorstore.add_documents(documents=splits)
                self._save_cache()
                logger.info(f"Ingestion complete: {processed_count} processed, {skipped_count} skipped, {error_count} errors")
            except Exception as e:
                logger.error(f"Failed to add documents to vector store: {e}")
                raise RAGPipelineError(f"Vector store update failed: {e}")
        else:
            logger.warning("No documents to ingest")
    
    def _should_ignore(self, file_path: Path) -> bool:
        """Check if file should be ignored based on patterns."""
        path_str = str(file_path)
        for pattern in Config.IGNORE_PATTERNS:
            if pattern in path_str:
                return True
        return False
    
    def _load_file(self, file_path: Path, file_type: str) -> List[Document]:
        """Load a single file with metadata."""
        try:
            # Check file size
            file_size_mb = file_path.stat().st_size / (1024 * 1024)
            if file_size_mb > Config.MAX_FILE_SIZE_MB:
                logger.warning(f"Skipping large file {file_path} ({file_size_mb:.2f} MB)")
                return []
            
            loader = TextLoader(str(file_path), encoding='utf-8')
            docs = loader.load()
            
            # Add metadata
            for doc in docs:
                doc.metadata.update({
                    'file_type': file_type,
                    'file_path': str(file_path),
                    'file_name': file_path.name,
                    'file_size': file_size_mb
                })
            
            return docs
        except Exception as e:
            logger.warning(f"Could not load {file_path}: {e}")
            return []
    
    def query(
        self, 
        question: str, 
        k: Optional[int] = None,
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """
        Query the vector store for relevant documents.
        
        Args:
            question: Query text
            k: Number of results to return
            filter_dict: Optional metadata filters
            
        Returns:
            List of relevant documents
        """
        k = k or Config.RAG_TOP_K
        
        try:
            logger.debug(f"Querying vector store: '{question[:50]}...' (k={k})")
            
            if filter_dict:
                results = self.vectorstore.similarity_search(
                    question, 
                    k=k,
                    filter=filter_dict
                )
            else:
                results = self.vectorstore.similarity_search(question, k=k)
            
            logger.debug(f"Found {len(results)} relevant documents")
            return results
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return []
    
    def query_with_scores(
        self, 
        question: str, 
        k: Optional[int] = None
    ) -> List[tuple[Document, float]]:
        """
        Query with similarity scores.
        
        Args:
            question: Query text
            k: Number of results to return
            
        Returns:
            List of (document, score) tuples
        """
        k = k or Config.RAG_TOP_K
        
        try:
            results = self.vectorstore.similarity_search_with_score(question, k=k)
            logger.debug(f"Found {len(results)} documents with scores")
            return results
        except Exception as e:
            logger.error(f"Query with scores failed: {e}")
            return []
    
    def get_relevant_context(
        self, 
        file_path: str, 
        change_description: str = ""
    ) -> str:
        """
        Get relevant regulatory context for a file change.
        
        Args:
            file_path: Path to changed file
            change_description: Description of the change
            
        Returns:
            Formatted context string
        """
        file_name = Path(file_path).name
        file_ext = Path(file_path).suffix
        
        # Build query
        query_parts = [
            f"Regulatory requirements for {file_ext} files",
            f"Compliance considerations for {file_name}",
        ]
        
        if change_description:
            query_parts.append(change_description)
        
        query = " ".join(query_parts)
        
        # Get relevant documents
        docs = self.query(query, k=Config.RAG_TOP_K)
        
        if not docs:
            return "No relevant regulatory context found in knowledge base."
        
        # Format context
        context_parts = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get('file_path', 'Unknown')
            content = doc.page_content[:500]  # Limit length
            context_parts.append(f"[Source {i}: {source}]\n{content}\n")
        
        return "\n".join(context_parts)
    
    def update_single_file(self, file_path: Path):
        """
        Update vector store for a single file.
        
        Args:
            file_path: Path to file to update
        """
        try:
            logger.info(f"Updating vector store for {file_path}")
            
            # Determine file type
            file_type = file_path.suffix.lstrip('.')
            
            # Load and process file
            docs = self._load_file(file_path, file_type)
            
            if docs:
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=Config.CHUNK_SIZE,
                    chunk_overlap=Config.CHUNK_OVERLAP
                )
                splits = text_splitter.split_documents(docs)
                
                # Add to vector store
                self.vectorstore.add_documents(documents=splits)
                self._update_cache(file_path)
                self._save_cache()
                
                logger.info(f"Updated {len(splits)} chunks for {file_path}")
        except Exception as e:
            logger.error(f"Failed to update file {file_path}: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about the vector store."""
        try:
            collection = self.vectorstore._collection
            count = collection.count()
            
            return {
                "total_documents": count,
                "cached_files": len(self.cache),
                "db_path": str(Config.CHROMA_DB_PATH),
                "cache_enabled": Config.ENABLE_CACHING
            }
        except Exception as e:
            logger.error(f"Could not get statistics: {e}")
            return {"error": str(e)}

# Made with Bob
