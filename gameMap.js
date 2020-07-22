//Game Map
function declineAttack() {
    if (gameVars.mapInfo.mapSelect.length === 0) {
        var earthShakingEventConfirmed = confirm("Decline Attack?");

        if (earthShakingEventConfirmed) {
            earthShakingEvent();
            //remove confirm attack button
            removeElement("map-screen-toolbar", "confirm-attack");
        }
    }
    else {
        //clear map select
        gameVars.mapInfo.mapSelect = [];
        //clear join threats
        gameVars.mapInfo.joinThreat = [];
        //rename button
        document.getElementById("decline-attack").innerHTML = "Decline Attack";
        //rebuild map
        buildMapButtons();
        //update note
        document.getElementById("map-note").innerHTML = findPlayerName(gameVars.gameStatus.turn) + " Choose Attack";
    }
}

function returnNonAttackFromJoiners() {
    //only do so if not attackable
    for (var i = 0; i < gameVars.mapInfo.joinThreat.length; i++) {
        if (isCountryAttackable(gameVars.mapInfo.joinThreat[i]) === false) {
            addClass(gameVars.mapInfo.joinThreat[i], 'not-attackable');
        }
    }
    gameVars.mapInfo.joinThreat = [];
}

function removeNonAttackFromJoiners() {
    returnNonAttackFromJoiners();
    for (var i = 0; i < gameVars.mapInfo.possibleBattle.length; i++) {
        removeClass(gameVars.mapInfo.possibleBattle[i], 'not-attackable');
        gameVars.mapInfo.joinThreat.push(gameVars.mapInfo.possibleBattle[i]);
    }
}

function resetMapScreen() {
    //remove all attack classes
    removeAllClassFromMapbuttons("attack-threat");
    removeAllClassFromMapbuttons("join-threat");
    removeAllClassFromMapbuttons("map-attack");
    removeAllClassFromMapbuttons("map-defend");
    removeAllClassFromMapbuttons("map-join");
    removeAllClassFromMapbuttons("already-attacked");
    //disable confirm attack button
    disableId("confirm-attack");
    //clear map select
    gameVars.mapInfo.mapSelect = [];
    if (!!document.getElementById("decline-attack")) {
        //update reset map button
        document.getElementById("decline-attack").innerHTML = "Decline Attack";
    }
}

function removeAllClassFromMapbuttons(classToRemove) {
    for (var i = 0; i < gameVars.mapInfo.countryList.length; i++) {
        removeClass(gameVars.mapInfo.countryList[i].country, classToRemove);
    }
}

function mapSelectPlayerNotSelected(countryPlayer) {
    for (var i = 0; i < gameVars.mapInfo.mapSelect.length; i++) {
        if (gameVars.mapInfo.mapSelect[i].deckPlayer === countryPlayer) {
            return false;
        }
    }
    return true;
}

function isPlayerNotOnDeckList(player, deckList) {
    for (var i = 0; i < deckList.length; i++) {
        var currentDeckPlayer = deckList[i].deckPlayer;

        if (currentDeckPlayer === player) {
            return false;
        }
    }
    return true;
}

function markToSurroundingPossibleBattle(country, classToAdd) {
    var fullCountry = findFullCountryWithCountry(country),
    playersToExclude = gameVars.mapInfo.mapSelect;
    
    if (!!fullCountry.deck) {
        for (var i = 0; i < fullCountry.borders.length; i++) {
            var currentBorderCountry = fullCountry.borders[i];

            if (!!findFullCountryWithCountry(currentBorderCountry).deck && isPlayerNotOnDeckList(findFullCountryWithCountry(currentBorderCountry).deck.deckPlayer, playersToExclude)) {
                addClass(fullCountry.borders[i], classToAdd);
                gameVars.mapInfo.possibleBattle.push(fullCountry.borders[i]);
            }
        }
    }
}

function isPlayerOnCountry(player, country) {
    if (!!findFullCountryWithCountry(country).deck && findFullCountryWithCountry(country).deck.deckPlayer === player) {
        return true;
    }
    return false;
}

function markAllMapCountriesNotBorderingCountry(country, classToAdd) {
    var countryBorders = findFullCountryWithCountry(country).borders;

    for (var i = 0; i < gameVars.mapInfo.countryList.length; i++) {
        if (gameVars.mapInfo.countryList[i].country !== country && !isItemInArray(gameVars.mapInfo.countryList[i].country, countryBorders)) {
            addClass(gameVars.mapInfo.countryList[i].country, classToAdd);
        }
    }
}

