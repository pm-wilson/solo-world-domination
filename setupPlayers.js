//Player Setup
function shuffleArchenemy() {
    gameVars.gameStatus.archenemyDecklist = [];
    for (var i = 0; i < archenemyDeck.length; i++) {
        gameVars.gameStatus.archenemyDecklist.push(i);
    }
    shuffleArray(gameVars.gameStatus.archenemyDecklist);
    gameVars.gameStatus.archenemyCount = 0;
}

function shuffleHeroAndConspiracy() {
    var countryNames = [],
    heroList = [],
    conspiracyList = [];

    //clear hero and conspiracy played list
    gameVars.mapInfo.heroConspiracyPlayed = [];
    //load country names
    for (var i = 0; i < gameVars.mapInfo.countryList.length; i++) {
        countryNames.push(gameVars.mapInfo.countryList[i].country);
        //remove previous hero
        if (!!gameVars.mapInfo.countryList[i].hero) {
            gameVars.mapInfo.countryList[i].hero = "";
        }
        //remove previous conspiracy
        if (!!gameVars.mapInfo.countryList[i].conspiracy) {
            gameVars.mapInfo.countryList[i].conspiracy = "";
        }
    }
    //create hero list
    if (adminSettings.useHero === true) {
        //add possible heros to hero list
        for (var h = 0; h < heroDeck.length; h++) {
            heroList.push(heroDeck[h].heroName);
        }
        //shuffle hero list
        shuffleArray(heroList);
        //shuffle country list
        shuffleArray(countryNames);
        //add hero to countries
        for (var hl = 0; hl < heroList.length && countryNames.length; hl++) {
            var currentFullCountry = findFullCountryWithCountry(countryNames[hl]);

            currentFullCountry.hero = heroList[hl];
        }
    }
    if (adminSettings.useConspiracy === true) {
        //add possible conspracy list
        for (var h = 0; h < conspiracyDeck.length; h++) {
            conspiracyList.push(conspiracyDeck[h].conspiracyName);
        }
        //shuffle conspiracy list
        shuffleArray(conspiracyList);
        //shuffle country list
        shuffleArray(countryNames);
        //add conspiracy to countries
        for (var cl = 0; cl < conspiracyList.length && countryNames.length; cl++) {
            var currentFullCountry = findFullCountryWithCountry(countryNames[cl]);

            currentFullCountry.conspiracy = conspiracyList[cl];
        }
    }
}

function placementClick(country) {
    var currentPlacementPlayer = gameVars.gameStatus.turnOrder[adminSettings.placementSetup.placementPlayer];
    dugoutDeck = gameVars.playerInfo["player" + currentPlacementPlayer].playerDugout + 1,
    dugoutDeckName = gameVars.playerInfo["player" + currentPlacementPlayer].playerDecklist[dugoutDeck].deckName,
    totalPlayers = gameVars.gameStatus.turnOrder.length,
    totalCountries = gameVars.mapInfo.countryList.length,
    countriesPerPlayer = Math.floor(totalCountries / totalPlayers);

    if (!findFullCountryWithCountry(country).deck) {
        //add deck name and deck player to country
        findFullCountryWithCountry(country).deck = {deckPlayer: currentPlacementPlayer, deckName: dugoutDeckName};
        //add 1 to dugout
        rollUpPlayerDugout(currentPlacementPlayer);
        if (adminSettings.useTwoHeadedGiant === true) {
            rollUpPlayerDugout(currentPlacementPlayer);
            //add second head
            addHeadToDeck(currentPlacementPlayer, dugoutDeckName, gameVars.playerInfo["player" + currentPlacementPlayer].playerDugout);
            //increase countries per player to account for added dugout decks
            countriesPerPlayer = countriesPerPlayer + countriesPerPlayer - 1;
        }
        //go to next turn order player
        if (adminSettings.placementSetup.placementPlayer === totalPlayers - 1) {
            //once setup is complete, go to top of turn
            if (dugoutDeck >= countriesPerPlayer) {
                //update owned continents
                controlledContinentUpdate();
                //update dugout
                rollUpAllPlayerDugout();
                //to top of turn to end setup
                topOfTurn();
            }
            else {
                //remove previous toolbar color
                removeClass("map-screen-toolbar", "player-color-" + gameVars.gameStatus.turnOrder[adminSettings.placementSetup.placementPlayer])
                //update placement player
                adminSettings.placementSetup.placementPlayer = 0;
                //update toolbar color
                addClass("map-screen-toolbar", "player-color-" + gameVars.gameStatus.turnOrder[adminSettings.placementSetup.placementPlayer]);
            }
        }
        else {
            //remove previous toolbar color
            removeClass("map-screen-toolbar", "player-color-" + gameVars.gameStatus.turnOrder[adminSettings.placementSetup.placementPlayer])
            //update placement player
            adminSettings.placementSetup.placementPlayer += 1;
            //update toolbar color
            addClass("map-screen-toolbar", "player-color-" + gameVars.gameStatus.turnOrder[adminSettings.placementSetup.placementPlayer]);

        }
        //refresh country list
        buildMapButtons();
    }
}

