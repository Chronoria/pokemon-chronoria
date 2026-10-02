#===============================================================================
# Midbattle Scripts
#===============================================================================
# This module stores all custom battle scripts that can be called upon with the
# battle rule "midbattleScript" if you don't want to input the entire script in
# the event script itself, due to it being too long or if you just find it neater
# this way.
#
# Note that when calling one of the scripts here, you do so in the event by
# setting the constant you defined here as a battle rule.
#
# 	For example:  
#   setBattleRule("midbattleScript", :DEMO_SPEECH)
#
#   *Note that a semi-colon is required in front of the constant when called, 
#    but not when defined below.
#-------------------------------------------------------------------------------
module MidbattleScripts
################################################################################
# Essentials-Demo: Alle Auslöser anzeigen
################################################################################
  #-----------------------------------------------------------------------------
  # Demo for displaying each of the main triggers and when they activate.
  #-----------------------------------------------------------------------------
  DEMO_SPEECH = {
    #---------------------------------------------------------------------------
    # Round phases
    "RoundStartCommand_foe" => "Trigger: 'RoundStartCommand'\n({2}, {1})",
    "RoundStartAttack_foe"  => "Trigger: 'RoundStartAttack'\n({2}, {1})",
    "RoundEnd_foe"          => "Trigger: 'RoundEnd'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # Battler turns
    "TurnStart_foe"         => "Trigger: 'TurnStart'\n({2}, {1})",
    "TurnEnd_foe"           => "Trigger: 'TurnEnd'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # Item usage
    "BeforeItemUse"         => "Trigger: 'BeforeItemUse'\n({2}, {1})",
    "AfterItemUse"          => "Trigger: 'AfterItemUse'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # Wild capture
    "BeforeCapture"         => "Trigger: 'BeforeCapture'\n({2}, {1})",
    "AfterCapture"          => "Trigger: 'AfterCapture'\n({2}, {1})",
    "FailedCapture"         => "Trigger: 'FailedCapture'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # Switching
    "BeforeSwitchOut"       => "Trigger: 'BeforeSwitchOut'\n({2}, {1})",
    "BeforeSwitchIn"        => "Trigger: 'BeforeSwitchIn'\n({2}, {1})",
    "BeforeLastSwitchIn"    => "Trigger: 'BeforeLastSwitchIn'\n({2}, {1})",
    "AfterSwitchIn"         => "Trigger: 'AfterSwitchIn'\n({2}, {1})",
    "AfterLastSwitchIn"     => "Trigger: 'AfterLastSwitchIn'\n({2}, {1})",
    "AfterSendOut"          => "Trigger: 'AfterSendOut'\n({2}, {1})",
    "AfterLastSendOut"      => "Trigger: 'AfterLastSendOut'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # Megas & Primals
    "BeforeMegaEvolution"   => "Trigger: 'BeforeMegaEvolution'\n({2}, {1})",
    "AfterMegaEvolution"    => "Trigger: 'AfterMegaEvolution'\n({2}, {1})",
    "BeforePrimalReversion" => "Trigger: 'BeforePrimalReversion'\n({2}, {1})",
    "AfterPrimalReversion"  => "Trigger: 'AfterPrimalReversion'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # Move usage
    "BeforeMove"            => "Trigger: 'BeforeMove'\n({2}, {1})",
    "BeforeDamagingMove"    => "Trigger: 'BeforeDamagingMove'\n({2}, {1})",
    "BeforePhysicalMove"    => "Trigger: 'BeforePhysicalMove'\n({2}, {1})",
    "BeforeSpecialMove"     => "Trigger: 'BeforeSpecialMove'\n({2}, {1})",
    "BeforeStatusMove"      => "Trigger: 'BeforeStatusMove'\n({2}, {1})",
    "AfterMove"             => "Trigger: 'AfterMove'\n({2}, {1})",
    "AfterDamagingMove"     => "Trigger: 'AfterDamagingMove'\n({2}, {1})",
    "AfterPhysicalMove"     => "Trigger: 'AfterPhysicalMove'\n({2}, {1})",
    "AfterSpecialMove"      => "Trigger: 'AfterSpecialMove'\n({2}, {1})",
    "AfterStatusMove"       => "Trigger: 'AfterStatusMove'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # Damage results
    "UserDealtDamage"       => "Trigger: 'UserDealtDamage'\n({2}, {1})",
    "UserDamagedSub"        => "Trigger: 'UserDamagedSub'\n({2}, {1})",
    "UserBrokeSub"          => "Trigger: 'UserBrokeSub'\n({2}, {1})",
    "UserDealtCriticalHit"  => "Trigger: 'UserDealtCriticalHit'\n({2}, {1})",
    "UserMoveEffective"     => "Trigger: 'UserMoveEffective'\n({2}, {1})",
    "UserMoveResisted"      => "Trigger: 'UserMoveResisted'\n({2}, {1})",
    "UserMoveNegated"       => "Trigger: 'UserMoveNegated'\n({2}, {1})",
    "UserMoveDodged"        => "Trigger: 'UserMoveDodged'\n({2}, {1})",
    "UserHPHalf"            => "Trigger: 'UserHPHalf'\n({2}, {1})",
    "UserHPLow"             => "Trigger: 'UserHPLow'\n({2}, {1})",
    "LastUserHPHalf"        => "Trigger: 'LastUserHPHalf'\n({2}, {1})",
    "LastUserHPLow"         => "Trigger: 'LastUserHPLow'\n({2}, {1})",
    "TargetTookDamage"      => "Trigger: 'TargetTookDamage'\n({2}, {1})",
    "TargetSubDamaged"      => "Trigger: 'TargetSubDamaged'\n({2}, {1})",
    "TargetSubBroken"       => "Trigger: 'TargetSubBroken'\n({2}, {1})",
    "TargetTookCriticalHit" => "Trigger: 'TargetTookCriticalHit'\n({2}, {1})",
    "TargetWeakToMove"      => "Trigger: 'TargetWeakToMove'\n({2}, {1})",
    "TargetResistedMove"    => "Trigger: 'TargetResistedMove'\n({2}, {1})",
    "TargetNegatedMove"     => "Trigger: 'TargetNegatedMove'\n({2}, {1})",
    "TargetDodgedMove"      => "Trigger: 'TargetDodgedMove'\n({2}, {1})",
    "TargetHPHalf"          => "Trigger: 'TargetHPHalf'\n({2}, {1})",
    "TargetHPLow"           => "Trigger: 'TargetHPLow'\n({2}, {1})",
    "LastTargetHPHalf"      => "Trigger: 'LastTargetHPHalf'\n({2}, {1})",
    "LastTargetHPLow"       => "Trigger: 'LastTargetHPLow'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # Battler condition
    "BattlerHPRecovered"    => "Trigger: 'BattlerHPRecovered'\n({2}, {1})",
    "BattlerHPFull"         => "Trigger: 'BattlerHPFull'\n({2}, {1})",
    "BattlerHPReduced"      => "Trigger: 'BattlerHPReduced'\n({2}, {1})",
    "BattlerHPCritical"     => "Trigger: 'BattlerHPCritical'\n({2}, {1})",
    "BattlerFainted"        => "Trigger: 'BattlerFainted'\n({2}, {1})",
    "LastBattlerFainted"    => "Trigger: 'LastBattlerFainted'\n({2}, {1})",
    "BattlerReachedHPCap"   => "Trigger: 'BattlerReachedHPCap'\n({2}, {1})",
    "BattlerStatusChange"   => "Trigger: 'BattlerStatusChange'\n({2}, {1})",
    "BattlerStatusCured"    => "Trigger: 'BattlerStatusCured'\n({2}, {1})",
    "BattlerConfusionStart" => "Trigger: 'BattlerConfusionStart'\n({2}, {1})",
    "BattlerConfusionEnd"   => "Trigger: 'BattlerConfusionEnd'\n({2}, {1})",
    "BattlerAttractStart"   => "Trigger: 'BattlerAttractStart'\n({2}, {1})",
    "BattlerAttractEnd"     => "Trigger: 'BattlerAttractEnd'\n({2}, {1})",
    "BattlerStatRaised"     => "Trigger: 'BattlerStatRaised'\n({2}, {1})",
    "BattlerStatLowered"    => "Trigger: 'BattlerStatLowered'\n({2}, {1})",
    "BattlerMoveZeroPP"     => "Trigger: 'BattlerMoveZeroPP'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # End of effects
    "WeatherEnded"          => "Trigger: 'WeatherEnded'\n({2}, {1})",
    "TerrainEnded"          => "Trigger: 'TerrainEnded'\n({2}, {1})",
    "FieldEffectEnded"      => "Trigger: 'FieldEffectEnded'\n({2}, {1})",
    "TeamEffectEnded"       => "Trigger: 'TeamEffectEnded'\n({2}, {1})",
    "BattlerEffectEnded"    => "Trigger: 'BattlerEffectEnded'\n({2}, {1})",
    #---------------------------------------------------------------------------
    # End of battle
    "BattleEnd"             => "Trigger: 'BattleEnd'\n({2}, {1})",
    "BattleEndWin"          => "Trigger: 'BattleEndWin'\n({2}, {1})",
    "BattleEndLoss"         => "Trigger: 'BattleEndLoss'\n({2}, {1})",
    "BattleEndDraw"         => "Trigger: 'BattleEndDraw'\n({2}, {1})",
    "BattleEndForfeit"      => "Trigger: 'BattleEndForfeit'\n({2}, {1})",
    "BattleEndRun"          => "Trigger: 'BattleEndRun'\n({2}, {1})",
    "BattleEndFled"         => "Trigger: 'BattleEndFled'\n({2}, {1})",
    "BattleEndCapture"      => "Trigger: 'BattleEndCapture'\n({2}, {1})"
  } 
  
