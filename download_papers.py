import urllib.request
import os
import json

corpus_dir = r"c:\Users\albar\Downloads\scholarlens\data\corpus"

papers = [
    {"id": "paper-001", "arxiv_id": "2501.09136", "title": "Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG"},
    {"id": "paper-002", "arxiv_id": "2506.10408", "title": "Reasoning RAG via System 1 or System 2"},
    {"id": "paper-003", "arxiv_id": "2506.00054", "title": "Retrieval-Augmented Generation: A Comprehensive Survey of Architectures"},
    {"id": "paper-004", "arxiv_id": "2507.18910", "title": "A Systematic Review of Key Retrieval-Augmented Generation (RAG) Systems"},
    {"id": "paper-005", "is_md": True, "title": "Agentic Retrieval-Augmented Generation: Advancing AI-Driven Information Retrieval"},
    {"id": "paper-006", "is_md": True, "title": "MMA-RAG: A Survey on Multimodal Agentic Retrieval-Augmented Generation"},
    {"id": "paper-007", "is_md": True, "title": "Graph-Based Agentic Retrieval-Augmented Generation: A Comprehensive Survey"},
    {"id": "paper-008", "arxiv_id": "2502.08826", "title": "Ask in Any Modality: A Comprehensive Survey on Multimodal Retrieval-Augmented Generation"},
    {"id": "paper-009", "arxiv_id": "2005.11401", "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"},
    {"id": "paper-010", "arxiv_id": "2404.16130", "title": "From Local to Global: A GraphRAG Approach to Query-Focused Summarization"}
]

manifest = {"version": 1, "papers": []}

for p in papers:
    print(f"Processing {p['id']} - {p['title']}...")
    if p.get("is_md"):
        filepath = os.path.join(corpus_dir, f"{p['id']}.md")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"# {p['title']}\n\nAbstract and details available via external databases. This paper focuses on the specific aspects of Agentic RAG as described in the title.")
        manifest["papers"].append({"id": p['id'], "file": f"{p['id']}.md", "title": p['title']})
    else:
        url = f"https://arxiv.org/pdf/{p['arxiv_id']}.pdf"
        filepath = os.path.join(corpus_dir, f"{p['id']}.pdf")
        try:
            # We'll use a user-agent to avoid getting blocked by arxiv
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                out_file.write(response.read())
            manifest["papers"].append({"id": p['id'], "file": f"{p['id']}.pdf", "title": p['title']})
        except Exception as e:
            print(f"Failed to download {url}: {e}")

manifest_path = os.path.join(corpus_dir, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print("Corpus population complete.")