function markAllCountriesBorderingWithSamePlayer(country, classToAdd) {
    var fullCountry = findFullCountryWithCountry(country);

    for (var i = 0; i < fullCountry.borders.length; i++) {
        var fullBorderCountry = findFullCountryWithCountry(fullCountry.borders[i]);

        if (!!fullBorderCountry.deck && fullBorderCountry.deck.deckPlayer === fullCountry.deck.deckPlayer) {
            addClass(fullBorderCountry.country, classToAdd);
        }
    }
}

function markAllOtherCountriesBorderingWithGivenPlayer(country, player, classToAdd) {
    var fullCountry = findFullCountryWithCountry(country);

    for (var i = 0; i < fullCountry.borders.length; i++) {
        var fullBorderCountry = findFullCountryWithCountry(fullCountry.borders[i]);

        if (!!fullBorderCountry.deck && fullBorderCountry.deck.deckPlayer === player && fullBorderCountry.deck.deckName !== gameVars.mapInfo.mapSelect[0].deckName) {
            addClass(fullBorderCountry.country, classToAdd);
        }
    }
}

function selectAttacker(country, countryDeck, currentTurnPlayerName, countryDeckName) {
    //remove all attack classes
    removeAllClassFromMapbuttons("attack-threat");
    removeAllClassFromMapbuttons("join-threat");
    removeAllClassFromMapbuttons("map-attack");
    removeAllClassFromMapbuttons("map-defend");
    removeAllClassFromMapbuttons("map-join");
    removeAllClassFromMapbuttons("out-of-range");
    //disable confirm attack
    disableId("confirm-attack");
    //clear ground zero
    gameVars.battleScreenInfo.groundZero = "";
    //make mapSelect = deck on country clicked
    gameVars.mapInfo.mapSelect = [countryDeck];
    //highlight as attacker
    addClass(country, "map-attack");
    //add bordering countries with deck and not same player as on map select as possible battle and highlight as possible attack
    gameVars.mapInfo.possibleBattle = [];
    markToSurroundingPossibleBattle(country, "attack-threat");
    //mark out of range
    markAllMapCountriesNotBorderingCountry(country, "out-of-range");
    //mark borders with same player as out of range
    markAllCountriesBorderingWithSamePlayer(country, "out-of-range")
    //update map message and note with countryDeckName
    document.getElementById("map-message").innerHTML = currentTurnPlayerName + " Choose Country To Attack";
    document.getElementById("map-note").innerHTML = countryDeckName + " attacks ";
    //update deline attack button
    document.getElementById("decline-attack").innerHTML = "Reset Map";
}

function selectDefender(country, countryPlayer, countryDeckName) {
    //enable confirm attack button
    undisableId("confirm-attack");
    //highlight as defender
    addClass(country, "map-defend");
    //remove attack and join threat class
    removeAllClassFromMapbuttons("attack-threat");
    removeAllClassFromMapbuttons("join-threat");
    removeAllClassFromMapbuttons("out-of-range");
    //set ground zero
    gameVars.battleScreenInfo.groundZero = country;
    //push to mapSelect
    gameVars.mapInfo.mapSelect.push({deckPlayer: countryPlayer, deckName: countryDeckName});
    //add bordering countries with deck and not same player as on map select as possible battle and highlight as possible joiner
    gameVars.mapInfo.possibleBattle = [];
    markToSurroundingPossibleBattle(country, "join-threat");
    //mark out of range
    markAllMapCountriesNotBorderingCountry(country, "out-of-range");
    //mark bordering countries with current player
    markAllOtherCountriesBorderingWithGivenPlayer(country, gameVars.gameStatus.turn, "out-of-range");
    //mark all bordering countries with same player
    markAllCountriesBorderingWithSamePlayer(country, "out-of-range");
    //update note with deck shown name
    document.getElementById("map-note").innerHTML += shownDeckName(countryPlayer, countryDeckName);
    //unlock joiners
    removeNonAttackFromJoiners();
}