################################################################################
# Essentials-Demo: Sprüche bei Mega-Entwicklung
################################################################################
  #-----------------------------------------------------------------------------
  # Demo trainer speech when triggering Mega Evolution.
  #-----------------------------------------------------------------------------
  DEMO_MEGA_EVOLUTION = {
    "BeforeMegaEvolution_foe"           => "C'mon, {1}!\nLet's blow them away with Mega Evolution!",
    "AfterMegaEvolution_GYARADOS_foe"   => "Behold the serpent of the darkest depths!",
    "AfterMegaEvolution_GENGAR_foe"     => "Good luck escaping THIS nightmare!",
    "AfterMegaEvolution_KANGASKHAN_foe" => "Parent and child fight as one!",
    "AfterMegaEvolution_AERODACTYL_foe" => "Prepare yourself for my prehistoric beast!",
    "AfterMegaEvolution_FIRE_foe"       => "Maximum firepower!",
    "AfterMegaEvolution_ELECTRIC_foe"   => "Prepare yourself for a mighty force of nature!",
    "AfterMegaEvolution_BUG_foe"        => "My mighty insect has emerged from its cacoon!"
  }
  
################################################################################
# Essentials-Demo: Sprüche bei Proto-Wandel
################################################################################
  #-----------------------------------------------------------------------------
  # Demo trainer speech when triggering Primal Reversion.
  #-----------------------------------------------------------------------------
  DEMO_PRIMAL_REVERSION = {
    "BeforePrimalReversion_foe"        => "Prepare yourself for an ancient force beyond imagination!",
    "AfterPrimalReversion_KYOGRE_foe"  => "{1}!\nLet the seas burst forth from your mighty presence!",
    "AfterPrimalReversion_GROUDON_foe" => "{1}!\nLet the ground crack beneath your mighty presence!",
    "AfterPrimalReversion_WATER_foe"   => "Flood the world with your majesty!",
    "AfterPrimalReversion_GROUND_foe"  => "Shatter the world with your majesty!"
  }
  
  
################################################################################
# Example demo of a generic capture tutorial battle.
################################################################################

  #-----------------------------------------------------------------------------
  # Suggested Battle Rules:
  #-----------------------------------------------------------------------------
  #   "autoBattle"
  #   "alwaysCapture"
  #   "tutorialCapture"
  #   "tempPlayer"
  #   "tempParty"
  #   "noExp"
  #-----------------------------------------------------------------------------
  
  DEMO_CAPTURE_TUTORIAL = {
    #---------------------------------------------------------------------------
    # General speech events.
    #---------------------------------------------------------------------------
    "RoundStartCommand_player"  => "Hey! A wild Pokémon!\nPay attention, now. I'll show you how to capture one of your own!",
    "BeforeDamagingMove_player" => ["Weakening a Pokémon through battle makes them much easier to catch!",
                                    "Be careful though - you don't want to knock them out completely!\nYou'll lose your chance if you do!",
                                    "Let's try dealing some damage.\nGet 'em, {1}!"],
    "BattlerStatusChange_foe"   => [:Opposing, "It's always a good idea to inflict status conditions like Sleep or Paralysis!",
                                    "This will really help improve your odds at capturing the Pokémon!"],
    #---------------------------------------------------------------------------
    # Turn 1 - Uses a status move on the opponent, if possible.
    #---------------------------------------------------------------------------
    "TurnStart_player" => {
      "useMove"      => "Status_foe",
      "setBattler"   => :Opposing,
      "battlerHPCap" => -1
    },
    #---------------------------------------------------------------------------
    # Continuous - Checks if the wild Pokemon's HP is low. If so, initiates the
    #              capture sequence.
    #---------------------------------------------------------------------------
    "RoundEnd_player_repeat" => {
      "ignoreUntil" => ["TargetTookDamage_foe", "RoundEnd_player_2"],
      "speech_A"    => "The Pokémon is weak!\nNow's the time to throw a Poké Ball!",
      "useItem"     => :POKEBALL,
      "speech_B"    => "Alright, that's how it's done!"
    }
  }
  
  
################################################################################
# Demo scenario vs. wild Rotom that shifts forms.
################################################################################
  
  DEMO_WILD_ROTOM = {
    #---------------------------------------------------------------------------
    # Turn 1 - Disables Poke Balls from being used.
    #---------------------------------------------------------------------------
    "RoundStartCommand_1_foe" => {
      "text_A"       => "{1} emited a powerful magnetic pulse!",
      "playAnim"     => [:CHARGE, :Self, :Self],
      "playSE"       => "Anim/Paralyze3",
      "text_B"       => "Your Poké Balls short-circuited!\nThey cannot be used this battle!",
      "disableBalls" => true
    },
    #---------------------------------------------------------------------------
    # Continuous - Shifts into random form, heals HP/status, and gains new item/ability.
    #---------------------------------------------------------------------------
    "RoundEnd_foe_repeat" => {
      "ignoreUntil"    => "TargetWeakToMove_foe",
      "playAnim"       => [:NIGHTMARE, :Opposing, :Self],
      "battlerForm"    => [:Random, "{1} possessed a new appliance!"],
      "battlerHP"      => 4,
      "battlerStatus"  => :NONE,
      "battlerAbility" => [:MOTORDRIVE, true],
      "battlerItem"    => [:CELLBATTERY, "{1} equipped a Cell Battery it found in the appliance!"]
    },
    #---------------------------------------------------------------------------
    # When Rotom's HP drops to 50% or lower, applies Charge, Magnet Rise, and Electric Terrain.
    #---------------------------------------------------------------------------
    "TargetHPHalf_foe" => {
	  "playAnim"       => [:CHARGE, :Self, :Self],
      "battlerEffects" => [
        [:Charge,     5, "{1} began charging power!"],
        [:MagnetRise, 5, "{1} levitated with electromagnetism!"],
      ],
      "changeTerrain"  => :Electric
    },
    #---------------------------------------------------------------------------
    # Player's Pokemon becomes paralyzed after dealing supereffective damage. 
    #---------------------------------------------------------------------------
    "UserMoveEffective_player_repeat" => {
      "text"          => [:Opposing, "{1} emited an electrical pulse out of desperation!"],
      "battlerStatus" => [:PARALYSIS, true]
    }
  }

################################################################################
# Demo scenario vs. Rocket Grunt in a collapsing cave.
################################################################################  
  
  #-----------------------------------------------------------------------------
  # Suggested Battle Rules:
  #-----------------------------------------------------------------------------
  #   "noMoney"
  #   "canLose"
  #-----------------------------------------------------------------------------
  
  DEMO_COLLAPSING_CAVE = {
    #---------------------------------------------------------------------------
    # Turn 1 - Battle intro.
    #---------------------------------------------------------------------------
    "RoundStartCommand_1_foe" => {
      "playSE"  => "Mining collapse",
      "text_A"  => "The cave ceiling begins to crumble down all around you!",
      "speech"  => ["I am not letting you escape!", "I don't care if this whole cave collapses down on the both of us...haha!"],
      "text_B"  => "Defeat your opponent before time runs out!"
    },
    #---------------------------------------------------------------------------
    # Continuous - Text event at the end of each turn.
    #---------------------------------------------------------------------------
    "RoundEnd_player_repeat" => {
      "playSE" => "Mining collapse",
      "text"   => "The cave continues to collapse all around you!"
    },
    #---------------------------------------------------------------------------
    # Turn 2 - Player's Pokemon takes damage and becomes confused.
    #---------------------------------------------------------------------------
    "RoundEnd_2_player" => {
      "text"          => "{1} was struck on the head by a falling rock!",
      "playAnim"      => [:ROCKSMASH, :Opposing, :Self],
      "battlerHP"     => -4,
      "battlerStatus" => :CONFUSED
    },
    #---------------------------------------------------------------------------
    # Turn 3 - Text event.
    #---------------------------------------------------------------------------
    "RoundEnd_3_player" => {
      "text" => ["You're running out of time!", "You need to escape immediately!"]
    },
    #---------------------------------------------------------------------------
    # Turn 4 - Battle prematurely ends in a loss.
    #---------------------------------------------------------------------------
    "RoundEnd_4_player" => {
      "text_A"    => "You failed to defeat your opponent in time!",
      "playAnim"  => ["Recall", :Self],
      "text_B"    => "You were forced to flee the battle!",
      "playSE"    => "Battle flee",
      "endBattle" => 3
    },
    #---------------------------------------------------------------------------
    # Opponent's final Pokemon is healed and increases its defenses when HP is low.
    #---------------------------------------------------------------------------
    "LastTargetHPLow_foe" => {
      "speech"       => "My {1} will never give up!",
      "endSpeech"    => true,
      "playAnim"     => [:BULKUP, :Self],
      "playCry"      => :Self,
      "battlerHP"    => [2, "{1} is standing its ground!"],
      "battlerStats" => [:DEFENSE, 2, :SPECIAL_DEFENSE, 2]
    },
    #---------------------------------------------------------------------------
    # Speech event upon losing the battle.
    #---------------------------------------------------------------------------
    "BattleEndForfeit" => "Haha...you'll never make it out alive!"
  }
  
  
