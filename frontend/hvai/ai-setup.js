let selectedAILevel = 'easy'

const aiLevelRadios = document.querySelectorAll('input[name="aiLevel"]');

aiLevelRadios.forEach(radio => {
    radio.addEventListener('change', function () {
        document.querySelectorAll('.ai-level').forEach(li =>
            li.classList.remove('selected')
        );

        this.closest('.ai-level').classList.add('selected');
    });
});

function updateColorSelection() {
            const player1Color = document.querySelector('input[name="player1Color"]:checked').value;
            const player2Color = document.querySelector('input[name="player2Color"]:checked').value;

            if (player1Color === player2Color) {
                const allColors = ['red', 'yellow', 'blue', 'green', 'purple', 'pink'];
                for (let color of allColors) {
                    if (color !== player1Color) {
                        document.querySelector(`input[name="player2Color"][value="${color}"]`).checked = true;
                        break;
                    }
                }
            }
        }

        document.querySelectorAll('input[name="player1Color"]').forEach(radio => {
            radio.addEventListener('change', updateColorSelection);
        });

        document.querySelectorAll('.color-option input').forEach(radio => {
            radio.addEventListener('change', function() {
                const label = this.parentElement;
                document.querySelectorAll('.color-option').forEach(el => {
                    el.classList.remove('selected');
                });
                label.classList.add('selected');
            });
        });

        document.getElementById('setupForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const player1Name = document.getElementById('player1Name').value.trim();

            if (!player1Name) {
                showError('player1Error', 'Please enter your name');
                return;
            }

            document.getElementById('player1Error').classList.remove('show');

            const player1Color = document.querySelector('input[name="player1Color"]:checked').value;
            const player2Color = document.querySelector('input[name="player2Color"]:checked').value;

            if (player1Color === player2Color) {
                showError('player1Error', 'Please select different colors');
                return;
            }

            localStorage.setItem('player1Name', player1Name);
            localStorage.setItem('player2Name', 'AI');
            localStorage.setItem('player1Color', player1Color);
            localStorage.setItem('player2Color', player2Color);

            const selectedAILevel = document.querySelector('input[name="aiLevel"]:checked').value;
            localStorage.setItem('aiLevel', selectedAILevel);

            window.location.href = 'ai-game.html';
        });

        function showError(elementId, message) {
            const errorEl = document.getElementById(elementId);
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }

        function goBack() {
            window.location.href = '../home/index.html';
        }

        window.addEventListener('load', function() {
            document.querySelector('input[name="player1Color"]:checked').parentElement.classList.add('selected');
            document.querySelector('input[name="player2Color"]:checked').parentElement.classList.add('selected');
        });