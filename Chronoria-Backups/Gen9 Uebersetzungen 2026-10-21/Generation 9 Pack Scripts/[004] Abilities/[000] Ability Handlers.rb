################################################################################
# 
# Ability triggers.
# 
################################################################################


module Battle::AbilityEffects
  OnTypeChange            = AbilityHandlerHash.new  # Protean, Libero
  OnOpposingStatGain      = AbilityHandlerHash.new  # Opportunist
  ModifyTypeEffectiveness = AbilityHandlerHash.new  # Tera Shell (damage)
  OnMoveSuccessCheck      = AbilityHandlerHash.new  # Tera Shell (display)
  OnInflictingStatus      = AbilityHandlerHash.new  # Poison Puppeteer

  def self.triggerOnStatusInflicted(ability, battler, user, status)
    OnInflictingStatus.trigger(user.ability, user, battler, status) if user && user.abilityActive? # Poison Puppeteer
    OnStatusInflicted.trigger(ability, battler, user, status)
  end
  
  def self.triggerOnSwitchIn(ability, battler, battle, switch_in = false)
    OnSwitchIn.trigger(ability, battler, battle, switch_in)
    battle.allSameSideBattlers(battler.index).each do |b|
      next if !b.hasActiveAbility?(:COMMANDER)
      next if b.effects[PBEffects::Commander]
      OnSwitchIn.trigger(b.ability, b, battle, switch_in)	  
    end
  end

  def self.triggerOnTypeChange(ability, battler, type)
    OnTypeChange.trigger(ability, battler, type)
  end

  def self.triggerOnOpposingStatGain(ability, battler, battle, statUps)
    OnOpposingStatGain.trigger(ability, battler, battle, statUps)
  end
  
  def self.triggerModifyTypeEffectiveness(ability, user, target, move, battle, effectiveness)
    return trigger(ModifyTypeEffectiveness, ability, user, target, move, battle, effectiveness, ret: effectiveness)
  end
  
  def self.triggerOnMoveSuccessCheck(ability, user, target, move, battle)
    OnMoveSuccessCheck.trigger(ability, user, target, move, battle)
  end

  def self.triggerOnInflictingStatus(ability, battler, user, status)
    OnInflictingStatus.trigger(ability, battler, user, status)
  end
end


################################################################################
# 
# Updates to old ability handlers.
# 
################################################################################


#===============================================================================
# Insomnia, Vital Spirit
#===============================================================================
# Adds Drowsy as a status that may be healed.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::StatusCure.add(:INSOMNIA,
  proc { |ability, battler|
    next if ![:SLEEP, :DROWSY].include?(battler.status)
    battler.battle.pbShowAbilitySplash(battler)
    battler.pbCureStatus(Battle::Scene::USE_ABILITY_SPLASH)
    if !Battle::Scene::USE_ABILITY_SPLASH
      case battler.status
      when :SLEEP  then msg = _INTL("{1}s {2} hat das Pokémon aufgeweckt!", battler.pbThis, battler.abilityName)
      when :DROWSY then msg = _INTL("{1}s {2} hat das Pokémon wieder wachsam gemacht!", battler.pbThis, battler.abilityName)
      end
      battler.battle.pbDisplay(msg)
    end
    battler.battle.pbHideAbilitySplash(battler)
  }
)

Battle::AbilityEffects::StatusCure.copy(:INSOMNIA, :VITALSPIRIT)

Battle::AbilityEffects::OnSwitchOut.add(:INSOMNIA,
  proc { |ability, battler, endOfBattle|
    next if ![:SLEEP, :DROWSY].include?(battler.status)
    PBDebug.log("[Ability triggered] #{battler.pbThis}'s #{battler.abilityName}")
    battler.status = :NONE
  }
)

Battle::AbilityEffects::OnSwitchOut.copy(:INSOMNIA, :VITALSPIRIT)