function setupCheck() {
    var totalNumberPlayers = Number(document.getElementById("update-player-count").value),
    currentPlayerNumber = Number(document.getElementById("update-setup-player").value);

    if (totalNumberPlayers > 5) {
        document.getElementById("update-player-count").value = 5;
    }
    if (totalNumberPlayers < 2) {
        document.getElementById("update-player-count").value = 2;
    }
    if(currentPlayerNumber > totalNumberPlayers) {
        document.getElementById("update-setup-player").value = Number(document.getElementById("update-player-count").value);
    }
    if(currentPlayerNumber < 1) {
        document.getElementById("update-setup-player").value = 1;
    }
}

function findIntroLogText(currentLogEntry) {
    if (currentLogEntry[1].search("Begins") !== -1) {
        if (currentLogEntry[1].search("Initiation") !== -1) {
            return currentLogEntry[1];
        }
        else {
            var attackLogName = findPlayerName(currentLogEntry[3]),
            attackLogDeckName = currentLogEntry[4][0].deckName;

            if (adminSettings.useTwoHeadedGiant) {
                var secondHead = findSecondHead(currentLogEntry[4][0].deckPlayer, currentLogEntry[4][0].deckName);

                return attackLogName + " attacks with " + attackLogDeckName + " and " + secondHead[0];
            }
            else {
                return attackLogName + " attacks with " + attackLogDeckName;
            }
        }
    }
    else if (currentLogEntry[1].search("Complete") !== -1) {

        if (currentLogEntry[1].search("Initiation") !== -1) {
            var completedLogName = findPlayerName(currentLogEntry[2][0][0]),
            completedLogEntry = currentLogEntry[2][0][1];

            return completedLogName + " playing " + completedLogEntry + " wins the Initiation Game!";
        }
        else {
            return currentLogEntry[2][0]
        }
    }
    else if (currentLogEntry[1].search("Drop") !== -1) {
        return "Supply Drop";
    }
}

function showLogInfo() {
    if (gameVars.gameLog.length > 0) {
        var logTextToShow = [];

        for (var i = gameVars.gameLog.length - 1; i >= 0; i--) {
            logTextToShow.push({
                logEntry: stringToDate(gameVars.gameLog[i][0])[1] + " " + stringToDate(gameVars.gameLog[i][0])[2] + ", " + stringToDate(gameVars.gameLog[i][0])[3],
                logText: findIntroLogText(gameVars.gameLog[i])
            });
        }

        //create table with above info
        var tableBody = document.getElementById("log-information"), //reference for body
        tbl = document.createElement("table"), //table element
        tblBody = document.createElement("tbody"), //tbody element)
        tblHeader = document.createElement("thead");

        var tblHeaderValues = ["Date", "Log"],
        tblHeaderRow = document.createElement("tr");

        //remove previous list
        removeElement("log-information", "log-info");
        tblHeader.appendChild(tblHeaderRow);
        for (var h = 0; h < tblHeaderValues.length; h++) {
            var headerValue = tblHeaderValues[h],
            headerCell = document.createElement("th"),
            headerText = document.createTextNode(headerValue);
            headerCell.appendChild(headerText);
            tblHeaderRow.appendChild(headerCell);
        }

        //creates all cells
        for (var i = 0; i < logTextToShow.length; i++) { 
            
            //creates a table row
            var row = document.createElement("tr"); 

            //create a td element and text node, make the text node the contents of td and put td at the end of table row
            for (var j = 0; j < tblHeaderValues.length; j++) { 
                var currentCountry = logTextToShow[i],
                values = Object.values(currentCountry),
                cell = document.createElement("td"),
                cellText = document.createTextNode(values[j]);

                cell.appendChild(cellText);    
                row.appendChild(cell);        
            }
            tblBody.appendChild(row);
        }
        tbl.id = "log-info";
        tbl.appendChild(tblHeader);
        tbl.appendChild(tblBody);
        tableBody.appendChild(tbl);
        //add class for bootstrap
        document.getElementById("log-info").classList.add("table-striped");
    }
}

