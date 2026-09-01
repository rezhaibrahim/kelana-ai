import json
import os

import boto3

AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
MODEL_ID = os.getenv("KNOWLEDGE_BASE_MODEL_ARN", "amazon.nova-lite-v1:0")

_agent_client = boto3.client(
    "bedrock-agent-runtime",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

_runtime_client = boto3.client("bedrock-runtime", region_name=AWS_REGION)


def ask_knowledge_base(question: str) -> str:
    retrieval = _agent_client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": question},
    )

    chunks = [result["content"]["text"] for result in retrieval.get("retrievalResults", [])]
    context = "\n\n---\n\n".join(chunks)

    prompt = f"""You are KelanaAI's travel assistant. Answer the question using ONLY the context below.
If the context doesn't contain the answer, say you don't have that information.

Context:
{context}

Question: {question}"""

    response = _runtime_client.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(
            {
                "messages": [{"role": "user", "content": [{"text": prompt}]}],
                "system": [{"text": "You are a helpful travel assistant that answers strictly from the given context."}],
            }
        ),
    )

    body = json.loads(response["body"].read())
    return body["output"]["message"]["content"][0]["text"]
