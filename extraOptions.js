
//Handle Planar Cards
function planarPrompt(promptText) {
    //show prompt text
    document.getElementById("planar-choice-text").innerHTML = promptText;
    //show prompt
    removeClass("planar-prompt", "hide-item-class");
}

function handleNormalPlanePrompt() {
    var planeText = "Planeswalk to Next Plane?";

    //prompt for planeswalk
    planarPrompt(planeText);
    addElement("planar-choice-menu", "div", "noContent", "planeswalk", "noClass", rollNextPlane);
    addElement("planar-choice-menu", "button", "Cancel", "cancel-prompt", "noClass", cancelPrompt);
    addClass("cancel-prompt", "btn");
    addClass("cancel-prompt", "btn-danger");
}

function poolsChaos() {
    //remove previous choices
    removeElement("planar-choice-menu", "cancel-prompt");
    removeElement("planar-choice-menu", "pools-chaos");
    removeElement("planar-choice-menu", "planeswalk");
    //reveals next 3 cards in a row and puts on bottom
    shufflePlanarDeck();
    //move pools to top front
    if (gameVars.battleScreenInfo.secondPlane.length === 0) {
        gameVars.battleScreenInfo.planarDeck = moveArrayObjectToBeginningOfArray("Pools of Becoming", gameVars.battleScreenInfo.planarDeck);
    }
    else {
        gameVars.battleScreenInfo.planarDeck = moveArrayObjectToBeginningOfArray(gameVars.battleScreenInfo.secondPlane[1], gameVars.battleScreenInfo.planarDeck);
        gameVars.battleScreenInfo.planarDeck = moveArrayObjectToBeginningOfArray(gameVars.battleScreenInfo.secondPlane[0], gameVars.battleScreenInfo.planarDeck);
    }
    //show pools on battle screen
    document.getElementById("battle-defense-plane").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[0]);
    //add an element that shows next plane, click puts it on bottom for 3 clicks
    addElement("planar-choice-menu", "div", "noContent", "pools-reveal", "reveal-one-card", poolsCardClick);
    //show first card
    document.getElementById("pools-reveal").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[1]);
    //update card count
    gameVars.battleScreenInfo.currentPlanarCard = 1;
    //update prompt text
    document.getElementById("planar-choice-text").innerHTML = "These 3 planar abilities happen (Phenomenons do nothing), click once ability is complete:";
}

function poolsCardClick() {
    var planarAbilities = 2 - gameVars.battleScreenInfo.currentPlanarCard;

    if (gameVars.battleScreenInfo.currentPlanarCard === 3) {
        //move previous 3 cards to bottom
        gameVars.battleScreenInfo.planarDeck = moveArrayObjectToEndOfArray(gameVars.battleScreenInfo.planarDeck[1], gameVars.battleScreenInfo.planarDeck);
        gameVars.battleScreenInfo.planarDeck = moveArrayObjectToEndOfArray(gameVars.battleScreenInfo.planarDeck[1], gameVars.battleScreenInfo.planarDeck);
        gameVars.battleScreenInfo.planarDeck = moveArrayObjectToEndOfArray(gameVars.battleScreenInfo.planarDeck[1], gameVars.battleScreenInfo.planarDeck);
        //adjust planar card count
        gameVars.battleScreenInfo.currentPlanarCard -= 3;
        //cleanup prompt
        removeElement("planar-choice-menu", "pools-reveal");
        //go back to battle screen
        addClass("planar-prompt", "hide-item-class");
    }
    else {
        //update prompt text
        document.getElementById("planar-choice-text").innerHTML = planarAbilities + " more planar abilities will happen (Phenomenons do nothing), click once ability is complete:";
        //update card count
        gameVars.battleScreenInfo.currentPlanarCard += 1;
        //show current card
        document.getElementById("pools-reveal").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[gameVars.battleScreenInfo.currentPlanarCard]);
    }
}

function cancelPrompt() {
    //remove previous choices
    removeElement("planar-choice-menu", "cancel-prompt");
    removeElement("planar-choice-menu", "pools-chaos");
    removeElement("planar-choice-menu", "stairs-chaos");
    removeElement("planar-choice-menu", "planeswalk");
    //hide prompt
    addClass("planar-prompt", "hide-item-class");
    document.getElementById("planar-choice-text").innerHTML = "";
}

