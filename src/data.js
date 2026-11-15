// Lore copy for the almanac. Places, people and festivals belong to Genshin Impact;
// the wording here is written for this fan page.

export const PLACES = [
  {
    id: 'city', n: 'I', name: 'Mondstadt', kind: 'The walled city', x: 468, y: 214,
    text: 'An island of red roofs in the middle of Cider Lake, joined to the shore by a single stone bridge. Three windmills turn above the streets, and at the highest point the cathedral faces a statue of the Anemo Archon with his hands held open to the sky.',
    note: 'Seat of the Knights of Favonius',
  },
  {
    id: 'starfell', n: 'II', name: 'Starfell Valley', kind: 'Lake & meadow', x: 628, y: 176,
    text: 'Rolling grass, a clear round lake, and a Statue of The Seven standing ankle-deep in it. Travellers say a star once fell here. Past the Whispering Woods the land climbs to Starsnatch Cliff, where Cecilias grow facing the sea wind.',
    note: 'Where most journeys begin',
  },
  {
    id: 'windrise', n: 'III', name: 'Windrise', kind: 'The great oak', x: 648, y: 372,
    text: 'One tree, older than the Knights, spreading over a quiet hill. A thousand years ago Vennessa, who broke the rule of the aristocracy, is said to have risen from this spot as a falcon. The wind here never quite stops.',
    note: 'Symbol of Mondstadt’s protection',
  },
  {
    id: 'springvale', n: 'IV', name: 'Springvale', kind: 'Hunters’ village', x: 462, y: 398,
    text: 'A handful of cottages around a spring that has never run dry. Its hunters keep the city’s tables supplied with boar and fowl, and its people swear a fairy lives in the water and listens to wishes.',
    note: 'Half a morning’s walk from the bridge',
  },
  {
    id: 'wolvendom', n: 'V', name: 'Wolvendom', kind: 'Forest of the wolves', x: 286, y: 404,
    text: 'Dark pines, claw-scored stone, and wolfhooks that catch on every sleeve. This is the domain of Andrius, the Wolf of the North, who chose long ago to look after the abandoned rather than rule the living.',
    note: 'Enter with respect, or not at all',
  },
  {
    id: 'winery', n: 'VI', name: 'Dawn Winery', kind: 'Vineyards', x: 196, y: 548,
    text: 'Terraced vines and a manor house at the foot of the western hills. Most of what is poured in Mondstadt’s taverns begins here, under the hand of the Ragnvindr family, whose crest is a bird in flight.',
    note: 'Source of the famous dandelion wine',
  },
  {
    id: 'lair', n: 'VII', name: 'Stormterror’s Lair', kind: 'Ruins of the old capital', x: 150, y: 176,
    text: 'A ring of broken towers around one that still stands. This was the first Mondstadt, sealed in by the storm-walls of the tyrant Decarabian until its people rose against him. Dvalin made the ruin his roost centuries later.',
    note: 'Brightcrown Mountains',
  },
  {
    id: 'dragonspine', n: 'VIII', name: 'Dragonspine', kind: 'The frozen mountain', x: 612, y: 590,
    text: 'A peak that the warm winds do not reach. A buried kingdom lies beneath the snow, along with the bones of the black dragon Durin, who fell here in battle with Dvalin five hundred years ago. The cold still kills the careless.',
    note: 'South of the valley; bring fire',
  },
];

