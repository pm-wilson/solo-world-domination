// drop map

function showSupplyViewButton() {
    var currentPlayerSupplyHand = currentPlayerUnplayedSupplyHand();

    gameVars.globalGameOptions.supplyInfo.showSupplyDrops = false;
    removeElement("map-screen-toolbar", "view-supply");
    if (currentPlayerSupplyHand.length > 0) {
        addElement("map-screen-toolbar", "button", "Toggle Supply (" + currentPlayerSupplyHand.length + ")", "view-supply", "btn", viewSupplyDrop);
        addClass("view-supply", "btn-warning");
    }
}

function returnSupplyDropCard(country) {
    var currentPlayer = gameVars.gameStatus.turn,
    currentPlayerSupply = gameVars.playerInfo["player" + currentPlayer].playerSupplyPoints;

    //find a card with corresponding country
    for (var i = 0; i < currentPlayerSupply.length; i++) {
        if (currentPlayerSupply[i].supplyCountry === country) {
            //remove it from the current player hand
            var supplyToMove = currentPlayerSupply.splice([i], 1);
            //add it to the turned in set
            gameVars.globalGameOptions.supplyInfo.supplyDropCardsTurnedIn.push(supplyToMove[0]);
        }
    }
}

function dropDeckIntoGame(player, country) {
    var fullPlayer = gameVars.playerInfo["player" + player],
    dugoutRef = fullPlayer.playerDugout,
    newDeckPlayer = player,
    lastDeck = fullPlayer.playerDecklist.length;

    if (adminSettings.useTwoHeadedGiant) {
        lastDeck -= 1;
    }
    if (dugoutRef < lastDeck) {
        var deckToDrop = fullPlayer.playerDecklist[dugoutRef],
        newDeckName = deckToDrop.deckName;

        //drop deck associated with dugout
        findFullCountryWithCountry(country).deck = {deckPlayer: newDeckPlayer, deckName: newDeckName}; 
        //increase player dugout by 1
        rollUpPlayerDugout(player);
        //add second head            
        if (adminSettings.useTwoHeadedGiant === true) {
            addHeadToDeck(player, newDeckName, dugoutRef + 1);
            rollUpPlayerDugout(player);
        }
        //return deck name
        return newDeckName
    }
}

function dropWildCard(card) {
    //only if queue is less than3
    if (gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length < 3) {
        //remove button for corresponding count
        removeElement("map-screen-toolbar", card);
        //mark as chosen
        chooseSupplyDrop("none");
    }
}

function reshuffleSupplyDeck() {
    //move each turned in supply to supply to draw
    for (var i = 0; i < gameVars.globalGameOptions.supplyInfo.supplyDropCardsTurnedIn.length; i++) {
        var supplyToMove = gameVars.globalGameOptions.supplyInfo.supplyDropCardsTurnedIn.splice([i], 1);

        gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw.push(supplyToMove[0]);
    }
    //shuffle cards to draw
    shuffleArray(gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw);
}