function introScreenName(currentCountry) {
    if (!!currentCountry.deck) {
        var currentDeck = findFullDeckWithPlayerAndName(currentCountry.deck.deckPlayer, currentCountry.deck.deckName),
        playerName = findPlayerName(findCountryPlayer(currentCountry.country));
        countryNameText = playerName + " playing " + currentCountry.deck.deckName + introScreenColor(currentCountry);
        
        if (gameVars.gameStatus.mode === "attack" && adminSettings.useTwoHeadedGiant) {
            secondHead = findSecondHead(currentCountry.deck.deckPlayer, currentCountry.deck.deckName);

            countryNameText += " and " + secondHead[0] + "(" + secondHead[1] + ")";
        }
        if (currentDeck.deckHidden) return playerName;
        return countryNameText
    }
    return "-Empty-";
}
function introScreenColor(currentCountry) {
    if (!!currentCountry.deck) {
        var currentDeck = findFullDeckWithPlayerAndName(currentCountry.deck.deckPlayer, currentCountry.deck.deckName);

        if (currentDeck.deckHidden) return "";
        return "(" + currentDeck.deckColors + ")";
    }
    return "";
}
function introScreenGames(currentCountry) {
    if (!!currentCountry.deck) {
        var currentDeck = findFullDeckWithPlayerAndName(currentCountry.deck.deckPlayer, currentCountry.deck.deckName);
        
        if (currentDeck.deckGamesPlayed === 0) return "";
        return currentDeck.deckGamesPlayed;
    }
    return "";
}
function introScreenBonus(currentCountry) {
    if (!!currentCountry.deck) {
        var currentDeck = findFullDeckWithPlayerAndName(currentCountry.deck.deckPlayer, currentCountry.deck.deckName);
        
        if (currentDeck.deckBonuses === 0) return "";
        return currentDeck.deckBonuses;
    }
    return "";
}
function introScreenPenalty(currentCountry) {
    if (!!currentCountry.deck) {
        var currentDeck = findFullDeckWithPlayerAndName(currentCountry.deck.deckPlayer, currentCountry.deck.deckName);
        
        if (currentDeck.deckPenalties === 0) return "";
        return currentDeck.deckPenalties;
    }
    return "";
}

function updateIntroScreen() {
    //show country list with player, deck, bonuses and penalties
    var countryList = [];
    
    for (var c = 0; c < gameVars.mapInfo.countryList.length; c++) {
        countryList.push({
            countryName: gameVars.mapInfo.countryList[c].countryName, 
            deckName: introScreenName(gameVars.mapInfo.countryList[c]),
            deckGames: introScreenGames(gameVars.mapInfo.countryList[c]),
            deckBonuses: introScreenBonus(gameVars.mapInfo.countryList[c]),
            deckPenalties: introScreenPenalty(gameVars.mapInfo.countryList[c])
        }); 
    }
    //create table with above info
    var tableBody = document.getElementById("intro-information"), //reference for body
    tbl = document.createElement("table"), //table element
    tblBody = document.createElement("tbody"), //tbody element)
    tblHeader = document.createElement("thead");

    var tblHeaderValues = ["Country", "Deck", "Games", "Bonuses", "Penalties"],
    tblHeaderRow = document.createElement("tr");

    //remove previous list
    removeElement("intro-information", "known-info");
    tblHeader.appendChild(tblHeaderRow);
    for (var h = 0; h < tblHeaderValues.length; h++) {
        var headerValue = tblHeaderValues[h],
        headerCell = document.createElement("th"),
        headerText = document.createTextNode(headerValue);
        headerCell.appendChild(headerText);
        tblHeaderRow.appendChild(headerCell);
    }
    //creates all cells
    for (var i = 0; i < countryList.length; i++) { 
        //creates a table row
        var row = document.createElement("tr"); 
        //create a td element and text node, make the text node the contents of td and put td at the end of table row
        for (var j = 0; j < tblHeaderValues.length; j++) { 
            var currentCountry = countryList[i],
            values = Object.values(currentCountry),
            cell = document.createElement("td"),
            cellText = document.createTextNode(values[j]);

            cell.appendChild(cellText);    
            row.appendChild(cell);        
        }
        tblBody.appendChild(row);
    }
    tbl.id = "known-info";
    tbl.appendChild(tblHeader);
    tbl.appendChild(tblBody);
    tableBody.appendChild(tbl);
    //add class for bootstrap
    document.getElementById("known-info").classList.add("table-striped");
    //display log information
    showLogInfo();
}

