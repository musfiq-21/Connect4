from backend.app.models import BoardState
from fastapi import APIRouter, status
import numpy as np
from backend.app.utils.minimax import minimax
router = APIRouter()

DEPTH_MAP = {'easy': 3, 'medium': 5, 'hard': 7}
@router.post("/ai-move", status_code=status.HTTP_200_OK)
def ai_move(state: BoardState):
    board = state.board
    difficulty = state.difficulty
    #print(DEPTH_MAP[difficulty])
    alpha = -np.inf
    beta = np.inf
    col, score = minimax(board, DEPTH_MAP[difficulty], alpha, beta, True)
    return {"col": col}