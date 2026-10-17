#===============================================================================
# Chronoria Battle Fixes - Raid-Pool fuer die verteilten Raid-Hoehlen
#-------------------------------------------------------------------------------
# Jede Hoehle mit diesem Skript zieht bei Tagesbeginn eines von 20 ausgewaehlten
# Pokemon. Der Rang (und damit das Level) richtet sich nach den Orden, siehe
# [005] Raid Rank By Badges.rb.
#
# Event:
#   Name:    BasicRaidDen      (Grafik und taegliches Zuruecksetzen macht das Raid-Plugin)
#   Seite 1: keine Bedingung, Aktionstaste
#            Script: chronoria_raid_den
#
# Die Hoehle merkt sich ihr Pokemon, bis der Raid gewonnen ist oder ein neuer
# Kalendertag beginnt. Wer verliert, trifft beim naechsten Versuch auf dasselbe.
#===============================================================================
module ChronoriaRaidPool
  # Ausgewaehlt fuer Chronoria: Pokemon, die es im Spiel sonst gar nicht gibt, und
  # wertvolle, die sonst erst spaet oder nur an einem Ort vorkommen.
  SPECIES = [
    # Pseudo-Legendaere
    :BAGON,       # Kindwurm   - sonst nirgends
    :FRIGIBAX,    # Frospino   - sonst nirgends
    :GIBLE,       # Kaumalat   - sonst erst auf Dracheninsel 2
    # Selten und begehrt
    :EEVEE,       # Evoli      - sonst nur an drei festen Stellen
    :DITTO,       # Ditto      - Zucht, sonst erst spaet
    :CHANSEY,     # Chaneira   - sonst erst auf Route 17
    :CHARCADET,   # Knarbon    - sonst nirgends, entwickelt sich zu Crimanzo/Azugladis
    :DURALUDON,   # Duraludon  - sonst nirgends
    :LAPRAS,      # Lapras     - sonst nirgends
    :PORYGON,     # Porygon    - sonst nirgends
    # Fossil und Raritaeten
    :ARCHEN,      # Flapteryx  - Fossil, sonst nirgends
    :RELICANTH,   # Relicanth  - sonst nirgends
    :TATSUGIRI,   # Nigiragi   - sonst nirgends
    :MILTANK,     # Miltank    - sonst nirgends
    # Solide Teamkameraden, die es sonst nicht gibt
    :MAGIKARP,    # Karpador   - Garados gibt es sonst nicht
    :ELEKID,      # Elekid
    :MAGBY,       # Magby
    :SHINX,       # Sheinux
    :PONYTA,      # Ponita
    :VANILLITE    # Gelatini
  ]

  def self.sample
    return SPECIES.select { |s| GameData::Species.exists?(s) }.sample
  end
end

def chronoria_raid_den(rules = {})
  rules = { :rank => ChronoriaRaidRanks.random_rank }.merge(rules)
  return pbRaidDen(ChronoriaRaidPool.sample, rules)
end