#===============================================================================
# Magma Armor
#===============================================================================
# Adds Frostbite as a status that may be healed.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::StatusCure.add(:MAGMAARMOR,
  proc { |ability, battler|
    next if ![:FROZEN, :FROSTBITE].include?(battler.status)
    battler.battle.pbShowAbilitySplash(battler)
    battler.pbCureStatus(Battle::Scene::USE_ABILITY_SPLASH)
    if !Battle::Scene::USE_ABILITY_SPLASH
      case battler.status
      when :FROZEN    then msg = _INTL("{1}s {2} hat das Pokémon aufgetaut!", battler.pbThis, battler.abilityName)
      when :FROSTBITE then msg = _INTL("{1}s {2} hat das Pokémon geheilt!", battler.pbThis, battler.abilityName)
      end
      battler.battle.pbDisplay(msg)
    end
    battler.battle.pbHideAbilitySplash(battler)
  }
)

Battle::AbilityEffects::OnSwitchOut.add(:MAGMAARMOR,
  proc { |ability, battler, endOfBattle|
    next if ![:FROZEN, :FROSTBITE].include?(battler.status)
    PBDebug.log("[Ability triggered] #{battler.pbThis}'s #{battler.abilityName}")
    battler.status = :NONE
  }
)

#===============================================================================
# Healer
#===============================================================================
# Adds Drowsy/Frostbite as statuses that may be healed.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::EndOfRoundHealing.add(:HEALER,
  proc { |ability, battler, battle|
    next unless battle.pbRandom(100) < 30
    battler.allAllies.each do |b|
      next if b.status == :NONE
      battle.pbShowAbilitySplash(battler)
      oldStatus = b.status
      b.pbCureStatus(Battle::Scene::USE_ABILITY_SPLASH)
      if !Battle::Scene::USE_ABILITY_SPLASH
        case oldStatus
        when :SLEEP
          battle.pbDisplay(_INTL("{1}s {2} hat seinen Mitstreiter aufgeweckt!", battler.pbThis, battler.abilityName))
        when :POISON
          battle.pbDisplay(_INTL("{1}s {2} hat die Vergiftung des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
        when :BURN
          battle.pbDisplay(_INTL("{1}s {2} hat die Verbrennung des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
        when :PARALYSIS
          battle.pbDisplay(_INTL("{1}s {2} hat die Paralyse des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
        when :FROZEN
          battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder aufgetaut!", battler.pbThis, battler.abilityName))
        when :DROWSY
          battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder wachsam gemacht!", battler.pbThis, battler.abilityName))
        when :FROSTBITE
          battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder geheilt!", battler.pbThis, battler.abilityName))
        end
      end
      battle.pbHideAbilitySplash(battler)
    end
  }
)

#===============================================================================
# Hydration
#===============================================================================
# Adds Drowsy/Frostbite as statuses that may be healed.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::EndOfRoundHealing.add(:HYDRATION,
  proc { |ability, battler, battle|
    next if battler.status == :NONE
    next if ![:Rain, :HeavyRain].include?(battler.effectiveWeather)
    battle.pbShowAbilitySplash(battler)
    oldStatus = battler.status
    battler.pbCureStatus(Battle::Scene::USE_ABILITY_SPLASH)
    if !Battle::Scene::USE_ABILITY_SPLASH
      case oldStatus
      when :SLEEP
        battle.pbDisplay(_INTL("{1}s {2} hat seinen Mitstreiter aufgeweckt!", battler.pbThis, battler.abilityName))
      when :POISON
        battle.pbDisplay(_INTL("{1}s {2} hat die Vergiftung des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
      when :BURN
        battle.pbDisplay(_INTL("{1}s {2} hat die Verbrennung des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
      when :PARALYSIS
        battle.pbDisplay(_INTL("{1}s {2} hat die Paralyse des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
      when :FROZEN
        battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder aufgetaut!", battler.pbThis, battler.abilityName))
      when :DROWSY
        battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder wachsam gemacht!", battler.pbThis, battler.abilityName))
      when :FROSTBITE
        battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder geheilt!", battler.pbThis, battler.abilityName))
      end
    end
    battle.pbHideAbilitySplash(battler)
  }
)

#===============================================================================
# Shed Skin
#===============================================================================
# Adds Drowsy/Frostbite as statuses that may be healed.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::EndOfRoundHealing.add(:SHEDSKIN,
  proc { |ability, battler, battle|
    next if battler.status == :NONE
    next unless battle.pbRandom(100) < 30
    battle.pbShowAbilitySplash(battler)
    oldStatus = battler.status
    battler.pbCureStatus(Battle::Scene::USE_ABILITY_SPLASH)
    if !Battle::Scene::USE_ABILITY_SPLASH
      case oldStatus
      when :SLEEP
        battle.pbDisplay(_INTL("{1}s {2} hat seinen Mitstreiter aufgeweckt!", battler.pbThis, battler.abilityName))
      when :POISON
        battle.pbDisplay(_INTL("{1}s {2} hat die Vergiftung des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
      when :BURN
        battle.pbDisplay(_INTL("{1}s {2} hat die Verbrennung des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
      when :PARALYSIS
        battle.pbDisplay(_INTL("{1}s {2} hat die Paralyse des Mitstreiters geheilt!", battler.pbThis, battler.abilityName))
      when :FROZEN
        battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder aufgetaut!", battler.pbThis, battler.abilityName))
      when :DROWSY
        battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder wachsam gemacht!", battler.pbThis, battler.abilityName))
      when :FROSTBITE
        battle.pbDisplay(_INTL("{1}s {2} hat den Mitstreiter wieder geheilt!", battler.pbThis, battler.abilityName))
      end
    end
    battle.pbHideAbilitySplash(battler)
  }
)

#===============================================================================
# Synchronize
#===============================================================================
# Adds Drowsy/Frostbite as statuses that may be passed.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnStatusInflicted.add(:SYNCHRONIZE,
  proc { |ability, battler, user, status|
    next if !user || user.index == battler.index
    case status
    when :POISON
      if user.pbCanPoisonSynchronize?(battler)
        battler.battle.pbShowAbilitySplash(battler)
        msg = nil
        if !Battle::Scene::USE_ABILITY_SPLASH
          msg = _INTL("{1}s {2} hat {3} vergiftet!", battler.pbThis, battler.abilityName, user.pbThis(true))
        end
        user.pbPoison(nil, msg, (battler.statusCount > 0))
        battler.battle.pbHideAbilitySplash(battler)
      end
    when :BURN
      if user.pbCanBurnSynchronize?(battler)
        battler.battle.pbShowAbilitySplash(battler)
        msg = nil
        if !Battle::Scene::USE_ABILITY_SPLASH
          msg = _INTL("{1}s {2} fügt {3} Verbrennungen zu!", battler.pbThis, battler.abilityName, user.pbThis(true))
        end
        user.pbBurn(nil, msg)
        battler.battle.pbHideAbilitySplash(battler)
      end
    when :PARALYSIS
      if user.pbCanParalyzeSynchronize?(battler)
        battler.battle.pbShowAbilitySplash(battler)
        msg = nil
        if !Battle::Scene::USE_ABILITY_SPLASH
          msg = _INTL("{1}s {2} hat {3} paralysiert! Es kann sich vielleicht nicht bewegen!",
             battler.pbThis, battler.abilityName, user.pbThis(true))
        end
        user.pbParalyze(nil, msg)
        battler.battle.pbHideAbilitySplash(battler)
      end
    when :DROWSY
      if user.pbCanSynchronizeStatus?(:SLEEP, battler)
        battler.battle.pbShowAbilitySplash(battler)
        msg = nil
        if !Battle::Scene::USE_ABILITY_SPLASH
          msg = _INTL("{1}s {2} hat {3} schläfrig gemacht! Es ist vielleicht zu müde, um sich zu bewegen!",
             battler.pbThis, battler.abilityName, user.pbThis(true))
        end
        user.pbSleep(nil, msg)
        battler.battle.pbHideAbilitySplash(battler)
      end
    when :FROSTBITE
      if user.pbCanSynchronizeStatus?(:FROZEN, battler)
        battler.battle.pbShowAbilitySplash(battler)
        msg = nil
        if !Battle::Scene::USE_ABILITY_SPLASH
          msg = _INTL("{1}s {2} verursacht bei {3} Frostbrand!", battler.pbThis, battler.abilityName, user.pbThis(true))
        end
        user.pbFreeze(nil, msg)
        battler.battle.pbHideAbilitySplash(battler)
      end
    end
  }
)

#===============================================================================
# Poison Touch
#===============================================================================
# Adds Covert Cloak immunity.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnDealingHit.add(:POISONTOUCH,
  proc { |ability, user, target, move, battle|
    next if target.fainted?
    next if !move.contactMove?
    next if battle.pbRandom(100) >= 30
    next if target.hasActiveItem?(:COVERTCLOAK)
    battle.pbShowAbilitySplash(user)
    if target.hasActiveAbility?(:SHIELDDUST) && !battle.moldBreaker
      battle.pbShowAbilitySplash(target)
      if !Battle::Scene::USE_ABILITY_SPLASH
        battle.pbDisplay(_INTL("{1} ist unbeeinflusst!", target.pbThis))
      end
      battle.pbHideAbilitySplash(target)
    elsif target.pbCanPoison?(user, Battle::Scene::USE_ABILITY_SPLASH)
      msg = nil
      if !Battle::Scene::USE_ABILITY_SPLASH
        msg = _INTL("{1}s {2} hat {3} vergiftet!", user.pbThis, user.abilityName, target.pbThis(true))
      end
      target.pbPoison(user, msg)
    end
    battle.pbHideAbilitySplash(user)
  }
)

#===============================================================================
# Power of Alchemy, Receiver
#===============================================================================
# Adds Ability Shield immunity.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::ChangeOnBattlerFainting.add(:POWEROFALCHEMY,
  proc { |ability, battler, fainted, battle|
    next if battler.opposes?(fainted)
    next if fainted.uncopyableAbility?
    next if battler.hasActiveItem?(:ABILITYSHIELD)
    battle.pbShowAbilitySplash(battler, true)
    battler.ability = fainted.ability
    battle.pbReplaceAbilitySplash(battler)
    battle.pbDisplay(_INTL("{1}s Fähigkeit {2} wurde übernommen!", fainted.pbThis, fainted.abilityName))
    battle.pbHideAbilitySplash(battler)
  }
)

Battle::AbilityEffects::ChangeOnBattlerFainting.copy(:POWEROFALCHEMY, :RECEIVER)


#===============================================================================
# Mummy
#===============================================================================
# Adds Ability Shield immunity. Lingering Aroma ability uses the same code.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnBeingHit.add(:MUMMY,
  proc { |ability, user, target, move, battle|
    next if !move.pbContactMove?(user)
    next if user.fainted?
    next if user.unstoppableAbility?
    next if [:MUMMY, :LINGERINGAROMA].include?(user.ability_id)
    next if user.hasActiveItem?(:ABILITYSHIELD)
    oldAbil = nil
    battle.pbShowAbilitySplash(target) if user.opposes?(target)
    if user.affectedByContactEffect?(Battle::Scene::USE_ABILITY_SPLASH)
      oldAbil = user.ability
      battle.pbShowAbilitySplash(user, true, false) if user.opposes?(target)
      user.ability = ability
      battle.pbReplaceAbilitySplash(user) if user.opposes?(target)
      if Battle::Scene::USE_ABILITY_SPLASH
	    case ability
        when :MUMMY
          msg = _INTL("{1}s Fähigkeit wurde zu {2}!", user.pbThis, user.abilityName)
        when :LINGERINGAROMA
          msg = _INTL("Eine Duftschwade geht auf {1} über!", user.pbThis(true))
        end
        battle.pbDisplay(msg)
      else
        battle.pbDisplay(_INTL("{1}s Fähigkeit wurde zu {2}, aufgrund der Fähigkeit {3}!",
           user.pbThis, user.abilityName, target.pbThis(true)))
      end
      battle.pbHideAbilitySplash(user) if user.opposes?(target)
    end
    battle.pbHideAbilitySplash(target) if user.opposes?(target)
    user.pbOnLosingAbility(oldAbil)
    user.pbTriggerAbilityOnGainingIt
  }
)

#===============================================================================
# Wandering Spirit
#===============================================================================
# Adds Ability Shield immunity.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnBeingHit.add(:WANDERINGSPIRIT,
  proc { |ability, user, target, move, battle|
    next if !move.pbContactMove?(user)
    next if user.uncopyableAbility?
    next if user.hasActiveItem?(:ABILITYSHIELD) || target.hasActiveItem?(:ABILITYSHIELD)
    oldUserAbil   = nil
    oldTargetAbil = nil
    battle.pbShowAbilitySplash(target) if user.opposes?(target)
    if user.affectedByContactEffect?(Battle::Scene::USE_ABILITY_SPLASH)
      battle.pbShowAbilitySplash(user, true, false) if user.opposes?(target)
      oldUserAbil   = user.ability
      oldTargetAbil = target.ability
      user.ability   = oldTargetAbil
      target.ability = oldUserAbil
      if user.opposes?(target)
        battle.pbReplaceAbilitySplash(user)
        battle.pbReplaceAbilitySplash(target)
      end
      if Battle::Scene::USE_ABILITY_SPLASH
        battle.pbDisplay(_INTL("{1} tauscht seine Fähigkeit mit {2}!", target.pbThis, user.pbThis(true)))
      else
        battle.pbDisplay(_INTL("{1} tauscht die Fähigkeit von {2} mit {3}s Fähigkeit {4}!",
           target.pbThis, user.abilityName, user.pbThis(true), target.abilityName))
      end
      if user.opposes?(target)
        battle.pbHideAbilitySplash(user)
        battle.pbHideAbilitySplash(target)
      end
    end
    battle.pbHideAbilitySplash(target) if user.opposes?(target)
    user.pbOnLosingAbility(oldUserAbil)
    target.pbOnLosingAbility(oldTargetAbil)
    user.pbTriggerAbilityOnGainingIt
    target.pbTriggerAbilityOnGainingIt
  }
)

#===============================================================================
# Neutralizing Gas
#===============================================================================
# Adds Ability Shield immunity.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnSwitchIn.add(:NEUTRALIZINGGAS,
  proc { |ability, battler, battle, switch_in|
    battle.pbShowAbilitySplash(battler, true)
    battle.pbHideAbilitySplash(battler)
    battle.pbDisplay(_INTL("Reaktionsgas legt sich über das Kampffeld!"))
    battle.allBattlers.each do |b|
      if b.hasActiveItem?(:ABILITYSHIELD)
        itemname = GameData::Item.get(b.item).name
        battle.pbDisplay(_INTL("{1}sFähigkeit ist durch das getragene Item {2} geschützt!",b.pbThis,itemname))
        next
      end
      b.effects[PBEffects::SlowStart] = 0
      b.effects[PBEffects::Truant] = false
      if !b.hasActiveItem?([:CHOICEBAND, :CHOICESPECS, :CHOICESCARF])
        b.effects[PBEffects::ChoiceBand] = nil
      end
      if b.effects[PBEffects::Illusion]
        b.effects[PBEffects::Illusion] = nil
        if !b.effects[PBEffects::Transform]
          battle.scene.pbChangePokemon(b, b.pokemon)
          battle.pbDisplay(_INTL("{1}s {2} schwindet!", b.pbThis, b.abilityName))
          battle.pbSetSeen(b)
        end
      end
    end
    battler.ability_id = nil
    had_unnerve = battle.pbCheckGlobalAbility(:UNNERVE)
    battler.ability_id = :NEUTRALIZINGGAS
    if had_unnerve && !battle.pbCheckGlobalAbility(:UNNERVE)
      battle.allBattlers.each { |b| b.pbItemsOnUnnerveEnding }
    end
  }
)

#===============================================================================
# Intimidate
#===============================================================================
# Targets with Guard Dog don't proc items that are only used when Intimidated.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnSwitchIn.add(:INTIMIDATE,
  proc { |ability, battler, battle, switch_in|
    next if battler.effects[PBEffects::OneUseAbility] == ability
    battle.pbShowAbilitySplash(battler)
    battle.allOtherSideBattlers(battler.index).each do |b|
      next if !b.near?(battler)
      check_item = true
      if b.hasActiveAbility?([:CONTRARY, :GUARDDOG])
        check_item = false if b.statStageAtMax?(:ATTACK)
      elsif b.statStageAtMin?(:ATTACK)
        check_item = false
      end
      check_ability = b.pbLowerAttackStatStageIntimidate(battler)
      b.pbAbilitiesOnIntimidated if check_ability
      b.pbItemOnIntimidatedCheck if check_item
    end
    battle.pbHideAbilitySplash(battler)
    battler.effects[PBEffects::OneUseAbility] = ability
  }
)

#===============================================================================
# Anger Point
#===============================================================================
# Allows Mirror Herb/Opportunist to copy the stat boosts granted by this ability.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnBeingHit.add(:ANGERPOINT,
  proc { |ability, user, target, move, battle|
    next if !target.damageState.critical
    next if !target.pbCanRaiseStatStage?(:ATTACK, target)
    battle.pbShowAbilitySplash(target)
    target.stages[:ATTACK] = 6
    target.addSideStatUps(:ATTACK, 6)
    target.statsRaisedThisRound = true
    battle.pbCommonAnimation("StatUp", target)
    if Battle::Scene::USE_ABILITY_SPLASH
      battle.pbDisplay(_INTL("{1} hat seinen {2} maximiert!", target.pbThis, GameData::Stat.get(:ATTACK).name))
    else
      battle.pbDisplay(_INTL("{1}s Fähigkeit {2} hat seinen {3} maximiert!",
         target.pbThis, target.abilityName, GameData::Stat.get(:ATTACK).name))
    end
    battle.pbHideAbilitySplash(target)
  }
)

#===============================================================================
# Dauntless Shield
#===============================================================================
# Adds once-per-battle check.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnSwitchIn.add(:DAUNTLESSSHIELD,
  proc { |ability, battler, battle, switch_in|
    next if Settings::MECHANICS_GENERATION >= 9 && battler.ability_triggered?
    battler.pbRaiseStatStageByAbility(:DEFENSE, 1, battler)
    battle.pbSetAbilityTrigger(battler)
  }
)

#===============================================================================
# Intrepid Sword
#===============================================================================
# Adds once-per-battle check.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnSwitchIn.add(:INTREPIDSWORD,
  proc { |ability, battler, battle, switch_in|
    next if Settings::MECHANICS_GENERATION >= 9 && battler.ability_triggered?
    battler.pbRaiseStatStageByAbility(:ATTACK, 1, battler)
    battle.pbSetAbilityTrigger(battler)
  }
)

#===============================================================================
# Protean, Libero
#===============================================================================
# Gen 9+ version that only triggers once per switch-in.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnTypeChange.add(:PROTEAN,
  proc { |ability, battler, type|
    next if Settings::MECHANICS_GENERATION < 9
    next if GameData::Type.get(type).pseudo_type
    battler.effects[PBEffects::OneUseAbility] = ability
  }
)

Battle::AbilityEffects::OnTypeChange.copy(:PROTEAN, :LIBERO)

#===============================================================================
# Battle Bond
#===============================================================================
# Gen 9+ version that boosts stats instead of becoming Ash-Greninja.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnEndOfUsingMove.add(:BATTLEBOND,
  proc { |ability, user, targets, move, battle|
    next if Settings::MECHANICS_GENERATION < 9
    next if user.fainted? || battle.pbAllFainted?(user.idxOpposingSide)
    next if !user.isSpecies?(:GRENINJA) || user.effects[PBEffects::Transform]
    next if battle.battleBond[user.index & 3][user.pokemonIndex]
    numFainted = 0
    targets.each { |b| numFainted += 1 if b.damageState.fainted }
    next if numFainted == 0
    battle.pbShowAbilitySplash(user)
    battle.battleBond[user.index & 3][user.pokemonIndex] = true
    battle.pbDisplay(_INTL("{1} wurde vollständig durch seine Freundschaft zum Trainer geboostet!", user.pbThis))
    battle.pbHideAbilitySplash(user)
    showAnim = true
    [:ATTACK, :SPECIAL_ATTACK, :SPEED].each do |stat|
      next if !user.pbCanRaiseStatStage?(stat, user)
      if user.pbRaiseStatStage(stat, 1, user, showAnim)
        showAnim = false
      end
    end
    battle.pbDisplay(_INTL("{1}s Statuswerte können nicht weiter steigen!", user.pbThis)) if showAnim
  }
)

#===============================================================================
# Illuminate
#===============================================================================
# Gen 9+ version prevents loss of accuracy and ignores target's evasion bonuses.
#-------------------------------------------------------------------------------
if Settings::MECHANICS_GENERATION >= 9
  Battle::AbilityEffects::StatLossImmunity.copy(:KEENEYE, :ILLUMINATE)
  Battle::AbilityEffects::AccuracyCalcFromUser.copy(:KEENEYE, :ILLUMINATE)
end

#===============================================================================
# Transistor
#===============================================================================
# Gen 9+ version reduces power bonus from 50% to 30%
#-------------------------------------------------------------------------------
Battle::AbilityEffects::DamageCalcFromUser.add(:TRANSISTOR,
  proc { |ability, user, target, move, mults, power, type|
    bonus = (Settings::MECHANICS_GENERATION >= 9) ? 1.3 : 1.5
    mults[:attack_multiplier] *= bonus if type == :ELECTRIC
  }
)

#===============================================================================
# Magician
#===============================================================================
# Records stolen item to ability bearer's stolen item data.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::OnEndOfUsingMove.add(:MAGICIAN,
  proc { |ability, user, targets, move, battle|
    next if battle.futureSight
    next if !move.pbDamagingMove?
    next if user.item
    next if user.wild?
    targets.each do |b|
      next if b.damageState.unaffected || b.damageState.substitute
      next if !b.item
      next if b.unlosableItem?(b.item) || user.unlosableItem?(b.item)
      battle.pbShowAbilitySplash(user)
      if b.hasActiveAbility?(:STICKYHOLD)
        battle.pbShowAbilitySplash(b) if user.opposes?(b)
        if Battle::Scene::USE_ABILITY_SPLASH
          battle.pbDisplay(_INTL("{1}s Item kann nicht entwendet werden!", b.pbThis))
        end
        battle.pbHideAbilitySplash(b) if user.opposes?(b)
        next
      end
      user.setStolenItem(b.item_id, b)
      user.item = b.item
      b.item = nil
      b.effects[PBEffects::Unburden] = true if b.hasActiveAbility?(:UNBURDEN)
      if battle.wildBattle? && !user.initialItem && user.item == b.initialItem
        user.setInitialItem(user.item)
        b.setInitialItem(nil)
      end
      if Battle::Scene::USE_ABILITY_SPLASH
        battle.pbDisplay(_INTL("{1} hat {2}s {3} gestohlen!", user.pbThis,
           b.pbThis(true), user.itemName))
      else
        battle.pbDisplay(_INTL("{1} hat {2}s {3} mit {4} gestohlen!", user.pbThis,
           b.pbThis(true), user.itemName, user.abilityName))
      end
      battle.pbHideAbilitySplash(user)
      user.pbHeldItemTriggerCheck
      break
    end
  }
)

