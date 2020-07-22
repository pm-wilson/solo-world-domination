
function rebuildAttackButtons() {
    //remove reset map button
    removeElement("map-screen-toolbar", "decline-attack");
    //remove confirm attack button
    removeElement("map-screen-toolbar", "confirm-attack");
    //create skip attack button
    addElement("map-screen-toolbar", "button", "Decline Attack", "decline-attack", "map-button", declineAttack);
    addClass("decline-attack", "btn");
    addClass("decline-attack", "btn-danger");
    //create confirm attack button
    addElement("map-screen-toolbar", "button", "Confirm Attack", "confirm-attack", "map-button", attackChosen);
    addClass("confirm-attack", "btn");
    addClass("confirm-attack", "btn-primary");
}

function afterBattleCleanup() {
        //clear deck info and buttons
        clearBattleScreenInformation();
        //clear battle variables
        gameVars.battleScreenInfo.battlePlayersCount = [];
        gameVars.battleScreenInfo.battleDecks = [];
        gameVars.battleScreenInfo.battleWinner = [];
        gameVars.battleScreenInfo.groundZero = "";
        gameVars.battleScreenInfo.battleBonuses = [];
        gameVars.battleScreenInfo.battlePenalties = [];
        gameVars.battleScreenInfo.battleVanguards = [];
        gameVars.battleScreenInfo.battleHero = [];
        gameVars.battleScreenInfo.battleConspiracy = [];
        gameVars.battleScreenInfo.battleContinentBonuses = [];
        gameVars.battleScreenInfo.battleLifeMods = [];
        gameVars.battleScreenInfo.battleHandMods = [];
        gameVars.battleScreenInfo.battlePowerAndToughnessMods = [];
        gameVars.battleScreenInfo.planePromptText = "";
        gameVars.battleScreenInfo.planarDeck = [];
        gameVars.battleScreenInfo.currentPlanarCard = 0;
        gameVars.globalGameOptions.supplyInfo.showSupplyDrops = false;
        removeElement("country-information", "map-defense-preview");
        removeElement("battle-information", "battle-defense-plane");
        //update supply view button
        showSupplyViewButton();
}

function setPlayerInfoLocation() {
    var battlePlayerCount = gameVars.battleScreenInfo.battlePlayersCount;

    if (battlePlayerCount === 3) {
        document.getElementById("battle-player2").style.margin= "auto";
        document.getElementById("battle-player2").style.position= "relative";
        document.getElementById("battle-player2").style.top= "187px";
    }
    else if (battlePlayerCount > 3) {
        document.getElementById("battle-player2").style.margin= "25px";
        document.getElementById("battle-player2").style.position= "absolute";
        document.getElementById("battle-player2").style.top= "325px";
    }
}

function endOfGame(winningPlayer) {
    var winningName = findPlayerName(winningPlayer);

    showIntro();
    gameVars.gameStatus.mode = "end";
    document.getElementById("intro-screen-toolbar").innerHTML = winningName + " wins!";
}

function countBattleLife(bonuses, penalties, countrySupport, battleDeckRef) {
    var lifeTotal = 20,
    lifeTotalMods = [],
    lifeBonuses = 0,
    lifePenalties = 0;

    //unmodified
    if (gameVars.gameStatus.mode === "attack" && adminSettings.useTwoHeadedGiant === true) {
        lifeTotalMods.push("Unmodified Life: 40");
        lifeTotal += 20;
    }
    else {
        lifeTotalMods.push("Unmodified Life: 20");
    }
    //initiation for last deck
    if (gameVars.gameStatus.mode === "attack" && battleDeckRef === 1 && playerDeckCount(gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckPlayer) === 1) {
        lifeTotalMods.push("Initiation Deck Life: +20");
        lifeTotal += 20;
    }
    //bonus life
    for (var b = 0; b < bonuses.length; b++) {
        if (bonuses[b] === 0) {
            lifeTotal += adminSettings.gameBonuses[0].life;
            lifeBonuses += 1;
        }
    }
    if (lifeBonuses > 0) {
        lifeTotalMods.push(lifeBonuses + " Life Bonuses (+" + adminSettings.gameBonuses[0].life + "): " + (adminSettings.gameBonuses[0].life * lifeBonuses));
    }
    //penalty life
    for (var p = 0; p < penalties.length; p++) {
        if (penalties[p] === 0) {
            lifeTotal += adminSettings.gamePenalties[0].life;
            lifePenalties += 1;
        }
    }
    if (lifePenalties > 0) {
        lifeTotalMods.push(lifePenalties + " Life Penalties (" + adminSettings.gamePenalties[0].life + "): " + (adminSettings.gamePenalties[0].life * lifePenalties));
    }
    //hero
    if (gameVars.gameStatus.mode === "attack" && gameVars.battleScreenInfo.battleHero[battleDeckRef] !== "noHero" && findFullHeroWithName(gameVars.battleScreenInfo.battleHero[battleDeckRef]).heroLife !== 0) {
        lifeTotal += findFullHeroWithName(gameVars.battleScreenInfo.battleHero[battleDeckRef]).heroLife;
        lifeTotalMods.push("Hero Life: +" + findFullHeroWithName(gameVars.battleScreenInfo.battleHero[battleDeckRef]).heroLife);
    }
    //vanguard
    if (gameVars.gameStatus.mode === "attack" && gameVars.battleScreenInfo.battleVanguards[battleDeckRef] !== "noVanguard") {
        var vanguardRef = findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef]);

        lifeTotal += vanguardDeck[vanguardRef].vanguardLife;
        if (vanguardDeck[vanguardRef].vanguardLife < 0) {
            lifeTotalMods.push("Vanguard Life: " + vanguardDeck[vanguardRef].vanguardLife);
        }
        else if (vanguardDeck[vanguardRef].vanguardLife > 0) {
            lifeTotalMods.push("Vanguard Life: +" + vanguardDeck[vanguardRef].vanguardLife);
        }
    }
    //country support
    if (adminSettings.supportBonus.useSupportBonusInGame === true && gameVars.gameStatus.mode !== "setup" && Math.floor(adminSettings.supportBonus.defendingLife * countrySupport[0]) > 0) {
        if (countrySupport[1] === true) {
            lifeTotal += Math.floor(adminSettings.supportBonus.defendingLife * countrySupport[0]);
            lifeTotalMods.push(countrySupport[0] + " Defense Support Bonuses: +" + Math.floor(adminSettings.supportBonus.defendingLife * countrySupport[0]));
        }
        else {
            lifeTotal += Math.floor(adminSettings.supportBonus.attackingLife * countrySupport[0]);
            lifeTotalMods.push(countrySupport[0] + " Attack Support Bonuses: +" + Math.floor(adminSettings.supportBonus.attackingLife * countrySupport[0]));
        }
    }
    //continent bonus
    if (gameVars.gameStatus.mode === "attack" && adminSettings.continentBonuses.useContinentBonuses === true && isItemInArray("North America", [gameVars.battleScreenInfo.battleContinentBonuses[battleDeckRef]]) && gameVars.battleScreenInfo.battleContinentBonuses[battleDeckRef] !== "noContinent") {
        lifeTotal += adminSettings.continentBonuses.continentLifeBonus;
        lifeTotalMods.push("Continent Bonus: +" + adminSettings.continentBonuses.continentLifeBonus);
    }
    lifeTotalMods.push("Starting Life: " + lifeTotal);
    gameVars.battleScreenInfo.battleLifeMods.push(lifeTotalMods);
    return ["Beginning Life Total: ", lifeTotal, "beginning-life"];
}

