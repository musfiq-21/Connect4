from backend.app.utils.util_function import get_valid_locations, is_terminal_node, is_winning_move, get_next_open_row, drop_piece

DEPTH_MAP = {'easy': 2, 'medium': 4, 'hard': 5}
PLAYER = 1
AI = 2
ROWS = 6
COLS = 7


def evaluate_window(window, player):
    score = 0
    opp = 3 - player

    if window.count(player) == 4:
        score += 100
    elif window.count(player) == 3 and window.count(0) == 1:
        score += 10
    elif window.count(player) == 2 and window.count(0) == 2:
        score += 4

    if window.count(opp) == 3 and window.count(0) == 1:
        score -= 80

    return score

def heuristic(board, player):
    score = 0

    center_col = COLS // 2
    center_count = [board[r][center_col] for r in range(ROWS)].count(player)
    score += center_count * 6

    for r in range(ROWS):
        for c in range(COLS - 3):
            window = board[r][c:c + 4]
            score += evaluate_window(window, player)

    for c in range(COLS):
        for r in range(ROWS - 3):
            window = [board[r + i][c] for i in range(4)]
            score += evaluate_window(window, player)

    for r in range(ROWS - 3):
        for c in range(COLS - 3):
            window = [board[r + i][c + i] for i in range(4)]
            score += evaluate_window(window, player)

    for r in range(ROWS - 3):
        for c in range(3, COLS):
            window = [board[r + i][c - i] for i in range(4)]
            score += evaluate_window(window, player)

    return score


def minimax(board, depth, alpha, beta, maximizing):
    valid_locations = get_valid_locations(board)
    terminal = is_terminal_node(board)

    if depth == 0 or terminal:
        if terminal:
            if is_winning_move(board, AI):
                return None, 1_000_000
            elif is_winning_move(board, PLAYER):
                return None, -1_000_000
            else:
                return None, 0
        return None, heuristic(board, AI)

    valid_locations.sort(key=lambda c: abs(c - COLS // 2))

    if maximizing:
        best_score = -float("inf")
        best_col = valid_locations[0]

        for col in valid_locations:
            row = get_next_open_row(board, col)
            if row is None:
                continue

            temp_board = [r[:] for r in board]
            drop_piece(temp_board, row, col, AI)

            _, score = minimax(temp_board, depth - 1, alpha, beta, False)

            if score > best_score:
                best_score = score
                best_col = col

            alpha = max(alpha, best_score)
            if alpha >= beta:
                break

        return best_col, best_score

    else:
        best_score = float("inf")
        best_col = valid_locations[0]

        for col in valid_locations:
            row = get_next_open_row(board, col)
            if row is None:
                continue

            temp_board = [r[:] for r in board]
            drop_piece(temp_board, row, col, PLAYER)

            _, score = minimax(temp_board, depth - 1, alpha, beta, True)

            if score < best_score:
                best_score = score
                best_col = col

            beta = min(beta, best_score)
            if alpha >= beta:
                break

        return best_col, best_score