function handlePoolsOfBecoming() {
    var planeText = "Planeswalk or Chaos?";

    //prompt for planeswalk or chaos
    planarPrompt(planeText);
    addElement("planar-choice-menu", "div", "noContent", "pools-chaos", "noClass", poolsChaos);
    addElement("planar-choice-menu", "div", "noContent", "planeswalk", "noClass", rollNextPlane);
    addElement("planar-choice-menu", "button", "Cancel", "cancel-prompt", "noClass", cancelPrompt);
    addClass("cancel-prompt", "btn");
    addClass("cancel-prompt", "btn-danger");
}

function stairsChaosYes() {
    var stairsCount = findItemRefInArray("Stairs to Infinity", gameVars.battleScreenInfo.planarDeck);

    //move plane card to bottom
    gameVars.battleScreenInfo.planarDeck = moveArrayObjectToEndOfArray(gameVars.battleScreenInfo.planarDeck[stairsCount + 1], gameVars.battleScreenInfo.planarDeck);
    //clear prompt
    stairsChaosNo();
}

function stairsChaosNo() {
    //remove previous choices
    removeElement("planar-choice-menu", "stairs-yes");
    removeElement("planar-choice-menu", "stairs-no");
    removeElement("planar-choice-menu", "stairs-reveal");
    //hide prompt
    addClass("planar-prompt", "hide-item-class");
}

function stairsChaos() {
    var stairsCount = findItemRefInArray("Stairs to Infinity", gameVars.battleScreenInfo.planarDeck);

    //remove previous choices
    removeElement("planar-choice-menu", "cancel-prompt");
    removeElement("planar-choice-menu", "stairs-chaos");
    removeElement("planar-choice-menu", "planeswalk");
    //add yes and no buttons
    addElement("planar-choice-menu", "button", "Yes", "stairs-yes", "stairs-chaos-yes", stairsChaosYes);
    addClass("stairs-yes", "btn");
    addClass("stairs-yes", "btn-success");
    addElement("planar-choice-menu", "button", "No", "stairs-no", "stairs-chaos-no", stairsChaosNo);
    addClass("stairs-no", "btn");
    addClass("stairs-no", "btn-danger");
    //do this if on last card
    if (gameVars.battleScreenInfo.planarDeck.length - 1 === stairsCount) {
        //reveals next 3 cards in a row and puts on bottom
        shufflePlanarDeck();
        //move stairs to top front
        gameVars.battleScreenInfo.planarDeck = moveArrayObjectToBeginningOfArray("Stairs to Infinity", gameVars.battleScreenInfo.planarDeck);
        //show stairs on battle screen
        document.getElementById("battle-defense-plane").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[0]);
        //update stairs count
        stairsCount = findItemRefInArray("Stairs to Infinity", gameVars.battleScreenInfo.planarDeck);
    }
    //add an element that shows next plane, click puts it on bottom for 3 clicks
    addElement("planar-choice-menu", "div", "noContent", "stairs-reveal", "reveal-one-card");
    //show next card
    document.getElementById("stairs-reveal").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[stairsCount + 1]);
    //update prompt text
    document.getElementById("planar-choice-text").innerHTML = "Would you like to put this Planar card on the bottom?";
}

function handleStairsToInfinity() {
    var planeText = "Planeswalk or Chaos?";

    //prompt for planeswalk or chaos
    planarPrompt(planeText);
    addElement("planar-choice-menu", "div", "noContent", "stairs-chaos", "noClass", stairsChaos);
    addElement("planar-choice-menu", "div", "noContent", "planeswalk", "noClass", rollNextPlane);
    addElement("planar-choice-menu", "button", "Cancel", "cancel-prompt", "noClass", cancelPrompt);
    addClass("cancel-prompt", "btn");
    addClass("cancel-prompt", "btn-danger");
}