function makeSupplyDrop() {
    //select clicked country
    buildMapButtons();

    var supplyDropConfirmation = confirm("Supply Drop to These Countries?");
    
    if (supplyDropConfirmation) {
        //do this for each country in queue
        for (var i = 0; i < gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length; i++) {
            var country = gameVars.globalGameOptions.supplyInfo.supplyDropQueue[i],
            currentPlayerName = findPlayerName(gameVars.gameStatus.turn),
            logText = "Supply Drop by " + currentPlayerName,
            fullCountry = findFullCountryWithCountry(country);
            
            //wild drop
            if (country === "none") {
                logText += " Wild Card Dropped";
            }
            else {
                //country drop
                if (!!fullCountry.deck) {
                    logText += " on " + fullCountry.countryName;
                    if (gameVars.gameStatus.turn === fullCountry.deck.deckPlayer) {
                        //drop 2 bonuses
                        findFullDeckWithPlayerAndName(fullCountry.deck.deckPlayer, fullCountry.deck.deckName).deckBonuses += 2;
                        //add log text
                        logText += ": 2 bonuses for " + findPlayerName(fullCountry.deck.deckPlayer) + "'s " + fullCountry.deck.deckName;
                    }
                    else {
                        //drop 2 penalties
                        findFullDeckWithPlayerAndName(fullCountry.deck.deckPlayer, fullCountry.deck.deckName).deckPenalties += 2;
                        //add log text
                        logText += ": 2 penalties for " + findPlayerName(fullCountry.deck.deckPlayer) + "'s " + fullCountry.deck.deckName;
                    }
                }
                else {
                    if (adminSettings.useAdditionalDeckDrops === true) {
                        //drop deck
                        var newDeckName = dropDeckIntoGame(gameVars.gameStatus.turn, country);

                        //add log text
                        if (newDeckName !== undefined) {
                            logText += ": " + findPlayerName(fullCountry.deck.deckPlayer) + " drops " + newDeckName + " into game";
                        }
                    }
                }
                //border drop
                for (var b = 0; b < fullCountry.borders.length; b++) {
                    var borderFullCountry = findFullCountryWithCountry(fullCountry.borders[b]);

                    if (!!borderFullCountry.deck) {
                        if (gameVars.gameStatus.turn === borderFullCountry.deck.deckPlayer) {
                            if (gameVars.gameStatus.modeType === "attack") {
                                //drop bonus
                                findFullDeckWithPlayerAndName(borderFullCountry.deck.deckPlayer, borderFullCountry.deck.deckName).deckBonuses += 2;
                                //add log text
                                logText += ": 2 bonus Attack Drop for " + findPlayerName(borderFullCountry.deck.deckPlayer) + "'s " + borderFullCountry.deck.deckName;
                            }
                            else {
                                //drop bonus
                                findFullDeckWithPlayerAndName(borderFullCountry.deck.deckPlayer, borderFullCountry.deck.deckName).deckBonuses += 1;
                                //add log text
                                logText += ": 1 bonus for " + findPlayerName(borderFullCountry.deck.deckPlayer) + "'s " + borderFullCountry.deck.deckName;
                            }
                        }
                        else {
                            if (gameVars.gameStatus.modeType === "attack" && isItemInArray(borderFullCountry.country, gameVars.mapInfo.mapSelect)) {
                                //extra penalty for any joiners in game for attack drop
                                findFullDeckWithPlayerAndName(borderFullCountry.deck.deckPlayer, borderFullCountry.deck.deckName).deckPenalties += 2;
                                //add log text
                                logText += ":2 Attack Drop Penalties for " + findPlayerName(borderFullCountry.deck.deckPlayer) + "'s " + borderFullCountry.deck.deckName;
                            }
                            else {
                                //drop penalty
                                findFullDeckWithPlayerAndName(borderFullCountry.deck.deckPlayer, borderFullCountry.deck.deckName).deckPenalties += 1;
                                //add log text
                                logText += ": 1 penalty for " + findPlayerName(borderFullCountry.deck.deckPlayer) + "'s " + borderFullCountry.deck.deckName;
                            }
                        }
                    }
                }
            }
            //put supply card in supplyDropCardsTurnedIn
            returnSupplyDropCard(country);
            //update Log
            updateLog([logText]);
        }
        //clear drop
        clearDropSelect();
        //remove drop buttons
        removeElement("map-screen-toolbar", "drop-select-cancel");
        removeElement("map-screen-toolbar", "make-drop");
        removeAllWildCardButtons();
        //change mode
        gameVars.gameStatus.mode = "attack";
        //check for attack drop
        if (gameVars.gameStatus.modeType === "attack") {
            //proceed with attack
            proceedWithAttack();
            //clear attack mode
            gameVars.gameStatus.modeType = "";
        }
        else {
            //go back to choose attack
            beginAttack();
            //alert user
            alert("Supply Drop Finished, proceed to Attack");
            //rebuild supply view button
            showSupplyViewButton();
        }
    }
    else {
        var select1 = gameVars.globalGameOptions.supplyInfo.supplyDropQueue[0],
        select2 = gameVars.globalGameOptions.supplyInfo.supplyDropQueue[1];

        //unselect country
        gameVars.globalGameOptions.supplyInfo.supplyDropQueue = [select1, select2];
        //rebuild map
        buildMapButtons();
    }
}

function removeAllWildCardButtons() {
    removeElement("map-screen-toolbar", "wild-drop0");
    removeElement("map-screen-toolbar", "wild-drop1");
    removeElement("map-screen-toolbar", "wild-drop2");
}

