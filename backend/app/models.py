from pydantic import BaseModel

class BoardState(BaseModel):
    board: list[list[int]]
    difficulty: str