function tunnelChoice(choice) {    
    newPlanarDeck = [],
    cardsForBottom = [];

    //shuffle other 4 and phenomenoms and put on bottom of deck
    for (var i = 0; i < gameVars.battleScreenInfo.planarDeck.length; i++) {
        if (isItemInArray(gameVars.battleScreenInfo.planarDeck[i], gameVars.battleScreenInfo.planarTemp)) {
            if (gameVars.battleScreenInfo.planarDeck[i] === choice) {
                newPlanarDeck.push(gameVars.battleScreenInfo.planarDeck[i]);
            }
            else {
                cardsForBottom.push(gameVars.battleScreenInfo.planarDeck[i]);
            }
        }
        else {
            newPlanarDeck.push(gameVars.battleScreenInfo.planarDeck[i]);
        }

    }
    //shuffle bottom cards
    shuffleArray(cardsForBottom);
    //move all other 4 to bottom in random order
    for (var r = 0; r < cardsForBottom.length; r++) {
        newPlanarDeck.push(cardsForBottom[r]);
    }
    gameVars.battleScreenInfo.planarDeck = newPlanarDeck;
    //cleanup and hide prompt
    removeElement("planar-choice-box", "planar-choice-menu");
    addElement("planar-choice-box", "div", "noContent", "planar-choice-menu");
    //clear temp
    gameVars.battleScreenInfo.planarTemp = [];
    //roll to next plane
    rollNextPlane();
}

function tunnelPlaneswalk() {
    var tunnelPreviewCards = [];

    //remove choices
    removeElement("planar-choice-menu", "cancel-prompt");
    removeElement("planar-choice-menu", "planeswalk");
    //reveals until 5 plane cards are found and player chooses next, rest on bottom in a random order
    shufflePlanarDeck();
    //move stairs to top
    gameVars.battleScreenInfo.planarDeck = moveArrayObjectToBeginningOfArray("Interplanar Tunnel", gameVars.battleScreenInfo.planarDeck);
    //show stairs on battle screen
    document.getElementById("battle-defense-plane").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[0]);
    //clear temp
    gameVars.battleScreenInfo.planarTemp = [];
    //finds next 5
    for (var i = 1; i < gameVars.battleScreenInfo.planarDeck.length; i++) {
        if (tunnelPreviewCards.length < 5 && isPlanePhenomenom(gameVars.battleScreenInfo.planarDeck[i]) === false) {
            tunnelPreviewCards.push(gameVars.battleScreenInfo.planarDeck[i]);
            //copy name to planar temp
            gameVars.battleScreenInfo.planarTemp.push(gameVars.battleScreenInfo.planarDeck[i]);
        }
        else if (tunnelPreviewCards.length < 5) {
            //copy name to planar temp
            gameVars.battleScreenInfo.planarTemp.push(gameVars.battleScreenInfo.planarDeck[i]);
        }
    }
    //build a button for each of 5 planes
    for (var p = 0; p < tunnelPreviewCards.length; p++) {
        addElement("planar-choice-menu", "div", "noContent", tunnelPreviewCards[p], "reveal-five-cards", tunnelChoice);
        //show plane card
        document.getElementById(tunnelPreviewCards[p]).style.backgroundImage = getPlanarPicture(tunnelPreviewCards[p]);
    }
}

function isPlanePhenomenom(planeName) {
    phenomenomNameList = [];

    for (var i = 0; i < phenomenomDeck.length; i++) {
        phenomenomNameList.push(phenomenomDeck[i].planeName);
    }
    return isItemInArray(planeName, phenomenomNameList);
}

function handleInterplanarTunnel() {
    var planeText = "Planeswalk into the Interplanar Tunnel?";

    planarPrompt(planeText);
    addElement("planar-choice-menu", "div", "noContent", "planeswalk", "noClass", tunnelPlaneswalk);
    addElement("planar-choice-menu", "button", "Cancel", "cancel-prompt", "noClass", cancelPrompt);
    addClass("cancel-prompt", "btn");
    addClass("cancel-prompt", "btn-danger");
}

function findNextPlane(planeToKeepOutOfDeck) {
    //shuffle planar deck
    shufflePlanarDeck();
    //move plane to top
    gameVars.battleScreenInfo.planarDeck = moveArrayObjectToBeginningOfArray(planeToKeepOutOfDeck, gameVars.battleScreenInfo.planarDeck);
    //reveal until 1 plane card is found
    for (var p = 1; p < gameVars.battleScreenInfo.planarDeck.length; p++) {
        if (isPlanePhenomenom(gameVars.battleScreenInfo.planarDeck[p]) === false) {
            return gameVars.battleScreenInfo.planarDeck[i];
        }
        else {
            gameVars.battleScreenInfo.currentPlanarCard += 1;
        }
    }
}