function maxSupplyCheck() {
    var currentTurn = gameVars.gameStatus.turn,
    currentPlayerSupplyCount = gameVars.playerInfo["player" + currentTurn].playerSupplyPoints.length;

    if (currentPlayerSupplyCount >= gameVars.globalGameOptions.supplyInfo.maxSupplyPerPerson) {
        if (gameVars.gameStatus.modeType === "") {
            //change button note
            document.getElementById("drop-select-cancel").innerHTML = "Unable to Cancel";
        }
        //disable cancel drop
        disableId("drop-select-cancel");
    }
    else {
        //enable cancel drop
        undisableId("drop-select-cancel");
    }
}

function clearDropSelect() {
    if (gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length === 0) {
        var confirmCancelDrop = confirm("Cancel Supply Drop?");

        if (confirmCancelDrop) {
            //clear queue
            gameVars.globalGameOptions.supplyInfo.supplyDropQueue = [];
            //remove map select class
            removeAllClassFromMapbuttons("map-select");
            //remove drop threats
            removeAllClassFromMapbuttons("drop-threat");
            //remove drop buttons
            removeElement("map-screen-toolbar", "drop-select-cancel");
            removeElement("map-screen-toolbar", "make-drop");
            removeAllWildCardButtons();
            //change mode
            gameVars.gameStatus.mode = "attack";
            //go back to choose attack
            beginAttack();
        }
    }
    else {
        //clear queue
        gameVars.globalGameOptions.supplyInfo.supplyDropQueue = [];
        //remove map select class
        removeAllClassFromMapbuttons("map-select");
        //remove drop threats
        removeAllClassFromMapbuttons("drop-threat");
        if (gameVars.gameStatus.modeType === "") {
            //map note
            document.getElementById("map-note").innerHTML = "Drops Remaining: ".concat(3 - gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length);
            //update cancel button
            document.getElementById("drop-select-cancel").innerHTML = "Cancel Supply Drop";
        }
        //check for max to disable cancel
        maxSupplyCheck();
        //remove all wild card buttons
        removeAllWildCardButtons();
        //disable make drop button
        disableId("make-drop");
        //make wild drop button for each wild card
        buildWildCardButtons();
        //rebuild map
        buildMapButtons();
    }
}

function chooseSupplyDrop(country) {
    var isAlreadyClicked = isItemInArray(country, gameVars.globalGameOptions.supplyInfo.supplyDropQueue);

    //check for already clicked
    if (isAlreadyClicked === false || country === "none") {
        if (isSupplyable(country) && gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length < 3) {
            if (gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length === 0 && gameVars.gameStatus.modeType === "" && !!document.getElementById("drop-select-cancel")) {
                //update cancel button
                document.getElementById("drop-select-cancel").innerHTML = "Clear Selected Drops";
                undisableId("drop-select-cancel");
            }
            if (country !== "none") {
                //add class map select
                addClass(country, "map-select");
                for (var i = 0; i < findFullCountryWithCountry(country).borders.length; i++) {
                    addClass(findFullCountryWithCountry(country).borders[i], "drop-threat");
                }
            }
            //add country to queue
            gameVars.globalGameOptions.supplyInfo.supplyDropQueue.push(country);
            //map note
            document.getElementById("map-note").innerHTML = "Drops Remaining: ".concat(3 - gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length);
            //create make drop button after 3 drops
            if (gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length === 3) {
                if (gameVars.gameStatus.modeType === "") {
                    //enable make drop button
                    undisableId("make-drop");
                }
            }
            else {
                //rebuild map
                buildMapButtons();
            }
            if (gameVars.gameStatus.modeType === "attack" && gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length === 3) {
                makeSupplyDrop();
            }
        }
    }

}

function possibleDrops() {
    var possible = [],
    currentPlayerNumber = gameVars.gameStatus.turn;

    for (var i = 0; i < gameVars.playerInfo["player" + currentPlayerNumber].playerSupplyPoints.length; i++) {
        possible.push(gameVars.playerInfo["player" + currentPlayerNumber].playerSupplyPoints[i].supplyCountry)
    }
    return possible;
}