function cleanupPlayerDeckLists() {
    for (var i = 0; i < gameVars.gameStatus.turnOrder.length; i++) {
        var currentPlayer = gameVars.gameStatus.turnOrder[i]
        currentPlayerDecklist = gameVars.playerInfo["player" + currentPlayer].playerDecklist;

        for (var d = 0; d < currentPlayerDecklist.length; d++) {
            currentPlayerDecklist[d].deckHidden = true;
            currentPlayerDecklist[d].deckEliminated = false;
            currentPlayerDecklist[d].deckPenalties = 0;
            currentPlayerDecklist[d].deckBonuses = 0;
            currentPlayerDecklist[d].deckVanguards = [];
            currentPlayerDecklist[d].deckAttacksMade = 0;
            currentPlayerDecklist[d].deckTimesDefended = 0;
            currentPlayerDecklist[d].deckTimesJoined = 0;          
            currentPlayerDecklist[d].deckGamesPlayed = 0;
            currentPlayerDecklist[d].deckWins = 0;
            currentPlayerDecklist[d].deckUniqueId = {deckPlayer: currentPlayer, deckName: currentPlayerDecklist[d].deckName};
        }
    }
    //setup hero, conspiracy, archenemy
    shuffleHeroAndConspiracy();
    shuffleArchenemy();
}

function buildSupplyPointList() {
    var supplyPointTypes = gameVars.globalGameOptions.supplyInfo.numberOfSupplyPointTypes,
    randomSupplyPoints = gameVars.globalGameOptions.supplyInfo.numberOfRandomSupplyPoints,
    randomCountryList = [],
    supplyPointList = [],
    currentSupplyType = 0;
    
    //create random country list
    for (var c = 0; c < gameVars.mapInfo.countryList.length; c++) {
        randomCountryList.push(gameVars.mapInfo.countryList[c].country);
    }
    shuffleArray(randomCountryList);

    //country supply points
    for (var i = 0; i < randomCountryList.length; i++) {
        currentSupplyType += 1;
        supplyPointList.push({"supplyType": currentSupplyType, "supplyCountry": randomCountryList[i]});

        if (currentSupplyType === supplyPointTypes) {
            currentSupplyType = 0;
        }
    }
    //random supply points
    for (var r = 0; r < randomSupplyPoints; r++) {
        supplyPointList.push({"supplyType": "wild", "supplyCountry": "none"});
    }
    gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw = supplyPointList;
    shuffleArray(gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw);
}

function topOfPlacementSetup() {
    //clear all battle buttons and battle variables
    battleScreenCleanup();
    //setup map
    showMap();
    buildMapButtons();
}

function setupComplete() {
    var logText = ["Initiation Game Complete"],
    battleDecks = [],
    placementSetup = adminSettings.placementSetup.usePlacementSetup

    //log end of game, add winner decks in order
    for (var i = 0; i < gameVars.battleScreenInfo.battleWinner.length; i++) {
        var currentBattlePlayer = gameVars.battleScreenInfo.battleWinner[i],
        currentBattleDeck = findBattleDeckNameWithPlayer(currentBattlePlayer);

        battleDecks.push([currentBattlePlayer, currentBattleDeck]);
    }
    logText.push(battleDecks);
    updateLog(logText)
    //update turn order
    gameVars.gameStatus.turnOrder = gameVars.battleScreenInfo.battleWinner;
    //update turn
    gameVars.gameStatus.turn = gameVars.battleScreenInfo.battleWinner[0];
    //update tool bar color
    updateToolbarColors(gameVars.gameStatus.turn);
    //cleanup decklists
    cleanupPlayerDeckLists();
    if (placementSetup === false) {
        //random setup
        //update owned continents
        controlledContinentUpdate();
        //set up map
        setupMapInformation();
        //top of turn
        topOfTurn();
    }
    else {
        //placement setup
        //top of placement setup
        topOfPlacementSetup()
    }
    //build supply point list
    buildSupplyPointList();
    //run test function
    runTestFunction();
}

function toIniGame() {
    var toIniGame = confirm("Save this information and proceed to Initiation Game?");

    if (toIniGame === true) {
        //shuffledecklists
        shuffleAllDecklists();
        //show battle info
        showBattle();
        //load initiation decks as battle decks
        for (var i = 1; i <= gameVars.globalGameOptions.totalPlayers; i++) {
            var currentPlayer = i,
            currentIniDeck = gameVars.playerInfo["player" + i].playerDecklist[0];

            gameVars.playerInfo["player" + i].playerDecklist[0].deckHidden = false;
            gameVars.battleScreenInfo.battleDecks.push({deckPlayer: currentPlayer, deckName: currentIniDeck.deckName});
        }
        //update battle players count
        gameVars.battleScreenInfo.battlePlayersCount = gameVars.battleScreenInfo.battleDecks.length;
        //show battle screen info for initiation
        for (var j = 0; j < gameVars.battleScreenInfo.battlePlayersCount; j++) {
            displayBattleInfo(j);
        }
        //set info locations
        setPlayerInfoLocation();
        //log beginning of initiation game
        updateLog(["Initiation Game Begins"]);
    }
}

