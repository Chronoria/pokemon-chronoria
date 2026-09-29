#===============================================================================
# Events mit Tile-Grafik aus sehr hohen Tilesets.
#
# PROBLEM: pbGetTileBitmap lädt für jedes Tile-Event das komplette Tileset.
# Ist es höher als die maximale Texturgröße (z.B. "Fusion Tileset" mit
# 45442 px), behandelt mkxp-z es als "Mega-Surface" und rechnet in Software
# über pixman. Das Kopieren eines Tiles daraus erzeugt die Konsolenmeldung
#   "In pixman_region_union_rect: Invalid rectangle passed"
# und ist bei jedem Tile-Event erneut langsam.
#
# LÖSUNG: Die Karte hat dasselbe Tileset bereits in zerlegter Form geladen
# (TilemapRenderer::TilesetWrapper verteilt es auf mehrere Spalten, die in eine
# Textur passen). Das Tile wird von dort kopiert. Ist keine zerlegte Fassung
# vorhanden (normal großes Tileset oder keine Karte aktiv), läuft alles wie im
# Original.
#===============================================================================
module ChronoriaTileEventFix
  # Zerlegte Fassung des Tilesets aus der aktuellen Karte, sonst nil.
  def self.wrapped_tileset(filename)
    return nil if !$scene.is_a?(Scene_Map)
    renderer = $scene.map_renderer
    return nil if !renderer || renderer.disposed?
    tilesets = renderer.instance_variable_get(:@tilesets)
    return nil if !tilesets
    wraps = tilesets.instance_variable_get(:@bitmap_wraps)
    return nil if !wraps || !wraps[filename]
    bitmap = tilesets[filename]
    return nil if !bitmap || bitmap.disposed?
    return bitmap
  end

  # Baut die Grafik eines Tile-Events (width x height Tiles, tile_id ist die
  # untere linke Ecke) aus der zerlegten Fassung zusammen.
  def self.tile_bitmap(wrapped, tile_id, hue, width, height)
    per_row = TilemapRenderer::TILESET_TILES_PER_ROW
    tw      = TilemapRenderer::SOURCE_TILE_WIDTH
    th      = TilemapRenderer::SOURCE_TILE_HEIGHT
    index   = tile_id - TilemapRenderer::TILESET_START_ID
    src_x   = (index % per_row) * tw
    top_row = (index / per_row) - height + 1
    ret = Bitmap.new(tw * width, th * height)
    height.times do |k|
      y = (top_row + k) * th   # Position im unzerlegten Tileset
      next if y < 0
      col = y / wrapped.height
      ret.blt(0, k * th, wrapped,
              Rect.new(src_x + (col * per_row * tw), y - (col * wrapped.height), tw * width, th))
    end
    ret.hue_change(hue) if hue != 0
    return ret
  end
end

alias chronoria_tile_fix_pbGetTileBitmap pbGetTileBitmap
def pbGetTileBitmap(filename, tile_id, hue, width = 1, height = 1)
  wrapped = ChronoriaTileEventFix.wrapped_tileset(filename)
  return chronoria_tile_fix_pbGetTileBitmap(filename, tile_id, hue, width, height) if !wrapped
  return ChronoriaTileEventFix.tile_bitmap(wrapped, tile_id, hue, width, height)
end
