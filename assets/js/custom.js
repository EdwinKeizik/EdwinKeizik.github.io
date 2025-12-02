document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const results = document.getElementById('formResults');
    const submitButton = form.querySelector('button[type="submit"]');

    // Pop-up elemento sukūrimas, jei jo nėra
    let popup = document.getElementById('formSuccessPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'formSuccessPopup';
        popup.className = 'form-success-popup';
        popup.style.position = 'fixed';
        popup.style.top = '20px';
        popup.style.right = '20px';
        popup.style.padding = '15px';
        popup.style.backgroundColor = '#28a745';
        popup.style.color = 'white';
        popup.style.borderRadius = '5px';
        popup.style.zIndex = '1000';
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.5s';
        
        popup.innerText = 'Duomenys pateikti sėkmingai!';
        document.body.appendChild(popup);
    }
    
    // Nustatome mygtuką kaip neaktyvų iš karto
    submitButton.disabled = true;

    // --- VALIDACIJOS FUNKCIJOS ---

    const isRequired = value => value.trim() === '';

    const isEmailValid = email => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const isLettersOnly = name => {
        const re = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s]+$/; 
        return re.test(name);
    };

    const showError = (input, message) => {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        let error = input.parentNode.querySelector('.invalid-feedback');
        if (!error) {
            error = document.createElement('div');
            error.className = 'invalid-feedback';
            input.parentNode.appendChild(error);
        }
        error.textContent = message;
    };

    const removeError = (input) => {
        input.classList.remove('is-invalid');
        if (input.value.trim() !== '') {
             input.classList.add('is-valid');
        } else {
             input.classList.remove('is-valid');
        }
    };

    const validateInput = (input) => {
        const fieldName = input.id;
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        removeError(input);

        // Tikriname privalomus laukus
        if (input.required && isRequired(value)) {
            isValid = false;
            errorMessage = 'Šis laukas yra privalomas.';
        } else if (fieldName === 'adresas' && isRequired(value)) {
            // Adresas neprivalomas, jei tuščias, laikomas validžiu
            isValid = true;
        } else {
            switch (fieldName) {
                case 'vardas':
                case 'pavarde':
                    if (!isLettersOnly(value)) {
                        isValid = false;
                        errorMessage = 'Gali būti tik raidės.';
                    }
                    break;
                case 'elpastas':
                    if (!isEmailValid(value)) {
                        isValid = false;
                        errorMessage = 'Neteisingas el. pašto formatas.';
                    }
                    break;
            }
        }

        if (!isValid) {
            showError(input, errorMessage);
        }

        return isValid;
    };

    // --- FORMAVIMO IR AKTYVAVIMO FUNKCIJOS ---

    const checkFormValidity = () => {
        // Tikriname visus laukus (išskyrus range)
        const requiredInputs = form.querySelectorAll('input:not([type="range"])');
        let isFormValid = true;

        requiredInputs.forEach(input => {
            if (input.type === 'text' || input.type === 'email') {
                 if (!validateInput(input)) {
                    isFormValid = false;
                }
            } else if (input.id === 'telefonas') {
                // Tikriname, ar telefono numeris yra pilnas (12 simbolių: +3706xx xxxxx)
                if (input.value.length !== 12) { 
                    isFormValid = false;
                }
            }
        });

        submitButton.disabled = !isFormValid;
    };


    const phoneInput = document.getElementById('telefonas');

    // Telefono numerio formatavimo logika
    phoneInput.addEventListener('input', (e) => {
        let input = e.target.value;
        
        let digits = input.replace(/\D/g, '');
        let formatted = '';

        digits = digits.substring(0, 11); // Maks. 11 skaitmenų (370 + 8)

        if (digits.length > 0) {
            if (!digits.startsWith('370')) {
                digits = '370' + digits; 
            }
        }
        
        if (digits.length >= 3) {
            formatted += '+' + digits.substring(0, 3);
        }
        if (digits.length >= 4) {
             formatted += digits.substring(3, 11);
        }

        e.target.value = formatted.trim();
        
        const requiredLength = 12;

        removeError(phoneInput);
        if (formatted.length < requiredLength && formatted.length > 0) {
             showError(phoneInput, 'Nepilnas telefono numeris (+3706xx xxxxx).');
        } else if (formatted.length === requiredLength) {
            removeError(phoneInput);
            phoneInput.classList.add('is-valid');
        } else if (formatted.length === 0 && phoneInput.required) {
            showError(phoneInput, 'Šis laukas yra privalomas.');
        }

        checkFormValidity();
    });

    const inputFields = form.querySelectorAll('input[type="text"], input[type="email"]');

    // Realaus laiko validacijos įvykiai
    inputFields.forEach(input => {
        input.addEventListener('input', (e) => {
             validateInput(e.target);
             checkFormValidity();
        });

        input.addEventListener('blur', (e) => {
             validateInput(e.target);
             checkFormValidity();
        });
    });

    // Patikrinimas puslapio įkėlimo metu
    setTimeout(checkFormValidity, 50); 
    
    // --- FORMOS PATEIKIMO APDOROJIMAS ---
    
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Paskutinė validacijos patikra
            let isFormValid = true;
            inputFields.forEach(input => {
                if (input.type !== 'range' && !validateInput(input)) {
                    isFormValid = false;
                }
            });

            if (phoneInput.value.length !== 12) { 
                isFormValid = false;
            }

            if (!isFormValid) {
                return;
            }

            // Duomenų surinkimas
            const obj = {
                vardas: form.vardas.value,
                pavarde: form.pavarde.value,
                elpastas: form.elpastas.value,
                telefonas: form.telefonas.value,
                adresas: form.adresas.value,
                klausimas1: form.q1.value,
                klausimas2: form.q2.value,
                klausimas3: form.q3.value
            };

            // Vidurkio skaičiavimas
            const avg = (
                (parseInt(obj.klausimas1) + parseInt(obj.klausimas2) + parseInt(obj.klausimas3)) / 3
            ).toFixed(1);

            // 1. ATVAZDUOJAME REZULTATUS PUSLAPYJE
            results.innerHTML =
                `<strong>Vardas:</strong> ${obj.vardas}<br>` +
                `<strong>Pavardė:</strong> ${obj.pavarde}<br>` +
                `<strong>El. paštas:</strong> ${obj.elpastas}<br>` +
                `<strong>Tel. Numeris:</strong> ${obj.telefonas}<br>` +
                `<strong>Adresas:</strong> ${obj.adresas}<br>` +
                `<strong>Klausimas 1:</strong> ${obj.klausimas1}<br>` +
                `<strong>Klausimas 2:</strong> ${obj.klausimas2}<br>` +
                `<strong>Klausimas 3:</strong> ${obj.klausimas3}<br><br>` +
                `<strong>${obj.vardas} ${obj.pavarde}: ${avg}</strong>`;

            // 2. IŠVEDAME OBJEKTĄ Į KONSOLĘ
            console.log(obj);

            // 3. RODO SĖKMĖS PRANEŠIMĄ
            popup.classList.add('show');
            popup.style.opacity = '1';
            setTimeout(() => {
                popup.style.opacity = '0';
                setTimeout(() => popup.classList.remove('show'), 500);
            }, 2500);
            
            // 4. NUVALOME FORMOS LAUKUS
            form.reset(); 
            
            // NUVALOME VALIDACIJOS ŽYMES IR DEAKTYVUOJAME MYGTUKĄ
            form.querySelectorAll('input').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
            
            submitButton.disabled = true;
        });
    }

    // --- 1. Kintamieji ir Duomenys ---
    
    // HTML elementai
    const gameBoard = document.getElementById('game-board');
    const difficultySelect = document.getElementById('difficulty-select');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const movesCountEl = document.getElementById('moves-count');
    const matchedPairsCountEl = document.getElementById('matched-pairs-count');
    const winMessageEl = document.getElementById('win-message');
    const timerEl = document.getElementById('timer');
    const bestEasyEl = document.getElementById('best-easy');
    const bestHardEl = document.getElementById('best-hard');

    // Žaidimo duomenys (ikonos, galite pakeisti paveikslėliais/tekstu)
    const cardIcons = [
        '⭐️', '🍎', '🌈', '⚡️', '🚀', '💡', 
        '👑', '🌊', '👽', '🎯', '🎸', '⚽️' // Papildomos ikonos sunkiam lygiui
    ];

    // Žaidimo būsenos kintamieji
    let currentCards = [];        // Kortelės, sugeneruotos dabartiniam žaidimui
    let flippedCards = [];        // Dvi atverstos kortelės
    let matchedPairs = 0;         // Sutapusių porų skaičius
    let moves = 0;                // Ėjimų skaičius
    let isGameLocked = false;     // Blokuoja paspaudimus kol kortelės verčiasi atgal
    let totalPairs = 0;           // Bendras porų skaičius
    let timerInterval = null;     // Laikmačio ID
    let startTime = 0;            // Žaidimo pradžios laikas

    // --- 2. Pagalbinės Funkcijos ---

    /** * Sumaišo masyvą (Fisher-Yates algoritmas) 
     * @param {Array} array
     * @returns {Array} Sumaišytas masyvas
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Nuskaito geriausius rezultatus iš LocalStorage ir atnaujina HTML.
     */
    function loadBestScores() {
        const bestEasy = localStorage.getItem('memoryGame_bestEasy') || 'Nėra';
        const bestHard = localStorage.getItem('memoryGame_bestHard') || 'Nėra';
        bestEasyEl.textContent = bestEasy;
        bestHardEl.textContent = bestHard;
    }

    /**
     * Atnaujina geriausią rezultatą LocalStorage.
     * @param {string} difficulty - 'easy' arba 'hard'
     * @param {number} currentMoves - Dabartinis ėjimų skaičius
     */
    function saveBestScore(difficulty, currentMoves) {
        const key = `memoryGame_best${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
        
        const bestScoreStr = localStorage.getItem(key);

        let bestScore;
        if (bestScoreStr === null || bestScoreStr === 'Nėra') {
            bestScore = Infinity; 
        } else {
            bestScore = parseInt(bestScoreStr);
        }
        
        if (currentMoves < bestScore) {
            localStorage.setItem(key, currentMoves);
            loadBestScores();
        }
    }

    // --- 3. Žaidimo Logika ---

    /**
     * Pradeda laikmatį.
     */
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            
            const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timerEl.textContent = formattedTime;
        }, 1000);
    }

    /**
     * Sustabdo laikmatį.
     */
    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    /**
     * Atnaujina statistikos rodiklius.
     */
    function updateStats() {
        movesCountEl.textContent = moves;
        matchedPairsCountEl.textContent = matchedPairs;
    }

    /**
     * Sugeneruoja kortelių duomenų rinkinį ir dinamiškai sukuria HTML lentą.
     * @param {string} difficulty - 'easy' arba 'hard'
     */
    function generateBoard(difficulty) {
        gameBoard.innerHTML = '';
        winMessageEl.classList.add('hidden');

        // Nustatome tinklelio dydį
        gameBoard.className = '';
        gameBoard.classList.add(difficulty);

        let pairsToUse;
        if (difficulty === 'easy') {
            pairsToUse = cardIcons.slice(0, 6); // 6 unikalūs elementai
            totalPairs = 6;
        } else {
            pairsToUse = cardIcons.slice(0, 12); // 12 unikalūs elementai
            totalPairs = 12;
        }

        // Sukuriame poras
        currentCards = [...pairsToUse, ...pairsToUse];

        // Sumaišome korteles
        currentCards = shuffleArray(currentCards);

        // Generuojame kortelių HTML
        currentCards.forEach((icon, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = index;
            card.dataset.icon = icon;
            
            // Kortelės priekis (turinys)
            const front = document.createElement('div');
            front.classList.add('card-face', 'card-front');
            front.textContent = icon;

            // Kortelės nugara (paslėpta)
            const back = document.createElement('div');
            back.classList.add('card-face', 'card-back');

            card.appendChild(front);
            card.appendChild(back);
            
            card.addEventListener('click', () => handleCardClick(card));
            
            gameBoard.appendChild(card);
        });
    }

    /**
     * Atstato žaidimo būseną.
     */
    function resetGameStatus() {
        stopTimer();
        timerEl.textContent = '00:00';
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        isGameLocked = false;
        winMessageEl.classList.add('hidden');
        updateStats();
    }

    /**
     * Paleidžia naują žaidimą.
     */
    function startGame() {
        resetGameStatus();
        const difficulty = difficultySelect.value;
        generateBoard(difficulty);
        startTimer();
    }

    /**
     * Tvarko kortelės paspaudimo logiką.
     * @param {HTMLElement} card - Paspausta kortelė
     */
    function handleCardClick(card) {
        // Ignoruojame, jei žaidimas neprasidėjo, kortelė jau atversta, sutapusi ar užrakinta
        if (!timerInterval || card.classList.contains('flipped') || card.classList.contains('matched') || isGameLocked) {
            return;
        }

        // Atverčiame kortelę
        card.classList.add('flipped');
        flippedCards.push(card);

        // Tikriname, ar atverstos dvi kortelės
        if (flippedCards.length === 2) {
            moves++;
            updateStats();
            isGameLocked = true; // Blokuojame paspaudimus
            
            const [card1, card2] = flippedCards;

            // Tikriname, ar kortelės sutampa
            if (card1.dataset.icon === card2.dataset.icon) {
                // 5a. Sutampa - paliekame atverstas ir darome neaktyviomis
                card1.classList.add('matched');
                card2.classList.add('matched');
                matchedPairs++;
                
                flippedCards = []; // Išvalome sąrašą
                isGameLocked = false; // Atrakiname žaidimą
                updateStats();

                // 7. Tikriname, ar laimėta
                if (matchedPairs === totalPairs) {
                    stopTimer();
                    winMessageEl.classList.remove('hidden');
                    // 11. Išsaugome geriausią rezultatą
                    saveBestScore(difficultySelect.value, moves);
                }

            } else {
                // 5b. Nesutampa - automatiškai apsiverčia atgal po 1s
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                    isGameLocked = false; // Atrakiname žaidimą po uždelsimo
                }, 1000);
            }
        }
    }

    // --- 4. Įvykių Klausytojai ---

    // 8. Starto mygtukas
    startButton.addEventListener('click', startGame);

    // 9. Atnaujinimo mygtukas (iš naujo sumaišo ir pradeda žaidimą)
    resetButton.addEventListener('click', () => {
        // Atstatome būseną
        resetGameStatus(); 
        
        // Iš naujo sugeneruojame lentą (su naujomis kortelėmis)
        const difficulty = difficultySelect.value;
        generateBoard(difficulty);
        
        // Laikmatis neįsijungia, kol nepaspaustas "Start"
    });

    // 3. Sudėtingumo lygio pasirinkimas (perskirsto korteles)
    difficultySelect.addEventListener('change', () => {
        // Atstatome būseną ir sugeneruojame naują lentą
        resetGameStatus();
        generateBoard(difficultySelect.value);
    });

    // --- 5. Pradinis Inicijavimas ---
    
    loadBestScores();

    generateBoard(difficultySelect.value);

});