################################################################################
# Demo scenario vs. Battle Quizmaster.
################################################################################ 
  
  #-----------------------------------------------------------------------------
  # Suggested Battle Rules:
  #-----------------------------------------------------------------------------
  #   "canLose"
  #   "noExp"
  #   "noMoney"
  #-----------------------------------------------------------------------------
  
  DEMO_BATTLE_QUIZMASTER = {
    #---------------------------------------------------------------------------
    # Intro speech event.
    #---------------------------------------------------------------------------
    "RoundStartCommand_1_foe" => {
      "speech_A" => ["Welcome to another episode of Pokémon Battle Quiz!", 
                     "The show where trainers must battle with both Pokémon and trivia at the same time!",
                     "You gain one point each time you answer a question correctly, and a bonus point if you knock out a Pokémon!",
                     "If you can reach six points within six turns, you win a prize!",
                     "Is our new challenger up to the task? Let's hear some noise for \\PN!"],
      "playSE"   => "Anim/Applause", 
      "speech_B" => "Now, \\PN!\nLet us begin!"
    },
    #---------------------------------------------------------------------------
    # Speech events.
    #---------------------------------------------------------------------------
    "Variable_1" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "You've earned yourself your first point!\nKeep your eye on the prize!",
    },
    "Variable_2" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "Two points - hey, not bad!\nCan our new challenger keep it going?",
    },
    "Variable_3" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "You've claimed your third point!\nYou're on fire! Keep it up, kid!",
    },
    "Variable_4" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "Four points on the board!\nDo you think you got what it takes to win?",
    },
    "Variable_5" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "Just one more point to go!\nCan our up-and-coming star clear a perfect game?",
    },
    "BattleEndLoss" => "Nice try, kid. On to the next challenger!",
    #---------------------------------------------------------------------------
    # Automatically ends the battle as a win if enough points have been earned.
    #---------------------------------------------------------------------------
    "VariableOver_5" => {
      "playSE_A"  => "Pkmn move learnt",
      "speech"    => ["Aaaand there we have it, folks! Point number six!",
                      "Do you know what that means? It looks like we've got a winner!",	  
                      "Let's hear it for our brand new Battle Quiz-wiz - \\PN!"],
      "playSE_B"  => "Anim/Applause", 
      "text"      => "You gracefully bow at the audience to a burst of applause!",
      "endBattle" => 1
    },
    #---------------------------------------------------------------------------
    # Continuous - Adds a bonus point whenever the opponent's Pokemon is KO'd.
    #---------------------------------------------------------------------------
    "BattlerFainted_foe_repeat" => {
      "addVariable" => 1
    },
    #---------------------------------------------------------------------------
    # Continuous - Opponent's final Pokemon always Endures damaging moves.
    #---------------------------------------------------------------------------
    "BeforeDamagingMove_player_repeat" => {
      "ignoreUntil"    => "AfterLastSwitchIn_foe",
      "setBattler"     => :Opposing,
      "battlerEffects" => [:Endure, true]
    },
    #---------------------------------------------------------------------------
    # Turn 1 - Multiple choice question (Region).
    #---------------------------------------------------------------------------
    "RoundEnd_1_foe" => {
      "playSE"     => "Voltorb Flip gain coins", 
      "setChoices" => [:region, 3, {
                        "Kalos" => "Ouch, that's a miss, my friend!",
                        "Johto" => "Close! Well, at least geographically speaking...",
                        "Kanto" => "Ah, good ol' Kanto!\nWhat a classic! Correct!",
                        "Galar" => "Unless you're Champion Leon, that's incorrect!\nI'm afraid you're NOT having a champion time!"
                      }],
      "speech"     => ["Time for our first question!",
                       "In which region do new trainers typically have the option to select Charmander as thier first Pokémon?", :Choices]
    },
    "ChoiceRight_region" => {
      "addVariable"  => 1,
      "playSE"       => "Anim/Applause",
      "text"         => "The crowd politely applauded for you!",
      "setBattler"   => :Opposing,
      "battlerStats" => [:ACCURACY, 1]
    },
    "ChoiceWrong_region" => {
      "setBattler"     => :Opposing,
      "battlerStats"   => [:ACCURACY, -2],
      "battlerEffects" => [:NoRetreat, true, "{1} became nervous!\nIt may no longer escape!"]
    },
    #---------------------------------------------------------------------------
    # Turn 2 - Multiple choice question (Poke Ball).
    #---------------------------------------------------------------------------
    "RoundEnd_2_foe" => {
      "playSE"     => "Voltorb Flip gain coins", 
      "setChoices" => [:pokeball, 4, {
                        "Fast Ball"  => "Perhaps you were a little too fast to answer, because I'm afraid that's incorrect!",
                        "Love Ball"  => "I'm sorry to break your heart, but that's incorrect!", 
                        "Quick Ball" => "Ah, you're a quick-witted one...\nBut unfortunately, not quite quick enough! You're incorrect!",
                        "Heavy Ball" => "Not even a Heavy Ball could contain that huge brain of yours! You're correct!"
                      }],
      "speech"     => ["It's time for our second question!",
                       "Which type of Poké Ball would be most effective if thrown on the first turn at a wild Metagross?", :Choices]
    },
    "ChoiceRight_pokeball" => {
      "addVariable" => 1,
      "playSE"      => "Anim/Applause",
      "text"        => "The crowd began to root for you to win!",
      "setBattler"  => :Opposing,
      "teamEffects" => [:LuckyChant, 5, "The Lucky Chant shields {1} from critical hits!"]
    },
    "ChoiceWrong_pokeball" => {
      "setBattler"   => :Opposing,
      "battlerMoves" => [:SPLASH, :METRONOME, nil, nil],
      "text"         => "{1} became embarassed and forgot its moves!"
    },
    #---------------------------------------------------------------------------
    # Turn 3 - Branching path question.
    #---------------------------------------------------------------------------
    "RoundEnd_3_foe" => {
      "setChoices" => [:topic, nil, "Battling", "Evolution", "Breeding"],
      "speech"     => ["Ah, we've made it to our wild card round!",
                       "This turn, you may choose one of three topics related to Pokémon.",
                       "Our Quiz-A-Tron 3000 will then generate a stumper of a question related to your chosen topic.",
                       "This will be a simple yes or no question, but it will be worth two points, so choose wisely!",
                       "So then, which topic will it be?", :Choices, 
                       "Interesting choice!", 
                       "Let's see what our Quiz-A-Tron comes up with!"],
      "endSpeech"  => true,
      "playSE"     => "PC Access", 
      "text"       => "The Quiz-A-Tron 3000 beeps and whirrs as it prints out a question."
    },
    #---------------------------------------------------------------------------
    # Branch 1 - Multiple choice question (Battle).
    #---------------------------------------------------------------------------
    "Choice_topic_1" => {
      "playSE"     => "Voltorb Flip gain coins",
      "setChoices" => [:battling, 2, {
                        "Yes" => "I'm sorry. I guess not everyone can have a Natural Gift for quizzes...",
                        "No"  => "Hey, looks like you've got a Natural Gift for this!"
                      }],
      "speech"     => ["Question time!",
                       "Would the move Nature Power become an Ice-type move if the user is holding a Yache Berry?", :Choices]
    },
    "ChoiceRight_battling" => {
      "addVariable"  => 2,
      "playSE"       => "Anim/Applause",
      "text"         => "The crowd roared with excitement!",
      "setBattler"   => :Opposing,
      "battlerHP"    => [1, "{1} was energized from the crowd's cheering!"],
      "battlerStats" => [:ATTACK, 1, :SPECIAL_ATTACK, 1]
    },
    "ChoiceWrong_battling" => {
      "setBattler"   => :Opposing,
      "text"         => "{1} became discouraged by the silence of the crowd...",
      "battlerStats" => [:ATTACK, -2, :SPECIAL_ATTACK, -2]
    },
    #---------------------------------------------------------------------------
    # Branch 2 - Multiple choice question (Evolution).
    #---------------------------------------------------------------------------
    "Choice_topic_2" => {
      "playSE"     => "Voltorb Flip gain coins",
      "setChoices" => [:evolution, 1, {
                        "Yes" => "It was critical that you got that question right! Good job!",
                        "No"  => "Oh no! You should have thought about that one more critically..."
                      }],
      "speech"     => ["Question time!",
                       "Would holding a Leek item be directly useful in some way with helping a Galarian Farfetch'd evolve?", :Choices]
    },
    "ChoiceRight_evolution" => {
      "addVariable"  => 2,
      "playSE"       => "Anim/Applause",
      "text"         => "The crowd roared with excitement!",
      "setBattler"   => :Opposing,
      "battlerHP"    => [1, "{1} was energized from the crowd's cheering!"],
      "battlerStats" => [:SPEED, 1, :EVASION, 1]
    },
    "ChoiceWrong_evolution" => {
      "setBattler"   => :Opposing,
      "text"         => "{1} became discouraged by the silence of the crowd...",
      "battlerStats" => [:SPEED, -2, :EVASION, -2]
    },
    #---------------------------------------------------------------------------
    # Branch 3 - Multiple choice question (Breeding).
    #---------------------------------------------------------------------------
    "Choice_topic_3" => {
      "playSE"     => "Voltorb Flip gain coins",
      "setChoices" => [:breeding, 1, {
                        "Yes" => "Whoa! You Volbeat that question without breaking a sweat!",
                        "No"  => "Ouch! Looks you got Volbeat by that question..."
	                    }],
      "speech"     => ["Question time!",
                       "Is Illumise able to produce eggs of a different species from itself?", :Choices]
    },
    "ChoiceRight_breeding" => {
      "addVariable"  => 2,
      "playSE"       => "Anim/Applause",
      "text"         => "The crowd roared with excitement!",
      "setBattler"   => :Opposing,
      "battlerHP"    => [1, "{1} was energized from the crowd's cheering!"],
      "battlerStats" => [:DEFENSE, 1, :SPECIAL_DEFENSE, 1]
    },
    "ChoiceWrong_breeding" => {
      "setBattler"   => :Opposing,
      "text"         => "{1} became discouraged by the silence of the crowd...",
      "battlerStats" => [:DEFENSE, -2, :SPECIAL_DEFENSE, -2]
    },
    #---------------------------------------------------------------------------
    # Turn 4 - Final question. 
    #---------------------------------------------------------------------------
    "RoundEnd_4_foe" => {
      "speech_A"   => ["I'm afraid we've reached our final round of questions!",
                       "Can our challenger pull out a win here?\nLet's find out!"],
      "playSE"     => "Voltorb Flip gain coins",
      "setChoices" => [:final, 1, {
                        "Hold the Ctrl key"      => "Yes, it's Ctrl! You got it!\nHey, you must be a pro at this!",
                        "Hold the Shift key"     => "Close! Holding Shift will only recompile plugins!\nThe correct key is Ctrl!",
                        "Hold your face and cry" => "Huh? C'mon now, it's not that hard... Just hold the Ctrl key.",
                        "Ask someone else how"   => "Well now you won't have to, because the answer is 'Hold the Ctrl key'."
                      }],
      "speech_B"   => ["Here it is, the final question:",
                       "When loading Pokémon Essentials in Debug mode and the game window is in focus, how do you manually trigger the game to recompile?", :Choices]
    },
    "ChoiceRight_final" => {
      "addVariable" => 1,
      "playSE"      => "Anim/Applause",
      "text"        => "The crowd gave you a standing ovation!"
    },
    "ChoiceWrong_final" => {
      "text"       => "You can hear disappointed murmurings from the crowd...",
      "setBattler" => :Opposing,
      "battlerHP"  => [0, "{1} fainted from embarassment..."]
    },
    #---------------------------------------------------------------------------
    # Turn 6 - Ends the battle as a loss if not enough points have been earned.
    #---------------------------------------------------------------------------
    "RoundEnd_6_foe" => {
      "playSE_A"   => "Slots stop",
      "speech_A"   => ["Oh no! That sound means we've reached the end of our game...",
                       "Our challenger \\PN showed much promise, but came up a tad short in the end.",
                       "But we still had fun, didn't we, folks?"], 
      "playSE_B"   => "Anim/Applause",
      "speech_B"   => "That's right! Well, that's all for today!\nTake a bow, \\PN! You and your Pokémon fought hard!",
      "text"       => "You awkwardly bow at the audience as staff begin to direct you off stage...",
      "endBattle"  => 2
    }
  }