function countBattleHand(bonuses, penalties, countrySupport, battleDeckRef) {
    var handTotal = 7,
    handTotalMods = [],
    handBonuses = 0,
    handPenalties = 0;

    //unmodified
    handTotalMods.push("Unmodified Hand: 7");
    //bonuses
    for (var b = 0; b < bonuses.length; b++) {
        if (bonuses[b] === 1) {
            handTotal += adminSettings.gameBonuses[1].hand;
            handBonuses += 1;
        }
    }
    if (handBonuses > 0) {
        handTotalMods.push(handBonuses + " Hand Bonuses (+" + adminSettings.gameBonuses[1].hand + "): " + (adminSettings.gameBonuses[1].hand * handBonuses));
    }
    //penalties
    for (var p = 0; p < penalties.length; p++) {
        if (penalties[p] === 1) {
            handTotal += adminSettings.gamePenalties[1].hand;
            handPenalties += 1;
        }
    }
    if (handPenalties > 0) {
        handTotalMods.push(handPenalties + " Hand Penalties (+" + adminSettings.gamePenalties[1].hand + "): " + (adminSettings.gamePenalties[1].hand * handPenalties));
    }
    //hero
    if (gameVars.gameStatus.mode === "attack" && gameVars.battleScreenInfo.battleHero[battleDeckRef] !== "noHero" && findFullHeroWithName(gameVars.battleScreenInfo.battleHero[battleDeckRef]).heroHand !== 0) {
        handTotal += findFullHeroWithName(gameVars.battleScreenInfo.battleHero[battleDeckRef]).heroHand;
        handTotalMods.push("Hero Hand: +" + findFullHeroWithName(gameVars.battleScreenInfo.battleHero[battleDeckRef]).heroHand);
    }
    //vanguard
    if (gameVars.gameStatus.mode === "attack" && gameVars.battleScreenInfo.battleVanguards[battleDeckRef] !== "noVanguard") {
        var vanguardRef = findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef]);

        handTotal += vanguardDeck[findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef])].vanguardHand;
        if (vanguardDeck[findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef])].vanguardHand < 0) {
            handTotalMods.push("Vanguard Hand: " + vanguardDeck[vanguardRef].vanguardHand);
        }
        else if (vanguardDeck[findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef])].vanguardHand > 0) {
            handTotalMods.push("Vanguard Hand: +" + vanguardDeck[vanguardRef].vanguardHand);
        }
    }
    //country support
    if (adminSettings.supportBonus.useSupportBonusInGame === true && gameVars.gameStatus.mode !== "setup" && Math.floor(adminSettings.supportBonus.defendingHand * countrySupport[0]) > 0) {
        if (countrySupport[1] === true) {
            handTotal += Math.floor(adminSettings.supportBonus.defendingHand * countrySupport[0]);
            handTotalMods.push(countrySupport[0] + " Defense Support Bonuses: +" + Math.floor(adminSettings.supportBonus.defendingHand * countrySupport[0]));
        }
        else {
            handTotal += Math.floor(adminSettings.supportBonus.attackingHand * countrySupport[0]);
            handTotalMods.push(countrySupport[0] + " Attacking Support Bonuses: +" + Math.floor(adminSettings.supportBonus.attackingHand * countrySupport[0]));
        }
    }
    //continent bonus
    if (gameVars.gameStatus.mode === "attack" && adminSettings.continentBonuses.useContinentBonuses === true && isItemInArray("Europe", [gameVars.battleScreenInfo.battleContinentBonuses[battleDeckRef]]) && gameVars.battleScreenInfo.battleContinentBonuses[battleDeckRef] !== "noContinent") {
        var currentPlayer = gameVars.battleScreenInfo.battleDecks[battleDeckRef],
        currentPlayerDeckCount = playerDeckCount(currentPlayer),
        cardsToAdd = Math.floor(adminSettings.continentBonuses.continentCardPerDeckBonus * currentPlayerDeckCount);

        if (cardsToAdd < adminSettings.continentBonuses.continentCardMinimum) {
            handTotal += adminSettings.continentBonuses.continentCardMinimum;
            handTotalMods.push("Continent Bonus: " + adminSettings.continentBonuses.continentCardMinimum);
        }
        else {
            handTotal += cardsToAdd;
            handTotalMods.push("Continent Bonus: " + cardsToAdd);
        }
    }
    handTotalMods.push("Starting and Max Hand Size: " + handTotal);
    gameVars.battleScreenInfo.battleHandMods.push(handTotalMods);
    return ["Opening & Max Hand Size: ", handTotal, "hand-size"];
}

function countBattlePower(bonuses, penalties, countrySupport, battleDeckRef) {
    var creaturePower = 0,
    creatureMods = [],
    creatureBonuses = 0,
    creaturePenalties = 0;
    
    //bonuses
    for (var b = 0; b < bonuses.length; b++) {
        if (bonuses[b] === 2) {
            creaturePower += adminSettings.gameBonuses[2].creatureMods[0];
            creatureBonuses += 1;
        }
    }
    //penalties
    for (var p = 0; p < penalties.length; p++) {
        if (penalties[p] === 2) {
            creaturePower += adminSettings.gamePenalties[2].creatureMods[0];
            creaturePenalties += 1;
        }
    }
    //vanguard
    if (gameVars.gameStatus.mode === "attack" && gameVars.battleScreenInfo.battleVanguards[battleDeckRef] !== "noVanguard" && vanguardDeck[findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef])].vanguardPower !== 0) {
        creaturePower += vanguardDeck[findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef])].vanguardPower;
        creatureMods.push("Vanguard Creature Modification: " + vanguardDeck[findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef])].vanguardPower);
    }
    //country support
    if (adminSettings.supportBonus.useSupportBonusInGame === true && gameVars.gameStatus.mode === "attack" && Math.floor(adminSettings.supportBonus.defendingPower * countrySupport[0]) !== 0) {
        if (countrySupport[1] === true) {
            creaturePower += Math.floor(adminSettings.supportBonus.defendingPower * countrySupport[0]);
            creatureMods.push("Defending Country Support: " + Math.floor(adminSettings.supportBonus.defendingPower * countrySupport[0]));
        }
        else {
            creaturePower += Math.floor(adminSettings.supportBonus.attackingPower * countrySupport[0]);
            creatureMods.push("Attacking Country Support: " + Math.floor(adminSettings.supportBonus.attackingPower * countrySupport[0]));
        }
    }
    return [creaturePower, creatureBonuses, creaturePenalties, creatureMods];
}

