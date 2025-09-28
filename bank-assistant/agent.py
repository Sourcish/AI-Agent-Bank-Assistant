from google.adk.agents.llm_agent import Agent
from google.adk.tools.retrieval.vertex_ai_rag_retrieval import VertexAiRagRetrieval
from google.adk.planners import BuiltInPlanner
from google.genai import types
from vertexai.preview import rag
import os
from dotenv import load_dotenv

load_dotenv()
ask_vertex_retrieval = VertexAiRagRetrieval(
    name='retrieve_rag_documentation',
    description=(
        'Use this tool to retrieve documentation and reference materials for the question from the RAG corpus,'
    ),
    rag_resources=[
        rag.RagResource(
            rag_corpus=os.getenv("RAG_CORPUS"),
        )
    ]
)

root_agent = Agent(
    model='gemini-2.5-flash',
    name='root_agent',
    description="You are an Bank Agent, answer general queries and Redirecting queries containing these keywords- 1.House-Loan, 2.Car-Loan, 3.Loan-Eligiblity",
    instruction="""You are an agent that forwards requests to other sub agents depending upon the queries, Always greet the user first, be polite and respectful.
      Follow these rules strictly:
      1. For General queries, do a google search and get the best results as output
      2. When a user asks details regarding House Loan-mention that this request is being forwarded to House Loan agent, kindly wait for response
      3. When a user asks details regarding Car Loan- mention that this request is being forwarded to Car Loan agent
      4. When a user asks for their eligibity for loans, ask them for details such as if they have existing loans, what is their salary, how much percent of the amount would be taken as loan, etc
        and mention that the details will be forwarded to Loan Eligibility agent.
      """,
  tools=[ask_vertex_retrieval],
)