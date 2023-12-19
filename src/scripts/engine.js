
// Enum
const pathImages = 'src/assets/icons',
    playerSides = {
        player1: "player-cards",
        computer: "computer-cards",
    };

/**
 * Estado global do game.
 */
const state = {
    values: {
        scores : {
            player: 0,
            computer: 0
        },
        cardsPerPlayer: 5
    },
    views: {
        scores : {
            player : document.querySelector("#player_score"),
            computer : document.querySelector("#computer_score")
        },
        cardSprites: {
            avatar: document.querySelector("#card-image"),
            name: document.querySelector("#card-name"),
            type: document.querySelector("#card-type")
        },
        fieldCards: {
            player: document.querySelector("#player-field-card"),
            computer: document.querySelector("#computer-field-card")
        },
        playerSides: {
            player1: document.getElementById(playerSides.player1),
            computer: document.getElementById(playerSides.computer)
        },
        selectNumberCards : document.getElementById("select-number-cards"),
        modal : document.querySelector(".modal-bg")
    },  
    actions: {
        button: document.querySelector("#next-duel"),
        btnConfirmNumberCards : document.querySelector("#confirm-number-cards")
    }
};



/**
 * Esta "enumeração" deveria vir de um banco de dados
 */
const cardData = [
    {
        id: 0,
        name: "Blue Eyes White Dragon",
        type: "Paper",
        img: pathImages+'/dragon.png',
        winOf: ["Rock"],
        loseOf: ["Scissors"]
    },
    {
        id: 1,
        name: "Dark Magician",
        type: "Rock",
        img: pathImages+'/magician.png',
        winOf: ["Scissors"],
        loseOf: ["Paper"]
    },
    {
        id: 2,
        name: "Exodia",
        type: "Scissors",
        img: pathImages+'/exodia.png',
        winOf: ["Paper"],
        loseOf: ["Rock"]
    },
];

async function getRandomCardId(maxRange) {
    const randomIndex = Math.floor(Math.random() * maxRange);
    return cardData[randomIndex].id;
}

/**
 * Cria uma carta
 * @param {integer} cardId 
 * @param {string} fieldSide 
 * @returns 
 */
async function createCardImage(cardId, fieldSide) {
    let cardIcon = 'src/assets/icons/card-back.png';
    
    const cardImage = document.createElement("img");
    cardImage.setAttribute("height", '100px');
    cardImage.setAttribute('data-id', cardId);
    cardImage.classList.add('card');

    if (fieldSide === playerSides.player1) {
        cardIcon = 'src/assets/icons/card-front.png';

        cardImage.addEventListener('click', () => {
            setCardsField(cardId);
        });

        cardImage.addEventListener('mouseover', () => {
            drawSelectedCard(cardId);
        });
    }

    // Define o ícone da carta conforme o jogador
    cardImage.setAttribute("src", cardIcon);

    return cardImage;
}

/**
 * "Saca" as cartas de determinado jogador.
 * Foi definida como async para que as cartas sejam sorteadas para os jogadores 
 * simultaneamente.
 */
async function drawCards(cardNumbers, fieldSide) {
    const drawingCards = [];

    for (let i = 0; i < cardNumbers; i++) {
        const drawingCardPromise = new Promise((resolve, reject) => {
            setTimeout(async () => {
                const randomIdCard = await getRandomCardId(cardData.length);
                const cardImage = await createCardImage(randomIdCard, fieldSide);

                // Bloqueia a carta para ela não ser clicada até que todas 
                // cartas sejam "sacadas"
                cardImage.style.pointerEvents = 'none';
        
                document.getElementById(fieldSide).appendChild(cardImage);

                resolve(cardImage);
            }, 400 * i);
        });
        
        drawingCards.push(drawingCardPromise);
    }

    // Todas as cartas já foram compradas e são desbloqueadas para o clique.
    Promise.allSettled(drawingCards)
        .then((results) => {
            results.forEach((result) => result.value.style.pointerEvents = 'auto');
        });
}