function markOtherJoinersWithSamePlayer(player, classToAdd) {
    for (var i = 0; i < gameVars.mapInfo.joinThreat.length; i++) {
        var currentPlayer = findCountryPlayer(gameVars.mapInfo.joinThreat[i]);

        if (currentPlayer === player) {
            addClass(gameVars.mapInfo.joinThreat[i], classToAdd);
        }
    }
}

function selectJoiner(country, countryPlayer, countryDeckName) {
    //remove join threats
    removeAllClassFromMapbuttons("join-threat");
    //highlight as joiner
    addClass(country, "map-join");
    //push to mapSelect
    gameVars.mapInfo.mapSelect.push({deckPlayer: countryPlayer, deckName: countryDeckName});
    //add bordering countries with deck and not same player as on map select as possible battle and highlight as possible joiner
    gameVars.mapInfo.possibleBattle = [];
    markToSurroundingPossibleBattle(gameVars.battleScreenInfo.groundZero, "join-threat");
    //mark out of range
    markOtherJoinersWithSamePlayer(countryPlayer, "out-of-range");
    //remove out of range
    removeClass(country, "out-of-range");
    //update note with deck shown name
    document.getElementById("map-note").innerHTML += " with " + shownDeckName(countryPlayer, countryDeckName);
}

function attackCountryClicked(country) {
    var currentTurnPlayer = gameVars.gameStatus.turn,
    currentTurnPlayerName = gameVars.playerInfo["player" + currentTurnPlayer].playerName,
    currentClick = gameVars.mapInfo.mapSelect.length,
    countryDeck = findDeckWithCountry(country),
    alreadyAttacked = isItemInArray(country, gameVars.mapInfo.alreadyAttacked);

    if (!!countryDeck) {
        var countryPlayer = countryDeck.deckPlayer,
        countryDeckName = shownDeckName(countryPlayer, countryDeck.deckName);

        if (currentTurnPlayer === countryPlayer && alreadyAttacked === false) {
            selectAttacker(country, countryDeck, currentTurnPlayerName, countryDeckName);
            removeNonAttackFromJoiners();
        }
        else if (isItemInArray(country, gameVars.mapInfo.possibleBattle)){
            for (var i = 0; i < gameVars.mapInfo.possibleBattle.length; i++) {
                if (gameVars.mapInfo.possibleBattle[i] === country) {
                    if (currentClick > 1) {
                        selectJoiner(country, countryPlayer, countryDeck.deckName);
                    }
                    else {
                        selectDefender(country, countryPlayer, countryDeck.deckName);
                    }
                }
            }   
        }
    }
}

function deckPenaltiesPunctuation(deckPenalties) {
    if (deckPenalties > 0) {
        return ", ";
    }
}

function mapCountryOffHover(country) {
    //use with future version of animating country;
}

