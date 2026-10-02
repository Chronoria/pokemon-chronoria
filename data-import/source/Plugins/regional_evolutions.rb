#===============================================================================
# Regional forms by evolution: the pre-evolution holds a type item when it
# evolves (by level, stone, move, friendship...). The item is not consumed.
#
# While holding the item, the pre-evolution already has the target form number.
# It has no data or sprite for that form, so it looks and plays like form 0.
# The form number is kept on evolution (Pokemon#species= keeps @form), and the
# evolution scene already shows the regional sprite.
#===============================================================================
module ChronoriaRegionalEvolutions
  # Pre-evolution => [held item, form of the evolved species]
  HELD_ITEM_FORMS = {
    :PIKACHU   => [:TWISTEDSPOON, 2],   # Raichu (Alola), Donnerstein
    :EXEGGCUTE => [:DRAGONFANG,   1],   # Kokowei (Alola), Blattstein
    :MIMEJR    => [:NEVERMELTICE, 1],   # Pantimos (Galar), kennt Mimikry
    :DEWOTT    => [:BLACKGLASSES, 1],   # Admurai (Hisui), Lv. 36
    :PETILIL   => [:BLACKBELT,    1],   # Dressella (Hisui), Sonnenstein
    :RUFFLET   => [:TWISTEDSPOON, 1],   # Washakwil (Hisui), Lv. 54
    :GOOMY     => [:METALCOAT,    1],   # Viscargot (Hisui), Lv. 40
    :BERGMITE  => [:HARDSTONE,    1],   # Arktilas (Hisui), Lv. 37
    :DARTRIX   => [:BLACKBELT,    1],   # Silvarro (Hisui), Lv. 34
    :MUNCHLAX  => [:NEVERMELTICE, 1],   # Relaxo (Frostform), Freundschaft
    :URSARING  => [:MOONSTONE,    1]    # Ursaluna (Blutmond), Torfblock nachts
  }

  # These species also had the Gen 9 Pack rule (town map region 3 = Hisui),
  # which is kept as a second condition.
  HISUI_REGION_SPECIES = [:DEWOTT, :PETILIL, :RUFFLET, :GOOMY, :BERGMITE, :DARTRIX]

  HELD_ITEM_FORMS.each do |species, (item, form)|
    MultipleForms.register(species, {
      "getForm" => proc { |pkmn|
        # Leave other forms alone (e.g. Spiky-eared Pikachu, form 1)
        next if pkmn.form_simple != 0 && pkmn.form_simple != form
        next form if pkmn.hasItem?(item)
        if HISUI_REGION_SPECIES.include?(species) && $game_map
          map_pos = $game_map.metadata&.town_map_position
          next form if map_pos && map_pos[0] == 3   # Hisui region
        end
        next 0
      }
    })
  end
end