#===============================================================================
# Pickpocket
#===============================================================================
# Records pickpocketed item to ability bearer's stolen item data.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::AfterMoveUseFromTarget.add(:PICKPOCKET,
  proc { |ability, target, user, move, switched_battlers, battle|
    next if target.wild?
    next if switched_battlers.include?(user.index)
    next if !move.contactMove?
    next if user.effects[PBEffects::Substitute] > 0 || target.damageState.substitute
    next if target.item || !user.item
    next if user.unlosableItem?(user.item) || target.unlosableItem?(user.item)
    battle.pbShowAbilitySplash(target)
    if user.hasActiveAbility?(:STICKYHOLD)
      battle.pbShowAbilitySplash(user) if target.opposes?(user)
      if Battle::Scene::USE_ABILITY_SPLASH
        battle.pbDisplay(_INTL("{1}s Item kann nicht entwendet werden!", user.pbThis))
      end
      battle.pbHideAbilitySplash(user) if target.opposes?(user)
      battle.pbHideAbilitySplash(target)
      next
    end
    target.setStolenItem(user.item_id, user)
    target.item = user.item
    user.item = nil
    user.effects[PBEffects::Unburden] = true if user.hasActiveAbility?(:UNBURDEN)
    if battle.wildBattle? && !target.initialItem && target.item == user.initialItem
      target.setInitialItem(target.item)
      user.setInitialItem(nil)
    end
    battle.pbDisplay(_INTL("{1} hat {2}s {3} stibitzt!", target.pbThis,
       user.pbThis(true), target.itemName))
    battle.pbHideAbilitySplash(target)
    target.pbHeldItemTriggerCheck
  }
)

