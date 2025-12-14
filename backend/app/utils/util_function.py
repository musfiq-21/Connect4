import numpy as np

PLAYER = 1
AI = 2
ROWS = 6
COLS = 7

def get_valid_locations(board):

    return [c for c in range(COLS) if board[0][c] == 0]


def get_next_open_row(board, col):

    for r in range(ROWS - 1, -1, -1):
        if board[r][col] == 0:
            return r
    return None


def drop_piece(board, row, col, piece):
    board[row][col] = piece


def is_terminal_node(board):
    return (
        is_winning_move(board, PLAYER)
        or is_winning_move(board, AI)
        or len(get_valid_locations(board)) == 0
    )


def is_winning_move(board, piece):
    for r in range(ROWS):
        for c in range(COLS - 3):
            if all(board[r][c + i] == piece for i in range(4)):
                return True

    for c in range(COLS):
        for r in range(ROWS - 3):
            if all(board[r + i][c] == piece for i in range(4)):
                return True

    for r in range(ROWS - 3):
        for c in range(COLS - 3):
            if all(board[r + i][c + i] == piece for i in range(4)):
                return True
    for r in range(ROWS - 3):
        for c in range(3, COLS):
            if all(board[r + i][c - i] == piece for i in range(4)):
                return True

    return False

def has_immediate_winning_move(board, piece):
    for col in get_valid_locations(board):
        row = get_next_open_row(board, col)
        if row is None:
            continue

        board[row][col] = piece
        win = is_winning_move(board, piece)
        board[row][col] = 0

        if win:
            return True

    return False