function decklistWithPrettyColors(deckList) {
    var newDecklist = [];

    for (var i = 0; i < deckList.length; i++) {
        newDecklist.push({deckName: deckList[i].deckName, deckColors: colorNames(deckList[i].deckColors)})
    }
    return newDecklist;
}

function refreshDeckListShown(decklistCount, deckList) {
    var updatedDecklist = decklistWithPrettyColors(deckList),
    tableBody = document.getElementById("decklist-container"), //reference for body
    tbl = document.createElement("table"), //table element
    tblBody = document.createElement("tbody"), //tbody element)
    tblHeader = document.createElement("thead");

    var tblHeaderValues = ["Deck", "Colors"],
    tblHeaderRow = document.createElement("tr");
    
    //remove previous list
    removeElement("decklist-container", "setup-player-decklist-table");

    tblHeader.appendChild(tblHeaderRow);
    for (var h = 0; h < tblHeaderValues.length; h++) {
        var headerValue = tblHeaderValues[h],
        headerCell = document.createElement("th"),
        headerText = document.createTextNode(headerValue);
       
        headerCell.appendChild(headerText);
        headerCell.classList.add("p-3");
        tblHeaderRow.appendChild(headerCell);
    }

    //creates all cells
    for (var i = 0; i < decklistCount; i++) { 
        
        //creates a table row
        var row = document.createElement("tr"); 

        //create a td element and text node, make the text node the contents of td and put td at the end of table row
        for (var j = 0; j < tblHeaderValues.length; j++) { 
            var currentDeck = updatedDecklist[i],
            values = Object.values(currentDeck),
            cell = document.createElement("td"),
            cellText = document.createTextNode(values[j]);

            cell.appendChild(cellText);
            cell.classList.add("py-2");
            cell.classList.add("px-3");
            row.appendChild(cell);        
        }
        tblBody.appendChild(row);
    }
    tbl.id = "setup-player-decklist-table";
    tbl.appendChild(tblHeader);
    tbl.appendChild(tblBody);
    tableBody.appendChild(tbl);
    //add class for bootstrap
    document.getElementById("setup-player-decklist-table").classList.add("table-striped");
    document.getElementById("setup-player-decklist-table").classList.add("mb-5");
}

function shuffleAllDecklists() {
    for (var i = 1; i < 6; i++) {
        shuffleArray(gameVars.playerInfo["player" + i].playerDecklist);
    }
}

function countPlayerDecklist(playerNumber) {
    return gameVars.playerInfo["player" + playerNumber].playerDecklist.length;
}

function changeCurrentSetupPlayer() {
    var currentPlayerNumber = Number(document.getElementById("update-setup-player").value),
    currentPlayerName = gameVars.playerInfo["player" + currentPlayerNumber].playerName,
    decklistToShow = gameVars.playerInfo["player" + currentPlayerNumber].playerDecklist.concat(),
    decklistCount = countPlayerDecklist(currentPlayerNumber);

    //show current player name
    updateDOMElement("display-name", currentPlayerName);
    //show current player deck count
    document.getElementById("potential-decklist").innerHTML = "Potential Decklist (" + decklistCount + ")";
    //show current player decklist
    orderArray(decklistToShow, "deckName");
    refreshDeckListShown(decklistCount, decklistToShow);
    //update background
    for (var i = 1; i < 6; i++) {
        removeClass("setup-toolbar", "player-color-" + i);
    }
    addClass("setup-toolbar", "player-color-" + currentPlayerNumber);
    //shuffledecklists
    shuffleAllDecklists();
}

function changeNumberOfPlayers() {
    var newNumberOfPlayers = Number(document.getElementById("update-player-count").value);

    //update variable
    gameVars.globalGameOptions.totalPlayers = newNumberOfPlayers;
    //set max player number
    document.getElementById("update-setup-player").max = newNumberOfPlayers;
    //turn to max if past
    if (document.getElementById("update-setup-player").value > newNumberOfPlayers) {
        document.getElementById("update-setup-player").value = newNumberOfPlayers;
        changeCurrentSetupPlayer();
    }
    //shuffledecklists
    shuffleAllDecklists();
}

