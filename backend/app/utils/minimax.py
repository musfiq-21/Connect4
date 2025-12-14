import numpy as np
from util_function import get_valid_locations, is_terminal_node, is_winning_move, get_next_open_row, drop_piece

DEPTH_MAP = {'easy': 2, 'medium': 4, 'hard': 5}
PLAYER = 1
AI = 2

def evaluate_window(window, player):
    score = 0
    opp_player = 3 - player
    if window.count(player) == 4:
        score += 100
    elif window.count(player) == 3 and window.count(0) == 1:
        score += 5
    elif window.count(player) == 2 and window.count(0) == 2:
        score += 2
    if window.count(opp_player) == 3 and window.count(0) == 1:
        score -= 4
    return score

def heuristic(board, player):
    score = 0
    board_np = np.array(board)
    rows, cols = board_np.shape

    center_array = [int(i) for i in list(board_np[:, cols // 2])]
    center_count = center_array.count(player)
    score += center_count * 3

    for r in range(rows):
        row_array = [int(i) for i in list(board_np[r, :])]
        for c in range(cols - 3):
            window = row_array[c:c + 4]
            score += evaluate_window(window, player)

    for c in range(cols):
        col_array = [int(i) for i in list(board_np[:, c])]
        for r in range(rows - 3):
            window = col_array[r:r + 4]
            score += evaluate_window(window, player)

    for r in range(rows - 3):
        for c in range(cols - 3):
            window = [board_np[r + i][c + i] for i in range(4)]
            score += evaluate_window(window, player)

    for r in range(rows - 3):
        for c in range(3, cols):
            window = [board_np[r + i][c - i] for i in range(4)]
            score += evaluate_window(window, player)

    return score


def minimax(board, depth, alpha, beta, maximizingPlayer):
    valid_locations = get_valid_locations(board)
    is_terminal = is_terminal_node(board)
    if depth == 0 or is_terminal:
        if is_terminal:
            if is_winning_move(board, AI):
                return None, 999999999
            elif is_winning_move(board, PLAYER):
                return None, -999999999
            else:
                return None, 0
        else:
            return None, heuristic(board, AI)
    if maximizingPlayer:
        value = -np.inf
        column = np.random.choice(valid_locations)
        for col in valid_locations:
            row = get_next_open_row(board, col)
            b_copy = [row[:] for row in board]
            drop_piece(b_copy, row, col, AI)
            new_score = minimax(b_copy, depth - 1, alpha, beta, False)[1]
            if new_score > value:
                value = new_score
                column = col
            alpha = max(alpha, value)
            if alpha >= beta:
                break
        return column, value
    else:
        value = np.inf
        column = np.random.choice(valid_locations)
        for col in valid_locations:
            row = get_next_open_row(board, col)
            b_copy = [row[:] for row in board]
            drop_piece(b_copy, row, col, PLAYER)
            new_score = minimax(b_copy, depth - 1, alpha, beta, True)[1]
            if new_score < value:
                value = new_score
                column = col
            beta = min(beta, value)
            if alpha >= beta:
                break
        return column, value