function mapCountryHover(country) {
    var countryName = findFullCountryWithCountry(country).countryName;

    //country name
    document.getElementById("country-information").innerHTML = countryName;
    //player name
    if (!!findFullCountryWithCountry(country).deck) {
        var countryPlayer = findFullCountryWithCountry(country).deck.deckPlayer,
        playerName = gameVars.playerInfo["player" + countryPlayer].playerName,
        deckId = findDeckRef(countryPlayer, findFullCountryWithCountry(country).deck.deckName),
        isHidden = gameVars.playerInfo["player" + countryPlayer].playerDecklist[deckId].deckHidden,
        deckName = findFullCountryWithCountry(country).deck.deckName,
        deckColors = gameVars.playerInfo["player" + countryPlayer].playerDecklist[deckId].deckColors,
        deckBonuses = gameVars.playerInfo["player" + countryPlayer].playerDecklist[deckId].deckBonuses,
        deckPenalties = gameVars.playerInfo["player" + countryPlayer].playerDecklist[deckId].deckPenalties,
        countryHero = findFullCountryWithCountry(country).hero,
        countryConspiracy = findFullCountryWithCountry(country).conspiracy,
        deckVanguards = gameVars.playerInfo["player" + countryPlayer].playerDecklist[deckId].vanguardList,
        vanguardsToShow = "",
        defensePlane = findFullDeckWithPlayerAndName(countryPlayer, deckName).defensePlane;

        document.getElementById("country-information").innerHTML += "<br>" + playerName + "<br>";
        //player deck if not hidden
        if (isHidden === false) {
            document.getElementById("country-information").innerHTML += deckName + " (" + deckColors + ")<br>";
            if (adminSettings.useTwoHeadedGiant === true) {
                var secondDeckName = findSecondHead(countryPlayer, deckName);

                document.getElementById("country-information").innerHTML += secondDeckName[0] + " (" + secondDeckName[1] + ")<br>";
            }
            if (!!defensePlane) {
                document.getElementById("country-information").innerHTML += "Defense Plane: " + defensePlane + "<br>";
                removeElement("country-information", "map-defense-preview");
                addElement("country-information", "div", "noContent", "map-defense-preview");
                document.getElementById("map-defense-preview").style.backgroundImage = getPlanarPicture(defensePlane);
            }
        }
        if (deckBonuses === 1) {
            document.getElementById("country-information").innerHTML += "One Bonus<br>";
        }
        if (deckBonuses > 1) {
            document.getElementById("country-information").innerHTML += deckBonuses + " Bonuses<br>";
        }
        if (deckPenalties === 1) {
            document.getElementById("country-information").innerHTML += "One Penalty<br>";
        }
        if (deckPenalties > 1) {
            document.getElementById("country-information").innerHTML += deckPenalties + " Penalties<br>";
        }
        if (!!deckVanguards && deckVanguards.length > 0) {
            for (var i = 0; i < deckVanguards.length; i++) {
                if (i === 0) {
                    vanguardsToShow += "Vanguard Pool: " + deckVanguards[i];
                }
                else {
                    vanguardsToShow += ", " + deckVanguards[i];
                }
            }
            document.getElementById("country-information").innerHTML += vanguardsToShow + "<br>";
        }
        if (isItemInArray(countryHero, gameVars.mapInfo.heroConspiracyPlayed)) {
            document.getElementById("country-information").innerHTML += "Hero: " + countryHero + "<br>";
        }
        if (isItemInArray(countryConspiracy, gameVars.mapInfo.heroConspiracyPlayed)) {
            document.getElementById("country-information").innerHTML += "Conspiracy: " + countryConspiracy + "<br>";
        }
        //future version animate country;
    }
    //update background color
    for (i = 1; i < 6; i++) {
        removeClass("country-information", 'player-color-' + i);
    }
    removeClass("country-information", 'player-color-');
    if (countryPlayer === undefined) {
        addClass("country-information", 'player-color-');
    }
    else {
        addClass("country-information", 'player-color-' + countryPlayer);
    }
}

function mapCountryClick(country) {
    var gameMode = gameVars.gameStatus.mode;

    switch (gameMode) {
        case "attack":
            attackCountryClicked(country);
        break;
        case "move":
            makeMove(country);
        break;
        case "setup":
            placementClick(country);
        break;        
        case "drop":
                chooseSupplyDrop(country);
        break;
        default: console.log("Mode not found in mapCountryClick");
    }
}

function countryMapName(currentCountry) {
    var currentCountryName = currentCountry.countryName,
    hasDeck = !!currentCountry.deck;

    if (hasDeck) {
        var currentPlayerNumber = currentCountry.deck.deckPlayer,
        currentDeckName = currentCountry.deck.deckName,
        currentPlayerName = findPlayerName(currentPlayerNumber),
        isHidden = findDeckWithPlayerNumberAndName(currentPlayerNumber, currentDeckName).deckHidden;  

        if (isHidden) {
            return "<span>" + currentCountryName + "<br>" + currentPlayerName + addDropInfoToMapName(currentCountry.country) + "</span>";
        }
        else {
            if (adminSettings.useTwoHeadedGiant === true) {
                var secondHeadDeckName = findSecondHead(currentPlayerNumber, currentDeckName);

                return "<span>" + currentCountryName + "<br>" + currentDeckName  + "<br> and " + secondHeadDeckName[0] + addDropInfoToMapName(currentCountry.country) + "</span>";
            }
            else {
                return "<span>" + currentCountryName + "<br>" + currentDeckName + addDropInfoToMapName(currentCountry.country) + "</span>";
            }
        }
    }
    else {
        return "<span>" + currentCountryName + addDropInfoToMapName(currentCountry.country) + "</span>";
    }
}