function aetherPlaneswalk() {
    //check that next plane is plane
    findNextPlane("Chaotic Aether");
    //display current plane
    rollNextPlane();
    //create second card space
    addElement("battle-information", "div", "noContent", "reveal-chaotic-aether", "noClass");
    //show picture
    document.getElementById("reveal-chaotic-aether").style.backgroundImage = getPlanarPicture("Chaotic Aether");
}

function handleChaoticAether() {
    var planeText = "Planeswalk into the Chaotic Aether?";

    planarPrompt(planeText);
    addElement("planar-choice-menu", "div", "noContent", "planeswalk", "noClass", aetherPlaneswalk);
    addElement("planar-choice-menu", "button", "Cancel", "cancel-prompt", "noClass", cancelPrompt);
}

function findNextTwoPlanes(planeToKeepOutOfDeck) {
    var nextTwoPlanes = [];

    //shuffle planar deck
    shufflePlanarDeck();
    //move plane to top
    gameVars.battleScreenInfo.planarDeck = moveArrayObjectToBeginningOfArray(planeToKeepOutOfDeck, gameVars.battleScreenInfo.planarDeck);
    //find next two planes
    for (var i = 1; i < gameVars.battleScreenInfo.planarDeck.length; i++) {
        if (nextTwoPlanes.length < 2) {
            if (isPlanePhenomenom(gameVars.battleScreenInfo.planarDeck[i]) === false) {
                nextTwoPlanes.push(gameVars.battleScreenInfo.planarDeck[i])
            }
            else {
                gameVars.battleScreenInfo.currentPlanarCard += 1;
            }
        }
    }
    return nextTwoPlanes;
}

function mergingPlaneswalk() {
    //reveal until 2 plane cards are found and go first and next in second card space
    var nextTwoPlanes = findNextTwoPlanes("Spatial Merging");

    //cancel prompt
    cancelPrompt();
    //go to next card
    gameVars.battleScreenInfo.currentPlanarCard += 1;
    //display two current planes
    moveArrayObjectToBeginningOfArray(nextTwoPlanes[0], gameVars.battleScreenInfo.planarDeck);
    moveArrayObjectToBeginningOfArray(nextTwoPlanes[1], gameVars.battleScreenInfo.planarDeck);
    
    //remove plane card spaces
    removeElement("battle-information", "battle-defense-plane2");
    removeElement("battle-information", "reveal-chaotic-aether");
    removeElement("battle-information", "reveal-spatial-merging");
    //clear prompt menu
    cancelPrompt();
    //save second plane name
    gameVars.battleScreenInfo.secondPlane.push(nextTwoPlanes[0]);
    gameVars.battleScreenInfo.secondPlane.push(nextTwoPlanes[1]);
    //go to next card
    gameVars.battleScreenInfo.currentPlanarCard += 1;
    //show picture
    document.getElementById("battle-defense-plane").style.backgroundImage = getPlanarPicture(nextTwoPlanes[1]);
    //create second card space
    addElement("battle-information", "div", "noContent", "reveal-spatial-merging", "noClass", secondPlaneChaosRoll);
    //show second picture
    document.getElementById("reveal-spatial-merging").style.backgroundImage = getPlanarPicture(nextTwoPlanes[0]);
}

function handleSpatialMerging() {  
    var planeText = "Planeswalk into the next two planes Spatial Merging?";

    planarPrompt(planeText);
    addElement("planar-choice-menu", "div", "noContent", "planeswalk", "noClass", mergingPlaneswalk);
    addElement("planar-choice-menu", "button", "Cancel", "cancel-prompt", "noClass", cancelPrompt);   
}

