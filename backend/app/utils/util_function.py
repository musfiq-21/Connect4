def is_winning_move(board, player):
    board_np = np.array(board)
    rows = board_np.shape[0]
    cols = board_np.shape[1]

    for r in range(rows):
        for c in range(cols - 3):
            if all(board_np[r, c + i] == player for i in range(4)):
                return True

    for c in range(cols):
        for r in range(rows - 3):
            if all(board_np[r + i, c] == player for i in range(4)):
                return True

    for r in range(rows - 3):
        for c in range(cols - 3):
            if all(board_np[r + i, c + i] == player for i in range(4)):
                return True

    for r in range(rows - 3):
        for c in range(3, cols):
            if all(board_np[r + i, c - i] == player for i in range(4)):
                return True
    return False

def get_valid_locations(board):
    board_np = np.array(board)
    rows = board_np.shape[0]
    cols = board_np.shape[1]

    locations = []

    for c in range(cols):
        if board_np[0, c] == 0:
            locations.append(c)

    return locations

def is_terminal_node(board):
    return is_winning_move(board, PLAYER) or is_winning_move(board, AI) or len(get_valid_locations(board)) == 0

def drop_piece(board, row, col, piece):
    board[row][col] = piece