function countBattleToughness(bonuses, penalties, countrySupport, battleDeckRef) {
    var creatureToughness = 0,
    creatureMods = [],
    creatureBonuses = 0,
    creaturePenalties = 0;
    
    for (var b = 0; b < bonuses.length; b++) {
        if (bonuses[b] === 2) {
            creatureToughness += adminSettings.gameBonuses[2].creatureMods[1];
            creatureBonuses += 1;
        }
    }
    for (var p = 0; p < penalties.length; p++) {
        if (penalties[p] === 2) {
            creatureToughness += adminSettings.gamePenalties[2].creatureMods[1];
            creaturePenalties += 1;
        }
    }
    //vanguard
    if (gameVars.gameStatus.mode === "attack" && gameVars.battleScreenInfo.battleVanguards[battleDeckRef] !== "noVanguard") {
        creatureToughness += vanguardDeck[findVanguardRef(gameVars.battleScreenInfo.battleVanguards[battleDeckRef])].vanguardToughness;
    }
    //country support
    if (adminSettings.supportBonus.useSupportBonusInGame === true && gameVars.gameStatus.mode === "attack") {
        if (countrySupport[1] === true) {
            creatureToughness += Math.floor(adminSettings.supportBonus.defendingToughness * countrySupport[0]);
        }
        else {
            creatureToughness += Math.floor(adminSettings.supportBonus.attackingToughness * countrySupport[0]);
        }
    }
    return [creatureToughness, creatureBonuses, creaturePenalties, creatureMods];
}

function findCreatureMod(power, toughness) {
    var powerString = String(power),
    toughnessString = String(toughness),
    creatureModText = "";

    if (power >= 0) {
        creatureModText += "+" + powerString + "/";
    }
    else {
        creatureModText += powerString + "/";
    }
    if (toughness === 0) {
        if (power < 0) {
            creatureModText += "-" + toughnessString;
        }
        else {
            creatureModText += "+" + toughnessString;
        }
    }
    else {
        if (toughness >= 0) {
            creatureModText += "+" + toughnessString;
        }
        else {
            creatureModText += toughnessString;
        }
    }
    return creatureModText;
}

function countBattlePowerAndToughness(bonuses, penalties, countrySupport, battleDeckRef) {
    var powerCalc = countBattlePower(bonuses, penalties, countrySupport, battleDeckRef),
    toughnessCalc = countBattleToughness(bonuses, penalties, countrySupport, battleDeckRef),
    creatureMod = findCreatureMod(powerCalc[0], toughnessCalc[0]),
    hoverMods = [];

    //bonus hover message
    if (powerCalc[1] === 1) {
        hoverMods.push("1 Creature Bonus (+1/+1): +1/+1");
    }
    if (powerCalc[1] > 1) {
        hoverMods.push(powerCalc[1] + " Creature Bonuses (+1/+1): +" + (adminSettings.gameBonuses[2].creatureMods[0] * powerCalc[1]) + "/+" + (adminSettings.gameBonuses[2].creatureMods[1] * powerCalc[1]));
    }
    //penalty hover message
    if (powerCalc[2] === 1) {
        hoverMods.push("1 Creature Penalty (-2/-0): -2/-0");
    }
    if (powerCalc[2] > 1) {
        hoverMods.push(powerCalc[2] + " Creature Penalties (-2/-0): " + (adminSettings.gamePenalties[2].creatureMods[0] * powerCalc[2]) + "/-" + (adminSettings.gamePenalties[2].creatureMods[1] * powerCalc[2]));
    }
    //other hover messages
    for (var p = 0; p < powerCalc[3].length; p++) {
        hoverMods.push(powerCalc[3][p]);
    }
    for (var t = 0; t < toughnessCalc[3].length; t++) {
        hoverMods.push(toughnessCalc[3][p]);
    }
    hoverMods.push("Creature Mod Totals: " + creatureMod);
    gameVars.battleScreenInfo.battlePowerAndToughnessMods.push(hoverMods);
    //mod tally
    if (creatureMod === "+0/+0") {
        return "";
    }
    else {
        return ["Your Creatures Get: ", creatureMod, "power-and-toughness"]
    }
}

function countBonusTutorLand(bonuses) {
    //tutor land
    var bonusTutorLand = 0,
    tutorLandAmount = adminSettings.gameBonuses[3].tutorLand;
    
    if (gameVars.gameStatus.mode === "attack") {
        for (var i = 0; i < bonuses.length; i++) {
            if (bonuses[i] === 3) {
                bonusTutorLand += 1;
            }
        }
        if (bonusTutorLand > 0) {
            if (bonusTutorLand > 1) {
                return ["Tutor for " + (tutorLandAmount * bonusTutorLand) + " lands and put into play tapped", ".", "bonus-tutor-land"];
            }
            else {
                return ["Tutor for 1 basic land and put into play tapped", ".", "bonus-tutor-land"];
            }
        }
    }
    return "";
}

function countBonusCheaperSpells(bonuses) {
    //spells cheaper
    var bonusCheaperSpells = 0,
    cheaperSpellsAmount = adminSettings.gameBonuses[4].spellsCheaper;

    if (gameVars.gameStatus.mode === "attack") {
        for (var i = 0; i < bonuses.length; i++) {
            if (bonuses[i] === 4) {
                bonusCheaperSpells += 1;
            }
        }
        if (bonusCheaperSpells > 0) {
            return ["Your spells cost " + (cheaperSpellsAmount + bonusCheaperSpells) + " cheaper for the first " + (cheaperSpellsAmount + bonusCheaperSpells) + " turns", ".", "bonus-cheaper-spells"];
        }
    }
    return "";
}

function countBonusPermanentInPlay(bonuses) {
    //spells cheaper
    var bonusPermanentInPlay = 0,
    permanentInPlayAmount = adminSettings.gameBonuses[5].permanentIntoPlay;

    if (gameVars.gameStatus.mode === "attack") {
        for (var i = 0; i < bonuses.length; i++) {
            if (bonuses[i] === 5) {
                bonusPermanentInPlay += 1;
            }
        }
        if (bonusPermanentInPlay > 0) {
            if (bonusPermanentInPlay > 1) {
                return ["You may start the game with " + (permanentInPlayAmount + bonusPermanentInPlay) + " permanents from your hand in play", ".", "bonus-permanent"];
            }
            else {
                return ["You may start the game with 1 permanent from your hand in play", ".", "bonus-permanent"];
            }
        }
    }
    return "";
}

function countPenaltyLandsTapped(penalties) {
    //lands tapped
    var penaltyLandsTapped = 0,
    landsTappedAmount = adminSettings.gamePenalties[3].landsTapped;

    if (gameVars.gameStatus.mode === "attack") {
        for (var i = 0; i < penalties.length; i++) {
            if (penalties[i] === 3) {
                penaltyLandsTapped += 1;
            }
        }
        if (penaltyLandsTapped > 0) {
            return ["Your first " + (landsTappedAmount + penaltyLandsTapped) + " lands enter the battlefield tapped", ".", "penalty-lands-tapped"];
        }
    }
    return "";
}

