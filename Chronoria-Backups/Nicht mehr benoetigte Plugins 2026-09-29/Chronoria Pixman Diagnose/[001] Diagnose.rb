#===============================================================================
# Pixman-Diagnose: meldet Zeichenbefehle mit ungültigem Rechteck samt Aufrufer.
# Nur im Debug-Modus aktiv. Nach der Fehlersuche den Plugin-Ordner löschen.
#===============================================================================
module PixmanDiagnose
  @reported = {}

  def self.report(what, detail)
    return if !$DEBUG
    stack = caller(2).reject { |l| l.include?("Pixman Diagnose") }.first(4)
    key = stack.first.to_s
    return if @reported[key]
    @reported[key] = true
    echoln("[Pixman-Diagnose] #{what} #{detail}")
    stack.each { |l| echoln("    aus: #{l}") }
  end

  # true, wenn das Zielrechteck nach dem Zuschneiden auf das Bild leer wäre
  def self.empty_target?(bmp, x, y, w, h)
    return true if w <= 0 || h <= 0
    return true if x >= bmp.width || y >= bmp.height || x + w <= 0 || y + h <= 0
    return false
  end
end

class Bitmap
  alias pixman_diag_fill_rect fill_rect
  def fill_rect(*args)
    if args[0].is_a?(Rect)
      r = args[0]
      PixmanDiagnose.report("fill_rect", "Rect(#{r.x},#{r.y},#{r.width},#{r.height}) auf #{width}x#{height}") if PixmanDiagnose.empty_target?(self, r.x, r.y, r.width, r.height)
    elsif args.length >= 4
      PixmanDiagnose.report("fill_rect", "(#{args[0]},#{args[1]},#{args[2]},#{args[3]}) auf #{width}x#{height}") if PixmanDiagnose.empty_target?(self, args[0], args[1], args[2], args[3])
    end
    pixman_diag_fill_rect(*args)
  end

  alias pixman_diag_blt blt
  def blt(x, y, src, rect, *rest)
    if rect.width <= 0 || rect.height <= 0 ||
       PixmanDiagnose.empty_target?(self, x, y, rect.width, rect.height)
      PixmanDiagnose.report("blt", "nach (#{x},#{y}) Quelle Rect(#{rect.x},#{rect.y},#{rect.width},#{rect.height}) auf #{width}x#{height}")
    end
    pixman_diag_blt(x, y, src, rect, *rest)
  end

  alias pixman_diag_stretch_blt stretch_blt
  def stretch_blt(dest, src, rect, *rest)
    if dest.width <= 0 || dest.height <= 0 || rect.width <= 0 || rect.height <= 0 ||
       PixmanDiagnose.empty_target?(self, dest.x, dest.y, dest.width, dest.height)
      PixmanDiagnose.report("stretch_blt", "Ziel Rect(#{dest.x},#{dest.y},#{dest.width},#{dest.height}) auf #{width}x#{height}")
    end
    pixman_diag_stretch_blt(dest, src, rect, *rest)
  end

  alias pixman_diag_draw_text draw_text
  def draw_text(*args)
    if args[0].is_a?(Rect)
      r = args[0]
      PixmanDiagnose.report("draw_text", "Rect(#{r.x},#{r.y},#{r.width},#{r.height})") if PixmanDiagnose.empty_target?(self, r.x, r.y, r.width, r.height)
    elsif args.length >= 5
      PixmanDiagnose.report("draw_text", "(#{args[0]},#{args[1]},#{args[2]},#{args[3]})") if PixmanDiagnose.empty_target?(self, args[0], args[1], args[2], args[3])
    end
    pixman_diag_draw_text(*args)
  end
end