async function setCardsField(playerCardId) {
    await removeAllCardsImages(state.views.playerSides.computer);
    await removeAllCardsImages(state.views.playerSides.player1);

    let computerCardId = await getRandomCardId(cardData.length);

    hideCardDetails();
    showHideCardFieldsImages(true)
    drawCardsInField(playerCardId, computerCardId);

    let duelResults = await checkDuelResults(playerCardId, computerCardId);

    await updateScore();
    await drawButton(duelResults);
}

/**
 * Remove todas as cartas da "mão" de determinado jogador.
 * @param {DOMElement} playerSide 
 */
async function removeAllCardsImages(playerSide) {
    let imgElements = playerSide.querySelectorAll("img");

    imgElements.forEach((img) => img.remove());
}

/**
 * Determina o resultado do duelo
 * @param {integer} playerCardId 
 * @param {integer} computerCardId 
 * @returns 
 */
async function checkDuelResults(playerCardId, computerCardId) {
    let duelResults = "Draw!";
    const playerCard = cardData[playerCardId];
    const computerCard = cardData[computerCardId];

    if (playerCard.winOf.includes(computerCard.type)) {
        duelResults = "You Won!";
        state.values.scores.player++;
        playAudio('win');
    } 
    if (playerCard.loseOf.includes(computerCard.type)) {
        duelResults = "You Lose!";
        state.values.scores.computer++;
        playAudio('lose');
    }

    return duelResults;
}

async function updateScore() {
    state.views.scores.player.innerHTML = 'Win: '+state.values.scores.player;
    state.views.scores.computer.innerHTML = 'Lose: '+state.values.scores.computer;
}

async function drawCardsInField(playerCardId, computerCardId) {
    state.views.fieldCards.player.src = cardData[playerCardId].img;
    state.views.fieldCards.computer.src = cardData[computerCardId].img;
}

async function showHideCardFieldsImages(isShow) {
    if (isShow) {
        state.views.fieldCards.player.style.display = "block";
        state.views.fieldCards.computer.style.display = "block";
    } else {
        state.views.fieldCards.player.style.display = "none";
        state.views.fieldCards.computer.style.display = "none";
    }
}

async function hideCardDetails() {
    state.views.cardSprites.name.innerText = '';
    state.views.cardSprites.type.innerText = '';
    state.views.cardSprites.avatar.src = '';
}

/**
 * Exibe o botão de reiniciar o duelo com determinado texto nele.
 * @param {string} text 
 */
async function drawButton(text) {
    state.actions.button.innerText = text;
    state.actions.button.style.display = 'block';
}

/**
 * Exibe a carta selecionada no painel à esquerda
 * @param {integer} cardId Índice da carta 
 */
async function drawSelectedCard(cardId) {
    state.views.cardSprites.avatar.src = cardData[cardId].img;
    state.views.cardSprites.name.innerHTML = cardData[cardId].name;
    state.views.cardSprites.type.innerHTML = 'Attribute: '+cardData[cardId].type;
}

/**
 * Reinicia o duelo
 */
async function resetDuel() {
    state.views.cardSprites.avatar.src = '';
    state.actions.button.style.display = 'none';

    initializeBoard();
}

async function playAudio(status) {
    const audio = new Audio('src/assets/audios/'+status+'.wav');
    audio.volume = 0.5;
    audio.play();
}

/**
 * Inicializa o tabuleiro após o jogador escolher a quantidade de cartas.
 */
function confirmModal() {
    // Define a quantidade de cartas para cada jogador
    state.values.cardsPerPlayer = state.views.selectNumberCards.value;

    hideModal();

    initializeBoard();
}

function hideModal() {
    state.views.modal.style.display = 'none';
}

function initializeActions() {
    // Evento do botão de confirmar a quantidade de cartas
    state.actions.btnConfirmNumberCards.addEventListener('click', confirmModal);
    // Evento do botão para reiniciar o duelo
    state.actions.button.addEventListener('click', resetDuel);
}

function initializeBoard() {
    showHideCardFieldsImages(false);

    drawCards(state.values.cardsPerPlayer, playerSides.player1);
    drawCards(state.values.cardsPerPlayer, playerSides.computer);
}

function init() {
    initializeActions();
}

init();