export const WINDS = [
  {
    id: 'east', dir: 'East', letter: 'E', name: 'Dvalin', title: 'Dragon of the East',
    seat: 'Stormterror’s Lair',
    text: 'A wind-born dragon who learned music from a bard and answered when Mondstadt called. Five centuries ago he tore out the throat of the black dragon Durin and swallowed its poisoned blood. He slept, and the city forgot his name; when he woke in pain they called him Stormterror.',
  },
  {
    id: 'north', dir: 'North', letter: 'N', name: 'Andrius', title: 'Wolf of the North',
    seat: 'Wolvendom',
    text: 'Once a god of ice who fought for the throne of the old capital. He judged himself unfit to love people and let his power run out into the land instead. What remains is a great spirit wolf who raises foundlings and tests anyone who walks into his forest.',
  },
  {
    id: 'south', dir: 'South', letter: 'S', name: 'The Lion', title: 'Lion of the South',
    seat: 'Temple of the Lion',
    text: 'Not a beast but a title: the Dandelion Knight, sworn to stand between the city and whatever comes for it. The name passes from one knight of Favonius to the next, and each generation decides again what protecting freedom should cost.',
  },
  {
    id: 'west', dir: 'West', letter: 'W', name: 'Vennessa', title: 'Falcon of the West',
    seat: 'Temple of the Falcon',
    text: 'A gladiator held in chains by the old nobility, who won her people’s freedom in the arena and then pulled the aristocracy down. She founded the Knights of Favonius, and at the end of her life rose from Windrise to watch over the city from above.',
  },
];

export const PEOPLE = [
  {
    id: 'venti', name: 'Venti', title: 'Windborne Bard', element: 'Anemo', weapon: 'Bow', role: 'Bard, of no fixed address', sign: 'Carmen Dei',
    text: 'The best bard in Mondstadt by his own reckoning, usually found near a tavern and never near a bill. He knows songs older than the city walls and tells no one how.',
    stars: [[18, 62], [30, 44], [44, 52], [52, 34], [66, 26], [80, 38], [70, 56], [56, 68], [38, 76]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [2, 7], [8, 0]],
  },
  {
    id: 'jean', name: 'Jean', title: 'Dandelion Knight', element: 'Anemo', weapon: 'Sword', role: 'Acting Grand Master, Knights of Favonius', sign: 'Leo Minor',
    text: 'She runs the Knights while the Grand Master is abroad, which in practice means she runs everything. Dutiful to a fault; the city sleeps well because she does not.',
    stars: [[20, 70], [32, 54], [28, 36], [44, 26], [60, 32], [64, 50], [80, 58], [84, 76], [50, 62]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [5, 8], [8, 1]],
  },
  {
    id: 'diluc', name: 'Diluc', title: 'The Dark Side of Dawn', element: 'Pyro', weapon: 'Claymore', role: 'Master of Dawn Winery', sign: 'Noctua',
    text: 'Mondstadt’s richest man and its least sociable. He left the Knights years ago and keeps his own watch over the city after dark, on his own terms.',
    stars: [[50, 20], [34, 34], [66, 34], [22, 52], [78, 52], [40, 56], [60, 56], [50, 74], [50, 44]],
    links: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 8], [2, 8], [8, 5], [8, 6], [5, 7], [6, 7]],
  },
  {
    id: 'kaeya', name: 'Kaeya', title: 'Frostwind Swordsman', element: 'Cryo', weapon: 'Sword', role: 'Cavalry Captain, Knights of Favonius', sign: 'Pavo Ocellus',
    text: 'Charming, well-informed and impossible to pin down. He commands a cavalry with no horses and gets most of his work done over a glass of Death After Noon.',
    stars: [[24, 78], [34, 60], [46, 46], [40, 28], [58, 22], [72, 30], [70, 48], [84, 60], [58, 62]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2], [6, 7], [6, 8], [8, 1]],
  },
  {
    id: 'lisa', name: 'Lisa', title: 'Witch of Purple Rose', element: 'Electro', weapon: 'Catalyst', role: 'Librarian, Knights of Favonius', sign: 'Tempus Fugit',
    text: 'Sumeru’s most gifted graduate in two hundred years, who came home to shelve books and take long naps. Return what you borrow on time.',
    stars: [[30, 24], [70, 24], [50, 48], [30, 74], [70, 74], [50, 30], [50, 68], [22, 48], [78, 48]],
    links: [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4], [0, 7], [7, 3], [1, 8], [8, 4]],
  },
  {
    id: 'klee', name: 'Klee', title: 'Fleeing Sunlight', element: 'Pyro', weapon: 'Catalyst', role: 'Spark Knight, Knights of Favonius', sign: 'Trifolium',
    text: 'Small, cheerful and heavily armed. She makes her own explosives and tests them on the fish of Starfell Lake, which is why she knows the solitary confinement room so well.',
    stars: [[50, 50], [50, 26], [36, 20], [64, 20], [28, 60], [24, 76], [42, 72], [72, 60], [76, 76], [58, 72]],
    links: [[0, 1], [1, 2], [1, 3], [2, 3], [0, 4], [4, 5], [5, 6], [6, 0], [0, 7], [7, 8], [8, 9], [9, 0]],
  },
  {
    id: 'amber', name: 'Amber', title: 'Gliding Champion', element: 'Pyro', weapon: 'Bow', role: 'Outrider, Knights of Favonius', sign: 'Lepus',
    text: 'The last Outrider and three-time winner of the gliding championship. First to greet a stranger at the gate, first to notice when something is wrong beyond it.',
    stars: [[26, 30], [34, 18], [40, 36], [52, 46], [68, 44], [80, 56], [70, 70], [50, 68], [36, 58]],
    links: [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 3]],
  },
  {
    id: 'barbara', name: 'Barbara', title: 'Shining Idol', element: 'Hydro', weapon: 'Catalyst', role: 'Deaconess, Church of Favonius', sign: 'Crater',
    text: 'She heals with songs and has decided that cheering people up is a form of medicine. The whole city hums her tunes, including people who say they do not.',
    stars: [[28, 28], [72, 28], [64, 46], [36, 46], [50, 52], [50, 68], [36, 80], [64, 80], [50, 22]],
    links: [[0, 8], [8, 1], [1, 2], [2, 4], [4, 3], [3, 0], [4, 5], [5, 6], [5, 7], [6, 7]],
  },
];