################################################################################
# Essentials-Demo: Quizmaster (Variante 2)
################################################################################
  DEMO_BATTLE_QUIZMASTER2 = {
    #---------------------------------------------------------------------------
    # Intro speech event.
    #---------------------------------------------------------------------------
    "RoundStartCommand_1_foe" => {
      "speech_A" => ["Willkommen zu einer weiteren Ausgabe von Pokémon Battle Quiz!", 
                     "Die Show, in der Trainer gleichzeitig mit Pokémon und Trivia kämpfen müssen!",
                     "Du erhältst einen Punkt für jede richtig beantwortete Frage und einen Bonuspunkt, wenn du ein Pokémon besiegst!",
                     "Wenn du innerhalb von sechs Runden sechs Punkte erreichst, gewinnst du einen Preis!",
                     "Ist unser neuer Herausforderer dieser Aufgabe gewachsen? Gebt alles für \\PN!"],
      "playSE"   => "Anim/Applause", 
      "speech_B" => "Nun denn, \\PN!\nLasst uns beginnen!"
    },

    "Variable_1" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "Du hast dir deinen ersten Punkt verdient!\nBehalte den Preis im Auge!",
    },
    "Variable_2" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "Zwei Punkte - hey, nicht schlecht!\nKann unser Herausforderer das Tempo halten?",
    },
    "Variable_3" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "Du hast dir den dritten Punkt gesichert!\nDu bist nicht aufzuhalten! Weiter so!",
    },
    "Variable_4" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "Vier Punkte auf dem Konto!\nHast du das Zeug zum Sieg?",
    },
    "Variable_5" => {
      "playSE" => "Pkmn move learnt", 
      "speech" => "Nur noch ein Punkt!\nSchafft unser aufstrebender Star das perfekte Spiel?",
    },

    "BattleEndLoss" => "Guter Versuch, Kleiner. Der nächste Herausforderer ist dran!",

    "VariableOver_5" => {
      "playSE_A"  => "Pkmn move learnt",
      "speech"    => ["Uuuund da ist er, Leute! Punkt Nummer sechs!",
                      "Wisst ihr, was das bedeutet? Wir haben einen Gewinner!",	  
                      "Applaus für unseren brandneuen Battle-Quizmeister - \\PN!"],
      "playSE_B"  => "Anim/Applause", 
      "text"      => "Du verbeugst dich elegant vor dem Publikum, während tosender Applaus aufbrandet!",
      "endBattle" => 1
    },

    "BattlerFainted_foe_repeat" => {
      "addVariable" => 1
    },

    "BeforeDamagingMove_player_repeat" => {
      "ignoreUntil"    => "AfterLastSwitchIn_foe",
      "setBattler"     => :Opposing,
      "battlerEffects" => [:Endure, true]
    },

    "RoundEnd_1_foe" => {
      "playSE"     => "Voltorb Flip gain coins", 
      "setChoices" => [:region, 3, {
                        "Kalos" => "Autsch, das war leider daneben!",
                        "Johto" => "Knapp! Zumindest geografisch gesehen...",
                        "Kanto" => "Ah, das gute alte Kanto!\nEin Klassiker! Richtig!",
                        "Galar" => "Sofern du nicht Champ Leon bist, ist das leider falsch!\nHeute hast du keine Champion-Zeit!"
                      }],
      "speech"     => ["Zeit für unsere erste Frage!",
                       "In welcher Region können neue Trainer typischerweise Glumanda als erstes Pokémon wählen?", :Choices]
    },

    "ChoiceRight_region" => {
      "addVariable"  => 1,
      "playSE"       => "Anim/Applause",
      "text"         => "Das Publikum applaudiert höflich für dich!",
      "setBattler"   => :Opposing,
      "battlerStats" => [:ACCURACY, 1]
    },

    "ChoiceWrong_region" => {
      "setBattler"     => :Opposing,
      "battlerStats"   => [:ACCURACY, -2],
      "battlerEffects" => [:NoRetreat, true, "{1} wurde nervös!\nEs kann nicht mehr fliehen!"]
    },

    "RoundEnd_2_foe" => {
      "playSE"     => "Voltorb Flip gain coins", 
      "setChoices" => [:pokeball, 4, {
                        "Fast Ball"  => "Vielleicht warst du etwas zu schnell mit deiner Antwort - leider falsch!",
                        "Love Ball"  => "Tut mir leid, dir das Herz zu brechen, aber das ist falsch!", 
                        "Quick Ball" => "Du bist schnell im Kopf...\nAber leider nicht schnell genug! Falsch!",
                        "Heavy Ball" => "Nicht einmal ein Schwerball könnte dein riesiges Gehirn fassen! Richtig!"
                      }],
      "speech"     => ["Hier kommt unsere zweite Frage!",
                       "Welcher Pokéball wäre am effektivsten, wenn er in der ersten Runde auf ein wildes Metagross geworfen wird?", :Choices]
    },

    "ChoiceRight_pokeball" => {
      "addVariable" => 1,
      "playSE"      => "Anim/Applause",
      "text"        => "Das Publikum feuert dich begeistert an!",
      "setBattler"  => :Opposing,
      "teamEffects" => [:LuckyChant, 5, "Glückssegen schützt {1} vor Volltreffern!"]
    },

    "ChoiceWrong_pokeball" => {
      "setBattler"   => :Opposing,
      "battlerMoves" => [:SPLASH, :METRONOME, nil, nil],
      "text"         => "{1} wurde verlegen und vergaß seine Attacken!"
    },

    "RoundEnd_3_foe" => {
      "setChoices" => [:topic, nil, "Kampf", "Entwicklung", "Zucht"],
      "speech"     => ["Ah, wir sind in unserer Joker-Runde angekommen!",
                       "In dieser Runde darfst du eines von drei Pokémon-Themen wählen.",
                       "Unser Quiz-A-Tron 3000 generiert anschließend eine knifflige Frage zu deinem gewählten Thema.",
                       "Es wird eine einfache Ja-oder-Nein-Frage sein, aber sie ist zwei Punkte wert - wähle also mit Bedacht!",
                       "Also, welches Thema darf es sein?", :Choices, 
                       "Interessante Wahl!", 
                       "Mal sehen, was unser Quiz-A-Tron ausspuckt!"],
      "endSpeech"  => true,
      "playSE"     => "PC Access", 
      "text"       => "Der Quiz-A-Tron 3000 piept und surrt, während er eine Frage ausdruckt."
    },

    "Choice_topic_1" => {
      "playSE"     => "Voltorb Flip gain coins",
      "setChoices" => [:battling, 1, {
                        "Ja"  => "Sieht so aus, als hättest du ein natürliches Talent für Quizfragen!",
                        "Nein" => "Leider nicht ganz richtig..."
                      }],
      "speech"     => ["Fragezeit!",
                       "Würde die Attacke Naturkraft zu einer Eis-Attacke werden, wenn der Anwender eine Yachebeere trägt?", :Choices]
    },

    "ChoiceRight_battling" => {
      "addVariable"  => 2,
      "playSE"       => "Anim/Applause",
      "text"         => "Das Publikum tobt vor Begeisterung!",
      "setBattler"   => :Opposing,
      "battlerHP"    => [1, "{1} wurde durch den Jubel des Publikums gestärkt!"],
      "battlerStats" => [:ATTACK, 1, :SPECIAL_ATTACK, 1]
    },

    "ChoiceWrong_battling" => {
      "setBattler"   => :Opposing,
      "text"         => "{1} wurde durch die Stille des Publikums entmutigt...",
      "battlerStats" => [:ATTACK, -2, :SPECIAL_ATTACK, -2]
    },

    "Choice_topic_2" => {
      "playSE"     => "Voltorb Flip gain coins",
      "setChoices" => [:evolution, 1, {
                        "Ja" => "Volltreffer! Gut gemacht!",
                        "Nein" => "Oh nein! Das war leider nicht korrekt..."
                      }],
      "speech"     => ["Fragezeit!",
                       "Ist das Item Lauch direkt hilfreich dabei, ein Galar-Flampion entwickeln zu lassen?", :Choices]
    },

    "ChoiceRight_evolution" => {
      "addVariable"  => 2,
      "playSE"       => "Anim/Applause",
      "text"         => "Das Publikum tobt vor Begeisterung!",
      "setBattler"   => :Opposing,
      "battlerHP"    => [1, "{1} wurde durch den Jubel des Publikums gestärkt!"],
      "battlerStats" => [:SPEED, 1, :EVASION, 1]
    },

    "ChoiceWrong_evolution" => {
      "setBattler"   => :Opposing,
      "text"         => "{1} wurde durch die Stille des Publikums entmutigt...",
      "battlerStats" => [:SPEED, -2, :EVASION, -2]
    },

    "Choice_topic_3" => {
      "playSE"     => "Voltorb Flip gain coins",
      "setChoices" => [:breeding, 1, {
                        "Ja" => "Wow! Diese Frage hast du mühelos gemeistert!",
                        "Nein" => "Autsch! Diese Frage hat dich kalt erwischt..."
	                    }],
      "speech"     => ["Fragezeit!",
                       "Kann Illumise Eier einer anderen Art als seiner eigenen hervorbringen?", :Choices]
    },

    "ChoiceRight_breeding" => {
      "addVariable"  => 2,
      "playSE"       => "Anim/Applause",
      "text"         => "Das Publikum tobt vor Begeisterung!",
      "setBattler"   => :Opposing,
      "battlerHP"    => [1, "{1} wurde durch den Jubel des Publikums gestärkt!"],
      "battlerStats" => [:DEFENSE, 1, :SPECIAL_DEFENSE, 1]
    },

    "ChoiceWrong_breeding" => {
      "setBattler"   => :Opposing,
      "text"         => "{1} wurde durch die Stille des Publikums entmutigt...",
      "battlerStats" => [:DEFENSE, -2, :SPECIAL_DEFENSE, -2]
    },

    "RoundEnd_4_foe" => {
      "speech_A"   => ["Wir sind bei unserer finalen Fragerunde angekommen!",
                       "Kann unser Herausforderer hier noch den Sieg holen?\nFinden wir es heraus!"],
      "playSE"     => "Voltorb Flip gain coins",
      "setChoices" => [:final, 1, {
                        "Strg gedrückt halten"      => "Richtig, es ist Strg! Sehr gut!\nDu kennst dich wirklich aus!",
                        "Shift gedrückt halten"     => "Knapp! Mit Shift werden nur Plugins neu kompiliert!\nDie richtige Taste ist Strg!",
                        "Verzweifelt weinen"        => "Nun komm schon, so schwer ist es nicht... Halte einfach Strg gedrückt.",
                        "Jemand anderen fragen"     => "Das brauchst du jetzt nicht mehr, denn die Antwort ist: Strg gedrückt halten."
                      }],
      "speech_B"   => ["Hier kommt die letzte Frage:",
                       "Wie löst man im Debug-Modus von Pokémon Essentials eine manuelle Neukompilierung aus, wenn das Spielfenster aktiv ist?", :Choices]
    },

    "ChoiceRight_final" => {
      "addVariable" => 1,
      "playSE"      => "Anim/Applause",
      "text"        => "Das Publikum erhebt sich zu stehenden Ovationen!"
    },

    "ChoiceWrong_final" => {
      "text"       => "Enttäuschtes Gemurmel ist aus dem Publikum zu hören...",
      "setBattler" => :Opposing,
      "battlerHP"  => [-100, "{1} fiel vor Scham in Ohnmacht..."]
    },

    "RoundEnd_6_foe" => {
      "playSE_A"   => "Slots stop",
      "speech_A"   => ["Oh nein! Dieses Geräusch bedeutet das Ende unseres Spiels...",
                       "Unser Herausforderer \\PN hat vielversprechend begonnen, aber am Ende knapp verfehlt.",
                       "Aber wir hatten trotzdem Spaß, oder, Leute?"], 
      "playSE_B"   => "Anim/Applause",
      "speech_B"   => "Genau! Das war's für heute!\nVerbeuge dich, \\PN! Du und deine Pokémon habt tapfer gekämpft!",
      "text"       => "Du verbeugst dich etwas unbeholfen, während das Personal dich von der Bühne begleitet...",
      "endBattle"  => 2
    }
  }
  
