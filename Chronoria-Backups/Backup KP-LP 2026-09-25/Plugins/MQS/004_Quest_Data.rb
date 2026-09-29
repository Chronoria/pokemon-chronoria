module QuestModule
  
  # You don't actually need to add any information, but the respective fields in the UI will be blank or "???"
  # I included this here mostly as an example of what not to do, but also to show it's a thing that exists
  Quest0 = {
  
  }
  
  # Here's the simplest example of a single-stage quest with everything specified
  Quest1 = {
    :ID => "1",
    :Name => "Käfer-Parade",
    :QuestGiver => "Lydia",
    :Stage1 => "Pokédexeintrag von Nincada",
    :QuestDescription => "Zeige Lydia den Pokédexeintrag von Nincada und erhalte eine Belohnung.",
	:RewardString => "Das könnte nützlich sein!"
  }
  
  # Here's an extension of the above that includes multiple stages
  Quest2 = {
    :ID => "2",
    :Name => "Introductions",
    :QuestGiver => "Little Boy",
    :Stage1 => "Look for clues.",
    :Stage2 => "Follow the trail.",
    :Stage3 => "Catch the troublemakers!",
    :Location1 => "Lappet Town",
    :Location2 => "Viridian Forest",
    :Location3 => "Route 3",
	:StageLabel1 => "1",
	:StageLabel2 => "2",
    :QuestDescription => "Some wild Pokémon stole a little boy's favourite toy. Find those troublemakers and help him get it back.",
    :RewardString => "Something shiny!"
  }
  
  # Here's an example of a quest with lots of stages that also doesn't have a stage location defined for every stage
  Quest3 = {
    :ID => "3",
    :Name => "Last-minute chores",
    :QuestGiver => "Grandma",
    :Stage1 => "A",
    :Stage2 => "B",
    :Stage3 => "C",
    :Stage4 => "D",
    :Stage5 => "E",
    :Stage6 => "F",
    :Stage7 => "G",
    :Stage8 => "H",
    :Stage9 => "I",
    :Stage10 => "J",
    :Stage11 => "K",
    :Stage12 => "L",
    :Location1 => "nil",
    :Location2 => "nil",
    :Location3 => "Dewford Town",
    :QuestDescription => "Isn't the alphabet longer than this?",
    :RewardString => "Chicken soup!"
  }
  
  # Here's an example of not defining the quest giver and reward text
  Quest4 = {
    :ID => "4",
    :Name => "A new beginning",
    :QuestGiver => "nil",
    :Stage1 => "Turning over a new leaf... literally!",
    :Stage2 => "Help your neighbours.",
    :Location1 => "Milky Way",
    :Location2 => "nil",
    :QuestDescription => "You crash landed on an alien planet. There are other humans here and they look hungry...",
    :RewardString => "nil"
  }
  
  # Other random examples you can look at if you want to fill out the UI and check out the page scrolling
  Quest5 = {
    :ID => "5",
    :Name => "All of my friends",
    :QuestGiver => "Barry",
    :Stage1 => "Meet your friends near Acuity Lake.",
    :QuestDescription => "Barry told me that he saw something cool at Acuity Lake and that I should go see. I hope it's not another trick.",
    :RewardString => "You win nothing for giving in to peer pressure."
  }
  
  Quest6 = {
    :ID => "6",
    :Name => "The journey begins",
    :QuestGiver => "Professor Oak",
    :Stage1 => "Deliver the parcel to the Pokémon Mart in Viridian City.",
    :Stage2 => "Return to the Professor.",
    :Location1 => "Viridian City",
    :Location2 => "nil",
    :QuestDescription => "The Professor has entrusted me with an important delivery for the Viridian City Pokémon Mart. This is my first task, best not mess it up!",
    :RewardString => "nil"
  }
  
  Quest7 = {
    :ID => "7",
    :Name => "Close encounters of the... first kind?",
    :QuestGiver => "nil",
    :Stage1 => "Make contact with the strange creatures.",
    :Location1 => "Rock Tunnel",
    :QuestDescription => "A sudden burst of light, and then...! What are you?",
    :RewardString => "A possible probing."
  }
  
  Quest8 = {
    :ID => "8",
    :Name => "These boots were made for walking",
    :QuestGiver => "Musician #1",
    :Stage1 => "Listen to the musician's, uhh, music.",
    :Stage2 => "Find the source of the power outage.",
    :Location1 => "nil",
    :Location2 => "Celadon City Sewers",
    :QuestDescription => "A musician was feeling down because he thinks no one likes his music. I should help him drum up some business."
  }
  
  Quest9 = {
    :ID => "9",
    :Name => "Got any grapes?",
    :QuestGiver => "Duck",
    :Stage1 => "Listen to The Duck Song.",
    :Stage2 => "Try not to sing it all day.",
    :Location1 => "YouTube",
    :QuestDescription => "Let's try to revive old memes by listening to this funny song about a duck wanting grapes.",
    :RewardString => "A loss of braincells. Hurray!"
  }
  
  Quest10 = {
    :ID => "10",
    :Name => "Singing in the rain",
    :QuestGiver => "Some old dude",
    :Stage1 => "I've run out of things to write.",
    :Stage2 => "If you're reading this, I hope you have a great day!",
    :Location1 => "Somewhere prone to rain?",
    :QuestDescription => "Whatever you want it to be.",
    :RewardString => "Wet clothes."
  }
  
  Quest11 = {
    :ID => "11",
    :Name => "When is this list going to end?",
    :QuestGiver => "Me",
    :Stage1 => "When IS this list going to end?",
    :Stage2 => "123",
    :Stage3 => "456",
    :Stage4 => "789",
    :QuestDescription => "I'm losing my sanity.",
    :RewardString => "nil"
  }
  
  Quest12 = {
    :ID => "12",
    :Name => "The laaast melon",
    :QuestGiver => "Some stupid dodo",
    :Stage1 => "Fight for the last of the food.",
    :Stage2 => "Don't die.",
    :Location1 => "A volcano/cliff thing?",
    :Location2 => "Good advice for life.",
    :QuestDescription => "Tea and biscuits, anyone?",
    :RewardString => "Food, glorious food!"
  }

    Quest13 = {
    :ID => "13",
    :Name => "Verschwundener Junge",
    :QuestGiver => "Lara",
    :Stage1 => "Finde das Kind.",
    :Location1 => "Route 3",
    :QuestDescription => "Mein Bruder ist in den Wald gelaufen und nicht mehr zurück gekommen. Ich würde hinterher gehen, aber meine Pokémon sind nicht stark genug. Könntest du ihn zurückbringen?",
    :RewardString => "Etwas Schmuck"
  }
  
      Quest14 = {
    :ID => "14",
    :Name => "Hobby-Archäologe",
    :QuestGiver => "Miriam",
    :Stage1 => "Finde einen bes. Stein",
    :Location1 => "Moostiefen",
    :QuestDescription => "Miriam ist auf der Suche nach seltenen Steinen. Hilf ihr welche zu finden.",
    :RewardString => "Pflanzen-Boost"
  }
  
  Quest15 = {
    :ID => "15",
    :Name => "Geburtstags-Bote",
    :QuestGiver => "Uschi",
    :Stage1 => "Geschenk überbringen",
    :Location1 => "Lunafeld",
    :QuestDescription => "Überbringe das Geschenk an das Enkelkind von Oma Uschi, der in Lunafeld wohnt.",
    :RewardString => "TM74"
  }
  Quest16 = {
    :ID => "16",
    :Name => "Versteckspiel",
    :QuestGiver => "Noah",
    :Stage1 => "Finde Noah in Mistral",
    :Location1 => "Mistral",
    :QuestDescription => "Noah ist langweilig und möchte mit dir Verstecken spielen. Er hat sich an verschiedenen Orten in Mistral versteckt. Versuche ihn zu finden.",
    :RewardString => "TM47"
  }
  Quest17 = {
    :ID => "17",
    :Name => "Bienenkönigin",
    :QuestGiver => "Prof. Aurelia",
    :Stage1 => "Übergebe ein Honweisel",
    :QuestDescription => "Die Honigqualität leidet ohne ein Honweisel. Hilf den Forschern und bringe ihnen ein Honweisel.",
    :RewardString => "Etwas lokales"
  }
  Quest18 = {
    :ID => "18",
    :Name => "Gestank",
    :QuestGiver => "Wolfgang",
    :Stage1 => "Bringe Wolfgang das Sleima",
	:Stage2 => "Bringe Wolfgang ein Skunkapuh",
    :Stage3 => "Bringe Wolfgang ein Deponitox",
    :QuestDescription => "Wolfgang sammelt besondere Düfte. Hilf ihm seine Sammlung zu ergänzen."
  }
  Quest19 = {
    :ID => "19",
    :Name => "Durstige Hotelangestellte",
    :QuestGiver => "Freya",
    :Stage1 => "Besorge eine Limonade",
    :QuestDescription => "Bringe eine Limonade der Hotelangestellten im Hotel Klefki."
  }
  Quest20 = {
    :ID => "20",
    :Name => "Pamo-Tausch",
    :QuestGiver => "Claudia",
    :Stage1 => "Tausche ein Pamo mit Claudia",
    :QuestDescription => "Tausche ein Pamo gegen ein Flunkifer mit Claudia auf Route 3."
  }
  Quest21 = {
    :ID => "21",
    :Name => "Pinsir-Tausch",
    :QuestGiver => "Nico",
    :Stage1 => "Tausche ein Pinsir mit Nico",
    :QuestDescription => "Tausche ein Pinsir gegen ein Sichlor mit Nico im Hotel-Klefki."
  }
  Quest22 = {
    :ID => "22",
    :Name => "Flegmonrute",
    :QuestGiver => "Hana",
    :Stage1 => "Besorge Hana ein Flegmon",
    :QuestDescription => "Besorge Hana aus Solhaven ein Flegmon."
  }
  Quest23 = {
    :ID => "23",
    :Name => "Geistervilla",
    :QuestGiver => "Ingbert",
    :Stage1 => "Befreie Celestia",
	:Location1 => "Celestia",
    :QuestDescription => "Das Dorf Celestia wird von Dämonen heimgesucht, vertreibe sie."
  }
  Quest24 = {
    :ID => "24",
    :Name => "Schlummer-Angel",
    :QuestGiver => "Steve",
    :Stage1 => "Fange eine Aalabyss",
    :QuestDescription => "Bringe Steve aus dem Hotel in Solhaven ein Aalabyss"
  }
  Quest25 = {
    :ID => "25",
    :Name => "Pokédex-Eintrag",
    :QuestGiver => "Pia",
    :Stage1 => "Pokédexeintrag von Relaxo",
    :QuestDescription => "Zeige Pia den Pokédexeintrag von Relaxo."
  }
  Quest26 = {
    :ID => "26",
    :Name => "Schlangen-Parade",
    :QuestGiver => "Emil",
    :Stage1 => "Pokédexeintrag von Arbok",
    :QuestDescription => "Zeige Emil aus Mistral den Pokédexeintrag von Arbok und erhalte eine Belohnung."
  }
  Quest27 = {
    :ID => "27",
    :Name => "Käfertastisch",
    :QuestGiver => "Eberhard",
    :Stage1 => "Nehme am Käfersammler-Turnier teil",
	:Location1 => "Route 4",
    :QuestDescription => "Zeige Eberhard aus dem Käfersammler-Club, dass du bereits am Käfersammler-Turnier teilgenommen hast, um im Club aufgenommen zu werden."
  }
  Quest28 = {
    :ID => "28",
    :Name => "Alter Falter",
    :QuestGiver => "Thomas",
    :Stage1 => "Zeige Thomas ein Smettbo",
    :QuestDescription => "Zeige Thomas aus dem Käfersammler-Club ein Smettbo und erhalte eine Belohnung."
  }
  Quest29 = {
    :ID => "29",
    :Name => "Käfer für Anfänger",
    :QuestGiver => "Leopold",
    :Stage1 => "Dritter beim Käfersammler-Turnier",
	:Location1 => "Route 4",
    :QuestDescription => "Nehme am Käfersammler-Turnier teil und werde mindestens Dritter."
  }
  Quest30 = {
    :ID => "30",
    :Name => "Duale Parade",
    :QuestGiver => "Frieda",
    :Stage1 => "Schnuthelm gegen Laukaps",
    :QuestDescription => "Tausche mit Frieda aus dem Käfersammler-Club dein Schnuthelm gegen ihr Laukaps."
  }
  Quest31 = {
    :ID => "31",
    :Name => "Duale Parade 2",
    :QuestGiver => "Konrad",
    :Stage1 => "Pinsir gegen Sichlor",
    :QuestDescription => "Tausche mit Konrad aus dem Käfersammler-Club dein Pinsir gegen sein Sichlor."
  }
  Quest32 = {
    :ID => "32",
    :Name => "Ein neuer Käfer",
    :QuestGiver => "Raphael",
    :Stage1 => "Zeige Raphael ein Libelldra",
    :QuestDescription => "Zeige Raphael aus dem Käfersammler-Club ein Libelldra."
  }
  Quest33 = {
    :ID => "33",
    :Name => "Schattenseite der Käfer",
    :QuestGiver => "Nikolai",
    :Stage1 => "Zeige Raphael ein Ninjatom",
    :QuestDescription => "Zeige Nikolai aus dem Käfersammler-Club ein Ninjatom."
  }
  Quest34 = {
    :ID => "34",
    :Name => "Ameisenplage",
    :QuestGiver => "Laurena",
    :Stage1 => "Vertreibe die Ameisen",
	:Location1 => "Ariduna",
    :QuestDescription => "Beseitige die Ameiseninvasion in Ariduna."
  }
  Quest35 = {
    :ID => "35",
    :Name => "Bei Käfer-Fragen Tectass fragen",
    :QuestGiver => "Cedrik",
    :Stage1 => "Zeige Cedrik ein Tectass",
    :QuestDescription => "Zeige Cedrik aus dem Käfersammler-Club ein Tectass."
  }
  Quest36 = {
    :ID => "36",
    :Name => "Regenbogenschmetterling",
    :QuestGiver => "Grace",
    :Stage1 => "Alle Formen von Vivillon",
    :QuestDescription => "Zeige Grace aus dem Käfersammler-Club eine bestimmte Form von Vivillon."
  }
  Quest37 = {
    :ID => "37",
    :Name => "Feuerfalter",
    :QuestGiver => "Detwin",
    :Stage1 => "Fange das Boss-Pokémon",
    :QuestDescription => "Detwin aus dem Käfersammler-Club bittet dich, das seltene Pokémon zu fangen."
  }
  Quest38 = {
    :ID => "38",
    :Name => "NOCH FREI",
    :QuestGiver => "Marlon",
    :Stage1 => "Besitze die Angel",
    :QuestDescription => "Zeige Marlon aus dem Angel-Club die Angel, um in den Angel-Club aufgenommen zu werden."
  }
  Quest39 = {
    :ID => "39",
    :Name => "NOCH FREI",
    :QuestGiver => "Balint",
    :Stage1 => "Fange ein Goldini",
    :QuestDescription => "Fange mit der Angel ein Goldini und zeige es Balint aus dem Angler-Club."
  }
  Quest40 = {
    :ID => "40",
    :Name => "Kleiner Fisch, kleine Wirkung",
    :QuestGiver => "Balint",
    :Stage1 => "Fange ein Goldini",
    :QuestDescription => "Fange mit der Angel ein Goldini und zeige es Balint, um in den Angel aufgenommen zu werden."
  }
  Quest41 = {
    :ID => "41",
    :Name => "Nur Bar ist wahr",
    :QuestGiver => "Krischan",
    :Stage1 => "Fange ein Barschuft",
    :QuestDescription => "Fange mit der Angel ein Barschuft und zeige es Krischan aus dem Angler-Club."
  }
  Quest42 = {
    :ID => "42",
    :Name => "Gurgelkurs",
    :QuestGiver => "Marleen",
    :Stage1 => "Vertreibe die Urgl",
	:Location1 => "Route 4",
    :QuestDescription => "Marleen aus dem Angler-Club bittet dich, die Urgl zu vertreiben."
  }
  Quest43 = {
    :ID => "43",
    :Name => "Ouroboros",
    :QuestGiver => "Mariano",
    :Stage1 => "Gib Mariano ein Muschas",
    :QuestDescription => "Besorge ein Muschas für Mariano aus dem Angler-Club, damit er sein Flegmon entwickeln kann."
  }
  Quest44 = {
    :ID => "44",
    :Name => "Tentakellastig",
    :QuestGiver => "Vito",
    :Stage1 => "Zeige Vito ein Tentacha",
    :QuestDescription => "Zeige Vito aus dem Angler-Club ein Tentacha."
  }
  Quest45 = {
    :ID => "45",
    :Name => "Torpedo",
    :QuestGiver => "Quinn",
    :Stage1 => "Zeige Quinn ein Tohaido",
    :QuestDescription => "Zeige Quinn aus dem Angler-Club ein Tohaido."
  }
  Quest46 = {
    :ID => "46",
    :Name => "Goldfisch",
    :QuestGiver => "Sybille",
    :Stage1 => "Zeige ein Shiny Karpador",
    :QuestDescription => "Zeige Sybille aus dem Angler-Club ein Shiny Karpador."
  }
  Quest47 = {
    :ID => "47",
    :Name => "Putziger Putzfisch",
    :QuestGiver => "Merlin",
    :Stage1 => "Fange alle Nigiragi-Formen",
    :QuestDescription => "Zeige Merlin aus dem Angler-Club alle Nigiragi-Formen."
  }
  Quest48 = {
    :ID => "48",
    :Name => "Lehrreicher Tag, Quak",
    :QuestGiver => "Kenji",
    :Stage1 => "Besänftige das Pokémon",
	:Location1 => "Route 9",
    :QuestDescription => "Kenji aus dem Angler-Club bittet dich, ein wildes Pokémon auf Route 9 zu zähmen."
  }
  Quest49 = {
    :ID => "49",
    :Name => "Einschläfernd",
    :QuestGiver => "Reginald",
    :Stage1 => "Vertreibe das Relaxo",
	:Location1 => "Lunafeld",
    :QuestDescription => "Reginald aus Ephiron bittet dich, das Relaxo Richtung Lunafeld zu vertreiben."
  }
   Quest50 = {
    :ID => "50",
    :Name => "Surprise-Box",
    :QuestGiver => "Miriam",
    :Stage1 => "Fülle die 1. Pokémon-Box",
    :QuestDescription => "Fülle deine gesamte erste Box mit Pokémon, um eine Überraschung von Miriam zu erhalten."
  }
     Quest51 = {
    :ID => "51",
    :Name => "Krankes Pokémon",
    :QuestGiver => "Marie",
    :Stage1 => "Medikament für Marie",
	:Location1 => "Solhaven",
    :QuestDescription => "Maries Igamaro wurde vergiftet. Sie hat gehört, dass es ein Medikament in Solhaven geben soll. Sie schafft es aber selbst nicht dorthin und das Pokécenter kann nicht helfen. Könntest du ihr das Medikament bringen?"
  }
	Quest52 = {
    :ID => "52",
    :Name => "Matschbombe",
    :QuestGiver => "Joel",
    :Stage1 => "Zeige Joel ein Sumpex",
    :QuestDescription => "Profiangler Joel aus Morastia würde gerne ein Sumpex sehen. Es ist auf Route 14 fangbar."
 }
  	Quest53 = {
    :ID => "53",
    :Name => "Dunkle Geheimnisse",
    :QuestGiver => "Casper",
    :Stage1 => "Besitze ein Geist-Pokémon",
    :QuestDescription => "Um Mitglied im Geisterclub zu werden, musst du ein Geist-Pokémon fangen."
 }
 Quest54 = {
    :ID => "54",
    :Name => "Steppenläufer",
    :QuestGiver => "Elara",
    :Stage1 => "Fange ein Weherba",
    :QuestDescription => "Elara aus dem Geisterclub möchte gerne ein Weherba sehen. Damit kannst du ihr zeigen, dass du gewillt bist, über den Tellerrand zu blicken und nicht vorschnell urteilst."
 }
  Quest55 = {
    :ID => "55",
    :Name => "Kimono",
    :QuestGiver => "Lucius",
    :Stage1 => "Zeige ein Frosdedje",
    :QuestDescription => "Lucius aus dem Geisterclub möchte dir zeigen, dass man sich nicht durch Schönheit blenden lassen sollte. Deshalb sollst du ihm ein Frosdedje zeigen."
 }
   Quest56 = {
    :ID => "56",
    :Name => "Kindergeburtstag",
    :QuestGiver => "Gustavo",
    :Stage1 => "Rette das entführte Kind",
	:Location1 => "Route 15",
    :QuestDescription => "Du bekommst mit, dass ein Driftlon ein Kind entführt haben soll. Sie befinden sich vermutlich auf Route 15. Hilf der armen Mutter und rette das Kind, welches von Driftlon entführt wurde."
 }
    Quest57 = {
    :ID => "57",
    :Name => "Puppenspiel",
    :QuestGiver => "Olga",
    :Stage1 => "Finde die Poképuppe",
	:Location1 => "Route 14",
    :QuestDescription => "Olga aus dem Geisterclub hat eine Poképuppe in einem Haus auf Route 14 versteckt. Beweise, dass du der Dunkelheit gewachsen bist."
 }
    Quest58 = {
    :ID => "58",
    :Name => "Knochentanz",
    :QuestGiver => "Samuel",
    :Stage1 => "Die letzte Lichtung",
	:Location1 => "Route 16",
    :QuestDescription => "Samuel aus dem Geisterclub hat ein besonderes Pokémon auf Route 16 an der letzten Lichtung gesehen. Du hast die Entscheidung, was du mit dem Pokémon machen möchtest."
 }
    Quest59 = {
    :ID => "59",
    :Name => "Trickbetrug",
    :QuestGiver => "Wiley",
    :Stage1 => "Räume das Geisterhaus auf",
    :Location1 => "Celestia",
    :QuestDescription => "Wiley aus dem Geisterclub hat von dem verfluchten Haus in Celestia mitbekommen. Finde heraus, was dort vor sich geht. Erstatte anschließend Bericht."
 }
    Quest60 = {
    :ID => "60",
    :Name => "Mysteriöser Frosch",
    :QuestGiver => "Eberhard",
    :Stage1 => "Finde das Frosch-Pokémon",
    :Location1 => "Route 9",
    :QuestDescription => "Eberhard auf Route 9 hat ein seltsam aussehendes Pokémon gesehen. Er glaubt, es könnte ein Shiny-Quappo sein. Fange das mysteriöse Pokémon auf Route 9 und zeig es Eberhard.",
	:RewardString => "TM22"
  }
    Quest61 = {
    :ID => "61",
    :Name => "Mega Stoned",
    :QuestGiver => "Jane",
    :Stage1 => "Finde 20 Mega-Steine",
    :QuestDescription => "Jane ist begeistert von Mega-Steinen. Teilst du ihre Begeisterung? Finde 20 Mega-Steine und komme wieder."
  }

  # ===== Vogelfänger-Club =====
  Quest62 = {
    :ID => "62",
    :Name => "Vogelperspektive",
    :QuestGiver => "Flynn",
    :Stage1 => "Besorge ein Botogel",
    :Location1 => "Route 6",
    :QuestDescription => "Der Vogelfänger-Club nimmt nur echte Vogelkenner auf. Flynn verlangt, dass du in die Lüfte austeigst und ein Botogel fängst, bevor er dich aufnimmt.",
    :RewardString => "Vogelfänger-Club Mitgliedschaft"
  }
  Quest63 = {
    :ID => "63",
    :Name => "Omlett",
    :QuestGiver => "Anan",
    :Stage1 => "Besorge das Washakwil-Ei",
    :Location1 => "Route 9",
    :QuestDescription => "Anan möchte unbedigt ein Ei eines wilden Washakwil. Er geht einer Theori nach und hat dir eine Belohnung versprochen."
  }
  Quest64 = {
    :ID => "64",
    :Name => "Federverlust",
    :QuestGiver => "Miku",
    :Stage1 => "Finde die verlorene Feder",
    :Location1 => "Route 11",
    :QuestDescription => "Miku hat eine seltene Schmuck-Feder verloren, als ihr Flaminkno durch einen Sandsturm geflogen ist. Finde die Feder wieder."
  }
  Quest65 = {
    :ID => "65",
    :Name => "Sturm im Anflug",
    :QuestGiver => "Rosalie",
    :Stage1 => "Vertreibe die wilden Habitak",
    :Location1 => "Route 5",
    :QuestDescription => "Ein Schwarm wilder Habitak bedroht Rosalies Hof auf Route 5. Vertreibe sie, bevor sie die Ernte zerstören."
  }
  Quest66 = {
    :ID => "66",
    :Name => "Bunter Vogel, bunte Lüge",
    :QuestGiver => "Anton",
    :Stage1 => "Finde heraus, wer die Wablu-Eier gestohlen hat",
    :Stage2 => "Stelle den Dieb in Mistral zur Rede",
    :Stage3 => "Bringe die Eier zu Anton zurück",
    :Location1 => "Route 5",
    :Location2 => "Mistral",
    :Location3 => "Route 5",
    :QuestDescription => "Jemand hat seltene Wablu-Eier aus dem Vogelfänger-Nest gestohlen. Finde den Täter in Mistral und bringe die Eier zurück."
  }
  Quest67 = {
    :ID => "67",
    :Name => "Federtausch",
    :QuestGiver => "Bianca",
    :Stage1 => "Tausche dein Wingull gegen Biancas Natu",
    :QuestDescription => "Tausche mit Bianca aus dem Vogelfänger-Club dein Wingull gegen ihr Natu."
  }
  Quest68 = {
    :ID => "68",
    :Name => "Der Kartenraub",
    :QuestGiver => "Norbert",
    :Stage1 => "Besiege Norberts drei Schützlinge nacheinander",
    :Stage2 => "Besiege Norbert selbst",
    :Location1 => "Route 5",
    :Location2 => "Route 5",
    :QuestDescription => "Norbert testet neue Club-Mitglieder mit einem Dreikampf gegen seine Schützlinge, gefolgt von einem Duell gegen ihn selbst."
  }
  Quest69 = {
    :ID => "69",
    :Name => "Sturmvögel",
    :QuestGiver => "Ilse",
    :Stage1 => "Entwickle ein Togetic zu Togekiss",
    :Stage2 => "Zeige Ilse dein Togekiss",
    :QuestDescription => "Ilse aus dem Vogelfänger-Club möchte ein vollständig entwickeltes Togekiss sehen - ein seltener Anblick, das nur wahre Meister vorweisen können."
  }
  Quest70 = {
    :ID => "70",
    :Name => "Legende der Lüfte",
    :QuestGiver => "Theodor",
    :Stage1 => "Sammle Hinweise auf das legendäre Vogel-Pokémon in Mistral",
    :Stage2 => "Folge der Spur zu den Dracheninseln",
    :Stage3 => "Fange das legendäre Pokémon",
    :Stage4 => "Kehre siegreich zu Theodor zurück",
    :Location1 => "Mistral",
    :Location2 => "Dracheninseln",
    :Location3 => "Dracheninseln",
    :Location4 => "Route 5",
    :QuestDescription => "Theodor glaubt, ein legendäres Vogel-Pokémon gesichtet zu haben. Folge den Hinweisen, finde es und beweise deine Meisterschaft."
  }
  Quest71 = {
    :ID => "71",
    :Name => "Goldener Flügel",
    :QuestGiver => "Paulina",
    :Stage1 => "Fange ein Shiny Taubsi in freier Wildbahn",
    :Stage2 => "Zeige es Paulina",
    :QuestDescription => "Zeige Paulina aus dem Vogelfänger-Club ein Shiny Taubsi, das du selbst gefangen hast - ein Beweis für wahre Geduld."
  }

  # ===== Drachen-Club =====
  Quest72 = {
    :ID => "72",
    :Name => "Drachenblut",
    :QuestGiver => "Sigrid",
    :Stage1 => "Rede mit den drei Ältesten der Dracheninseln",
    :Stage2 => "Bestehe die Mutprobe vor einem wilden Drachen",
    :Stage3 => "Kehre zu Sigrid zurück",
    :Location1 => "Dracheninseln",
    :Location2 => "Dracheninseln",
    :Location3 => "Dracheninseln",
    :QuestDescription => "Um in den Drachen-Club aufgenommen zu werden, musst du die Ältesten der Dracheninseln überzeugen und eine Mutprobe bestehen.",
    :RewardString => "Drachen-Club Mitgliedschaft"
  }
  Quest73 = {
    :ID => "73",
    :Name => "Kleiner Wurm, große Zukunft",
    :QuestGiver => "Alarich",
    :Stage1 => "Besiege 3 Trainer mit Drachen-Pokémon",
    :Location1 => "Dracheninseln",
    :QuestDescription => "Zeige Alarich aus dem Drachen-Club, dass du auch jungen Drachen-Pokémon gewachsen bist, indem du drei Trainer auf den Dracheninseln besiegst."
  }
  Quest74 = {
    :ID => "74",
    :Name => "Schleimspur",
    :QuestGiver => "Freyja",
    :Stage1 => "Folge der Schleimspur zu ihrem Ursprung",
    :Stage2 => "Fange das Viscora am Ende der Spur",
    :Location1 => "Faulmoor",
    :Location2 => "Faulmoor",
    :QuestDescription => "Freyja aus dem Drachen-Club hat eine mysteriöse Schleimspur im Faulmoor entdeckt. Folge ihr bis zum Ursprung."
  }
  Quest75 = {
    :ID => "75",
    :Name => "Fossiler Wurm",
    :QuestGiver => "Bertram",
    :Stage1 => "Grabe in den Moostiefen nach einem Fossil",
    :Stage2 => "Belebe das Fossil zu einem Balgoras",
    :Stage3 => "Zeige es Bertram",
    :Location1 => "Moostiefen",
    :Location2 => "Solhaven",
    :Location3 => "Dracheninseln",
    :QuestDescription => "Bertram aus dem Drachen-Club hat von einem versteinerten Drachen in den Moostiefen gehört. Grabe das Fossil aus und lass es wiederbeleben."
  }
  Quest76 = {
    :ID => "76",
    :Name => "Tausch der Titanen",
    :QuestGiver => "Isolde",
    :Stage1 => "Tausche dein Milza gegen Isoldes Kapuno",
    :QuestDescription => "Tausche mit Isolde aus dem Drachen-Club dein Milza gegen ihr Kapuno."
  }
  Quest77 = {
    :ID => "77",
    :Name => "Apfel des Zwietrachts",
    :QuestGiver => "Roland",
    :Stage1 => "Finde den besonderen Apfel im Flammenhain",
    :Stage2 => "Fange das Knapfel, das ihn gegessen hat",
    :Stage3 => "Zeige Roland das Knapfel",
    :Location1 => "Flammenhain",
    :Location2 => "Flammenhain",
    :Location3 => "Dracheninseln",
    :QuestDescription => "Roland aus dem Drachen-Club ist fasziniert von den Apfel-Drachen. Finde den besonderen Apfel im Flammenhain und das Knapfel, das ihn gegessen hat."
  }
  Quest78 = {
    :ID => "78",
    :Name => "Zweiköpfiger Ärger",
    :QuestGiver => "Gerlinde",
    :Stage1 => "Finde das wild gewordene Duodino",
    :Stage2 => "Besänftige es im Kampf",
    :Stage3 => "Bringe es zu Gerlinde",
    :Location1 => "Route 12",
    :Location2 => "Route 12",
    :Location3 => "Dracheninseln",
    :QuestDescription => "Gerlinde aus dem Drachen-Club bittet dich, ein wild gewordenes Duodino auf Route 12 zu bändigen."
  }
  Quest79 = {
    :ID => "79",
    :Name => "Pseudo-Legende",
    :QuestGiver => "Konstantin",
    :Stage1 => "Besiege Konstantins Elite-Team",
    :Stage2 => "Zeige ihm dein voll entwickeltes Drachen-Pokémon",
    :Location1 => "Dracheninseln",
    :Location2 => "Dracheninseln",
    :QuestDescription => "Konstantin aus dem Drachen-Club stellt nur die stärksten Trainer auf die Probe. Besiege sein Elite-Team und zeige ihm dein bestes Drachen-Pokémon."
  }
  Quest80 = {
    :ID => "80",
    :Name => "Wächter der Inseln",
    :QuestGiver => "Brunhilde",
    :Stage1 => "Finde den verborgenen Höhleneingang auf den Dracheninseln",
    :Stage2 => "Besiege die Wächter-Trainer",
    :Stage3 => "Fange das Boss-Pokémon",
    :Stage4 => "Kehre siegreich zu Brunhilde zurück",
    :Location1 => "Dracheninseln",
    :Location2 => "Dracheninseln",
    :Location3 => "Dracheninseln",
    :Location4 => "Dracheninseln",
    :QuestDescription => "Brunhilde bewacht die Dracheninseln und hat ein besonders mächtiges Pokémon in einer verborgenen Höhle gesichtet. Finde den Eingang, bezwinge die Wächter und beweise deine Stärke."
  }
  Quest81 = {
    :ID => "81",
    :Name => "Goldener Drache",
    :QuestGiver => "Ottokar",
    :Stage1 => "Finde ein Shiny Dratini in freier Wildbahn",
    :Stage2 => "Zeige es Ottokar",
    :QuestDescription => "Zeige Ottokar aus dem Drachen-Club ein Shiny Dratini, das du selbst gefangen hast - der Traum jedes Drachensammlers."
  }
   Quest82 = {
    :ID => "82",
    :Name => "Vitamine 1",
    :QuestGiver => "Sina",
    :Stage1 => "Zeige Sina ein Drapfel",
	:Stage2 => "Zeige Sina ein Sirapfel",
	:Stage3 => "Zeige Sina ein Schlapfel",
	:Stage4 => "Zeige Sina die ganze Knapfel-Familie",
    :QuestDescription => "Sina hat sich auf Beeren und besondere Zutaten spezialisiert. Die Rezepte hat sie von ihrer Mutter. Einige sind leider nicht mehr lesbar. Erledige ihre Aufgaben, vielleicht kann Sina dadurch ihr Rezept fertigstellen."
  }
  Quest83 = {
    :ID => "83",
    :Name => "Robuste Entwicklung",
    :QuestGiver => "Lea",
    :Stage1 => "Bringe Lea einen Metallmantel",
    :QuestDescription => "In der Trainer-Schule in Velmora wartet Lea darauf, dass du ihr einen Metallmantel bringst, damit sie ihr Sichlor zu Scherox entwickeln kann."
  }
  Quest84 = {
    :ID => "84",
    :Name => "Verwandlungskünstler",
    :QuestGiver => "Prof. Amara",
    :Stage1 => "Bringe Prof. Amara ein Raikou",
    :Stage2 => "Bringe Prof. Amara ein Entei",
    :Stage3 => "Bringe Prof. Amara ein Suicune",
    :QuestDescription => "Prof. Almara hat sich auf Dittos spezialisiert. Sie schafft es selbst nicht bestimmte Pokémon zu fangen und bittet dich, Raikou, Entei und Suicune mitzubringen, damit Ditto sich in diese verwandeln kann."
  }
  Quest85 = {
    :ID => "85",
    :Name => "Kopfnuss",
    :QuestGiver => "William",
    :Stage1 => "Erhalte einen Orden",
    :QuestDescription => "William auf Route erwartet von dir zumindest einen Orden, um dir das Item für die Rüttelbäume zu überreichen. Manchmal fallen wilde Pokémon herunter."
  }
  Quest86 = {
    :ID => "86",
    :Name => "Innige Bindung",
    :QuestGiver => "Thea",
    :Stage1 => "Zeige einen Freundschaftswert von 200 oder mehr",
    :QuestDescription => "Thea auf Route 2 glaubt, an den Augen eines Pokémon ablesen zu können, wie sehr es seinen Trainer liebt. Zeig ihr ein Pokémon mit besonders hohem Freundschaftswert (>=200).",
    :RewardString => "Etwas freundschaftliches"
  }
  Quest87 = {
    :ID => "87",
    :Name => "Ein einziger Schlag",
    :QuestGiver => "Björn",
    :Stage1 => "Richte mit einer Attacke >=50% Schaden an",
    :Stage2 => "Richte mit einer Attacke >=66% Schaden an",
    :Stage3 => "Richte mit einer Attacke >=80% Schaden an",
    :Stage4 => "Richte mit einer Attacke 100% Schaden an",
    :QuestDescription => "Björn hat kein Interesse an Taktik oder Ausdauer - für ihn zählt nur die reine Wucht eines einzigen Treffers. Beweise Kampf für Kampf, dass dein Team genug rohe Kraft aufbringt.",
    :RewardString => "X-Angriff bis Stufe 6"
  }
  Quest88 = {
    :ID => "88",
    :Name => "Wie ein Fels",
    :QuestGiver => "Rose",
    :Stage1 => "Überstehe 5 Runden, ohne dass ein Pokémon fällt",
    :Stage2 => "Überstehe 10 Runden, ohne dass ein Pokémon fällt",
    :Stage3 => "Gewinne, ohne dass ein Pokémon unter 50% KP fällt",
    :Stage4 => "Besiege Rose mit nur einem Pokémon, ohne Items",
    :QuestDescription => "Rose interessiert sich nicht für schnelle Siege, sondern für Ausdauer - wer stehen bleibt, wenn es hart auf hart kommt. Beweise Kampf für Kampf, dass dein Team wirklich etwas aushält.",
    :RewardString => "X-Verteidigung bis Stufe 6"
  }
  Quest89 = {
    :ID => "89",
    :Name => "Der erste Schlag zählt",
    :QuestGiver => "Finn",
    :Stage1 => "Besiege das Pokémon, bevor es zuschlägt",
    :Stage2 => "Besiege das Pokémon, bevor es zuschlägt",
    :Stage3 => "Besiege 2 Pokémon, bevor sie zuschlagen",
    :Stage4 => "Besiege 2 Pokémon, bevor sie zuschlagen",
    :QuestDescription => "Für Finn zählt nicht, wer am Ende gewinnt, sondern wer zuerst da ist - selbst wenn sich die Regeln drehen. Beweise Kampf für Kampf, dass dein Team schneller ist als seins, ganz gleich unter welchen Bedingungen.",
    :RewardString => "X-Initiative bis Stufe 6"
  }
  Quest90 = {
    :ID => "90",
    :Name => "Stärker als jede Abwehr",
    :QuestGiver => "Mira",
    :Stage1 => "Besiege 1 Pokémon mit einer resistenten Attacke",
    :Stage2 => "Besiege 2 Pokémon mit einer resistenten Attacke",
    :Stage3 => "Besiege 1 Pokémon mit einer resistenten Attacke",
    :Stage4 => "Besiege 2 Pokémon mit einer resistenten Attacke",
    :QuestDescription => "Mira sagt, dass Typvorteile nur die halbe Wahrheit über einen Kampf verraten - die andere Hälfte ist rohe Kraft. Beweise Kampf für Kampf, dass dein Team auch gegen jede Abwehr durchschlägt - selbst wenn du selbst im Nachteil bist.",
    :RewardString => "X-Sp.-Angr. bis Stufe 6"
  }
  Quest91 = {
    :ID => "91",
    :Name => "Unerschütterlich",
    :QuestGiver => "Falk",
    :Stage1 => "Überstehe 5 Runden, ohne dass ein Pokémon fällt",
    :Stage2 => "Überstehe 10 Runden, ohne dass ein Pokémon fällt",
    :Stage3 => "Gewinne, ohne dass ein Pokémon unter 50% KP fällt",
    :Stage4 => "Besiege Falk mit nur einem Pokémon, ohne Items",
    :QuestDescription => "Falk lässt sich durch nichts aus der Ruhe bringen - er glaubt, dass wahre Stärke nicht im Zuschlagen liegt, sondern darin, wie viel man aushält, ohne ins Wanken zu geraten. Beweise Kampf für Kampf, dass dein Team genauso unerschütterlich ist.",
    :RewardString => "X-Sp.-Vert. bis Stufe 6"
  }
  Quest92 = {
    :ID => "92",
    :Name => "Niemals daneben",
    :QuestGiver => "Nadja",
    :Stage1 => "Gewinne einen Kampf ohne zu verfehlen",
    :Stage2 => "Gewinne einen Kampf ohne zu verfehlen",
    :Stage3 => "Lande 3 riskante Attacken in Folge",
    :Stage4 => "Gewinne einen Kampf ohne zu verfehlen",
    :QuestDescription => "Für Nadja ist Kraft ohne Zielsicherheit wertlos - sie hat sich der absoluten Präzision verschrieben und lässt keinen einzigen Fehlschuss gelten, egal wie unwahrscheinlich der Treffer eigentlich ist. Beweise Kampf für Kampf, dass dein Team genauso treffsicher ist.",
    :RewardString => "X-Genauigkeit bis Stufe 6"
  }
  Quest93 = {
    :ID => "93",
    :Name => "Vom Glück geküsst",
    :QuestGiver => "Rocco",
    :Stage1 => "Lande 1 Volltreffer in einem Kampf gegen Rocco",
    :Stage2 => "Lande 2 Volltreffer gegen Rocco",
    :Stage3 => "Lande 3 Volltreffer gegen Rocco",
    :Stage4 => "Lande 4 Volltreffer gegen Rocco",
    :QuestDescription => "Rocco glaubt fest daran, dass ein Volltreffer kein Zufall ist, sondern der Moment, in dem das Schicksal einem Trainer zulächelt. Beweise ihm Kampf für Kampf, dass dein Team vom Glück geküsst ist.",
    :RewardString => "X-Volltreffer bis Stufe 3"
  }
end