export const ELEMENT_COLOR = {
  Anemo: '#7fe0c4', Pyro: '#ff8a5c', Cryo: '#a6e4f5', Electro: '#c9a2ff', Hydro: '#6cc3ff', Geo: '#f2c15a',
};

export const FESTIVALS = [
  {
    season: 'Spring', name: 'Windblume Festival', span: 'When the first warm wind arrives',
    text: 'A festival for love, and for the freedom it took to earn it. Each person offers the flower they believe to be the true windblume, and nobody agrees on which flower that is. Poems are read aloud, some of them good.',
  },
  {
    season: 'Summer', name: 'Ludi Harpastum', span: 'Fifteen days',
    text: 'Games, markets and far too much food. A maiden is chosen to throw the harpastum, a ball of red cloth, into the crowd; whoever catches it is promised a year of luck. The custom has a darker origin that the city has chosen to redeem.',
  },
  {
    season: 'Autumn', name: 'Weinlesefest', span: 'After the last harvest',
    text: 'The grapes are in, the cellars are full, and Mondstadt thanks the wind for both. Stalls line the streets down to the gate, and gifts are left out for the Anemo Archon, who is rumoured to prefer the ones that come in bottles.',
  },
];

// Windsong lyre: three diatonic octaves in C, like the one handed to every bard in town.
export const LYRE_ROWS = [
  { keys: 'QWERTYU', octave: 5 },
  { keys: 'ASDFGHJ', octave: 4 },
  { keys: 'ZXCVBNM', octave: 3 },
];
export const SOLFEGE = ['do', 're', 'mi', 'fa', 'so', 'la', 'ti'];

// An original little tune in C for the "play for me" button: [key, beats]
export const TUNE = [
  ['G', 1], ['Q', 1], ['W', 1], ['E', 2], ['W', 1], ['Q', 1], ['H', 2], ['G', 2],
  ['A', 1], ['D', 1], ['G', 1], ['Q', 2], ['J', 1], ['H', 1], ['G', 3], [null, 1],
  ['E', 1], ['R', 1], ['T', 2], ['E', 1], ['W', 1], ['Q', 2], ['H', 1], ['Q', 1],
  ['W', 1.5], ['E', 0.5], ['W', 1], ['H', 1], ['G', 1], ['D', 1], ['A', 4],
];