################################################################################
# Arenaleiter Isaac (Orden 2)
################################################################################
  ARENALEITER_ISAAC = {

    #---------------------------------------------------------------------------
    # Sobald erste Pokémon unter 50KP
    #---------------------------------------------------------------------------

    "TargetHPHalf_foe" => {
      "speech"  => ["Hm... beeindruckend.",
					"Du liest die Strömung schneller als gedacht.",
					"Doch ein Sturm beginnt stets mit einem leisen Windstoß."]
    },
    #---------------------------------------------------------------------------
    # Vorletztes Pokémon wurde besiegt
    #---------------------------------------------------------------------------
	
    "BeforeLastSwitchIn" => {
      "speech"  => ["Jetzt steigt die Flut!",
					"Spürst du, wie der Druck zunimmt?",
					"Das Meer kennt kein zögern."]
    },    
	#---------------------------------------------------------------------------
    # Letztes Pokémon wurde eingesetzt
    #---------------------------------------------------------------------------
    "AfterLastSwitchIn" => {
      "speech"  => ["So sei es.",
					"Mein treuer Gefährte...",
					"erhebe dich aus den Tiefen und durchbrich die Wolken.",
					"Zeige die wahre Macht des Sturms."]
    }
  }

################################################################################
# Arenaleiterin Sakura (Orden 3)
################################################################################
  ARENALEITER_SAKURA = {

    #---------------------------------------------------------------------------
    # Sobald erste Pokémon unter 50KP
    #---------------------------------------------------------------------------

    "TargetHPHalf_foe" => {
      "speech"  => ["Sehr schön...",
					"Du verstehst bereits, dass Stärke nicht nur aus Kraft entsteht.",
					"Die Natur verändert sich ständig,",
					"Und wir mit ihr."]
    },
    #---------------------------------------------------------------------------
    # Vorletztes Pokémon wurde besiegt
    #---------------------------------------------------------------------------
	
    "BeforeLastSwitchIn_foe" => {
      "speech"  => ["Jeder Kampf hinterlässt Spuren!",
					"Doch aus jeder Wunde wächst neues Leben.",
					"Nun beginnt die Blüte meines stärksten Partners."]
    },    
	#---------------------------------------------------------------------------
    # Letztes Pokémon wurde eingesetzt
    #---------------------------------------------------------------------------
    "AfterLastSwitchIn_foe" => {
      "speech"  => ["Also gut...",
					"Nun stehen nur noch wir beide auf dem Feld.",
					"Zeigen wir, wie dieser Kampf enden soll."]
    },
	#---------------------------------------------------------------------------
    # Letztes Pokémon Wert gesenkt
    #---------------------------------------------------------------------------
	"BattlerStatLowered_foe" => {
	  "speech"  => ["Auch das wird uns nicht aufhalten!"]
	}
  }

################################################################################
# Arenaleiter Marvin (Orden 4, Arena-Kampf)
################################################################################
  ARENALEITER_MARVIN = {

    #---------------------------------------------------------------------------
    # Sobald erste Pokémon drin
    #---------------------------------------------------------------------------
    "AfterSendOut_foe" => {
	  "changeTerrain" => :Electric,
      "speech" => [
        "Die Spannung steigt!"]
    },

    #---------------------------------------------------------------------------
    # Sobald Pokémon Regentanz einsetzt
    #---------------------------------------------------------------------------
    "BeforeMove_RAINDANCE_foe" => {
      "speech" => [
        "Lass uns ein Gewitter entfachen!"]
    },

    #---------------------------------------------------------------------------
    # Sobald Pokémon Lichtschild einsetzt
    #---------------------------------------------------------------------------
    "AfterMove_LIGHTSCREEN_foe" => {
      "speech" => [
        "Wir wissen, wie man sich in Stürmen jeder Art zu verhalten hat."]
    },

    #---------------------------------------------------------------------------
    # Sobald Zapplalek eingesetzt wurde
    #---------------------------------------------------------------------------
    "AfterSwitchIn_EELEKTRIK_foe" => {
      "speech" => [
        "Ich befürchte, ich muss zu härteren Mitteln greifen..."],
	  "playAnim" => [:TRANSFORM, :Opposing],
	  "battlerSpecies" => [:EELEKTROSS],
	  "text" => [
	    "Marvin hat einen Donnerstein eingesetzt, um Zapplalek zu Zapplarang zu entwickeln."]
    },

    #---------------------------------------------------------------------------
    # Vorletztes Pokémon wurde besiegt
    #---------------------------------------------------------------------------
    "BeforeLastSwitchIn_foe" => {
      "speech" => [
        "Du glaubst, du bist weit gekommen.",
		"Aber an meinem letzten Pokémon kommst du nicht vorbei."]
    }
  }

################################################################################
# Arenaleiter Flint (Orden 5)
################################################################################
  ARENALEITER_FLINT = {

    #---------------------------------------------------------------------------
    # Sobald erste Pokémon drin
    #---------------------------------------------------------------------------
    "AfterSendOut_foe" => {
      "speech" => [
        "Torkoal, heiz die Arena auf!",
        "Ich hoffe, du kannst mit der Hitze umgehen!"]
    },

    #---------------------------------------------------------------------------
    # Vorletztes Pokémon wurde besiegt
    #---------------------------------------------------------------------------
    "BeforeLastSwitchIn_foe" => {
      "speech" => [
        "Heh... du hast es bis hierhin geschafft?",
        "Gut. Dann zeig ich dir jetzt mein wahres Ass im Ärmel!"]
    },

    #---------------------------------------------------------------------------
    # Letztes Pokémon – Mega Aerodactyl Reveal
    #---------------------------------------------------------------------------
    "BeforeMegaEvolution_AERODACTYL_foe" => {
      "speech" => [
        "Das hier ist mein stärkster Partner!",
        "Urzeitliche Macht... entfessle dich!"]
    },

    "AfterMegaEvolution_AERODACTYL_foe" => {
      "speech" => [
        "Mega-Aerodactyl!",
        "Jetzt gibt es kein Zurück mehr!",
        "Zeig ihnen die Wut der Urzeit!"]
    }
  }

################################################################################
# Arenaleiter Bodhi & Raya (Orden 6)
################################################################################
  ARENALEITER_BODHIRAYA = {

    #---------------------------------------------------------------------------
    # Sobald die ersten Pokémon drin sind
    #---------------------------------------------------------------------------
    "AfterSendOut_foe" => {
      "speech" => [
        "Willkommen in unserer Traumwelt.",
        "Hier ist nichts, wie es scheint: Stärke wird zur Schwäche, und Schwäche zum Schutz."]
    },

    #---------------------------------------------------------------------------
    # Psiana setzt Reflektor
    #---------------------------------------------------------------------------
    "AfterMove_REFLECT_foe" => {
      "speech" => [
        "Ein Spiegel zeigt dir immer das Gegenteil von dem, was du erwartest."]
    },

    #---------------------------------------------------------------------------
    # Calamanero setzt Kraftkoloss ein (Umkehrung)
    #---------------------------------------------------------------------------
    "AfterMove_SUPERPOWER_foe" => {
      "speech" => [
        "Siehst du? Was andere schwächt, macht Calamanero nur stärker."]
    },

    #---------------------------------------------------------------------------
    # Somnivora setzt Rechte Hand ein
    #---------------------------------------------------------------------------
    "AfterMove_HELPINGHAND_foe" => {
      "speech" => [
        "Zu zweit träumt es sich leichter."]
    },

    #---------------------------------------------------------------------------
    # Skelabra kommt ins Spiel
    #---------------------------------------------------------------------------
    "AfterSwitchIn_CHANDELURE_foe" => {
      "speech" => [
        "Siehst du dieses Licht?",
        "Folge ihm lieber nicht, es führt dich tiefer in den Traum."]
    },

    #---------------------------------------------------------------------------
    # Vorletztes Pokémon wurde besiegt
    #---------------------------------------------------------------------------
    "BeforeLastSwitchIn_foe" => {
      "speech" => [
        "Du hast in diesem Labyrinth nicht den Überblick verloren... beeindruckend.",
        "Doch der tiefste Traum beginnt erst jetzt."]
    },

    #---------------------------------------------------------------------------
    # Mega-Entwicklung Guardevoir
    #---------------------------------------------------------------------------
    "BeforeMegaEvolution_GARDEVOIR_foe" => {
      "speech" => [
        "Guardevoir, zeig unserem Gast, was geschieht, wenn ein Traum erwacht!"]
    },

    #---------------------------------------------------------------------------
    # Nach der Mega-Entwicklung
    #---------------------------------------------------------------------------
    "AfterMegaEvolution_GARDEVOIR_foe" => {
      "speech" => [
        "Mega-Guardevoir!",
        "Licht und Schatten, vereint in einem einzigen Wesen."]
    }
  }