function shufflePlanarDeck(plane) {
    var currentGroundZero = gameVars.battleScreenInfo.groundZero,
    groundZeroContinent = findCountryContinent(currentGroundZero),
    newPlanarDeck = [],
    possiblePhenomenomDeck = [];

    //reset current planar card
    gameVars.battleScreenInfo.currentPlanarCard = 0;
    //first shuffle
    if (gameVars.battleScreenInfo.planarDeck.length === 0) {
        //push continent planes
        for (var i = 0; i < planarDeck.length; i++) {
            if (planarDeck[i].planeContinent === groundZeroContinent && planarDeck[i].planeName !== plane.planeName) {
                newPlanarDeck.push(planarDeck[i].planeName);
            }
        }
        //push random phenomenom
        for (var p = 0; p < phenomenomDeck.length; p++) {
            if (isItemInArray(phenomenomDeck[p].planeName, newPlanarDeck) === false) {
                possiblePhenomenomDeck.push(phenomenomDeck[p].planeName);
            }
        }
        shuffleArray(possiblePhenomenomDeck);
        if (possiblePhenomenomDeck.length > 0) {
            newPlanarDeck.push(possiblePhenomenomDeck[0]);
        }
        //shuffle planar deck
        shuffleArray(newPlanarDeck);
        //saves planar deck
        if (findPlaneContinent(plane.planeName) === findCountryContinent(currentGroundZero)) {//start in plane
            var planarDeckToUse = [];
            
            //push defense plane
            planarDeckToUse.push(plane.planeName);
            //push rest of shuffled planar deck
            for (var d = 0; d < newPlanarDeck.length; d++) {
                planarDeckToUse.push(newPlanarDeck[d]);
            }
            //update planar deck
            gameVars.battleScreenInfo.planarDeck = planarDeckToUse;
        }
        else {//start in random
            //push defense plane
            newPlanarDeck.push(plane.planeName);
            //shuffle planar deck
            shuffleArray(newPlanarDeck);
            //update planar deck
            gameVars.battleScreenInfo.planarDeck = newPlanarDeck;
        }
    }
    //ongoing shuffle
    else {
        //add phenomenom
        for (var c = 0; c < phenomenomDeck.length; c++) {
            if (isItemInArray(phenomenomDeck[c].planeName, gameVars.battleScreenInfo.planarDeck) === false) {
                possiblePhenomenomDeck.push(phenomenomDeck[c].planeName);
            }
        }
        if (possiblePhenomenomDeck.length > 0) {
            shuffleArray(possiblePhenomenomDeck);
            gameVars.battleScreenInfo.planarDeck.push(possiblePhenomenomDeck[0]);
        }
        //shuffle planar deck and reset current card
        shuffleArray(gameVars.battleScreenInfo.planarDeck);
        //show picture
        document.getElementById("battle-defense-plane").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[0]);
    }
}

function shuffleNoteText(plane) {
    var currentGroundZero = gameVars.battleScreenInfo.groundZero,
    groundZeroContinent = findCountryContinent(currentGroundZero);

    if (findPlaneContinent(plane.planeName) === findCountryContinent(currentGroundZero)) {
        return "Start in " + plane.planeName + ", and shuffle the " + groundZeroContinent + " planes and add a phenomenon";
    }
    else {
        return "Start in a random plane and shuffle " + plane.planeName + " in with the " + groundZeroContinent + " planes and add a phenomenon";
    }
}

function createDefensePlane() {
    var defendingPlayerDeck = gameVars.battleScreenInfo.battleDecks[1];

    //do this if deck has defense plane
    if (gameVars.gameStatus.mode === "attack" && !!findFullDeckWithPlayerAndName(defendingPlayerDeck.deckPlayer, defendingPlayerDeck.deckName).defensePlane) {
        var defensePlaneRef = findDefensePlaneRefWithPlayerAndDeckName(defendingPlayerDeck.deckPlayer, defendingPlayerDeck.deckName);

        //create the element
        addElement("battle-information", "div", "noContent", "battle-defense-plane", "noClass", planarChaosRoll);
        //plane shuffle note
        document.getElementById("battle-note").innerHTML = shuffleNoteText(planarDeck[defensePlaneRef])
        //create planar deck
        shufflePlanarDeck(planarDeck[defensePlaneRef]);
        //show picture
        document.getElementById("battle-defense-plane").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[gameVars.battleScreenInfo.currentPlanarCard]);
    }
}

