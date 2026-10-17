#===============================================================================
# Chronoria Battle Fixes - 20 Raid-Hoehlen mit eigenem Pokemon-Pool
#-------------------------------------------------------------------------------
# Jede Hoehle hat einen festen Rang und 20 eigene Pokemon. Bei Tagesbeginn zieht
# sie zufaellig eines davon. Level je Rang (Raid-Plugin):
#   Rang 1: 10-15   Rang 2: 20-25   Rang 3: 30-35   Rang 4: 40-45   Rang 5: 65-70
#
# Event:
#   Name:    BasicRaidDen      (Grafik und taegliches Zuruecksetzen macht das Raid-Plugin)
#   Seite 1: keine Bedingung, Aktionstaste
#            Script: chronoria_raid_den(1)      <- Nummer der Hoehle, 1 bis 20
#
# Die Hoehle merkt sich ihr Pokemon, bis der Raid gewonnen ist oder ein neuer
# Kalendertag beginnt. Wer verliert, trifft beim naechsten Versuch auf dasselbe.
# Jede Hoehle braucht ein eigenes Event (eigene Event-ID), sonst teilen sie sich
# nichts - das Gedaechtnis haengt am Event.
#
# Optional: chronoria_raid_den(5, { :size => 2 }) usw. - Regeln wie bei pbRaidDen.
# Ohne Nummer (chronoria_raid_den) zieht die Hoehle aus allen 400 Pokemon und
# waehlt den Rang nach Orden, siehe [005] Raid Rank By Badges.rb.
#===============================================================================
module ChronoriaRaidPool
  DENS = {
    #---------------------------------------------------------------------------
    # 1. Waldlichtung - Rang 1 (Lv. 10-15), Pflanze/Käfer
    1 => { :name => "Waldlichtung", :rank => 1, :species => [
      :BULBASAUR_1, :CHIKORITA_1, :TURTWIG_1, :POLTCHAGEIST,    # Bisasam (Kanto), Endivie (Jotho), Chelast (Sinnoh), Mortcha
      :ODDISH, :BELLSPROUT, :PARAS, :VENONAT,                   # Myrapla, Knofensa, Paras, Bluzuk
      :HOPPIP, :SEWADDLE, :COTTONEE, :PETILIL,                  # Hoppspross, Strawickl, Waumboll, Lilminip
      :FOONGUS, :SCATTERBUG, :GRUBBIN, :CUTIEFLY,               # Tarnpignon, Purmel, Mabula, Wommel
      :FOMANTIS, :SMOLIV, :BOUNSWEET, :NYMBLE                   # Imantis, Olini, Frubberl, Micrick
    ]},
    #---------------------------------------------------------------------------
    # 2. Uferhoehle - Rang 1 (Lv. 10-15), Wasser
    2 => { :name => "Uferhöhle", :rank => 1, :species => [
      :SQUIRTLE_1, :TOTODILE_1, :MAGIKARP, :SEEL,               # Schiggy (Kanto), Karnimani (Jotho), Karpador, Jurob
      :PSYDUCK, :POLIWAG, :HORSEA, :SHELLDER,                   # Enton, Quapsel, Seeper, Muschas
      :KRABBY, :CHINCHOU, :WOOPER, :MUDKIP,                     # Krabby, Lampi, Felino, Hydropi
      :SPHEAL, :CLAMPERL, :FEEBAS, :BUIZEL,                     # Seemops, Perlu, Barschwa, Bamelin
      :OSHAWOTT, :FROAKIE, :POPPLIO, :FINIZEN                   # Ottaro, Froxy, Robball, Normifin
    ]},
    #---------------------------------------------------------------------------
    # 3. Wiese - Rang 1 (Lv. 10-15), Normal/Flug/Fee
    3 => { :name => "Wiese", :rank => 1, :species => [
      :PIDGEY, :EEVEE, :DITTO, :FIDOUGH,                        # Taubsi, Evoli, Ditto, Hefel
      :MIMEJR, :SWABLU_1, :HOOTHOOT_1, :TOGEPI,                 # Pantimimi, Wablu (Chrono), Hoothoot (Chrono), Togepi
      :SNUBBULL, :TEDDIURSA, :RALTS, :SKITTY,                   # Snubbull, Teddiursa, Trasla, Eneco
      :BUNEARY, :LILLIPUP, :MINCCINO, :FLETCHLING,              # Haspiror, Yorkleff, Picochilla, Dartiri
      :ROOKIDEE, :WOOLOO, :LECHONK, :TANDEMAUS                  # Meikro, Wolly, Ferkuli, Zwieps
    ]},
    #---------------------------------------------------------------------------
    # 4. Felsgrotte - Rang 1 (Lv. 10-15), Gestein/Boden/Stahl
    4 => { :name => "Felsgrotte", :rank => 1, :species => [
      :KLINK, :MUDBRAY, :CUBONE_2, :TRAPINCH_1,                 # Klikk, Pampuli, Tragosso (Chrono), Knacklion (Chrono)
      :YAMASK_1, :LARVITAR, :GIBLE, :BELDUM,                    # Makabaja (Galar), Larvitar, Kaumalat, Tanhel
      :ARON, :GEODUDE, :DIGLETT, :SANDSHREW,                    # Stollunior, Kleinstein, Digda, Sandan
      :PHANPY, :NUMEL, :ROGGENROLA, :DRILBUR,                   # Phanpy, Camaub, Kiesling, Rotomurf
      :ROCKRUFF, :NACLI, :CUFANT, :BONSLY                       # Wuffels, Geosali, Kupfanti, Mobai
    ]},
    #---------------------------------------------------------------------------
    # 5. Glutnest - Rang 2 (Lv. 20-25), Feuer
    5 => { :name => "Glutnest", :rank => 2, :species => [
      :CHARMANDER_1, :CYNDAQUIL_1, :TORCHIC_1, :PONYTA,         # Glumanda (Kanto), Feurigel (Jotho), Flemmli (Hoenn), Ponita
      :MAGBY, :CHARCADET, :DARUMAKA, :CUBONE_1,                 # Magby, Knarbon, Flampion, Tragosso (Alola)
      :VULPIX, :GROWLITHE, :SLUGMA, :HOUNDOUR,                  # Vulpix, Fukano, Schneckmag, Hunduster
      :CHIMCHAR, :TEPIG, :LITWICK, :FENNEKIN,                   # Panflam, Floink, Lichtel, Fynx
      :LITTEN, :SALANDIT, :SCORBUNNY, :FUECOCO                  # Flamiau, Molunk, Hopplo, Krokel
    ]},
    #---------------------------------------------------------------------------
    # 6. Funkenhoehle - Rang 2 (Lv. 20-25), Elektro/Stahl
    6 => { :name => "Funkenhöhle", :rank => 2, :species => [
      :PIKACHU_1, :ELEKID, :SHINX, :PLUSLE,                     # Pikachu (Spitzohr), Elekid, Sheinux, Plusle
      :MINUN, :CHINCHOU_1, :PICHU, :MAREEP,                     # Minun, Lampi (Chrono), Pichu, Voltilamm
      :ELECTRIKE, :PACHIRISU, :BLITZLE, :EMOLGA,                # Frizelbliz, Pachirisu, Elezeba, Emolga
      :JOLTIK, :TYNAMO, :HELIOPTILE, :DEDENNE,                  # Wattzapf, Zapplardin, Eguana, Dedenne
      :YAMPER, :TOXEL, :TADBULB, :VOLTORB_1                     # Voldi, Toxel, Blipp, Voltobal (Hisui)
    ]},
    #---------------------------------------------------------------------------
    # 7. Schattenspalte - Rang 2 (Lv. 20-25), Unlicht/Geist/Gift
    7 => { :name => "Schattenspalte", :rank => 2, :species => [
      :MEOWTH_1, :SNUBBULL_1, :ZORUA_1, :GIMMIGHOUL,            # Mauzi (Alola), Snubbull (Chrono), Zorua (Hisui), Gierspenst
      :QWILFISH_1, :SHELLDER_1, :GASTLY, :MISDREAVUS,           # Baldorfish (Hisui), Muschas (Chrono), Nebulak, Traunfugil
      :MURKROW, :SNEASEL, :SABLEYE, :SHUPPET,                   # Kramurx, Sniebel, Zobiris, Shuppet
      :DUSKULL, :STUNKY, :CROAGUNK, :FRILLISH,                  # Zwirrlicht, Skunkapuh, Glibunkel, Quabbel
      :DEINO, :SINISTEA, :IMPIDIMP, :GREAVARD                   # Kapuno, Fatalitee, Baehmon, Gruff
    ]},
    #---------------------------------------------------------------------------
    # 8. Mondhain - Rang 2 (Lv. 20-25), Psycho/Fee
    8 => { :name => "Mondhain", :rank => 2, :species => [
      :ELGYEM, :TRUBBISH_1, :ABRA, :CLEFAIRY,                   # Pygraulon, Unratuetox (Chrono), Abra, Piepi
      :NATU, :SMOOCHUM, :KIRLIA, :MEDITITE,                     # Natu, Kussilla, Kirlia, Meditie
      :SPOINK, :CHIMECHO, :BRONZOR, :MUNNA,                     # Spoink, Palimpalim, Bronzel, Somniam
      :GOTHITA, :SOLOSIS, :ESPURR, :SPRITZEE,                   # Mollimorba, Monozyto, Psiau, Parfi
      :INKAY, :HATENNA, :PONYTA_1, :SLOWPOKE_1                  # Iscalar, Brimova, Ponita (Galar), Flegmon (Galar)
    ]},
    #---------------------------------------------------------------------------
    # 9. Kampfplatz - Rang 3 (Lv. 30-35), Kampf
    9 => { :name => "Kampfplatz", :rank => 3, :species => [
      :PRIMEAPE, :MACHAMP, :HITMONLEE, :HITMONCHAN,             # Rasaff, Machomei, Kicklee, Nockchan
      :HITMONTOP, :HARIYAMA, :THROH, :SAWK,                     # Kapoera, Hariyama, Jiutesto, Karadonis
      :COMBUSKEN, :PAWMO, :FALINKS, :GRAPPLOCT,                 # Jungglut, Pamamo, Legios, Kaocto
      :HERACROSS, :BRELOOM, :LUCARIO, :GURDURR,                 # Skaraborn, Kapilz, Lucario, Strepoli
      :SCRAFTY, :MIENFOO, :HAWLUCHA, :PASSIMIAN                 # Irokex, Lin-Fu, Resladero, Quartermak
    ]},
    #---------------------------------------------------------------------------
    # 10. Frostkluft - Rang 3 (Lv. 30-35), Eis
    10 => { :name => "Frostkluft", :rank => 3, :species => [
      :DEWGONG, :MRMIME_1, :NOCTOWL_1, :PILOSWINE,              # Jugong, Pantimos (Galar), Noctuh (Chrono), Keifel
      :GLALIE, :SEALEO, :ABOMASNOW, :GLACEON,                   # Firnontor, Seejong, Rexblisar, Glaziola
      :BEARTIC, :ARCTIBAX, :DARMANITAN_2, :SANDSLASH_1,         # Siberio, Cryospino, Flampivian (Galar-Form Normalmodus), Sandamer (Alola)
      :NINETALES_1, :CLOYSTER, :ONIX_1, :JYNX,                  # Vulnona (Alola), Austos, Onix (Chrono), Rossana
      :DELIBIRD, :FROSLASS, :CRYOGONAL, :AMAURA                 # Botogel, Frosdedje, Frigometri, Amarino
    ]},
    #---------------------------------------------------------------------------
    # 11. Sumpf - Rang 3 (Lv. 30-35), Wasser/Boden/Gift
    11 => { :name => "Sumpf", :rank => 3, :species => [
      :WARTORTLE_1, :CROCONAW_1, :GOLDUCK, :SLOWBRO,            # Schillok (Kanto), Tyracroc (Jotho), Entoron, Lahmus
      :NIDOQUEEN, :NIDOKING, :ARBOK, :RHYDON,                   # Nidoqueen, Nidoking, Arbok, Rizeros
      :VAPOREON, :RELICANTH, :TATSUGIRI, :SWALOT,               # Aquana, Relicanth, Nigiragi, Schlukwech
      :GASTRODON, :MARSHTOMP, :QUAGSIRE, :WHISCASH,             # Gastrodon, Moorabbel, Morlord, Welsar
      :TOXICROAK, :PALPITOAD, :KROKOROK, :GLIGAR                # Toxiquak, Mebrana, Rokkaiman, Skorgla
    ]},
    #---------------------------------------------------------------------------
    # 12. Himmelsfels - Rang 3 (Lv. 30-35), Flug/Drache
    12 => { :name => "Himmelsfels", :rank => 3, :species => [
      :PIDGEOTTO, :FEAROW, :SWELLOW, :SHELGON,                  # Tauboga, Ibitak, Schwalboss, Draschel
      :VIBRAVA_1, :ALTARIA_1, :ARCHEN, :TYRUNT,                 # Vibrara (Chrono), Altaria (Chrono), Flapteryx, Balgoras
      :SLIGGOO, :DURALUDON, :BOMBIRDIER, :CYCLIZAR,             # Viscargot, Duraludon, Adebom, Mopex
      :TURTONATOR, :DRAGONAIR, :GABITE, :FRAXURE,               # Tortunator, Dragonir, Knarksel, Sharfax
      :ZWEILOUS, :DRAKLOAK, :SKARMORY, :TROPIUS                 # Duodino, Phandra, Panzaeron, Tropius
    ]},
    #---------------------------------------------------------------------------
    # 13. Vulkan - Rang 4 (Lv. 40-45), Feuer/Gestein
    13 => { :name => "Vulkan", :rank => 4, :species => [
      :CHARIZARD_1, :TYPHLOSION_1, :BLAZIKEN_1, :ARCANINE_1,    # Glurak (Kanto), Tornupto (Jotho), Lohgock (Hoenn), Arkani (Hisui)
      :RAPIDASH, :MAGMORTAR, :FLAREON, :MAGCARGO,               # Gallopa, Magbrant, Flamara, Magcargo
      :RHYPERIOR, :COALOSSAL, :TYRANTRUM, :STONJOURNER,         # Rihornior, Montecarbo, Monargoras, Humanolith
      :GARGANACL, :SIMISEAR, :AERODACTYL, :HOUNDOOM,            # Saltigant, Grillchita, Aerodactyl, Hundemon
      :TORKOAL, :VOLCARONA, :LYCANROC, :CARBINK                 # Qurtel, Ramoth, Wolwerock, Rocara
    ]},
    #---------------------------------------------------------------------------
    # 14. Tiefsee - Rang 4 (Lv. 40-45), Wasser
    14 => { :name => "Tiefsee", :rank => 4, :species => [
      :BLASTOISE_1, :FERALIGATR_1, :LAPRAS, :GYARADOS,          # Turtok (Kanto), Impergator (Jotho), Lapras, Garados
      :TAUROS_3, :KINGLER, :SLOWKING, :FLOATZEL,                # Tauros (Paldea (Flutenvariante)), Kingler, Laschoking, Bojelin
      :SAMUROTT_1, :JELLICENT, :CLAWITZER, :DRACOVISH,          # Admurai (Hisui), Apoquallyp, Wummer, Pescragon
      :ARCTOVISH, :DONDOZO, :EMPOLEON, :MILOTIC,                # Pescryodon, Heerashai, Impoleon, Milotic
      :KINGDRA, :SHARPEDO, :BARRASKEWDA, :PALAFIN               # Seedraking, Tohaido, Barrakiefa, Delfinator
    ]},
    #---------------------------------------------------------------------------
    # 15. Urwald - Rang 4 (Lv. 40-45), Pflanze/Käfer
    15 => { :name => "Urwald", :rank => 4, :species => [
      :VENUSAUR_1, :MEGANIUM_1, :TORTERRA_1, :SCIZOR,           # Bisaflor (Kanto), Meganie (Jotho), Chelterrar (Sinnoh), Scherox
      :LEAFEON, :SERPERIOR, :SIMISAGE, :ESCAVALIER,             # Folipurba, Serpiroyal, Vegichita, Cavalanzas
      :SAWSBUCK, :TSAREENA, :RIBOMBEE, :DHELMISE,               # Kronjuwild, Fruyal, Bandelby, Moruda
      :MEOWSCARADA, :RABSCA, :SINISTCHA, :HYDRAPPLE,            # Maskagato, Skarabaks, Fatalitcha, Hydrapfel
      :YANMEGA, :GALVANTULA, :FERROTHORN, :KLEAVOR              # Yanmega, Voltula, Tentantel, Axantor
    ]},
    #---------------------------------------------------------------------------
    # 16. Spukhaus - Rang 4 (Lv. 40-45), Geist/Unlicht/Psycho
    16 => { :name => "Spukhaus", :rank => 4, :species => [
      :GENGAR_1, :UMBREON, :ESPEON, :SPIRITOMB,                 # Gengar (Chrono), Nachtara, Psiana, Kryppuk
      :DUSKNOIR, :COFAGRIGUS, :GOTHITELLE, :REUNICLUS,          # Zwirrfinst, Echnatoll, Morbitesse, Zytomega
      :BEHEEYEM, :POLTEAGEIST, :CURSOLA, :RUNERIGUS,            # Megalon, Mortipot, Gorgasonn, Oghnatoll
      :OBSTAGOON, :MALAMAR, :ANNIHILAPE, :GHOLDENGO,            # Barrikadax, Calamanero, Epitaff, Monetigo
      :FARIGIRAF, :MIMIKYU, :HATTERENE, :CHANDELURE             # Farigiraf, Mimigma, Silembrim, Skelabra
    ]},
    #---------------------------------------------------------------------------
    # 17. Drachenhort - Rang 5 (Lv. 65-70), Drache
    17 => { :name => "Drachenhort", :rank => 5, :species => [
      :SALAMENCE, :FLYGON_1, :EXEGGUTOR_1, :FERALIGATR,         # Brutalanda, Libelldra (Chrono), Kokowei (Alola), Impergator
      :DRACOZOLT, :BAXCALIBUR, :ARCHALUDON, :DRAGONITE,         # Lectragon, Espinodon, Briduradon, Dragoran
      :GARCHOMP, :HYDREIGON, :GOODRA, :GOODRA_1,                # Knakrack, Trikephalo, Viscogon, Viscogon (Hisui)
      :KOMMOO, :DRAGAPULT, :HAXORUS, :DRUDDIGON,                # Grandiras, Katapuldra, Maxax, Shardrago
      :NOIVERN, :DRAMPA, :DRAGALGE, :GYARADOS_1                 # UHaFnir, Sen-Long, Tandrak, Garados (Chrono)
    ]},
    #---------------------------------------------------------------------------
    # 18. Stahlwerk - Rang 5 (Lv. 65-70), Stahl/Elektro
    18 => { :name => "Stahlwerk", :rank => 5, :species => [
      :METAGROSS, :JOLTEON, :LUXRAY, :MAGNEZONE,                # Metagross, Blitza, Luxtra, Magnezone
      :MAGNEZONE_1, :ELECTIVIRE, :ROTOM_1, :ROTOM_2,            # Magnezone (Chrono), Elevoltek, Rotom (Hitze Rotom), Rotom (Wasch Rotom)
      :ROTOM_5, :KLINKLANG, :COPPERAJAH, :ARCTOZOLT,            # Rotom (Schneid Rotom), Klikdiklak, Patinaraja, Lecryodon
      :TINKATON, :KINGAMBIT, :RAICHU_2, :GOLEM_1,               # Granforgita, Gladimperio, Raichu (Alola), Geowaz (Alola)
      :STEELIX_1, :AEGISLASH, :CORVIKNIGHT, :AMPHAROS           # Stahlos (Chrono), Durengard, Krarmor, Ampharos
    ]},
    #---------------------------------------------------------------------------
    # 19. Gipfel - Rang 5 (Lv. 65-70), Eis/Flug/Kampf
    19 => { :name => "Gipfel", :rank => 5, :species => [
      :PIDGEOT, :TAUROS_1, :TAUROS_2, :SNORLAX_1,               # Tauboss, Tauros (Paldea (Gefechtsvariante)), Tauros (Paldea (Flammenvariante)), Relaxo (Frostform)
      :MAMOSWINE, :AVALUGG, :AVALUGG_1, :CRABOMINABLE,          # Mamutel, Arktilas, Arktilas (Hisui), Krawell
      :EISCUE, :SNEASLER, :CETITAN, :BRAVIARY_1,                # Kubuin, Snieboss, Kolowal, Washakwil (Hisui)
      :INFERNAPE, :TALONFLAME, :CHESNAUGHT, :VANILLUXE,         # Panferno, Fiaro, Brigaron, Gelatwino
      :WEAVILE, :TOGEKISS, :STARAPTOR, :CONKELDURR              # Snibunna, Togekiss, Staraptor, Meistagrif
    ]},
    #---------------------------------------------------------------------------
    # 20. Schatzkammer - Rang 5 (Lv. 65-70), gemischt, Raritaeten
    20 => { :name => "Schatzkammer", :rank => 5, :species => [
      :TYRANITAR, :METAGROSS_1, :URSALUNA, :URSALUNA_1,         # Despotar, Metagross (Chrono), Ursaluna, Ursaluna (Blutmond Ursaluna)
      :FLOETTE_5, :CLOYSTER_1, :PORYGONZ, :BLASTOISE,           # Floette (Ewigbluetler), Austos (Chrono), Porygon-Z, Turtok
      :TYPHLOSION, :BLAZIKEN, :DECIDUEYE_1, :GRENINJA,          # Tornupto, Lohgock, Silvarro (Hisui), Quajutsu
      :INTELEON, :CINDERACE, :DELPHOX, :INCINEROAR,             # Intelleon, Liberlo, Fennexis, Fuegro
      :BLISSEY, :SLAKING, :VOLCARONA_1, :FLORGES                # Heiteira, Letarking, Ramoth (Chrono), Florges
    ]}
  }

  module_function

  def species_for(den)
    data = DENS[den]
    return [] if !data
    return data[:species].select { |s| GameData::Species.exists?(s) }
  end

  def all_species
    return DENS.keys.map { |d| species_for(d) }.flatten.uniq
  end
end

def chronoria_raid_den(den = nil, rules = {})
  if den.is_a?(Hash)
    rules = den
    den = nil
  end
  data = ChronoriaRaidPool::DENS[den]
  if data
    rules = { :rank => data[:rank] }.merge(rules)
    pool = ChronoriaRaidPool.species_for(den)
  else
    rules = { :rank => ChronoriaRaidRanks.random_rank }.merge(rules)
    pool = ChronoriaRaidPool.all_species
  end
  return pbRaidDen(pool.sample, rules)
end