################################################################################
# Arenaleiterin Eira (Orden 7)
################################################################################
  ARENALEITER_EIRA = {

    #---------------------------------------------------------------------------
    # Sobald erste Pokémon drin
    #---------------------------------------------------------------------------
    "AfterSendOut_foe" => {
      "speech" => [
        "Willkommen in meiner Arena!",
        "Hier drinnen herrscht ewiger Winter. Ich hoffe, du hast dich warm angezogen!"]
    },

    #---------------------------------------------------------------------------
    # Auroraschleier / Eiseskälte
    #---------------------------------------------------------------------------
    "AfterMove_AURORAVEIL_foe" => {
      "speech" => [
        "Das Polarlicht schützt mein Team.",
        "Durch diesen Schleier kommst du nicht so leicht!"]
    },

    "BeforeMove_SHEERCOLD_foe" => {
      "speech" => [
        "Halt still... das wird kurz und eisig!"]
    },

    #---------------------------------------------------------------------------
    # Vorletztes Pokémon wurde besiegt
    #---------------------------------------------------------------------------
    "BeforeLastSwitchIn_foe" => {
      "speech" => [
        "Du bringst mich ja richtig ins Schwitzen...",
        "Aber jetzt wird es wirklich kalt!"]
    },

    #---------------------------------------------------------------------------
    # Mega-Entwicklungen (je nach Variante eine davon)
    #---------------------------------------------------------------------------
    "BeforeMegaEvolution_DRAGONITE_foe" => {
      "speech" => [
        "Mein ältester Partner hat schon so manchen Schneesturm überstanden.",
        "Zeig ihnen, wie hoch wir fliegen können!"]
    },

    "AfterMegaEvolution_DRAGONITE_foe" => {
      "speech" => [
        "Mega-Dragoran!",
        "Der Himmel über dem Eis gehört uns!"]
    },

    "BeforeMegaEvolution_ABOMASNOW_foe" => {
      "speech" => [
        "Der Winter hat noch nicht einmal richtig angefangen!",
        "Lass den Schnee über das ganze Feld herfallen!"]
    },

    "AfterMegaEvolution_ABOMASNOW_foe" => {
      "speech" => [
        "Mega-Rexblisar!",
        "Gegen diesen Sturm kommst du nicht an!"]
    },

    "BeforeMegaEvolution_GARCHOMP_foe" => {
      "speech" => [
        "Schnell wie ein Schneesturm, scharf wie Eis!",
        "Jetzt wird es ernst!"]
    },

    "AfterMegaEvolution_GARCHOMP_foe" => {
      "speech" => [
        "Mega-Knakrack!",
        "Versuch ruhig, mit dieser Geschwindigkeit mitzuhalten!"]
    },

    "BeforeMegaEvolution_BAXCALIBUR_foe" => {
      "speech" => [
        "Das hier ist die Kälte, die selbst Drachen erstarren lässt!",
        "Entfessle deine ganze Kraft!"]
    },

    "AfterMegaEvolution_BAXCALIBUR_foe" => {
      "speech" => [
        "Mega-Espinodon!",
        "Spür die Kälte des ewigen Eises!"]
    }
  }

################################################################################
# Arenaleiterin Titania (Orden 8)
################################################################################
  ARENALEITER_TITANIA = {

    #---------------------------------------------------------------------------
    # Sobald erste Pokémon drin
    #---------------------------------------------------------------------------
    "AfterSendOut_foe" => {
      "speech" => [
        "Willkommen in meiner Schmiede!",
        "Hier wird aus Träumen Stahl, und aus Stahl ein kleines Wunder."]
    },

    #---------------------------------------------------------------------------
    # Clavion setzt Lichtschild
    #---------------------------------------------------------------------------
    "AfterMove_LIGHTSCREEN_foe" => {
      "speech" => [
        "Clavion hält die Tür für uns verschlossen.",
        "Mal sehen, ob du den richtigen Schlüssel findest!"]
    },

    #---------------------------------------------------------------------------
    # Tarnsteine gelegt
    #---------------------------------------------------------------------------
    "AfterMove_STEALTHROCK_foe" => {
      "speech" => [
        "Jeder dieser Splitter ist von Hand geschmiedet!"]
    },

    #---------------------------------------------------------------------------
    # Feelinara kommt ins Spiel
    #---------------------------------------------------------------------------
    "AfterSwitchIn_SYLVEON_foe" => {
      "speech" => [
        "Erkennst du diese Form?",
        "Auch dein Evoli könnte eines Tages so strahlen."]
    },

    #---------------------------------------------------------------------------
    # Vorletztes Pokémon wurde besiegt
    #---------------------------------------------------------------------------
    "BeforeLastSwitchIn_foe" => {
      "speech" => [
        "Du hast mein ganzes Werk auf die Probe gestellt...",
        "Dann zeige ich dir jetzt mein Meisterstück!"]
    },

    #---------------------------------------------------------------------------
    # Mega-Entwicklung Flunkifer
    #---------------------------------------------------------------------------
    "BeforeMegaEvolution_MAWILE_foe" => {
      "speech" => [
        "Hinter dem niedlichsten Lächeln verbirgt sich das schärfste Maul!",
        "Flunkifer, zeig ihnen deine wahre Form!"]
    },

    #---------------------------------------------------------------------------
    # Nach der Mega-Entwicklung
    #---------------------------------------------------------------------------
    "AfterMegaEvolution_MAWILE_foe" => {
      "speech" => [
        "Mega-Flunkifer!",
        "Fee und Stahl, untrennbar verschmolzen!"]
    }
  }

################################################################################
# Team 0 - Aeon
################################################################################
  TEAM0_AEON = {

    #---------------------------------------------------------------------------
    # Sobald erste gegnerische Pokémon besiegt
    #---------------------------------------------------------------------------

    "BattlerFainted_foe" => {
      "speech"  => ["Interessant.",
					"Du reagierst nicht, wie die anderen.",
					"Du passt dich an, fast als würdest du lernen."]
    },
    #---------------------------------------------------------------------------
    # Vorletztes Pokémon wurde besiegt
    #---------------------------------------------------------------------------
	
    "BeforeLastSwitchIn_foe" => {
      "speech"  => ["Ist das also deine Rolle?",
					"Wer weiß was passiert wäre, wenn du mir mehr Zeit gegeben hättest."]
    },   
	#---------------------------------------------------------------------------
    # Letztes Pokémon wurde eingesetzt
    #---------------------------------------------------------------------------
    "AfterLastSwitchIn_foe" => {
      "speech"  => ["So sei es.",
					"Lasst es uns beenden!"]
    }
  }
  
################################################################################
# Rivalin Elisa - Starterkampf
################################################################################
  ELISA_STARTER = {

    #---------------------------------------------------------------------------
    # Sobald erste Pokémon unter 50KP
    #---------------------------------------------------------------------------

    "TargetHPHalf_foe" => {
      "speech"  => ["Was?! Schon so viel Schaden?",
					"Aber ich gebe noch lange nicht auf."]
    },
	
	"BattlerStatLowered_foe" => {
      "speech"  => ["Ist das deine Strategie?",
					"Das habe ich sofort durchschaut."]
    }
  }
  
################################################################################
# Kampf gegen KOPPLOSIO
################################################################################
  
  BLACEPHALON = {
    #---------------------------------------------------------------------------
    # Runde 2
    #---------------------------------------------------------------------------
    "RoundEnd_2_foe" => {
      "battlerStats" => [:Random, -2],
	  "text_A"       => "Die Energie scheint etwas zu schwinden.",
	  "text_B"       => "Versuche Elisa noch mehr Zeit zu geben."
    },
    #---------------------------------------------------------------------------
    # Runde 4
    #---------------------------------------------------------------------------
    "RoundEnd_4_foe" => {
      "battlerStats" => [:Random, -2],
	  "text_A"       => "Das Kopplosio wird schwächer."
    },
    #---------------------------------------------------------------------------
    # Runde 6
    #---------------------------------------------------------------------------
    "RoundEnd_6_foe" => {
      "battlerStats" => [:Random, -2],
	  "text_A"       => "Nicht aufgeben!"
    },
    #---------------------------------------------------------------------------
    # Runde 8
    #---------------------------------------------------------------------------
    "RoundEnd_8_foe" => {
      "battlerStats" => [:Random, -2],
	  "text_A"       => "Halte durch!",
	  "text_B"       => "Elisa hat es bestimmt bald geschafft."
    },
    #---------------------------------------------------------------------------
    # Runde 10
    #---------------------------------------------------------------------------
    "RoundEnd_10_foe" => {
      "battlerStats" => [:Random, -2],
	  "text_A"       => "Das Kopplosio scheint fast keine Energie mehr zu haben."
    },
    #---------------------------------------------------------------------------
    # Runde 12
    #---------------------------------------------------------------------------
    "RoundEnd_12_foe" => {
	  "text_A"       => "Elisa hat es geschafft, alle Generatoren abzuschalten.",
	  "endBattle" 	 => 1
    }
  }

################################################################################
# Kampf gegen ZEKROM
################################################################################
  
  ZEKROM = {
	"RoundEnd_foe_repeat_even" => {
		"playCry"      => :Self,
		"battlerStats" => [:Random, 1, :Random, 1]
	},
	"BattlerHPCritical_foe" => {
		"endBattle"	   => 1
	}
  }