function viewSupplyDrop() {
    var wildCardCount = countWildSupply(currentPlayerUnplayedSupplyHand());

    if (gameVars.globalGameOptions.supplyInfo.showSupplyDrops === false) {
        gameVars.globalGameOptions.supplyInfo.showSupplyDrops = true;
        buildMapButtons();
        document.getElementById("view-supply").innerHTML = wildCardCount + " Wild Cards";
    }
    else {
        gameVars.globalGameOptions.supplyInfo.showSupplyDrops = false;
        buildMapButtons();
        showSupplyViewButton();
    }
}

function addDropInfoToMapName(country) {
    var countriesToShow = possibleDrops();

    if (isItemInArray(country, countriesToShow)) {
        if (gameVars.gameStatus.mode === "drop") {
            return "<br>" + countrySupplyTypeForMap(country);
        }
        else {
            if (gameVars.globalGameOptions.supplyInfo.showSupplyDrops === true) {
                return "<br>" + countrySupplyTypeForMap(country);
            }
        }
    }
    return "";
}

function countrySupplyTypeForMap(country) {
    var type = findCountrySupplyType(country);

    if (type === 1) {
        return "(Infantry)";
    }
    else if (type === 2) {
        return "(Calvary)";
    }
    else {
        return "(Artillery)";
    }
}

function findCountrySupplyType(country) {
    var supplyList = [];
    
    //count list to draw from
    for (var d = 0; d < gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw.length; d++) {
        supplyList.push(gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw[d]);
    }
    //count list played
    for (var t = 0; t < gameVars.globalGameOptions.supplyInfo.supplyDropCardsTurnedIn.length; t++) {
        supplyList.push(gameVars.globalGameOptions.supplyInfo.supplyDropCardsTurnedIn[t]);
    }
    //count players hands
    for (var p = 1; p <= gameVars.gameStatus.turnOrder.length; p++) {
        for (var s = 0; s < gameVars.playerInfo["player" + p].playerSupplyPoints.length; s++) {
            supplyList.push(gameVars.playerInfo["player" + p].playerSupplyPoints[s]);
        }
    }
    //check for match
    for (var c = 0; c < supplyList.length; c++) {
        if (country === supplyList[c].supplyCountry) {
            return supplyList[c].supplyType;
        }
    }
}

function currentPlayerUnplayedSupplyHand() {
    var currentPlayer = gameVars.gameStatus.turn,
    currentPlayerSupplyHand = gameVars.playerInfo["player" + currentPlayer].playerSupplyPoints,
    unplayedHand = [];

    for (var i = 0; i < currentPlayerSupplyHand.length; i++) {
        if (isItemInArray(currentPlayerSupplyHand[i].supplyCountry, gameVars.globalGameOptions.supplyInfo.supplyDropQueue) === false) {
            unplayedHand.push(currentPlayerSupplyHand[i]);
        }
    }
    return unplayedHand;
}

function countSupplyTypeInCurrentHand(type) {
    var currentSupplyHand = currentPlayerUnplayedSupplyHand(),
    numberOfTypes = 0;

    for (var i = 0; i < currentSupplyHand.length; i++) {
        if (currentSupplyHand[i].supplyType === type) {
            numberOfTypes += 1;
        }
    }
    return numberOfTypes;
}

function otherSupplyType(firstType, secondType) {
    for (var i = 1; i <= gameVars.globalGameOptions.supplyInfo.numberOfSupplyPointTypes; i++) {
        if (firstType !== i && secondType !== i) {
            return i;
        }
    }
}

function isOneOfEachPossible() {
    var currentHand = currentPlayerUnplayedSupplyHand(),
    type1 = 0,
    type2 = 0,
    type3 = 0;

    for (var i = 0; i < currentHand.length; i++) {
        if (currentHand[i].supplyType === 1) {
            type1 += 1;
        }
        if (currentHand[i].supplyType === 2) {
            type2 += 1;
        }
        if (currentHand[i].supplyType === 3) {
            type3 += 1;
        }
    }
    if (type1 >= 1 && type2 >= 1 && type3 >= 1) {
        return true;
    }
    return false;
}

function checkZeroCardsPlayed(currentSupplyType) {
    // not if wild card in hand
    if (countWildSupply(currentPlayerUnplayedSupplyHand()) === 0) {
        //mark if one of each isnt possible and doesnt have 3 of this kind
        if (isOneOfEachPossible() === false && countSupplyTypeInCurrentHand(currentSupplyType) < 3) {
            return true;
        }
    }
    return false;
}