function setupPlayerName() {
    var currentPlayerNumber = Number(document.getElementById("update-setup-player").value),
    currentPlayerName = gameVars.playerInfo["player" + currentPlayerNumber].playerName,
    changePlayerNameTo = prompt("Change Name to:", currentPlayerName);

    if (!!changePlayerNameTo) {
        gameVars.playerInfo["player" + currentPlayerNumber].playerName = changePlayerNameTo;
    }
    updateDOMElement("display-name", changePlayerNameTo);
    //shuffledecklists
    shuffleAllDecklists();
}

function initialStartup() {
    showIntro();
    //refresh player 1 info
    changeCurrentSetupPlayer();
    //show current game options
    activateCountrySupport();
    activatePlacementSetup();
    activateTwoHeadedGiant();
    activateArchenemy();
    activateDefensePlane();
    activateAdditionalDecks();
    activateVanguard();
    activateHero();
    activateConspiracy();
    activateContinentBonuses();
    activateContinentMoves();
}

//Game Options
function activateCountrySupport() {
    if (document.getElementById("checkbox-enable-support").checked) {
        //update option
        adminSettings.supportBonus.useSupportBonusInGame = true;
        //update message
        document.getElementById("option-support-message").innerHTML = "Bonuses applied for each allied country surrounding and not participating in a battle.";
        //unhide realted options
        removeClass("option-support-options", "hide-item-class");
    }
    else {
        //update option
        adminSettings.supportBonus.useSupportBonusInGame = false;
        //update message
        document.getElementById("option-support-message").innerHTML = "Country Support Disabled";
        //hide related options
        addClass("option-support-options", "hide-item-class");
    }
    //list current attacker life
    document.getElementById("change-attacker-life").defaultValue = adminSettings.supportBonus.attackingLife;
    //list current attacker cards
    document.getElementById("change-attacker-cards").defaultValue = adminSettings.supportBonus.attackingHand;
    //list current attacker power
    document.getElementById("change-attacker-power").defaultValue = adminSettings.supportBonus.attackingPower;
    //list current attacker toughness
    document.getElementById("change-attacker-toughness").defaultValue = adminSettings.supportBonus.attackingToughness;
    //list current defender life
    document.getElementById("change-defender-life").defaultValue = adminSettings.supportBonus.defendingLife;
    //list current defender cards
    document.getElementById("change-defender-cards").defaultValue = adminSettings.supportBonus.defendingHand;
    //list current defender power
    document.getElementById("change-defender-power").defaultValue = adminSettings.supportBonus.defendingPower;
    //list current defender toughness
    document.getElementById("change-defender-toughness").defaultValue = adminSettings.supportBonus.defendingToughness;
}

function updateSupport(support, id) {
    adminSettings.supportBonus[support] = Number(document.getElementById(id).value);
}

function activatePlacementSetup() {
    if (document.getElementById("checkbox-enable-placement").checked) {
        //update option
        adminSettings.placementSetup.usePlacementSetup = true;
        //update message
        document.getElementById("option-board-message").innerHTML = "Players choose starting countries in turn order.";
    }
    else {
        //update option
        adminSettings.placementSetup.usePlacementSetup = false;
        //update message
        document.getElementById("option-board-message").innerHTML = "Starting countries are chosen randomly.";
    }
}

function activateTwoHeadedGiant() {
    if (document.getElementById("checkbox-two-headed-giant").checked) {
        //update option
        adminSettings.useTwoHeadedGiant = true;
        //update message
        document.getElementById("option-two-headed-giant-message").innerHTML = "Games will be Two-Headed Giant.";
    }
    else {
        //update option
        adminSettings.useTwoHeadedGiant = false;
        //update message
        document.getElementById("option-two-headed-giant-message").innerHTML = "Games will be single decks.";
    }
}

function activateArchenemy() {
    if (document.getElementById("checkbox-archenemy").checked) {
        //update option
        adminSettings.useArchenemy = true;
        //update message
        document.getElementById("option-archenemy-message").innerHTML = "A button on the battle screen shows an Archenemy card. Each turn the defender gets a 1 in 6 chance each game turn to play one.";
    }
    else {
        //update option
        adminSettings.useArchenemy = false;
        //update message
        document.getElementById("option-archenemy-message").innerHTML = "Archenemy Disabled";
    }
}

