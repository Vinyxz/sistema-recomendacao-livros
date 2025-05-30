from typing import List
from pydantic import BaseModel

class BookResponse(BaseModel):
    title: str
    authors: str
    description: str
    image_url: str = None

def get_recommendations_from_db(db, query: str) -> List[BookResponse]:
    # Aqui você buscaria no banco, mas vamos retornar um exemplo fixo
    return [
        BookResponse(title="Livro Exemplo 1", authors="Autor 1", description="Descrição 1"),
        BookResponse(title="Livro Exemplo 2", authors="Autor 2", description="Descrição 2"),
    ]

def get_books_from_google_api(query: str) -> List[BookResponse]:
    # Aqui você chamaria a Google Books API, mas vamos retornar dummy
    return [
        BookResponse(title="Google Book 1", authors="Google Author", description="Descrição Google"),
    ]
