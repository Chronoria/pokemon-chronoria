#===============================================================================
# Chronoria Battle Fixes - gezielte Raids ohne Raid-Rang
#-------------------------------------------------------------------------------
# Viele legendaere Pokemon haben in Chronoria bewusst KEINEN Raid-Rang mehr,
# damit sie nie zufaellig in einer Hoehle erscheinen. Das Raid-Plugin ersetzt
# aber jede Art ohne Rang durch Ditto - auch dann, wenn ein Event sie gezielt
# angibt:
#
#   RaidBattle.start(:DARKRAI, { :rank => 6 })
#
# Hier gilt deshalb: Eine ausdruecklich genannte Art wird genommen, auch ohne
# Rang. Die zufaellige Auswahl (nil oder ein Filter) ist davon nicht betroffen,
# sie zieht weiterhin nur aus Arten mit Rang.
#===============================================================================
if defined?(pbDefaultRaidSpecies)
  alias chronoria_explicit_pbDefaultRaidSpecies pbDefaultRaidSpecies

  def pbDefaultRaidSpecies(species, rules)
    data = GameData::Species.try_get(species)
    return species if data && data.form == 0 && data.raid_ranks.empty?
    return chronoria_explicit_pbDefaultRaidSpecies(species, rules)
  end
end