function countPenaltyCounterSpell(penalties) {
    //counter spell
    var penaltyCounterSpell = 0,
    counterSpellAmount = adminSettings.gamePenalties[4].counterSpell;

    if (gameVars.gameStatus.mode === "attack") {
        for (var i = 0; i < penalties.length; i++) {
            if (penalties[i] === 4) {
                penaltyCounterSpell += 1;
            }
        }
        if (penaltyCounterSpell > 0) {
            if (penaltyCounterSpell > 1) {
                return ["Your first " + (counterSpellAmount + penaltyCounterSpell) + " spells are countered", ".", "penalty-counter-spells"];
            }
            else {
                return ["Your first spell is countered."];
            }
        }
    }
    return "";
}

function countPenaltyExile(penalties) {
    //lands tapped
    var penaltyExile = 0,
    exileAmount = adminSettings.gamePenalties[5].exile;

    if (gameVars.gameStatus.mode === "attack") {
        for (var i = 0; i < penalties.length; i++) {
            if (penalties[i] === 5) {
                penaltyExile += 1;
            }
        }
        if (penaltyExile > 0) {
            return ["Exile the top " + (exileAmount + penaltyExile) + " cards from the top of your library", ".", "penalty-exile"];
        }
    }
    return "";
}

function battleVanguard(battleDeckRef) {
    if (gameVars.gameStatus.mode === "setup" || gameVars.battleScreenInfo.battleVanguards[battleDeckRef] === "noVanguard") {
        return "";
    }
    else {
        return ["Vanguard: ", gameVars.battleScreenInfo.battleVanguards[battleDeckRef], "vanguard"];
    }
}

function continentBonuses(battleDeckRef) {
    if (adminSettings.continentBonuses.useContinentBonuses && gameVars.gameStatus.mode === "attack") {
        var currentPlayer = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckPlayer,
        currentDeckName = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckName,
        currentDeckColors = getDeckColors(currentPlayer, currentDeckName),
        continentBonuses = [],
        groundZero = gameVars.battleScreenInfo.groundZero,
        groundZeroColor = adminSettings.continentBonuses[findContinentWithCountry(groundZero)],
        controlledContinents = listControlledContinentsWithPlayerAndColor(currentPlayer, currentDeckColors),
        ownedContinents = listOwnedContinentsWithPlayerAndColor(currentPlayer, currentDeckColors),
        bonusText = "",
        battleContBonus = [];
    
        //add ground zero if color matches
        if (colorOnList(groundZeroColor, currentDeckColors)) {
            continentBonuses.push(findContinentWithCountry(groundZero));
        }
        //add owned continents with color match
        for (var o = 0; o < ownedContinents.length; o++) {
            continentBonuses.push(ownedContinents[o]);
        }
        //add controlled continents with color match
        for (var c = 0; c < controlledContinents.length; c++) {
            continentBonuses.push(controlledContinents[c]);
        }
        //return bonus or blank
        if (continentBonuses.length === 0) {
            gameVars.battleScreenInfo.battleContinentBonuses.push("noContinent");
            return "";
        }
        else {
            //remove duplicates from ownedContinents list
            continentBonuses = findUniqueValuesInArray(continentBonuses);
            //build bonus text
            for (var i = 0; i < continentBonuses.length; i++) {
                if (i === 0) {
                    battleContBonus.push(continentBonuses[i]);
                    bonusText += continentBonuses[i];
                }
                else {
                    battleContBonus.push(continentBonuses[i]);
                    bonusText += ", " + continentBonuses[i];
                }
            }
            gameVars.battleScreenInfo.battleContinentBonuses.push(battleContBonus);
            return ["Continent Bonus: ", bonusText, "continent-bonus"];
        }
    }
    return "";
}

function battleHero(battleDeckRef) {
    //for defense
    if (gameVars.gameStatus.mode !== "setup") {
        if (battleDeckRef === 1) {
            var currentPlayer = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckPlayer,
            currentDeckName = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckName,
            currentHero = findFullCountryWithDeckPlayerAndDeckName(currentPlayer, currentDeckName).hero;
    
            if (currentHero !== "") {
                gameVars.battleScreenInfo.battleHero.push(currentHero);
                gameVars.mapInfo.heroConspiracyPlayed.push(currentHero);
                return ["Hero: ", currentHero, "hero"];
            }
        }
        gameVars.battleScreenInfo.battleHero.push("noHero");
    }
    return "";
}

function battleConspiracy(battleDeckRef) {
    //for attack
    if (gameVars.gameStatus.mode !== "setup") {
        if (battleDeckRef !== 1) {
            var currentPlayer = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckPlayer,
            currentDeckName = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckName,
            currentConspiracy = findFullCountryWithDeckPlayerAndDeckName(currentPlayer, currentDeckName).conspiracy;
    
            if (currentConspiracy !== "") {
                gameVars.battleScreenInfo.battleConspiracy.push(currentConspiracy);
                gameVars.mapInfo.heroConspiracyPlayed.push(currentConspiracy);
                return ["Conspiracy: ", currentConspiracy, "conspiracy"];
            }
        }
        gameVars.battleScreenInfo.battleConspiracy.push("noConspiracy");
    }
    return "";
}

function updateAttackDefendJoined() {
    for (var i = 0; i < gameVars.battleScreenInfo.battleDecks.length; i++) {
        var currentDeck = gameVars.battleScreenInfo.battleDecks[i],
        currentFullDeck = findFullDeckWithPlayerAndName(currentDeck.deckPlayer, currentDeck.deckName);

        if (i === 0) {
            currentFullDeck.deckAttacksMade += 1;
        }
        else if (i === 1) {
            currentFullDeck.deckTimesDefended += 1;
        }
        else {
            currentFullDeck.deckTimesJoined += 1;
        }
    }
}

function unhideAllBattleDecks() {
    for (var i = 0; i < gameVars.battleScreenInfo.battleDecks.length; i++) {
        var currentDeck = gameVars.battleScreenInfo.battleDecks[i],

        currentFullDeck = findFullDeckWithPlayerAndName(currentDeck.deckPlayer, currentDeck.deckName);
        currentFullDeck.deckHidden = false;
    }
}