function isCountryAttackable(country) {
    var currentFullCountry = findFullCountryWithCountry(country);

    if (!!currentFullCountry.deck) {
        var currentPlayerTurn = gameVars.gameStatus.turn,
        currentCountryPlayer = currentFullCountry.deck.deckPlayer,
        currentCountryBorders = [],
        currentCountryBorderPlayers = [],
        surroundingCountryWithDifferentPlayer = false;

        //remove countries that attacked from border list
        for (var b = 0; b < currentFullCountry.borders.length; b++) {
            var currentBorderCountry = currentFullCountry.borders[b];

            if (!!currentFullCountry.deck && !isItemInArray(currentBorderCountry, gameVars.mapInfo.alreadyAttacked)) {
                var countryBorderFullCountry = findFullCountryWithCountry(currentBorderCountry);

                currentCountryBorders.push(currentBorderCountry);
                if (!!countryBorderFullCountry.deck) {
                    var countryBorderPlayer = countryBorderFullCountry.deck.deckPlayer;

                    currentCountryBorderPlayers.push(countryBorderPlayer);
                }
            }
        }
        //does surrounding country have a different player
        for (var c = 0; c < currentCountryBorderPlayers.length; c++) {
            if (currentCountryBorderPlayers[c] !== currentPlayerTurn) {
                surroundingCountryWithDifferentPlayer = true;
            }
        }
        //if deck on country is current player turn 
        if (currentCountryPlayer === currentPlayerTurn) {
            //if deck on country doesnt have a surrounding country with a different player
            if (surroundingCountryWithDifferentPlayer === false) {
                return false;
            }
        }        
        //if deck on country is not current player turn
        else {
            //if a surrounding country doesnt have a deck is current player turn
            if (isItemInArray(currentPlayerTurn, currentCountryBorderPlayers) === false) {
                return false;
            }
        }
        if (!!currentFullCountry.deck && currentPlayerTurn === currentFullCountry.deck.deckPlayer && !isItemInArray(country, gameVars.mapInfo.alreadyAttacked)) {
            gameVars.mapInfo.possibleAttack += 1;
        }
        return true;
    }
    return false;
}

function buildMapButtons() {    
    //reset possible attack count
    gameVars.mapInfo.possibleAttack = 0;
    gameVars.mapInfo.playableSupply = [];

    //add svg element
    removeElement("world-map", "map-countries");
    addMapArea("world-map", "map-countries");
    //add country text container
    removeElement("world-map", "text-countries");
    addElement("world-map", "div", "noContent", "text-countries");
    //add countries
    for (var i = 0; i < gameVars.mapInfo.countryList.length; i++) {
        var currentFullCountry = gameVars.mapInfo.countryList[i],
        currentCountry = currentFullCountry.country,
        alreadyAttacked = isItemInArray(currentCountry, gameVars.mapInfo.alreadyAttacked);

        //build each country path
        addMapElement("map-countries", countryMapName(currentFullCountry), currentCountry, "country-button", mapCountryClick, mapCountryHover, mapCountryOffHover);
        //all add player color
        if (!!currentFullCountry.deck) {
            var currentPlayer = currentFullCountry.deck.deckPlayer;

            addClass(currentCountry, "player-color-" + currentPlayer);
            if (currentFullCountry.deck.deckPlayer === gameVars.gameStatus.turn) {
                addClass(currentCountry, "current-player");
            }
        }
        //for attack mode only
        if (gameVars.gameStatus.mode === "attack") {
            //check for already attacked
            if (alreadyAttacked === true) {
                addClass(currentCountry, "already-attacked");
            }
            //check for attackable
            removeClass(currentCountry, "not-attackable");
            if (isCountryAttackable(currentCountry) === false) {
                addClass(currentCountry, "not-attackable");  
            }
        }
        else if (gameVars.gameStatus.mode === "move") {
            //check for movable
            if (!isMovable(currentCountry)) {
                addClass(currentCountry, "not-movable");
            }
        }
        else if (gameVars.gameStatus.mode === "drop") {
            //grey out countries already dropped and that cards cant drop
            if (!isSupplyable(currentCountry)) {
                addClass(currentCountry, "not-supplyable");
            }
            else {
                addClass(currentCountry, "is-supplyable");
            }
            if (isItemInArray(currentCountry, gameVars.globalGameOptions.supplyInfo.supplyDropQueue)) {
                addClass(currentCountry, "map-select");
            }
        }
    }
}

