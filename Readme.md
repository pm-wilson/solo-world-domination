# World Domination
## Overview
World Domination is a HTML, CSS, and JavaScript based game that loosely combines the card game of Magic the Gathering, and Risk. There are no external dependencies or anything that needs to be installed. In Risk the world map is occupied by each player and a dice roll determines the winners in a turn, in this game the dice roll is replaced by a game of Magic.
I originally built a working version of this program using VB Script in Microsoft Excel, and have been rebuilding it in JavaScript in order to learn how to code in JavaScript. This is still a work in progress and is missing many critical parts, but the heart of the game can be interacted with.
This was originally built as a way for Magic players to play their entire collection of decks against another player.
## How to Play
### Player Setup
It all begins in the intro screen showing all the countries to be empty, once the screen is clicked we go to player set up where we can choose the number of players and select the current setup player. As each player is selected, their names can be changed from the default and their list of decks can be seen. In future versions each player would be uploading their own list of decks here. Once all players have updated their information the 'Complete Setup' button confirms and takes us to the Initiation Game to decide the turn order.
This is a group game with all the players and the order of the winners are selected. Once the first player has been selected the 'cancel' button appears in case there is a mistake and after all the players places have been indicated the turn order can be confirmed, bringing us to the intro screen for the first turn.
### Information Screen
Now the intro screen shows the Game Log and the Country List. The Game Log will show information on the past games and supply checks (explained later), the Country List shows the known information on each country. At this point only the player name is known for a given country. Clicking through will go to the world map for the current player to select an attack.
### Choose Attack
The top tool bar will be the same color as the active player. Once a country owned by the attacking player that can attack is clicked, all the other countries out of range will fade out. If a different country that can attack is clicked the focus will shift to the countries surrounding that one instead. If an enemy country is then clicked any of the surrounding countries controlled by either players are faded out leaving players not currently in the battle to join if they choose. Once the joiners are chosen 'Confirm Attack' at the top of the screen will list all the decks that the map had surrounded in yellow as participants in the battle. 'Reset Map' will deselect all countries and return to the original map, if 'Decline Attack' is then clicked it will prompt the current user to forgo the attack and pass this part of the turn. 
### Battle for a Win
We return once again to the Battle Screen, except from here on out only one winner is chosen for a given battle, the defending Deck will win any tied games. If the attacking deck (top one) wins, the game will go to the Map Screen for the current turn player to move decks, if anyone else wins we go back to the map to choose another attack and the deck that attack is faded out and is unable to attack. If the defending deck loses it is eliminated and the winner claims the defending country and gets a supply card, if anyone else loses they get a Penalty. The current turn player continues to attack until the attack is finished by either winning a game, running out of decks to attack with, or choses to decline the attack. 
### Move Between Countries
Once the attack is finished the current turn player may choose a deck to move, either switching two decks between neighboring countries, or moving to an empty neighboring country. Countries that are unable to move will be faded out. The map can be reset if need be and once the move is complete the current turn is over and we go back to the Information Screen to see the Game Log and Country List. Once a player is the only one on a given continent they get bonus moves depending on the continent.
### Supply Drop
Once a given player starts a turn with 3 or more Supply Points (from eliminating a deck) a "Supply Drop" button will appear at the top of the Map Screen. Once a battle has been chosen this will go away for the turn. If a player has 5 or more Supply Points the player will be alerted that they are forced to go to the Supply Drop. During the supply drop, the player will see all the countries faded out except the ones that correspond to their supply points, these will also be highlighted in yellow to see easily. If they were forced into the Supply Drop the 'Cancel Supply Drop' button will be disabled. Future versions will make the type of Supply Point that can be played dependent on the type possessed by the player (to be more like Risk), but for now any 3 can be played and wild cards will have a button appear at the top. Each time a Supply Drop country is chosen the neighbors will get an orange border and once 3 are chosen and 'Make Supply Drop' is clicked any country owned by the current turn player will get a bonus, and any other player deck will get a penalty. If an empty country is selected the current turn player will get a new deck from their list added to that country.
### Bonuses and Penalties
These are simple game modifications that will give or take resources away from a deck at the beginning of the game by modifying starting life, maximum and opening hand size, and creature strength.
### Ongoing Game Play
The game progresses until only one player has decks left on the map and is declared the winner. Clicking refresh in the browser will erase the game and begin a new one.
## Future Versions
### Functional Parts to Build
Upload function for player deck lists
Make Supply Drop Type Dependent
Continent move bonuses to be applied only to that continent moves
Save Game Option
Placement Setup to give an option after the initiation game for players to choose their countries
### Cosmetic Parts to Add
Various modifications to the look of the game
Battle Screen needs to better indicate Attacker and Defender
Country buttons on map to be country shapes instead of circles
Make the selected Supply Drop countries more obvious
End of Game screen to be updated
### Magic Specific Parts to Add
More Bonuses and Penalties
Country Support to add minor bonuses when neighbors of defending deck are controlled by you
Defense Plane to be chosen for each deck the first time they are attacked
Specific bonuses given for controlling or owing each continent
hero and conspiracy each assigned to a given country to apply when attacking or defending from that country
When a player is down to their last deck, it should be a two-headed giant to defeat
Initiative Game every turn to balance turn order
## Code Sources
I wrote all the code myself, and looked up specific issues on http://goole.com and found code samples here and there at:
http://w3schools.com
http://overstack.com
https://developer.mozilla.org/bm/docs/Web/JavaScript