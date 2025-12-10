from fastapi import APIRouter
from models import BoardState

@app.post("/ai-move")
def ai_move(state: BoardState):
    board = state.board
    
    return {"col": 0}