function beginAttack() {
    var currentTurnPlayerNumber = gameVars.gameStatus.turn,
    currentTurnPlayerName = findPlayerName(currentTurnPlayerNumber);

    if (gameVars.gameStatus.mode === "setup") {
        showPregame();
    }
    else if (gameVars.gameStatus.mode === "attack") {
        showMap();
        //build map buttons
        buildMapButtons();
        //create attack buttons
        rebuildAttackButtons();
        disableId("confirm-attack");
        //update message and note
        document.getElementById("map-message").innerHTML = currentTurnPlayerName + " Choose Your Attack";
        document.getElementById("map-note").innerHTML = "";
        //earth shaking event check
        earthShakingEventCheck();
        //ignore drop check if recent log shows drop
        if (gameVars.gameLog[gameVars.gameLog.length - 1][1].substr(0, 11) !== "Supply Drop") {
            //drop check and forced drop check
            supplyDropCheck();
        }
    }
}

function topOfTurn() {
    //update toolbar color
    addClass("map-screen-toolbar", "player-color-" + gameVars.gameStatus.turn);
    //clear all battle buttons and battle variables
    battleScreenCleanup();
    //change mode
    gameVars.gameStatus.mode = "attack";
    //go to intro screen
    showIntro();
    //update supply view button
    showSupplyViewButton();
}

function playerCountOnContinent(continent) {
    var playersOnContinent = [];

    for (var i = 0; i < gameVars.mapInfo.countryList.length; i++) {
        var currentContinent = gameVars.mapInfo.countryList[i].continent,
        isDeck = !!gameVars.mapInfo.countryList[i].deck;

        if (currentContinent === continent && isDeck) {
            playersOnContinent.push(gameVars.mapInfo.countryList[i].deck.deckPlayer);
        }
    }
    return findUniqueValuesInArray(playersOnContinent).length;
}

function setupContinentCheck() {
    var continents = [];

    for (var i = 0; i < gameVars.mapInfo.countryList.length; i++) {
        var currentContinent = gameVars.mapInfo.countryList[i].continent;
        //for each country push the continent to the continents array
        continents.push(currentContinent);
    }
    //change the continents array to unique values
    continents = findUniqueValuesInArray(continents);
    //if any continent has only 1 player then return true
    for (var c = 0; c < continents.length; c++) {
        if (playerCountOnContinent(continents[c]) === 1) {
            return true;
        }
    }
    return false;
}

function removeAllDecksFromCountries() {
    for (var i = 0; i < gameVars.mapInfo.countryList.length; i++) {
        if (!!gameVars.mapInfo.countryList[i].deck) {
            delete gameVars.mapInfo.countryList[i].deck;
        }
    }
}

function setupMapInformation() {
    var countryCount = gameVars.mapInfo.countryList.length,
    playerCount = gameVars.globalGameOptions.totalPlayers,
    countriesPerPlayer = Math.floor(countryCount/playerCount),
    deckListToAdd = [],
    countryListToAddTo = gameVars.mapInfo.countryList.concat();

    for (var p = 1; p <= playerCount; p++) {
        //reset dugout
        gameVars.playerInfo["player" + p].playerDugout = 0;
        //add decks
        for (var i = 1; i <= countriesPerPlayer; i++) {
            var currentDeck = gameVars.playerInfo["player" + p].playerDecklist[i].deckUniqueId;

            deckListToAdd.push(currentDeck);
            rollUpPlayerDugout(p);
            if (adminSettings.useTwoHeadedGiant === true) {
                rollUpPlayerDugout(p);
            }
        }
    }
    shuffleArray(deckListToAdd);
    shuffleArray(countryListToAddTo);
    for (var c = 0; c < deckListToAdd.length; c++) {
        countryListToAddTo[c].deck = deckListToAdd[c];
    }
    if (setupContinentCheck() === true) {
        //delete all decks from countries
        removeAllDecksFromCountries();
        //setup again
        setupMapInformation();
    }
    else {
        //complete setup
        orderArray(countryListToAddTo, "country")
        gameVars.mapInfo.countryList = countryListToAddTo;
        //set second heads
        if (adminSettings.useTwoHeadedGiant === true) {
            addSecondHeadsToCountryList(countriesPerPlayer);
        }
        //update dugout
        rollUpAllPlayerDugout();
    }
}