function checkOneCardPlayed(currentSupplyType) {
    var queueCardType = findCountrySupplyType(gameVars.globalGameOptions.supplyInfo.supplyDropQueue[0]);

    // not if wild card in hand
    if (countWildSupply(currentPlayerUnplayedSupplyHand()) === 0) {
        //if current country type is same as queue type
        if (currentSupplyType === queueCardType) {
            //mark if 3 of a kind isnt possible
            if (countSupplyTypeInCurrentHand(currentSupplyType) < 2) {
                return true;
            }
        }
        //if current country type is not same as queue type
        else {
            var typeNeeded = otherSupplyType(currentSupplyType, queueCardType);

            // mark if there is no third type
            if (countSupplyTypeInCurrentHand(typeNeeded) === 0) {
                return true;
            }
        }
    }
    return false;
}

function checkTwoCardsPlayed(currentSupplyType) {
    var cardOneType = findCountrySupplyType(gameVars.globalGameOptions.supplyInfo.supplyDropQueue[0]),
    cardTwoType = findCountrySupplyType(gameVars.globalGameOptions.supplyInfo.supplyDropQueue[1]);

    //if both cards in queue the same type 
    if (cardOneType === cardTwoType) {
        //mark if this country is any other type
        if (currentSupplyType !== cardOneType) {
            return true;
        }
    }
    //if both cards in queue not the same type
    else {
        //mark if this country is any of these types
        if (currentSupplyType === cardOneType || currentSupplyType === cardTwoType) {
            return true;
        }
    }
    return false;
}

function checkUndroppable(currentCountry) {//true is undroppable
    //mark any undroppables in supply hand
    var currentSupplyType = findCountrySupplyType(currentCountry);

    //check when 0 cards played
    if (gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length === 0) {
        return checkZeroCardsPlayed(currentSupplyType);
    }
    //check when 1 card played
    if (gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length === 1) {
        return checkOneCardPlayed(currentSupplyType);
    }
    //check when 2 cards played
    if (gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length === 2) {
        return checkTwoCardsPlayed(currentSupplyType);
    }
    return false;
}

function isSupplyable(currentCountry) {
    var currentPlayer = gameVars.gameStatus.turn,
    currentPlayerSupplyHand = gameVars.playerInfo["player" + currentPlayer].playerSupplyPoints,
    currentSupplyHandPlayableCountries = [];

    if (currentCountry === "none") {
        return true;
    }
    else {
        for (var i = 0; i < currentPlayerSupplyHand.length; i++) {
            if (!!currentPlayerSupplyHand[i]) {
                currentSupplyHandPlayableCountries.push(currentPlayerSupplyHand[i].supplyCountry);
            }
        }
        if (isItemInArray(currentCountry, currentSupplyHandPlayableCountries)) {
            gameVars.mapInfo.playableSupply.push(currentCountry);
            if ((checkUndroppable(currentCountry))) {
                return false;
            }
            else {
                return true;
            }
        }
    }
    return false;
}

function buildWildCardButtons() {
    var wildSupply = countWildSupply(gameVars.playerInfo["player" + gameVars.gameStatus.turn].playerSupplyPoints);

    if (wildSupply === 1) {
        //add wild card button
        addElement("map-screen-toolbar", "button", "Use Wild Card", "wild-drop0", "map-button", dropWildCard);
        addClass("wild-drop0", "btn");
        addClass("wild-drop0", "btn-cation");
    }
    if (wildSupply === 2) {
        //add wild card button
        addElement("map-screen-toolbar", "button", "Use Wild Card", "wild-drop0", "map-button", dropWildCard);
        addClass("wild-drop0", "btn");
        addClass("wild-drop0", "btn-cation");
        //add second wild card button
        addElement("map-screen-toolbar", "button", "Use Wild Card", "wild-drop1", "map-button", dropWildCard);
        addClass("wild-drop1", "btn");
        addClass("wild-drop1", "btn-cation");
    }
    if (wildSupply >= 3) {
        //add wild card button
        addElement("map-screen-toolbar", "button", "Use Wild Card", "wild-drop0", "map-button", dropWildCard);
        addClass("wild-drop0", "btn");
        addClass("wild-drop0", "btn-cation");
        //add second wild card button
        addElement("map-screen-toolbar", "button", "Use Wild Card", "wild-drop1", "map-button", dropWildCard);
        addClass("wild-drop1", "btn");
        addClass("wild-drop1", "btn-cation");
        //add second wild card button
        addElement("map-screen-toolbar", "button", "Use Wild Card", "wild-drop2", "map-button", dropWildCard);
        addClass("wild-drop2", "btn");
        addClass("wild-drop2", "btn-cation");
    }
}