function proceedWithAttack() {
    if (gameVars.gameStatus.modeType === "attack") {
        var attackChoiceConfirmed = true;
    }
    else {
        var attackChoiceConfirmed = confirm("Confirm Attack?");
    }

    if (attackChoiceConfirmed) {
        var attackingPlayer = gameVars.mapInfo.mapSelect[0].deckPlayer,
        attackingDeckName = gameVars.mapInfo.mapSelect[0].deckName,
        countGames = numberSuffix(gameCount()),
        groundZero = findFullCountryWithCountry(gameVars.battleScreenInfo.groundZero).countryName;

        //update battle deck information
        gameVars.battleScreenInfo.battleDecks = gameVars.mapInfo.mapSelect;
        //update battle players count
        gameVars.battleScreenInfo.battlePlayersCount = gameVars.battleScreenInfo.battleDecks.length;
        //display battle screen info
        for (var j = 0; j < gameVars.battleScreenInfo.battlePlayersCount; j++) {
            //load battle vanguards
            loadBattleVanguards(j);
            //load battle screen info
            displayBattleInfo(j);
        }
        //add archenemy button
        if (adminSettings.useArchenemy === true) {   
            removeElement("battle-information", "archenemy-button");
            addElement("battle-information", "button", "Archenemy", "archenemy-button", "btn", playArchenemy);
            addClass("archenemy-button", "player-color-" + gameVars.mapInfo.mapSelect[1].deckPlayer);
        }
        //add card picture element
        addElement("battle-information", "div", "noContent", "card-picture");
        //set info locations
        setPlayerInfoLocation();
        //update log
        updateLog([countGames + " Game Begins", groundZero]);
        //add attacking country to already attacked list
        gameVars.mapInfo.alreadyAttacked.push(findFullCountryWithDeckPlayerAndDeckName(attackingPlayer, attackingDeckName).country);
        //unhide all decks
        unhideAllBattleDecks();
        //update times attacked, defended and joined
        updateAttackDefendJoined();
        //reset map
        resetMapScreen();
        if (adminSettings.useDefensePlane) {
            defensePlanePrompt();
        }
        else {
            //go to battle screen 
            showBattle();
            //update battle message and note
            document.getElementById("battle-message").innerHTML = countGames + " Battle Game for " + groundZero;
            //remove supply drop button
            removeElement("map-screen-toolbar", "supply-drop-button");
        }
    }
}

function attackChosen() {
    var currentPlayerSupplyHand = currentPlayerUnplayedSupplyHand(),
    groundZero = findFullCountryWithCountry(gameVars.battleScreenInfo.groundZero);

    //prompt for attack drop if current player has wild card and supply card of ground zero
    if (countWildSupply(currentPlayerSupplyHand) >= 1 && isItemInArray(groundZero.country, possibleDrops()) && currentPlayerUnplayedSupplyHand().length >= 3) {
        var goToAttackDrop = confirm("Would You Like to Make an Attack Supply Drop On " + groundZero.countryName + "?"),
        currentPlayer = findPlayerName(gameVars.gameStatus.turn);

        if (goToAttackDrop) {
            //remove reset map button
            removeElement("map-screen-toolbar", "decline-attack");
            //remove confirm attack button
            removeElement("map-screen-toolbar", "confirm-attack");
            //remove supply view
            removeElement("map-screen-toolbar", "view-supply");
            //show wild card buttons
            buildWildCardButtons();
            //update message to choose one more country
            document.getElementById("map-message").innerHTML = currentPlayer + " Choose the Remaining Supply Drop"
            //change mode to attack-drop
            gameVars.gameStatus.mode = "drop";
            gameVars.gameStatus.modeType = "attack";
            chooseSupplyDrop("none");
            chooseSupplyDrop(gameVars.battleScreenInfo.groundZero);
        }
        else {
            proceedWithAttack();
        }
    }
    else {
        proceedWithAttack();
    }
}

function defensePlanePrompt() {
    var defendingDeck = gameVars.battleScreenInfo.battleDecks[1],
    groundZero = findFullCountryWithCountry(gameVars.battleScreenInfo.groundZero).countryName,
    countGames = numberSuffix(gameCount()),
    playerName = findPlayerName(defendingDeck.deckPlayer),
    defensePromptText = playerName + " choose Defense Plane for " + defendingDeck.deckName + " defending " + groundZero;

    if (!!findFullDeckWithPlayerAndName(defendingDeck.deckPlayer, defendingDeck.deckName).defensePlane) {
        //go to battle screen 
        showBattle();
        //update battle message and note
        document.getElementById("battle-message").innerHTML = countGames + " Battle Game for " + groundZero;
        //remove supply drop button
        removeElement("map-screen-toolbar", "supply-drop-button");
    }
    else {
        //unhide defense prompt
        unhideId("defense-plane-prompt");
        //update defense prompt note
        document.getElementById("defense-choice-text").innerHTML = defensePromptText;
        //save plane prompt text
        gameVars.battleScreenInfo.planePromptText = defensePromptText;
        //build defense plane buttons
        buildDefensePlaneButtons(defendingDeck.deckPlayer);
    }
}

function buildDefensePlaneButtons(defensePlayer) {
    //update defense prompt color
    for (var i = 1; i < 6; i++) {
        removeClass("defense-choice-box", "defense-color-" + i);  
    }
    addClass("defense-choice-box", "defense-color-" + defensePlayer);
    //build defense plane buttons without phenomenoms
    for (var i = 0; i < planarDeck.length; i++) {
        var currentPlaneName = planarDeck[i].planeName,
        planeColor = findContinentColor(planarDeck[i].planeContinent).toLowerCase();
        
        removeElement("defense-plane-buttons", "plane-ref-" + i);
        addElement("defense-plane-buttons", "button", currentPlaneName, "plane-ref-" + i, "btn", planePromptChoice, planeOnHover);
        //update button color
        addClass("plane-ref-" + i, "plane-color-" + planeColor);

        //check plane for already taken
        if (countPlaneNameUsedByPlayer(currentPlaneName, defensePlayer) ===  playerHighestPlaneCount(defensePlayer)) {
            //mark as taken
            addClass("plane-ref-" + i, "taken");
            //disable
            disableId("plane-ref-" + i);
        }
    }
}

function countPlaneNameUsedByPlayer(planeName, player) {
    var planeCount = 0;

    for (var d = 0; d < gameVars.playerInfo["player" + player].playerDecklist.length; d++) {
        var currentDeck = gameVars.playerInfo["player" + player].playerDecklist[d];

        if (!!currentDeck.defensePlane && currentDeck.defensePlane === planeName) {
            planeCount += 1;
        }
    }
    return planeCount;
}

function playerHighestPlaneCount(player) {
    var planeCount = 0,
    planeCountTally = [];

    for (var p = 0; p < planarDeck.length; p++) {
        var currentPlane = planarDeck[p].planeName,
        currentPlaneCount = 0;

        for (var d = 0; d < gameVars.playerInfo["player" + player].playerDecklist.length; d++) {
            var currentDeck = gameVars.playerInfo["player" + player].playerDecklist[d];
            
            if (!!currentDeck.defensePlane && currentDeck.defensePlane === currentPlane) {
                currentPlaneCount += 1;
            }
        }
        //record running total of decks this plane is in on given player
        planeCountTally.push(currentPlaneCount);
        //record if it is the highest number of decks use this plane on given player
        if (currentPlaneCount > planeCount) {
            planeCount = currentPlaneCount;
        }
    }
    //if they are all the same return 1 more
    if (findUniqueValuesInArray(planeCountTally).length === 1) {
        planeCount += 1;
    }
    return planeCount;
}