function activateDefensePlane() {
    if (document.getElementById("checkbox-defense-plane").checked) {
        //update option
        adminSettings.useDefensePlane = true;
        //update message
        document.getElementById("option-defense-plane-message").innerHTML = "Each defending deck chooses a defense plane to stay with the deck. This will be the starting plane if it is on the continent color, or be included in the continent planar deck if not.";
    }
    else {
        //update option
        adminSettings.useDefensePlane = false;
        //update message
        document.getElementById("option-defense-plane-message").innerHTML = "Defense Planes Disabled";
    }
}

function activateAdditionalDecks() {
    if (document.getElementById("checkbox-additional-decks").checked) {
        //update option
        adminSettings.useAdditionalDeckDrops = true;
        //update message
        document.getElementById("option-additional-decks-message").innerHTML = "New decks enter the game from the player deck list when supply cards are played on an unoccupied country. As long as another deck is available.";
    }
    else {
        //update option
        adminSettings.useAdditionalDeckDrops = false;
        //update message
        document.getElementById("option-additional-decks-message").innerHTML = "No new decks will be dropped in the game.";
    }
}

function activateVanguard() {
    if (document.getElementById("checkbox-vanguard").checked) {
        //update option
        adminSettings.useVanguard = true;
        //update message
        document.getElementById("option-vanguard-message").innerHTML = "A Vanguard card is awarded to each game winner. Each game the deck starts with a random Vanguard it has won.";
    }
    else {
        //update option
        adminSettings.useVanguard = false;
        //update message
        document.getElementById("option-vanguard-message").innerHTML = "Vanguards Disabled";
    }
}

function activateHero() {
    if (document.getElementById("checkbox-hero").checked) {
        //update option
        adminSettings.useHero = true;
        //update message
        document.getElementById("option-hero-message").innerHTML = "Each Hero is assigned to a random country and is shuffled if a turn goes by without the current player winning. A deck starts with a given Hero if they defend a country with one.";
    }
    else {
        //update option
        adminSettings.useHero = false;
        //update message
        document.getElementById("option-hero-message").innerHTML = "Hero Disabled";
    }
}

function activateConspiracy() {
    if (document.getElementById("checkbox-conspiracy").checked) {
        //update option
        adminSettings.useConspiracy = true;
        //update message
        document.getElementById("option-conspiracy-message").innerHTML = "Each Conspiracy is assigned to a random country and is shuffled if a turn goes by without the current player winning. A deck starts with a given Conspiracy if they attack from a country with one.";
    }
    else {
        //update option
        adminSettings.useConspiracy = false;
        //update message
        document.getElementById("option-conspiracy-message").innerHTML = "Conspiracy Disabled";
    }
}

function activateContinentBonuses() {
    if (document.getElementById("checkbox-continent-bonuses").checked) {
        //update option
        adminSettings.continentBonuses.useContinentBonuses = true;
        //update message
        document.getElementById("option-continent-bonuses-message").innerHTML = "Each deck that has a color that corresponds with the attacked continent gets an ability. If a player is the only one occupying a continent it applies to all their decks. A second color is chosen if they control all countries on the continent.";
        //unhide realted options
        removeClass("option-continent-bonuses-options", "hide-item-class");
        //continent north america
        document.getElementById("continent-northamerica").defaultValue = adminSettings.continentBonuses["bonusNorth America"];
        //continent north america life
        document.getElementById("continent-northamerica-life").defaultValue = adminSettings.continentBonuses["continentLifeBonus"];
        //continent europe
        document.getElementById("continent-europe").defaultValue = adminSettings.continentBonuses["bonusEurope"];
        //continent europe hand size
        document.getElementById("continent-europe-hand").defaultValue = adminSettings.continentBonuses["continentCardPerDeckBonus"];
        //continent europe minimum cards
        document.getElementById("continent-europe-minimum").defaultValue = adminSettings.continentBonuses["continentCardMinimum"];
        //continent africa
        document.getElementById("continent-africa").defaultValue = adminSettings.continentBonuses["bonusAfrica"];
        //continent australia
        document.getElementById("continent-australia").defaultValue = adminSettings.continentBonuses["bonusAustralia"];
        //continent asia
        document.getElementById("continent-asia").defaultValue = adminSettings.continentBonuses["bonusAsia"];
        //continent south america all decks
        document.getElementById("continent-southamerica").defaultValue = adminSettings.continentBonuses["bonusSouth America"];
    }
    else {
        //update option
        adminSettings.continentBonuses.useContinentBonuses = false;
        //update message
        document.getElementById("option-continent-bonuses-message").innerHTML = "Continent Bonuses Disabled";
        //hide realted options
        addClass("option-continent-bonuses-options", "hide-item-class");
    }
}

