#===============================================================================
# LEGENDS Z-A NEW MOVES
#===============================================================================

#===============================================================================
# This move ignores target's Defense, Special Defense and evasion stat changes.
# This move also can hit Fairy-type. (Nihil Light)
#===============================================================================
class Battle::Move::IgnoreTargetDefSpDefEvaStatStagesHitFairyType < Battle::Move::IgnoreTargetDefSpDefEvaStatStages
  def pbCalcTypeModSingle(moveType, defType, user, target)
    return Effectiveness::NORMAL_EFFECTIVE_MULTIPLIER if moveType == :DRAGON && defType == :FAIRY
    return super
  end
end

#===============================================================================
# LEGENDS Z-A UPDATED MOVES
#===============================================================================

#===============================================================================
# Water Shuriken
#===============================================================================
class Battle::Move::HitTwoToFiveTimesOrThreeForAshGreninja < Battle::Move::HitTwoToFiveTimes
  # Chronoria-Fix: Mega Greninja is form 1 in Chronoria (pokemon_forms_Gen_9_Pack.txt),
  # not form 3. multiHitMove? gets no user, so it used an undefined "user" and crashed
  # on every hit; it now uses the single-hit flag that pbNumHits sets for this move.
  def mega_greninja?(user)
    return user.isSpecies?(:GRENINJA) && user.form == 1
  end

  def multiHitMove?
    return false if @chronoria_single_hit
    return super
  end

  def pbNumHits(user, targets)
    @chronoria_single_hit = mega_greninja?(user)
    return 1 if @chronoria_single_hit
    return 3 if user.isSpecies?(:GRENINJA) && user.form == 2
    return super
  end

  def pbBaseDamage(baseDmg, user, target)
    return 75 if mega_greninja?(user)
    return 20 if user.isSpecies?(:GRENINJA) && user.form == 2
    return super
  end
end