function planeOnHover(planeRef) {
    var actualPlaneRef = planeRef.slice(10),
    takenDeckNames = findDefenseDecks(gameVars.battleScreenInfo.battleDecks[1].deckPlayer, planarDeck[actualPlaneRef].planeName);
    //show picture
    document.getElementById("defense-preview").style.backgroundImage = planarDeck[actualPlaneRef].planePicture;
    //display current deck if taken
    if (takenDeckNames.length === 0) {
        document.getElementById("defense-preview").innerHTML = "";
        document.getElementById("defense-choice-text").innerHTML = gameVars.battleScreenInfo.planePromptText;
    }
    else {
        var takenDeckNameText = "";

        for (var i = 0; i < takenDeckNames.length; i++) {
            if (i === 0) {
                takenDeckNameText += findDefenseDecks(playerNumber, defenseName);
            }
            else if (i === takenDeckNames.length - 1) {
                takenDeckNameText += ", and " + findDefenseDecks(playerNumber, defenseName);
            }
            else {
                takenDeckNameText += ", " + findDefenseDecks(playerNumber, defenseName);
            }
        }
        document.getElementById("defense-choice-text").innerHTML = "This plane is assigned to " + takenDeckNameText;
    }
}

function addDefensePlaneToDeck(planeRef) {
    const deckPlayer = gameVars.battleScreenInfo.battleDecks[1].deckPlayer,
    deckName = gameVars.battleScreenInfo.battleDecks[1].deckName,
    deckToAddTo = findDeckWithPlayerNumberAndName(deckPlayer, deckName),
    defenseToAdd = planarDeck[planeRef].planeName;

    deckToAddTo["defensePlane"] = defenseToAdd;
}

function planePromptChoice(planeRef) {
    var groundZero = findFullCountryWithCountry(gameVars.battleScreenInfo.groundZero).countryName,
    actualPlaneRef = planeRef.slice(10),
    countGames = numberSuffix(gameCount());

    //hide defense prompt
    hideId("defense-plane-prompt");
    //add plane info to deck
    addDefensePlaneToDeck(actualPlaneRef)
    //go to battle screen 
    showBattle();
    //update battle message and note
    document.getElementById("battle-message").innerHTML = countGames + " Battle Game for " + groundZero;
    //remove supply drop button
    removeElement("map-screen-toolbar", "supply-drop-button");
}

function battleScreenCleanup() {
    //clear cancel and win buttons
    removeElement("battle-screen-toolbar", "reset-winners");
    removeElement("battle-screen-toolbar", "confirm-winners");
    //after battle cleanup
    afterBattleCleanup();
    //cleanup continent owned and controlled list
    cleanupContinentOwnedList();
    cleanupContinentControlledList();
    //cleanup hero and conspiracy played list
    cleanupHeroAndConspiracy();
}

function findBattleDeckNameWithPlayer(currentBattlePlayer) {
    for (var i = 0; i < gameVars.battleScreenInfo.battleDecks.length; i++) {
        if (gameVars.battleScreenInfo.battleDecks[i].deckPlayer === currentBattlePlayer) {
            var battleDeckName = gameVars.battleScreenInfo.battleDecks[i].deckName;
            
            return battleDeckName;
        }
    }
}

function battleWinnerNote(placement) {
    if(gameVars.gameStatus.mode === "setup") {
        return numberSuffix(placement + 1);
    }
    else {
        return "the winner!";
    }
}

function battleConfirmationText(namesOfWinners) {
    var confirmationText = [];

    for (var i = 0; i < namesOfWinners.length; i++) {
        var textToAdd = namesOfWinners[i] + " is " + battleWinnerNote(i);

        confirmationText.push(textToAdd);
    }
    return confirmationText;
}

function battleWinnerConfirmed() {
    var orderOfWinners = gameVars.battleScreenInfo.battleWinner,
    namesOfWinners = findArrayOfPlayerNames(orderOfWinners),
    confirmationResults = battleConfirmationText(namesOfWinners),
    confirmationText = "The turn order will be:\n" + confirmationResults + "\nClick Ok to Accept";

    if (confirm(confirmationText)) {
        setupComplete();
    }
}

function resetWinners() {
    removeElement("battle-screen-toolbar", "confirm-winners");
    removeElement("battle-screen-toolbar", "reset-winners");
    for (var i = 0; i < gameVars.battleScreenInfo.battleWinner.length; i++) {
        var playerIdToRename = gameVars.battleScreenInfo.battleWinner[i],
        playerNameToRename = gameVars.playerInfo["player" + playerIdToRename].playerName,
        buttonToRename = document.getElementById("battle-winner-"+ playerIdToRename);

        buttonToRename.innerHTML = playerNameToRename;
    }
    for (var p = 1; p <= gameVars.battleScreenInfo.battlePlayersCount; p++) {
        undisableId("battle-winner-" + p);
    }
    gameVars.battleScreenInfo.battleWinner = [];
    document.getElementById("battle-note").innerHTML = "Click order of winners for turn order";
}

function showWinningButtonText(winningPlace, totalBattlePlayers) {
    //winning text for initiation
    if (totalBattlePlayers === winningPlace) {
        addElement("battle-screen-toolbar", "button", "Confirm Winners", "confirm-winners", "noClass", battleWinnerConfirmed);
        //add btn class to button
        addClass("confirm-winners", "btn");
        //add primary button class to button
        addClass("confirm-winners", "btn-primary");
        //add danger button class to button
        addClass("confirm-winners", "battle-button");
        return "utterly defeated";
    }
    return numberSuffix(winningPlace) + " place";
}

function findLosingDecks(winnerPlayerNumber) {
    var decksToReturn = [];

    for (var i = 0; i < gameVars.battleScreenInfo.battleDecks.length; i++) {
        if (gameVars.battleScreenInfo.battleDecks[i].deckPlayer !== winnerPlayerNumber) {
            decksToReturn.push(gameVars.battleScreenInfo.battleDecks[i]);
        }
    }
    return decksToReturn;
}

function findWinningPlayerDesignation(winningPlayer) {
    if (gameVars.battleScreenInfo.battleDecks[0].deckPlayer === winningPlayer) {
        return "attackerWins";
    }
    else if (gameVars.battleScreenInfo.battleDecks[1].deckPlayer === winningPlayer) {
        return "defenderWins";
    }
    else {
        return "joinerWins";
    }
}

function eliminateDeck(deckPlayer, deckName) {
    var deckToEliminate = findFullDeckWithPlayerAndName(deckPlayer, deckName),
    eliminatedDeckCountry = findFullCountryWithDeckPlayerAndDeckName(deckPlayer, deckName),
    winningPlayerNumber = gameVars.battleScreenInfo.battleWinner.deckPlayer,
    winningPlayerDeckName = gameVars.battleScreenInfo.battleWinner.deckName,
    winningDeckCountry = findFullCountryWithDeckPlayerAndDeckName(winningPlayerNumber, winningPlayerDeckName);
    
    //mark as eliminated
    deckToEliminate.deckEliminated = true;
    //add winner to losers country
    eliminatedDeckCountry.deck = {deckPlayer: winningPlayerNumber, deckName: winningPlayerDeckName};
    //remove winner from its country
    delete winningDeckCountry.deck;
    //winner gets a supply drop card
    getSupplyCard(winningPlayerNumber);
}

