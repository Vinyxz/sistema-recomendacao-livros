import os
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
import requests

import models
import auth

app = FastAPI(title="Sistema de Recomendação Inteligente de Livros")

# CORS para seu frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint raiz na raiz "/"
@app.get("/", tags=["Status"])
def root():
    return {"message": "API funcionando na raiz /"}

# Schemas
class BookResponse(BaseModel):
    title: str
    authors: str
    description: str
    image_url: Optional[str] = Field(None, alias="image_url")

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Dependência do banco de dados
def get_db():
    db = next(models.get_db())
    try:
        yield db
    finally:
        db.close()

# Busca livros na Google Books API
def get_books_from_google_api(query: str) -> List[BookResponse]:
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=10"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    books = []
    for item in data.get("items", []):
        volume_info = item.get("volumeInfo", {})
        book = BookResponse(
            title=volume_info.get("title", "Sem título"),
            authors=", ".join(volume_info.get("authors", ["Desconhecido"])),
            description=volume_info.get("description", "Sem descrição"),
            image_url=volume_info.get("imageLinks", {}).get("thumbnail")
        )
        books.append(book)
    return books

# Função para obter usuário atual autenticado via token JWT
def get_current_user(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas", headers={"WWW-Authenticate": "Bearer"})
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas", headers={"WWW-Authenticate": "Bearer"})
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas", headers={"WWW-Authenticate": "Bearer"})
    return user

api_router = APIRouter(prefix="/api")

@api_router.get("/", tags=["Status"])
def api_root():
    return {"message": "API está funcionando"}

@api_router.post("/register", response_model=Token, tags=["Usuário"])
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Nome de usuário já registrado")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = auth.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/token", response_model=Token, tags=["Usuário"])
def login_for_access_token(form_data: auth.OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Nome de usuário ou senha incorretos", headers={"WWW-Authenticate": "Bearer"})
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/recommendations", response_model=List[BookResponse], tags=["Livros"])
def get_book_recommendations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Por enquanto, exemplo fixo de livros
    return [
        BookResponse(title="Livro Exemplo 1", authors="Autor 1", description="Descrição 1"),
        BookResponse(title="Livro Exemplo 2", authors="Autor 2", description="Descrição 2"),
    ]

@api_router.get("/search-books", response_model=List[BookResponse], tags=["Livros"])
def search_books(query: str = Query(..., min_length=1), current_user: models.User = Depends(get_current_user)):
    try:
        books = get_books_from_google_api(query)
        return books
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Erro ao acessar Google Books API")

app.include_router(api_router)

@app.on_event("startup")
def on_startup():
    models.create_db_and_tables()