################################################################################
# Quest93 "Vom Glück geküsst" - Rocco (X-Volltreffer)
################################################################################
  # Counts the player's own critical hits across the whole battle into Game
  # Variable 150 ("Rocco Volltreffer"), so the calling event can check it right
  # after the battle ends regardless of win/loss. "copyVariableToGameVar" is a
  # custom action added by Plugins/Rocco Crit Quest, not stock DBK.
  #
  # Each of the 4 fights ends the instant its own required crit count is
  # reached ("VariableOver_N" + "endBattle" => 1, i.e. forced win) - fine to
  # combine even though VariableOver_N re-fires on every later variable change
  # while still above N, since endBattle immediately stops the battle and no
  # further crits can land afterwards to re-trigger it.
  ROCCO_CRIT_TRACKER_1 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "UserDealtCriticalHit_player_repeat" => { "addVariable" => 1 },
    "VariableOver_0" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 150 }
  }

################################################################################
# Quest93 Rocco - Kampf 2
################################################################################
  ROCCO_CRIT_TRACKER_2 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "UserDealtCriticalHit_player_repeat" => { "addVariable" => 1 },
    "VariableOver_1" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 150 }
  }

################################################################################
# Quest93 Rocco - Kampf 3
################################################################################
  # Kampf 3: Rocco setzt vor der ersten Zugauswahl (zählt nicht als Zug) X-Volltreffer
  # auf sein erstes Pokémon ein, um dessen Volltrefferquote zu erhöhen.
  ROCCO_CRIT_TRACKER_3 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "RoundStartCommand_1_foe" => {
      "text"     => "Rocco setzt X-Volltreffer ein!",
      "useItem"  => :DIREHIT
    },
    "UserDealtCriticalHit_player_repeat" => { "addVariable" => 1 },
    "VariableOver_2" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 150 }
  }

################################################################################
# Quest93 Rocco - Kampf 4
################################################################################
  # Kampf 4: dasselbe, aber mit dem stärkeren X-Volltreffer 2.
  ROCCO_CRIT_TRACKER_4 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "RoundStartCommand_1_foe" => {
      "text"     => "Rocco setzt X-Volltreffer 2 ein!",
      "useItem"  => :DIREHIT2
    },
    "UserDealtCriticalHit_player_repeat" => { "addVariable" => 1 },
    "VariableOver_3" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 150 }
  }

################################################################################
# Quest87 "Ein einziger Schlag" - Björn (X-Angriff)
################################################################################
  # Checks every damaging hit the player lands against the % of the target's
  # max HP it just took off (Game Variable 152 holds success 0/1 after the
  # battle, "checkHitThreshold" is a custom action added by
  # Plugins/X-Item Quest Mechanics). Ends the battle the instant a hit clears
  # the required threshold - no need to actually finish off Björn's team.

  BJORN_POWER_TRACKER_1 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "UserDealtDamage_player_repeat" => { "checkHitThreshold" => 0.5 },
    "VariableOver_0" => {
      "text"      => "Die Hälfte weg, ein Treffer! Björn bricht den Kampf sofort ab.",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 153 }
  }

################################################################################
# Quest87 Björn - Kampf 2
################################################################################
  BJORN_POWER_TRACKER_2 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "UserDealtDamage_player_repeat" => { "checkHitThreshold" => 0.66 },
    "VariableOver_0" => {
      "text"      => "Zwei Drittel weg, ein Treffer! Björn bricht den Kampf sofort ab.",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 153 }
  }

################################################################################
# Quest87 Björn - Kampf 3
################################################################################
  # Kampf 4: Björns einziges Pokémon in diesem Kampf wird direkt nach dem
  # Einsetzen "gebufft" (Vert./Sp.Vert. je 1 Stufe) - trotzdem soll ein
  # einziger Treffer für den vollen K.O. reichen.
  BJORN_POWER_TRACKER_3 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "AfterSendOut_foe" => {
      "text"         => "Björns Pokémon wird direkt gestärkt!",
      "battlerStats" => [:DEFENSE, 1, :SPECIAL_DEFENSE, 1]
    },
    "UserDealtDamage_player_repeat" => { "checkHitThreshold" => 0.8 },
    "VariableOver_0" => {
      "text"      => "Vier Fünftel weg, ein Treffer! Björn bricht den Kampf sofort ab.",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 153 }
  }

################################################################################
# Quest87 Björn - Kampf 4
################################################################################
  # Kampf 4: Björns einziges Pokémon in diesem Kampf wird direkt nach dem
  # Einsetzen "gebufft" (Vert./Sp.Vert. je 2 Stufen) - trotzdem soll ein
  # einziger Treffer für den vollen K.O. reichen.
  BJORN_POWER_TRACKER_4 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "AfterSendOut_foe" => {
      "text"         => "Björns Pokémon wird direkt gestärkt!",
      "battlerStats" => [:DEFENSE, 2, :SPECIAL_DEFENSE, 2]
    },
    "UserDealtDamage_player_repeat" => { "checkHitThreshold" => 1.0 },
    "VariableOver_0" => {
      "text"      => "Ein Treffer, K.O.! Björn bricht den Kampf sofort ab.",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 153 }
  }

################################################################################
# Quest88 "Wie ein Fels" - Rose (X-Verteidigung)
################################################################################
  # Game Variable 155 holds the per-attempt success (0/1) after the battle.

  # Kampf 1: 5 Runden ohne eigenes K.O. überstehen. "RoundEnd_player_repeat_every_5"
  # feuert bei Runde 5, 10, 15... - endBattle beim ersten Mal (Runde 5) verhindert,
  # dass er je wieder feuert, ein eigenes K.O. davor bricht sofort als Fehlschlag ab.
  ROSE_ENDURANCE_TRACKER_1 = {
    "BattlerFainted_player" => {
      "text"      => "Ein eigenes Pokémon ist gefallen - Rose bricht den Kampf sofort ab.",
      "endBattle" => 2
    },
    "RoundEnd_player_repeat_every_5" => {
      "text"      => "Fünf Runden überstanden! Rose bricht den Kampf sofort ab.",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 155 }
  }

################################################################################
# Quest88 Rose - Kampf 2
################################################################################
  # Kampf 2: dasselbe, aber 10 Runden.
  ROSE_ENDURANCE_TRACKER_2 = {
    "BattlerFainted_player" => {
      "text"      => "Ein eigenes Pokémon ist gefallen - Rose bricht den Kampf sofort ab.",
      "endBattle" => 2
    },
    "RoundEnd_player_repeat_every_10" => {
      "text"      => "Zehn Runden überstanden! Rose bricht den Kampf sofort ab.",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 155 }
  }

################################################################################
# Quest88 Rose - Kampf 3
################################################################################
  # Kampf 3: Kampf gewinnen, ohne dass ein eigenes Pokémon je unter 50% KP fällt.
  # "clean" (1) bleibt so lange stehen, bis TargetHPHalf_player einmal feuert, dann
  # dauerhaft 0 für den Rest des Kampfs. Nur bei echtem Sieg zählt das Ergebnis -
  # bei jedem anderen Kampfausgang wird 155 explizit auf 0 gezwungen.
  ROSE_ENDURANCE_TRACKER_3 = {
    "RoundStartCommand_1_player" => { "setVariable" => 1 },
    "TargetHPHalf_player" => {
      "text"        => "Ein eigenes Pokémon ist unter die Hälfte seiner LP gefallen!",
      "setVariable" => 0
    },
    "BattleEndWin"     => { "copyVariableToGameVar" => 155 },
    "BattleEndLoss"    => { "setVariable" => 0, "copyVariableToGameVar" => 155 },
    "BattleEndRun"     => { "setVariable" => 0, "copyVariableToGameVar" => 155 },
    "BattleEndForfeit" => { "setVariable" => 0, "copyVariableToGameVar" => 155 }
  }

################################################################################
# Quest88 Rose - Kampf 4
################################################################################
  # Kampf 4: Items sind für beide Seiten gesperrt (disableItems); die Beschränkung auf
  # ein einziges Pokémon läuft über die Battle-Rule "tempParty" im Event selbst, nicht
  # hier im Skript. Erfolg = echter Sieg, sonst 0.
  ROSE_ENDURANCE_TRACKER_4 = {
    "RoundStartCommand_1_player" => { "disableItems" => true },
    "BattleEndWin"     => { "setVariable" => 1, "copyVariableToGameVar" => 155 },
    "BattleEndLoss"    => { "setVariable" => 0, "copyVariableToGameVar" => 155 },
    "BattleEndRun"     => { "setVariable" => 0, "copyVariableToGameVar" => 155 },
    "BattleEndForfeit" => { "setVariable" => 0, "copyVariableToGameVar" => 155 }
  }

################################################################################
# Quest89 "Der erste Schlag zählt" - Finn - Kampf 1
################################################################################
  # Quest89 "Der erste Schlag zählt" (Finn): "checkFirstStrikeKO" (X-Item Quest
  # Mechanics.rb) zählt jedes gegnerische Pokémon, das mit turnCount == 0 fällt,
  # also besiegt wird, bevor es auch nur eine volle Runde aktiv war. Statt
  # simpler Zahlen-Eskalation wechseln sich hier Anzahl (1/1/2/2) und
  # Trick-Room-Bedingung (aus/an/aus/an) ab, damit die vier Kämpfe sich nicht
  # alle gleich anfühlen. "setTrickRoom" (X-Item Quest Mechanics.rb) setzt das
  # Feld direkt, ohne dass jemand die Attacke einsetzen muss.
  FINN_INITIATIVE_TRACKER_1 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "BattlerFainted_foe_repeat" => { "checkFirstStrikeKO" => true },
    "VariableOver_0" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 159 }
  }

################################################################################
# Quest89 Finn - Kampf 2
################################################################################
  FINN_INITIATIVE_TRACKER_2 = {
    "RoundStartCommand_1_player" => {
      "setVariable"  => 0,
      "setTrickRoom" => 99
    },
    "BattlerFainted_foe_repeat" => { "checkFirstStrikeKO" => true },
    "VariableOver_0" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 159 }
  }

################################################################################
# Quest89 Finn - Kampf 3
################################################################################
  FINN_INITIATIVE_TRACKER_3 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "RoundStartCommand_1_foe" => {
      "text"    => "Finn setzt X-Initiative ein!",
      "useItem" => :XSPEED
    },
    "BattlerFainted_foe_repeat" => { "checkFirstStrikeKO" => true },
    "VariableOver_1" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 159 }
  }