function getSupplyCard(player) {
    //if supply deck is empty, reshuffle discard pile
    if (gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw.length === 0) {
        reshuffleSupplyDeck();
    }

    var nextSupplyCard = gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw.pop();

    //if no supply cards are outstanding, create a wild card
    if (nextSupplyCard === undefined) {
        nextSupplyCard = {supplyType: "wild", supplyCountry: "none"};
    }
    //give player card
    findFullPlayerWithPlayerNumber(player).playerSupplyPoints.push(nextSupplyCard);
    //shuffle draw pile
    shuffleArray(gameVars.globalGameOptions.supplyInfo.supplyDropCardsToDraw);
    //for testing
    return nextSupplyCard;
}

function markDeckAsWinner(deckPlayer, deckName) {
    var fullDeck = findFullDeckWithPlayerAndName(deckPlayer, deckName);

    gameVars.battleScreenInfo.battleWinner = {deckPlayer: deckPlayer, deckName: deckName};
    fullDeck.deckWins += 1;
    fullDeck.deckGamesPlayed += 1;
}

function markDeckAsLoser(deckPlayer, deckName, defenderPlayer) {
    var fullDeck = findFullDeckWithPlayerAndName(deckPlayer, deckName);

    if (defenderPlayer === deckPlayer) {
        eliminateDeck(deckPlayer, deckName);
        gameVars.battleScreenInfo.eliminatedDeck = {deckPlayer: deckPlayer, deckName: deckName};
    }
    else {
        fullDeck.deckPenalties += 1;
        fullDeck.deckGamesPlayed += 1;
    }
}

function clearBattleScreenInformation() {
    for (var i = 0; i < 6; i++) {
        removeElement("battle-information", "battle-player" + i);
    }
}

function eliminatedPlayerCheck(winningDeck, defendingDeck) {
    //check for player eliminated and end of game
    if (winningDeck.deckPlayer !== defendingDeck.deckPlayer) {
        var defendingDeckCount = 0,
        playersInGame = [];

        for (var i = 0; i < gameVars.mapInfo.countryList.length; i++) {
            if (!!gameVars.mapInfo.countryList[i].deck) {
                if (gameVars.mapInfo.countryList[i].deck.deckPlayer === defendingDeck.deckPlayer) {
                    defendingDeckCount += 1;
                }
                playersInGame.push(gameVars.mapInfo.countryList[i].deck.deckPlayer);
            }
            playersInGame = findUniqueValuesInArray(playersInGame);
        }
        if (defendingDeckCount === 0) {
            //check for end of game
            if (playersInGame.length === 1) {
                //end of game
                endOfGame(winningDeck.deckPlayer);
            }
            //player defeated message
            alert(findPlayerName(defendingDeck.deckPlayer) + " Has Been Defeated");
            //transfer supply
            supplyCardsFromTo(defendingDeck.deckPlayer, winningDeck.deckPlayer);
            //remove from turn and count
            removeFromTurnOrder(defendingDeck.deckPlayer);
        }
    }
}

function removeFromTurnOrder(player) {
    for (var i = 0; i < gameVars.gameStatus.turnOrder.length; i++) {
        if (gameVars.gameStatus.turnOrder[i] === player) {
            gameVars.gameStatus.turnOrder.splice([i], 1);
        }
    }
}

function supplyCardsFromTo(playerFrom, playerTo) {
    for (var i = 0; i < gameVars.playerInfo["player" + playerFrom].playerSupplyPoints.length; i++) {
        var supplyToMove = gameVars.playerInfo["player" + playerFrom].playerSupplyPoints.splice([i], 1);

        gameVars.playerInfo["player" + playerTo].playerSupplyPoints.push(supplyToMove[0]);
    }
}

function battleWinner(winningPlayerButton) {
    var winningPlayerId = Number(winningPlayerButton.slice(14)),
    winningPlayerName = gameVars.playerInfo["player" + winningPlayerId].playerName,
    totalBattlePlayers = gameVars.battleScreenInfo.battlePlayersCount;

    if (gameVars.gameStatus.mode === "attack") {
        var winnerConfirmed = confirm(winningPlayerName + " wins!");
        
        //clear card picture
        removeElement("battle-information", "card-picture");
        if (winnerConfirmed) {
            var battleDefender = gameVars.battleScreenInfo.battleDecks[1],
            battleJoiners = [],
            winningDeck = {deckPlayer: winningPlayerId, deckName: findBattleDeckNameWithPlayer(winningPlayerId)},
            losingDecks = findLosingDecks(winningPlayerId),
            winnerDesignation = findWinningPlayerDesignation(winningPlayerId),
            logTempNote = [],
            logNote = [];

            //update joiner list
            if (gameVars.battleScreenInfo.battleDecks.length > 2) {
                for (var i = 2; i < gameVars.battleScreenInfo.battleDecks.length; i++) {
                    battleJoiners.push(gameVars.battleScreenInfo.battleDecks[i]);
                }
            }
            //update battle winners
            markDeckAsWinner(winningDeck.deckPlayer, winningDeck.deckName);

            if (adminSettings.useTwoHeadedGiant) {
                var secondHead = findSecondHead(winningDeck.deckPlayer, winningDeck.deckName);

                logTempNote.push(winningPlayerName + " playing " + winningDeck.deckName + " and " + secondHead[0] + " wins");
            }
            else {
                logTempNote.push(winningPlayerName + " playing " + winningDeck.deckName + " wins");
            }
            //update battle losers
            for (var i = 0; i < losingDecks.length; i++) {
                markDeckAsLoser(losingDecks[i].deckPlayer, losingDecks[i].deckName, battleDefender.deckPlayer);
                if (gameVars.battleScreenInfo.eliminatedDeck.deckPlayer === losingDecks[i].deckPlayer) {
                    logTempNote.push(findPlayerName(losingDecks[i].deckPlayer) + " playing " + losingDecks[i].deckName + " lost and was eliminated");
                }
                else {
                    logTempNote.push(findPlayerName(losingDecks[i].deckPlayer) + " playing " + losingDecks[i].deckName + " lost");
                }
            }
            //get vanguard
            if (adminSettings.useVanguard === true) {
                getVanguard(winningDeck.deckPlayer, winningDeck.deckName);
            }
            //log end of battle
            logNote = ["Battle Game Complete"];
            logNote.push(logTempNote);
            updateLog(logNote);
            //rebuild attack buttons
            rebuildAttackButtons();
            //if attacker wins
            if (winnerDesignation === "attackerWins") {
                //change mode to move
                setToMove();
            }
            //after battle cleanup
            afterBattleCleanup();
            //show map
            showMap();
            //build map
            buildMapButtons();
            if (winningPlayerId !== gameVars.gameStatus.turn) {  
                earthShakingEventCheck();
            }
            //check for player eliminated and end of game
            eliminatedPlayerCheck(winningDeck, battleDefender);
            //cleanup continent owned and controlled list
            cleanupContinentOwnedList();
            cleanupContinentControlledList();
        }
    }
    //if mode is setup
    else {
        var  winningPlayerCount = gameVars.battleScreenInfo.battleWinner.length,
        winningPlace = winningPlayerCount + 1,
        winningButtonText = winningPlayerName + " is " + showWinningButtonText(winningPlace, totalBattlePlayers);

        disableId(winningPlayerButton);
        gameVars.battleScreenInfo.battleWinner.push(winningPlayerId);
        winningPlayerCount = gameVars.battleScreenInfo.battleWinner.length;
        document.getElementById(winningPlayerButton).innerHTML = winningButtonText;
        if (winningPlayerCount === 1) {
            addElement("battle-screen-toolbar", "button", "Cancel", "reset-winners", "noClass", resetWinners);
            //add btn class to button
            addClass("reset-winners", "btn");
            //add danger button class to button
            addClass("reset-winners", "btn-danger");
            //add battle button class to button
            addClass("reset-winners", "battle-button");
            document.getElementById("battle-note").innerHTML = winningPlayerName + " goes first";
        }
        else {
            if (winningPlayerCount === gameVars.globalGameOptions.totalPlayers) {
                document.getElementById("battle-note").innerHTML += ", " + winningPlayerName + " goes last.";
            }
            else {
                document.getElementById("battle-note").innerHTML += ", " + winningPlayerName + " goes " + numberSuffix(winningPlayerCount);
            }
        }
    }
}