function getPlanarPicture(planeName) {
    for (var i = 0; i < planarDeck.length; i++) {
        if (planarDeck[i].planeName === planeName) {
            return planarDeck[i].planePicture;
        }
    }
    for (var p = 0; p < phenomenomDeck.length; p++) {
        if (phenomenomDeck[p].planeName === planeName) {
            return phenomenomDeck[p].planePicture;
        }
    }
}

function secondPlaneChaosRoll() {
    var secondPlaneName = gameVars.battleScreenInfo.secondPlane[0];
    
    //add exceptions for special cards
    switch (secondPlaneName) {
        case "Pools of Becoming":
            handlePoolsOfBecoming();
            break;
        case "Stairs to Infinity":
            handleStairsToInfinity();
            break;
        default:
            handleNormalPlanePrompt();
    }
}

function planarChaosRoll() {
    if (gameVars.battleScreenInfo.secondPlane.length === 0) {
        var currentPlaneName = gameVars.battleScreenInfo.planarDeck[gameVars.battleScreenInfo.currentPlanarCard];
    }
    else {
        var currentPlaneName = gameVars.battleScreenInfo.secondPlane[1];
    }
    //add exceptions for special cards
    switch (currentPlaneName) {
        case "Pools of Becoming":
            handlePoolsOfBecoming();
            break;
        case "Stairs to Infinity":
            handleStairsToInfinity();
            break;
        case "Chaotic Aether":
            handleChaoticAether();
            break;
        case "Interplanar Tunnel":
            handleInterplanarTunnel();
            break;
        case "Spatial Merging":
            handleSpatialMerging();
            break;
        default:
            handleNormalPlanePrompt();
    }
}

function rollNextPlane() {
    //hide prompt
    addClass("planar-prompt", "hide-item-class");
    if (gameVars.battleScreenInfo.planarDeck.length === gameVars.battleScreenInfo.currentPlanarCard + 1) {
        //reshuffle
        shufflePlanarDeck();
    }
    else {
        //go to next card
        gameVars.battleScreenInfo.currentPlanarCard += 1;
        //show picture
        document.getElementById("battle-defense-plane").style.backgroundImage = getPlanarPicture(gameVars.battleScreenInfo.planarDeck[gameVars.battleScreenInfo.currentPlanarCard]);
    }
    //remove plane card spaces (only remove when a planeswalk is walked from for spatial merging)
    removeElement("battle-information", "battle-defense-plane2");
    removeElement("battle-information", "reveal-chaotic-aether");
    removeElement("battle-information", "reveal-spatial-merging");
    gameVars.battleScreenInfo.secondPlane = [];
    //clear prompt menu
    cancelPrompt();
}

function closeArchenemyPrompt() {
    addClass("archenemy-prompt", "hide-item-class");
}

function playArchenemy() {
    var archPrompt = confirm("Play Archenemy? \n (Defender must roll a 6 on a six sided dice to play");

    if (archPrompt) {
        var archenemyCount = gameVars.gameStatus.archenemyCount,
        currentArchRef = gameVars.gameStatus.archenemyDecklist[archenemyCount];

        //show archenemy prompt
        removeClass("archenemy-prompt", "hide-item-class");
        //show archenemy card
        document.getElementById("archenemy-choice-menu").style.backgroundImage = archenemyDeck[currentArchRef].archenemyPicture
        //count archenemy
        gameVars.gameStatus.archenemyCount += 1;
        //shuffle if at end of deck
        if (gameVars.gameStatus.archenemyCount === gameVars.gameStatus.archenemyDecklist.length) {
            shuffleArchenemy();
        }
    }
}

function battleHoverCreatureModText(battleDeckReference) {
    var creatureText = "Creature Mod Tally:";

    for (var i = 0; i < gameVars.battleScreenInfo.battlePowerAndToughnessMods[battleDeckReference].length; i++) {
        creatureText += "<br>" + gameVars.battleScreenInfo.battlePowerAndToughnessMods[battleDeckReference][i];
    }
    return creatureText;
}