function goToSupplyDrop() {
    //update message and note
    document.getElementById("map-message").innerHTML = findPlayerName(gameVars.gameStatus.turn) + " Choose Supply Drop. Either 3 of the same type, or 3 different types";
    document.getElementById("map-note").innerHTML = "Drops Remaining: ".concat(3 - gameVars.globalGameOptions.supplyInfo.supplyDropQueue.length);
    //remove suply drop button
    removeElement("map-screen-toolbar", "supply-drop-button");
    //remove deline attack button
    removeElement("map-screen-toolbar", "decline-attack");
    //remove confirm attack
    removeElement("map-screen-toolbar", "confirm-attack");
    //change mode
    gameVars.gameStatus.mode = "drop";
    //make cancel drop button
    addElement("map-screen-toolbar", "button", "Cancel Supply Drop", "drop-select-cancel", "map-button", clearDropSelect);
    addClass("drop-select-cancel", "btn");
    addClass("drop-select-cancel", "btn-danger");
    //check for max to disable cancel
    maxSupplyCheck();
    //make confirm drop button and disable
    addElement("map-screen-toolbar", "button", "Make Supply Drop", "make-drop", "map-button", makeSupplyDrop);
    addClass("make-drop", "btn");
    addClass("make-drop", "btn-primary");
    disableId("make-drop");
    //make wild drop button for each wild card
    buildWildCardButtons();
    //rebuild map buttons
    buildMapButtons();
    //remove toggle button
    removeElement("map-screen-toolbar", "view-supply");
}

function selectSupplyDrop() {
    var confirmDrop = confirm(findPlayerName(gameVars.gameStatus.turn) + " Go to Supply Drop?");

    if (confirmDrop) {
        goToSupplyDrop();
    }
}

function countWildSupply(currentSupplyHand){
    wildCount = 0;

    for (var i = 0; i < currentSupplyHand.length; i++) {
        if (!!currentSupplyHand[i] && currentSupplyHand[i].supplyType === "wild") {
            wildCount += 1;
        }
    }
    return wildCount;
}

function countSupplyTypes(currentSupplyHand) {
    types = [];

    for (var i = 0; i < currentSupplyHand.length; i++) {
        if (!!currentSupplyHand[i] && currentSupplyHand[i].supplyType !== "wild") {
            types.push(currentSupplyHand[i].supplyType)
        }
    }
    return findUniqueValuesInArray(types).length;
}

function supplyDropAvailable(currentSupplyHand) {
    var countWild = countWildSupply(currentSupplyHand),
    countTypes = countSupplyTypes(currentSupplyHand),
    supplyNeeded = gameVars.globalGameOptions.supplyInfo.droppedPerSession;

    //check for 3 types
    if (currentSupplyHand.length >= supplyNeeded && countTypes >= 3) {
        return true;
    }
    //check for 3 of a kind
    else if (currentSupplyHand.length >= supplyNeeded && countTypes === 1) {
        return true;
    }
    //check for wild
    else if (currentSupplyHand.length >= supplyNeeded && countWild >= 1) {
        return true;
    }
    return false;
}

function supplyDropCheck() {
    var currentPlayer = gameVars.gameStatus.turn,
    currentSupplyHand = gameVars.playerInfo["player" + currentPlayer].playerSupplyPoints,
    currentPlayerName = findPlayerName(currentPlayer),
    supplyDropReady = supplyDropAvailable(currentSupplyHand);

    if (currentSupplyHand.length >= gameVars.globalGameOptions.supplyInfo.maxSupplyPerPerson) {
        //force drop
        alert(currentPlayerName + " Forced Supply Drop");
        //go to drop
        goToSupplyDrop();
    }
    else if (supplyDropReady === true) {
        //create supply drop button
        addElement("map-screen-toolbar", "button", "Supply Drop", "supply-drop-button", "map-button", selectSupplyDrop);
        addClass("supply-drop-button", "btn");
        addClass("supply-drop-button", "btn-cation");
    }
}