#===============================================================================
# Ball Fetch
#===============================================================================
# Records fetched Poke Ball to ability bearer's stolen item data.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::EndOfRoundGainItem.add(:BALLFETCH,
  proc { |ability, battler, battle|
    next if battler.item
    next if battle.first_poke_ball.nil?
    battle.pbShowAbilitySplash(battler)
    user.setStolenItem(battle.first_poke_ball)
    battler.item = battle.first_poke_ball
    battler.setInitialItem(battler.item) if !battler.initialItem
    battle.first_poke_ball = nil
    battle.pbDisplay(_INTL("{1} hat den geworfenen {2} zurückgebracht!", battler.pbThis, battler.itemName))
    battle.pbHideAbilitySplash(battler)
    battler.pbHeldItemTriggerCheck
  }
)

#===============================================================================
# Pick Up
#===============================================================================
# Records picked up item to ability bearer's stolen item data.
#-------------------------------------------------------------------------------
Battle::AbilityEffects::EndOfRoundGainItem.add(:PICKUP,
  proc { |ability, battler, battle|
    next if battler.item
    foundItem = nil
    fromBattler = nil
    use = 0
    battle.allBattlers.each do |b|
      next if b.index == battler.index
      next if b.effects[PBEffects::PickupUse] <= use
      foundItem   = b.effects[PBEffects::PickupItem]
      fromBattler = b
      use         = b.effects[PBEffects::PickupUse]
    end
    next if !foundItem
    battle.pbShowAbilitySplash(battler)
    battler.setStolenItem(foundItem, fromBattler)
    battler.item = foundItem
    fromBattler.effects[PBEffects::PickupItem] = nil
    fromBattler.effects[PBEffects::PickupUse]  = 0
    fromBattler.setRecycleItem(nil) if fromBattler.recycleItem == foundItem
    if battle.wildBattle? && !battler.initialItem && fromBattler.initialItem == foundItem
      battler.setInitialItem(foundItem)
      fromBattler.setInitialItem(nil)
    end
    battle.pbDisplay(_INTL("{1} hat das Item {2} gefunden!", battler.pbThis, battler.itemName))
    battle.pbHideAbilitySplash(battler)
    battler.pbHeldItemTriggerCheck
  }
)