function battleHoverLifeText(battleDeckReference) {
    var lifeText = "Life Tally:";

    for (var i = 0; i < gameVars.battleScreenInfo.battleLifeMods[battleDeckReference].length; i++) {
        lifeText += "<br>" + gameVars.battleScreenInfo.battleLifeMods[battleDeckReference][i];
    }
    return lifeText;
}

function battleHoverHandText(battleDeckReference) {
    var handText = "Hand Tally:";

    for (var i = 0; i < gameVars.battleScreenInfo.battleHandMods[battleDeckReference].length; i++) {
        handText += "<br>" + gameVars.battleScreenInfo.battleHandMods[battleDeckReference][i];
    }
    return handText;
}

function battleHoverContinentText(currentPlayer, battleDeckReference) {
    var hoverText = "Continent Bonus",
    continentsBon = gameVars.battleScreenInfo.battleContinentBonuses[battleDeckReference];

    for (var i = 0; i < continentsBon.length; i++) {
        var currentContinent = continentsBon[i];

        hoverText += " <br> " + currentContinent + ": " + adminSettings.continentBonuses["bonus" + currentContinent];
        if (currentContinent === "North America") {
            hoverText += adminSettings.continentBonuses.continentLifeBonus + ".";
        }
        if (currentContinent === "Europe") {
            var totalPlayerDeckCount = playerDeckCount(currentPlayer),
            cardsToAdd = Math.floor(adminSettings.continentBonuses.continentCardPerDeckBonus * totalPlayerDeckCount);

            if (cardsToAdd < adminSettings.continentBonuses.continentCardMinimum) {
                cardsToAdd = adminSettings.continentBonuses.continentCardMinimum;
            }
            hoverText += cardsToAdd + ".";
        }
    }
    return hoverText;
}

function battlePictureOffHover(mod) {
    if (gameVars.gameStatus.mode === "attack") {
        document.getElementById("card-picture").innerHTML = "";
        addClass("card-picture", "hide-item-class");
        removeClass("card-picture", "player-color-1");
        removeClass("card-picture", "player-color-2");
        removeClass("card-picture", "player-color-3");
        removeClass("card-picture", "player-color-4");
        removeClass("card-picture", "player-color-5");
        removeClass("card-picture", "toolbar");
    }
}

function battlePictureHover(mod) {
    var battleDeckReference = mod.charAt(mod.length - 1),
    pictureType = mod.slice(0, -1),
    currentPlayer = gameVars.battleScreenInfo.battleDecks[battleDeckReference].deckPlayer;

    if (gameVars.gameStatus.mode === "attack") {
        removeClass("card-picture", "hide-item-class");
        if (pictureType === "vanguard" && pictureType !== "noVanguard") {
            var vanguardToShowName = gameVars.battleScreenInfo.battleVanguards[battleDeckReference],
            vanguardRef = findVanguardRef(vanguardToShowName),
            pictureToShow = vanguardDeck[vanguardRef].vanguardPicture;

            document.getElementById("card-picture").innerHTML = "";
            document.getElementById("card-picture").style.backgroundImage = pictureToShow;
        } 
        else if (pictureType === "hero" && pictureType !== "noHero") {
            var heroToShowName = gameVars.battleScreenInfo.battleHero[battleDeckReference],
            heroRef = findHeroRef(heroToShowName),
            pictureToShow = heroDeck[heroRef].heroPicture;

            document.getElementById("card-picture").innerHTML = "";
            document.getElementById("card-picture").style.backgroundImage = pictureToShow;
        } 
        else if (pictureType === "conspiracy" && pictureType !== "noConspiracy") {
            var conspiracyToShowName = gameVars.battleScreenInfo.battleConspiracy[battleDeckReference],
            conspiracyRef = findConspiracyRef(conspiracyToShowName),
            pictureToShow = conspiracyDeck[conspiracyRef].conspiracyPicture;

            document.getElementById("card-picture").innerHTML = "";
            document.getElementById("card-picture").style.backgroundImage = pictureToShow;
        }
        else if (pictureType ==="continent-bonus" && pictureType !== "noContinent") {
            var continentText = battleHoverContinentText(currentPlayer, battleDeckReference);

            for (i = 1; i < 6; i++) {
                removeClass("card-picture", 'player-color-' + i);
            }
            removeClass("card-picture", "toolbar");
            document.getElementById("card-picture").style.backgroundImage = "none";
            addClass("card-picture", "player-color-" + currentPlayer);
            addClass("card-picture", "toolbar");
            document.getElementById("card-picture").innerHTML = continentText;
        }
        else if (pictureType === "beginning-life") {
            var lifeText = battleHoverLifeText(battleDeckReference);

            for (i = 1; i < 6; i++) {
                removeClass("card-picture", 'player-color-' + i);
            }
            removeClass("card-picture", "toolbar");
            document.getElementById("card-picture").style.backgroundImage = "none";
            addClass("card-picture", "player-color-" + currentPlayer);
            addClass("card-picture", "toolbar");
            document.getElementById("card-picture").innerHTML = lifeText;
        }
        else if (pictureType === "hand-size") {
            var handText = battleHoverHandText(battleDeckReference);

            for (i = 1; i < 6; i++) {
                removeClass("card-picture", 'player-color-' + i);
            }
            removeClass("card-picture", "toolbar");
            document.getElementById("card-picture").style.backgroundImage = "none";
            addClass("card-picture", "player-color-" + currentPlayer);
            addClass("card-picture", "toolbar");
            document.getElementById("card-picture").innerHTML = handText;
        }
        else if (pictureType === "power-and-toughness") {
            var creatureModText = battleHoverCreatureModText(battleDeckReference);

            for (i = 1; i < 6; i++) {
                removeClass("card-picture", 'player-color-' + i);
            }
            removeClass("card-picture", "toolbar");
            document.getElementById("card-picture").style.backgroundImage = "none";
            addClass("card-picture", "player-color-" + currentPlayer);
            addClass("card-picture", "toolbar");
            document.getElementById("card-picture").innerHTML = creatureModText;
        }
        else {
            console.log(mod);
        }
    }
}