################################################################################
# Quest89 Finn - Kampf 4
################################################################################
  FINN_INITIATIVE_TRACKER_4 = {
    "RoundStartCommand_1_player" => {
      "setVariable"  => 0,
      "setTrickRoom" => 99
    },
    "BattlerFainted_foe_repeat" => { "checkFirstStrikeKO" => true },
    "VariableOver_1" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 159 }
  }

################################################################################
# Quest90 "Stärker als jede Abwehr" - Mira - Kampf 1
################################################################################
  # Quest90 "Stärker als jede Abwehr" (Mira): "checkResistedKO" (X-Item Quest
  # Mechanics.rb) feuert auf "UserMoveResisted_player_repeat" - dem core-eigenen
  # Trigger für "eigener Treffer war nicht sehr effektiv" - und prüft direkt, ob
  # das Ziel dabei trotzdem besiegt wurde. Wie bei Finn wechseln sich zwei
  # Achsen ab statt reiner Zahlen-Eskalation: Anzahl (1/2/1/2) und ob das
  # eigene Pokémon selbst eine Typenschwäche gegen das Ziel haben muss
  # (aus/aus/an/an, über "checkResistedKOWithWeakness").
  MIRA_RESISTANCE_TRACKER_1 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "UserMoveResisted_player_repeat" => { "checkResistedKO" => true },
    "VariableOver_0" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 161 }
  }

################################################################################
# Quest90 Mira - Kampf 2
################################################################################
  MIRA_RESISTANCE_TRACKER_2 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "UserMoveResisted_player_repeat" => { "checkResistedKO" => true },
    "VariableOver_1" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 161 }
  }

################################################################################
# Quest90 Mira - Kampf 3
################################################################################
  MIRA_RESISTANCE_TRACKER_3 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "UserMoveResisted_player_repeat" => { "checkResistedKOWithWeakness" => true },
    "VariableOver_0" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 161 }
  }

################################################################################
# Quest90 Mira - Kampf 4
################################################################################
  MIRA_RESISTANCE_TRACKER_4 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "UserMoveResisted_player_repeat" => { "checkResistedKOWithWeakness" => true },
    "VariableOver_1" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 161 }
  }

################################################################################
# Quest91 "Unerschütterlich" - Falk - Kampf 1
################################################################################
  # Quest91 "Unerschütterlich" (Falk) - identisch zu ROSE_ENDURANCE_TRACKER_1-4,
  # nur mit Variable 163 statt 155. Kampf 1/2: 5/10 Runden ohne eigenes K.O.
  # überstehen. Kampf 3: gewinnen, ohne dass ein eigenes Pokémon unter 50% KP
  # fällt. Kampf 4: Items gesperrt, die Beschränkung auf ein Pokémon läuft über
  # die "tempParty"-Battle-Rule im Event selbst.
  FALK_RESILIENCE_TRACKER_1 = {
    "BattlerFainted_player" => {
      "text"      => "Ein eigenes Pokémon ist gefallen - Falk bricht den Kampf sofort ab.",
      "endBattle" => 2
    },
    "RoundEnd_player_repeat_every_5" => {
      "text"      => "Fünf Runden überstanden! Falk bricht den Kampf sofort ab.",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 163 }
  }

################################################################################
# Quest91 Falk - Kampf 2
################################################################################
  FALK_RESILIENCE_TRACKER_2 = {
    "BattlerFainted_player" => {
      "text"      => "Ein eigenes Pokémon ist gefallen - Falk bricht den Kampf sofort ab.",
      "endBattle" => 2
    },
    "RoundEnd_player_repeat_every_10" => {
      "text"      => "Zehn Runden überstanden! Falk bricht den Kampf sofort ab.",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 163 }
  }

################################################################################
# Quest91 Falk - Kampf 3
################################################################################
  FALK_RESILIENCE_TRACKER_3 = {
    "RoundStartCommand_1_player" => { "setVariable" => 1 },
    "TargetHPHalf_player" => {
      "text"        => "Ein eigenes Pokémon ist unter die Hälfte seiner LP gefallen!",
      "setVariable" => 0
    },
    "BattleEndWin"     => { "copyVariableToGameVar" => 163 },
    "BattleEndLoss"    => { "setVariable" => 0, "copyVariableToGameVar" => 163 },
    "BattleEndRun"     => { "setVariable" => 0, "copyVariableToGameVar" => 163 },
    "BattleEndForfeit" => { "setVariable" => 0, "copyVariableToGameVar" => 163 }
  }

################################################################################
# Quest91 Falk - Kampf 4
################################################################################
  FALK_RESILIENCE_TRACKER_4 = {
    "RoundStartCommand_1_player" => { "disableItems" => true },
    "BattleEndWin"     => { "setVariable" => 1, "copyVariableToGameVar" => 163 },
    "BattleEndLoss"    => { "setVariable" => 0, "copyVariableToGameVar" => 163 },
    "BattleEndRun"     => { "setVariable" => 0, "copyVariableToGameVar" => 163 },
    "BattleEndForfeit" => { "setVariable" => 0, "copyVariableToGameVar" => 163 }
  }

################################################################################
# Quest92 Nadja - Kampf 1
################################################################################
  # Quest92 "..." (Nadja): "checkNoMiss" (X-Item Quest Mechanics.rb) starts
  # optimistic at 1 and zeroes out on any missed hit against Nadja's side.
  # Kampf 1: ganzer Kampf ohne Fehlschlag. Kampf 2: dasselbe, aber Nadjas
  # erstes Pokémon setzt zu Rundenbeginn erzwungen Doppelteam ein (über den
  # bereits vorhandenen "useMove"-Handler). Kampf 3: "checkRiskyMoveStreak"
  # verlangt 3 riskante (nicht-100%) Treffer in Folge. Kampf 4: wie Kampf 2,
  # nur übers ganze Team.
  NADJA_ACCURACY_TRACKER_1 = {
    "RoundStartCommand_1_player" => { "setVariable" => 1 },
    "AfterMove_player_repeat" => { "checkNoMiss" => true },
    "BattleEndWin"     => { "copyVariableToGameVar" => 165 },
    "BattleEndLoss"    => { "setVariable" => 0, "copyVariableToGameVar" => 165 },
    "BattleEndRun"     => { "setVariable" => 0, "copyVariableToGameVar" => 165 },
    "BattleEndForfeit" => { "setVariable" => 0, "copyVariableToGameVar" => 165 }
  }

################################################################################
# Quest92 Nadja - Kampf 2
################################################################################
  NADJA_ACCURACY_TRACKER_2 = {
    "RoundStartCommand_1_player" => { "setVariable" => 1 },
    "RoundStartCommand_1_foe" => {
      "text"    => "Nadjas Pokémon setzt Doppelteam ein!",
      "useMove" => :DOUBLETEAM
    },
    "AfterMove_player_repeat" => { "checkNoMiss" => true },
    "BattleEndWin"     => { "copyVariableToGameVar" => 165 },
    "BattleEndLoss"    => { "setVariable" => 0, "copyVariableToGameVar" => 165 },
    "BattleEndRun"     => { "setVariable" => 0, "copyVariableToGameVar" => 165 },
    "BattleEndForfeit" => { "setVariable" => 0, "copyVariableToGameVar" => 165 }
  }

################################################################################
# Quest92 Nadja - Kampf 3
################################################################################
  NADJA_ACCURACY_TRACKER_3 = {
    "RoundStartCommand_1_player" => { "setVariable" => 0 },
    "AfterMove_player_repeat" => { "checkRiskyMoveStreak" => true },
    "VariableOver_2" => {
      "text"      => "Der Kampf wird beendet!",
      "endBattle" => 1
    },
    "BattleEnd" => { "copyVariableToGameVar" => 165 }
  }

################################################################################
# Quest92 Nadja - Kampf 4
################################################################################
  NADJA_ACCURACY_TRACKER_4 = {
    "RoundStartCommand_1_player" => { "setVariable" => 1 },
    "RoundStartCommand_1_foe" => {
      "text"    => "Nadjas Pokémon setzt Doppelteam ein!",
      "useMove" => :DOUBLETEAM
    },
    "AfterMove_player_repeat" => { "checkNoMiss" => true },
    "BattleEndWin"     => { "copyVariableToGameVar" => 165 },
    "BattleEndLoss"    => { "setVariable" => 0, "copyVariableToGameVar" => 165 },
    "BattleEndRun"     => { "setVariable" => 0, "copyVariableToGameVar" => 165 },
    "BattleEndForfeit" => { "setVariable" => 0, "copyVariableToGameVar" => 165 }
  }

################################################################################
# Kristall-Stahlos (Gesteinsschlund, Map 205)
################################################################################
  #---------------------------------------------------------------------------
  # Kristall-Stahlos (Gesteinsschlund, Map 205, EV001) - wildes Boss-Stahlos
  # in der "Chrono"-Form (Stahl/Eis, Schneewarnung)
  #---------------------------------------------------------------------------
  KRISTALL_STAHLOS = {

    #-------------------------------------------------------------------------
    # Kampfbeginn: die Höhle reagiert auf das erwachte Stahlos
    #-------------------------------------------------------------------------
    "RoundStartCommand_1_foe" => {
      "text" => [
        "Der Höhlenboden erzittert unter dem Gewicht des Stahlos!",
        "Kalte Luft strömt aus den Rissen im Gestein..."],
      "changeWeather" => :Hail,
      "battlerHPCap"  => 50
    },

    #-------------------------------------------------------------------------
    # KP stoppen beim ersten Erreichen von 50% - Enrage-Phase
    #-------------------------------------------------------------------------
    "BattlerReachedHPCap_foe" => {
      "text"         => "Das Stahlos brüllt auf - sein Körper glänzt hart wie Diamant!",
      "playAnim"     => [:IRONDEFENSE, :Self, :Self],
      "battlerStats" => [:ATTACK, 1, :DEFENSE, 1],
      "battlerHPCap" => 1
    },

    #-------------------------------------------------------------------------
    # Kritischer KP-Stand: erzwungener Donnerfang + letzter Widerstand
    #-------------------------------------------------------------------------
    "TargetHPLow_foe" => {
      "text"           => ["Das Stahlos stemmt sich mit letzter Kraft gegen die Niederlage!",
                            "Ein greller Blitz zuckt zwischen seinen Zähnen auf - das hast du nicht erwartet!"],
      "useMove"        => :THUNDERFANG,
      "battlerEffects" => [:Endure, true, "{1} hält durch!"]
    }
  }
end