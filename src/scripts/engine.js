
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
        winOf: [1],
        loseOf: [2]
    },
    {
        id: 1,
        name: "Dark Magician",
        type: "Rock",
        img: pathImages+'/magician.png',
        winOf: [2],
        loseOf: [0]
    },
    {
        id: 2,
        name: "Exodia",
        type: "Scissors",
        img: pathImages+'/exodia.png',
        winOf: [0],
        loseOf: [1]
    },
];

async function getRandomCardId(maxRange) {
    const randomIndex = Math.floor(Math.random() * maxRange);
    return cardData[randomIndex].id;
}

async function createCardImage(cardId, fieldSide) {
    let cardIcon = 'src/assets/icons/card-back.png';
    
    const cardImage = document.createElement("img");
    cardImage.setAttribute("height", '100px');
    cardImage.setAttribute('data-id', cardId);
    cardImage.classList.add('card');

    if (fieldSide === playerSides.player1) {
        cardIcon = 'src/assets/icons/card-front.png';

        cardImage.addEventListener('click', () => {
            // setCardsField(cardImage.getAttribute('data-id'));
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

/*
    Foi definida como async para que as cartas sejam sorteadas para os jogadores
    simultaneamente.
*/
async function drawCards(cardNumbers, fieldSide) {
    for (let i = 0; i < cardNumbers; i++) {
        setTimeout(async () => {
            const randomIdCard = await getRandomCardId(cardData.length);
            const cardImage = await createCardImage(randomIdCard, fieldSide);
    
            document.getElementById(fieldSide).appendChild(cardImage);
        }, 400 * i);
    }
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

async function removeAllCardsImages(cardsBox) {
    let imgElements = cardsBox.querySelectorAll("img");

    imgElements.forEach((img) => img.remove());
}

async function checkDuelResults(playerCardId, computerCardId) {
    let duelResults = "Draw!";
    let playerCard = cardData[playerCardId];

    if (playerCard.winOf.includes(computerCardId)) {
        duelResults = "You Won!";
        state.values.scores.player++;
        playAudio('win');
    } 
    if (playerCard.loseOf.includes(computerCardId)) {
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

function confirmModal() {
    state.values.cardsPerPlayer = state.views.selectNumberCards.value;
    state.views.modal.style.display = 'none';

    initializeBoard();
}

function initializeActions() {
    state.actions.btnConfirmNumberCards.addEventListener('click', confirmModal);
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