function availableVanguardCards() {
    var takenVanguardCards = [],
    availableVanguardDeck = [];

    //load takenvanguardcards
    for (var c = 0; c < gameVars.mapInfo.countryList.length; c++) {
        var currentCountry = gameVars.mapInfo.countryList[c];

        if (!!currentCountry.deck) {
            var fullDeck = findFullDeckWithPlayerAndName(currentCountry.deck.deckPlayer, currentCountry.deck.deckName);

            if (!!fullDeck.vanguardList) {
                var currentVanguardList = findFullDeckWithPlayerAndName(currentCountry.deck.deckPlayer, currentCountry.deck.deckName).vanguardList;

                for (var v = 0; v < currentVanguardList.length; v++) {
                    takenVanguardCards.push(currentVanguardList[v]);
                }
            }
        }      
    }
    //add available vanguard
    for (var v = 0; v < vanguardDeck.length; v++) {
        var currentVanguardName = vanguardDeck[v].vanguardName;

        if (!isItemInArray(currentVanguardName, takenVanguardCards)) {
            availableVanguardDeck.push(currentVanguardName)
        }
    }
    return availableVanguardDeck;
}

function getVanguard(deckPlayer, deckName) {
    var availableVanguard = availableVanguardCards();

    shuffleArray(availableVanguard);
    //take next card
    if (availableVanguard.length > 0) {
        var nextVanguard = availableVanguard[0];

        if (!findFullDeckWithPlayerAndName(deckPlayer, deckName).vanguardList) {
            findFullDeckWithPlayerAndName(deckPlayer, deckName).vanguardList = [];
        }
        findFullDeckWithPlayerAndName(deckPlayer, deckName).vanguardList.push(nextVanguard);
    }
}

function loadBattleVanguards(battleDeckRef) {
    var currentPlayer = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckPlayer,
    currentDeckName = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckName;

    if (!!findFullDeckWithPlayerAndName(currentPlayer, currentDeckName).vanguardList) {
        var currentVanguardList = findFullDeckWithPlayerAndName(currentPlayer, currentDeckName).vanguardList
        
        shuffleArray(currentVanguardList);
        gameVars.battleScreenInfo.battleVanguards.push(currentVanguardList[0]);
    }
    else {
        gameVars.battleScreenInfo.battleVanguards.push("noVanguard");
    }
}