function updateContinentBonus(bonusToChange, id) {
    adminSettings.continentBonuses[bonusToChange] = document.getElementById(id).value;
}

function updateNorthAmericaLife() {
    adminSettings.continentBonuses["continentLifeBonus"] = Number(document.getElementById("continent-northamerica-life").value);
}

function updateEuropeCards() {
    adminSettings.continentBonuses["continentCardPerDeckBonus"] = Number(document.getElementById("continent-europe-hand").value);
}

function updateMinEuropeCards() {
    adminSettings.continentBonuses["continentCardMinimum"] = Number(document.getElementById("continent-europe-minimum").value);
}

function activateContinentMoves() {
    //move count north america
    document.getElementById("move-northamerica").defaultValue = adminSettings.continentMoves["moveNorth America"];
    //move count europe
    document.getElementById("move-europe").defaultValue = adminSettings.continentMoves["moveEurope"];
    //move count europe
    document.getElementById("move-africa").defaultValue = adminSettings.continentMoves["moveAfrica"];
    //move count europe
    document.getElementById("move-australia").defaultValue = adminSettings.continentMoves["moveAustralia"];
    //move count europe
    document.getElementById("move-asia").defaultValue = adminSettings.continentMoves["moveAsia"];
    //move count europe
    document.getElementById("move-southamerica").defaultValue = adminSettings.continentMoves["moveSouth America"];
}

function updateMove(continentMove, id) {
    if (Number(document.getElementById(id).value) > 10) {
        adminSettings.continentMoves[continentMove] = 10;
    }
    else {
        adminSettings.continentMoves[continentMove] = Number(document.getElementById(id).value);
    }
}

function checkMoveOver(continentMove, id) {
    if (Number(document.getElementById(id).value) > 10) {
        document.getElementById(id).value = adminSettings.continentMoves[continentMove];
    }
}

function uploadDecklist() {
    //show prompt
    unhideId("deck-upload-prompt");
    //unlock paste listener
    adminSettings.unlockDecklistPaste = true;
}

function deckPasteCancel() {
    //hide prompt
    hideId("deck-upload-prompt");
    //lock paste listener
    adminSettings.unlockDecklistPaste = false;
}

function checkDeckColors(colors) {
    var colorsInCaps = colors.toUpperCase(),
    newDeckColors = "";

    //check for w
    if (colorsInCaps.indexOf("W") !== -1) {
        newDeckColors += "W";
    }
    //check for u
    if (colorsInCaps.indexOf("U") !== -1) {
        newDeckColors += "U";
    }
    //check for b
    if (colorsInCaps.indexOf("B") !== -1) {
        newDeckColors += "B";
    }
    //check for r
    if (colorsInCaps.indexOf("R") !== -1) {
        newDeckColors += "R";
    }
    //check for g
    if (colorsInCaps.indexOf("G") !== -1) {
        newDeckColors += "G";
    }
    //check for n
    if (newDeckColors === "") {
        newDeckColors += "N";
    }
    return newDeckColors;
}

function checkDeckName(deckName) {
    //replace double quotes with single quotes
    var newDeckName = deckName.replace(/"/g, "'");

    return newDeckName;
}

function convertCSVtoDecklist(csv) {
    var newDecklist = [],
    csvTabToComma = csv.replace(/\t/g, ",")
    decklistArray = csvTabToComma.split('\n').map(function(ln){
        //https://stackoverflow.com/questions/47876718/splitting-text-file-by-newlines-and-tab-in-javascript
        return ln.split(',');
    });
    for (var i = 0; i < decklistArray.length; i++) {
        if (decklistArray[i].length === 2 && decklistArray[i][0] !== "" && decklistArray[i][0] !== "undefined") {
            newDecklist.push({deckName: checkDeckName(decklistArray[i][0]), deckColors: checkDeckColors(decklistArray[i][1])});
        }
    }
    return newDecklist;
}

document.addEventListener('paste', function (event) {
    if (adminSettings.unlockDecklistPaste === true) {
        var copiedDecklist = event.clipboardData.getData('Text'),
        playerNumber = Number(document.getElementById("update-setup-player").value);
    
        //hide prompt
        deckPasteCancel();
        //clear player decklist
        gameVars.playerInfo["player" + playerNumber].playerDecklist = [];
        //update player decklist
        gameVars.playerInfo["player" + playerNumber].playerDecklist = convertCSVtoDecklist(copiedDecklist);
        //refresh potential decklist
        changeCurrentSetupPlayer();
    }
});

/*
//warns about refresh
window.onbeforeunload = function() {
    return "";
}
*/