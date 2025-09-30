from google.adk.agents.llm_agent import Agent
from google.adk.agents.llm_agent import LlmAgent
from google.adk.tools.retrieval.vertex_ai_rag_retrieval import VertexAiRagRetrieval
from google.adk.planners import BuiltInPlanner
from google.genai import types
from pydantic import BaseModel, Field
from vertexai.preview import rag
import os
import math
import asyncio
import re

ask_vertex_retrieval = VertexAiRagRetrieval(
    name='retrieve_rag_documentation',
    description=(
        'Use this tool to retrieve documentation and reference materials for the question from the RAG corpus,'
    ),
    rag_resources=[
        rag.RagResource(
            rag_corpus="projects/aidevproject1337/locations/us-east4/ragCorpora/6917529027641081856",
        )
    ]
)

home_loan= Agent(
    model='gemini-2.5-flash',
    name='home_loan_agent',
    description="You are an Home Loan Agent, answer queries regarding home loans, interest rates, processing fees, documents required, etc",
    instruction="""You are an agent that answers queries regarding home loans, interest rates, processing fees, documents required, etc.
      Follow these rules strictly:
      1. Always greet the user first, be polite and respectful.
      2. Provide accurate and concise information regarding home loans.
      3. If you don't know the answer, do a google search but fact check it.
      """,
    tools=[ask_vertex_retrieval],  # use sync wrapper tool
)

car_loan= Agent(
    model='gemini-2.5-flash',
    name='car_loan_agent',
    description="You are an Car Loan Agent, answer queries regarding car loans, interest rates",
    instruction="""You are an agent that answers queries regarding car loans, interest rates, processing fees, documents required, etc.
      Follow these rules strictly:
      1. Always greet the user first, be polite and respectful.
      2. Provide accurate and concise information regarding car loans.
      3. If you don't know the answer, do a google search but fact check it.
      """,
      tools=[ask_vertex_retrieval],  # use sync wrapper tool
      )
loan_eligibility= Agent(
    model='gemini-2.5-flash',  
    name='loan_eligibility_agent',
    description="You are an Loan Eligiblity Agent, answer queries regarding loan eligiblity",
    instruction="""You are an agent that answers queries regarding loan eligiblity, documents required, etc.
      Follow these rules strictly:
        1. Always greet the user first, be polite and respectful.
        2. Provide accurate and concise information regarding loan eligiblity.
        3. If you don't know the answer, admit it honestly.
        """,
        tools=[ask_vertex_retrieval],  # use sync wrapper tool
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
    sub_agents=[home_loan, car_loan, loan_eligibility]  # use sync wrapper tool
)