function findDeckPenalties(deckPlayer, deckName) {
    if (gameVars.gameStatus.mode === "setup") {
        return [];
    }
    else {
        var deckRef = findDeckRef(deckPlayer, deckName),
        penaltyCount = gameVars.playerInfo["player" + deckPlayer].playerDecklist[deckRef].deckPenalties,
        penaltyList = [];

        for (var i = 0; i < penaltyCount; i++) {
            var currentPenaltyRoll = getRandomInt(adminSettings.gamePenalties.length);

            penaltyList.push(currentPenaltyRoll);
        }
        //push penalty total to battle screen info
        gameVars.battleScreenInfo.battlePenalties.push(penaltyList);
        return penaltyList;
    }
}

function findCountrySupport(deckPlayer) {
    if (gameVars.gameStatus.mode !== "setup") {
        var groundZer0 = gameVars.battleScreenInfo.groundZero,
        fullCountryGroundZero = findFullCountryWithCountry(groundZer0),
        borderingCountriesWithSamePlayer = 0,
        isDefender = true;
    
        for (var i = 0; i < fullCountryGroundZero.borders.length; i++) {
            if (findCountryPlayer(fullCountryGroundZero.borders[i]) === deckPlayer) {
                borderingCountriesWithSamePlayer += 1;
            }
        }
        //modify country support
        if (gameVars.battleScreenInfo.battleDecks[1].deckPlayer !== deckPlayer) {
            borderingCountriesWithSamePlayer -= 1;
            isDefender = false;
        }
        return [borderingCountriesWithSamePlayer, isDefender];
    }
}

function findDeckBonuses(deckPlayer, deckName) {
    if (gameVars.gameStatus.mode === "setup") {
        return [];
    }
    else {
        var deckRef = findDeckRef(deckPlayer, deckName),
        bonusCount = gameVars.playerInfo["player" + deckPlayer].playerDecklist[deckRef].deckBonuses,
        bonusList = [];
    
        for (var i = 0; i < bonusCount; i++) {
            var currentBonusRoll = getRandomInt(adminSettings.gameBonuses.length);
    
            bonusList.push(currentBonusRoll);
        }
        //push bonus total to battle screen info
        gameVars.battleScreenInfo.battleBonuses.push(bonusList);
        return bonusList;
    }
}

function displayBattleInfo(battleDeckRef) {
    var currentPlayer = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckPlayer,
    currentPlayerName = findPlayerName(currentPlayer),
    currentDeckName = gameVars.battleScreenInfo.battleDecks[battleDeckRef].deckName,
    currentDeckRef = findDeckRef(currentPlayer, currentDeckName),
    currentDeckColor = findDeckWithPlayerAndRef(currentPlayer, currentDeckRef).deckColors,
    battleText = [
        currentPlayerName + " playing " + currentDeckName + " (" + currentDeckColor + ")"
    ],
    countrySupport = findCountrySupport(currentPlayer),
    penalties = findDeckPenalties(currentPlayer, currentDeckName),
    bonuses = findDeckBonuses(currentPlayer, currentDeckName),
    gameMods = [
        battleVanguard(battleDeckRef),
        continentBonuses(battleDeckRef),
        battleHero(battleDeckRef),
        battleConspiracy(battleDeckRef),
        countBattleLife(bonuses, penalties, countrySupport, battleDeckRef),
        countBattleHand(bonuses, penalties, countrySupport, battleDeckRef),
        countBattlePowerAndToughness(bonuses, penalties, countrySupport, battleDeckRef),
        countBonusTutorLand(bonuses),
        countBonusCheaperSpells(bonuses),
        countBonusPermanentInPlay(bonuses),
        countPenaltyLandsTapped(penalties),
        countPenaltyCounterSpell(penalties),
        countPenaltyExile(penalties)
    ];
    //add player and deck name (color)
    addElement("battle-information", "h3", battleText, "battle-player" + battleDeckRef, "battle-player");
    //add player number class to deck info space
    addClass("battle-player" + battleDeckRef, "player-" + currentPlayer + "-battle-info");
    //add second head
    if (gameVars.gameStatus.mode === "attack" && adminSettings.useTwoHeadedGiant === true) {
        var secondHead = findSecondHead(currentPlayer, currentDeckName);

        document.getElementById("battle-player" + battleDeckRef).innerHTML += "<br> and " + secondHead[0] + " (" + secondHead[1] + ")";
    }
    if (gameVars.gameStatus.mode === "attack" && battleDeckRef === 1 && playerDeckCount(currentPlayer) === 1) {
        var initiationDeck = playerFullInitiationDeck(currentPlayer);

        document.getElementById("battle-player" + battleDeckRef).innerHTML += "<br> and " + initiationDeck.deckName + " (" + initiationDeck.deckColors + ")";
    }
    //for each battle player show player, deck, life, cards
    for (var d = 0; d < gameMods.length; d++) {
        if (gameMods[d] !== "") {
            var gameModsCurrentText = gameMods[d][0] + gameMods[d][1];

            addElement("battle-player" + battleDeckRef, "h6", gameModsCurrentText, gameMods[d][2] + battleDeckRef, "small", "noFunction", battlePictureHover, battlePictureOffHover);
        }
    }
    //create buttons
    addElement("battle-player" + battleDeckRef, "button", currentPlayerName, "battle-winner-" + currentPlayer, "player-color-" + currentPlayer, battleWinner);
    //add btn class to button
    addClass("battle-winner-" + currentPlayer, "btn");
    //add win-button class to button
    addClass("battle-winner-" + currentPlayer, "win-button");
}