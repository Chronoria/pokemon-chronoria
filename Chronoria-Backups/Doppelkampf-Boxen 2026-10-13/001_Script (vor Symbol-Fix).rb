#=============================================================================
# Adds battle UI option to the options.
#=============================================================================

class PokemonSystem
  attr_accessor :battle_ui

  def initialize
	@battle_ui     = 0     # Default battle ui (see also Settings::BATTLE_UI)
  end
end

# MenuHandlers.add(:options_menu, :battle_ui, {
  # "name"        => _INTL("Battle UI"),
  # "order"       => 105,
  # "type"        => NumberOption,
  # "parameters"  => 1..Settings::BATTLE_UI.length,
  # "description" => _INTL("Choose the appearance of the battle UI."),
  # "get_proc"    => proc { next $game_variables[Settings::UI_VARIABLE] },
  # "set_proc"    => proc { |value, scene| 
  # $game_variables[Settings::UI_VARIABLE] = value if $game_variables
  # }
# })

#=============================================================================
# Edits the Graphics themselves.
#=============================================================================
class Battle::Scene::MenuBase
  def initialize(viewport = nil)
    @x            = 0
    @y            = 0
    @z            = 0
    @visible      = false
    @color        = Color.new(0, 0, 0, 0)
    @index        = 0
    @mode         = 0
    @disposed     = false
    @sprites      = {}
    @visibility   = {}
	# Add another " || $game_variables[Settings::UI_VARIABLE] == #" at the end if your UI is dark.
    if $game_variables && ($game_variables[Settings::UI_VARIABLE] == 1)
    # For dark UI (light text)
	@base_color   = Color.new(248, 248, 248)
    @shadow_color = Color.new(53, 119, 177)
	else
	# For light UI (dark text)
	@base_color   = Color.new(248, 248, 248)
    @shadow_color = Color.new(53, 119, 177)
	end
  end
end

class Battle::Scene::CommandMenu < Battle::Scene::MenuBase
  def initialize(viewport, z)
    super(viewport)
    self.x = 0
    self.y = Graphics.height - 96
    # Create message box (shows "What will X do?")
    @msgBox = Window_UnformattedTextPokemon.newWithSize(
      "", self.x + 16, self.y + 2, 220, Graphics.height - self.y, viewport
    )
    @msgBox.baseColor   = Color.new(248, 248, 248)
    @msgBox.shadowColor = Color.new(53, 119, 177)
    @msgBox.windowskin  = nil
    addSprite("msgBox", @msgBox)
    if USE_GRAPHICS
      # Create background graphic
      background = IconSprite.new(self.x, self.y, viewport)
      background.setBitmap("Graphics/UI/Battle/#{$game_variables[53]}/overlay_command")
      addSprite("background", background)
      # Create bitmaps
      @buttonBitmap = AnimatedBitmap.new("Graphics/UI/Battle/#{$game_variables[53]}/cursor_command")
      # Create action buttons
      @buttons = Array.new(4) do |i|   # 4 command options, therefore 4 buttons
        button = Sprite.new(viewport)
        button.bitmap = @buttonBitmap.bitmap
        button.x = self.x + Graphics.width - 260
        button.x += (i.even? ? 0 : (@buttonBitmap.width / 2) - 4)
        button.y = self.y + 6
        button.y += (((i / 2) == 0) ? 0 : BUTTON_HEIGHT - 4)
        button.src_rect.width  = @buttonBitmap.width / 2
        button.src_rect.height = BUTTON_HEIGHT
        addSprite("button_#{i}", button)
        next button
      end
    else
      # Create command window (shows Fight/Bag/Pokémon/Run)
      @cmdWindow = Window_CommandPokemon.newWithSize(
        [], self.x + Graphics.width - 240, self.y, 240, Graphics.height - self.y, viewport
      )
      @cmdWindow.columns       = 2
      @cmdWindow.columnSpacing = 4
      @cmdWindow.ignore_input  = true
      addSprite("cmdWindow", @cmdWindow)
    end
    self.z = z
    refresh
  end
  
class Battle::Scene::FightMenu < Battle::Scene::MenuBase  
def initialize(viewport, z)
    super(viewport)
    self.x = 0
    self.y = Graphics.height - 96
    @battler   = nil
    @shiftMode = 0
    # NOTE: @mode is for the display of the Mega Evolution button.
    #       0=don't show, 1=show unpressed, 2=show pressed
    if USE_GRAPHICS
      # Create bitmaps
      @buttonBitmap  = AnimatedBitmap.new(_INTL("Graphics/UI/Battle/#{$game_variables[53]}/cursor_fight"))
      @typeBitmap    = AnimatedBitmap.new(_INTL("Graphics/UI/types"))
      @megaEvoBitmap = AnimatedBitmap.new(_INTL("Graphics/UI/Battle/#{$game_variables[53]}/cursor_mega"))
      @shiftBitmap   = AnimatedBitmap.new(_INTL("Graphics/UI/Battle/#{$game_variables[53]}/cursor_shift"))
      # Create background graphic
      background = IconSprite.new(0, Graphics.height - 96, viewport)
      background.setBitmap("Graphics/UI/Battle/#{$game_variables[53]}/overlay_fight")
      addSprite("background", background)
      # Create move buttons
      @buttons = Array.new(Pokemon::MAX_MOVES) do |i|
        button = Sprite.new(viewport)
        button.bitmap = @buttonBitmap.bitmap
        button.x = self.x + 2
        button.x += (i.even? ? 0 : (@buttonBitmap.width / 2))
        button.y = self.y + 2
        button.y += (((i / 2) == 0) ? 0 : BUTTON_HEIGHT)
        button.src_rect.width  = @buttonBitmap.width / 2
        button.src_rect.height = BUTTON_HEIGHT
        addSprite("button_#{i}", button)
        next button
      end
      # Create overlay for buttons (shows move names)
      @overlay = BitmapSprite.new(Graphics.width, Graphics.height - self.y, viewport)
      @overlay.x = self.x
      @overlay.y = self.y
      pbSetNarrowFont(@overlay.bitmap)
      addSprite("overlay", @overlay)
      # Create overlay for selected move's info (shows move's PP)
      @infoOverlay = BitmapSprite.new(Graphics.width, Graphics.height - self.y, viewport)
      @infoOverlay.x = self.x
      @infoOverlay.y = self.y
      pbSetNarrowFont(@infoOverlay.bitmap)
      addSprite("infoOverlay", @infoOverlay)
      # Create type icon
      @typeIcon = Sprite.new(viewport)
      @typeIcon.bitmap = @typeBitmap.bitmap
      @typeIcon.x      = self.x + 416
      @typeIcon.y      = self.y + 20
      @typeIcon.src_rect.height = TYPE_ICON_HEIGHT
      addSprite("typeIcon", @typeIcon)
      # Create Mega Evolution button
      @megaButton = Sprite.new(viewport)
      @megaButton.bitmap = @megaEvoBitmap.bitmap
      @megaButton.x      = self.x + 120
      @megaButton.y      = self.y - (@megaEvoBitmap.height / 2)
      @megaButton.src_rect.height = @megaEvoBitmap.height / 2
      addSprite("megaButton", @megaButton)
      # Create Shift button
      @shiftButton = Sprite.new(viewport)
      @shiftButton.bitmap = @shiftBitmap.bitmap
      @shiftButton.x      = self.x + 4
      @shiftButton.y      = self.y - @shiftBitmap.height
      addSprite("shiftButton", @shiftButton)
    else
      # Create message box (shows type and PP of selected move)
      @msgBox = Window_AdvancedTextPokemon.newWithSize(
        "", self.x + 320, self.y, Graphics.width - 320, Graphics.height - self.y, viewport
      )
      @msgBox.baseColor   = @base_color
      @msgBox.shadowColor = @shadow_color
      pbSetNarrowFont(@msgBox.contents)
      addSprite("msgBox", @msgBox)
      # Create command window (shows moves)
      @cmdWindow = Window_CommandPokemon.newWithSize(
        [], self.x, self.y, 320, Graphics.height - self.y, viewport
      )
      @cmdWindow.columns       = 2
      @cmdWindow.columnSpacing = 4
      @cmdWindow.ignore_input  = true
      pbSetNarrowFont(@cmdWindow.contents)
      addSprite("cmdWindow", @cmdWindow)
    end
    self.z = z
    end
 end
 
  def refreshButtonNames
    moves = (@battler) ? @battler.moves : []
    if !USE_GRAPHICS
      # Fill in command window
      commands = []
      [4, moves.length].max.times do |i|
        commands.push((moves[i]) ? moves[i].name : "-")
      end
      @cmdWindow.commands = commands
      return
    end
    # Draw move names onto overlay
    @overlay.bitmap.clear
    textPos = []
    @buttons.each_with_index do |button, i|
      next if !@visibility["button_#{i}"]
      x = button.x - self.x + (button.src_rect.width / 2)
      y = button.y - self.y + 14
      moveNameBase = TEXT_BASE_COLOR
      if GET_MOVE_TEXT_COLOR_FROM_MOVE_BUTTON && moves[i].display_type(@battler)
        # NOTE: This takes a color from a particular pixel in the button
        #       graphic and makes the move name's base color that same color.
        #       The pixel is at coordinates 10,34 in the button box. If you
        #       change the graphic, you may want to change the below line of
        #       code to ensure the font is an appropriate color.
        moveNameBase = button.bitmap.get_pixel(10, button.src_rect.y + 34)
      end
      textPos.push([moves[i].name, x, y, :center, @base_color, @shadow_color])
    end
    pbDrawTextPositions(@overlay.bitmap, textPos)
  end
end

class Battle::Scene::TargetMenu < Battle::Scene::MenuBase
  attr_accessor :mode

  # Lists of which button graphics to use in different situations/types of battle.
  MODES = [
    [0, 2, 1, 3],   # 0 = Regular battle
    [0, 2, 1, 9],   # 1 = Regular battle with "Cancel" instead of "Run"
    [0, 2, 1, 4],   # 2 = Regular battle with "Call" instead of "Run"
    [5, 7, 6, 3],   # 3 = Safari Zone
    [0, 8, 1, 3]    # 4 = Bug-Catching Contest
  ]
  CMD_BUTTON_WIDTH_SMALL = 170
  TEXT_BASE_COLOR   = Color.new(248, 248, 248)
  TEXT_SHADOW_COLOR = Color.new(53, 119, 177)

  def initialize(viewport, z, sideSizes)
    super(viewport)
    @sideSizes = sideSizes
    maxIndex = (@sideSizes[0] > @sideSizes[1]) ? (@sideSizes[0] - 1) * 2 : (@sideSizes[1] * 2) - 1
    @smallButtons = (@sideSizes.max > 2)
    self.x = 0
    self.y = Graphics.height - 96
    @texts = []
    # NOTE: @mode is for which buttons are shown as selected.
    #       0=select 1 button (@index), 1=select all buttons with text
    # Create bitmaps
    @buttonBitmap = AnimatedBitmap.new("Graphics/UI/Battle/#{$game_variables[53]}/cursor_target")
    # Create target buttons
    @buttons = Array.new(maxIndex + 1) do |i|
      numButtons = @sideSizes[i % 2]
      next if numButtons <= i / 2
      # NOTE: Battler indices go from left to right from the perspective of
      #       that side's trainer, so inc is different for each side for the
      #       same value of i/2.
      inc = (i.even?) ? i / 2 : numButtons - 1 - (i / 2)
      button = Sprite.new(viewport)
      button.bitmap = @buttonBitmap.bitmap
      button.src_rect.width  = (@smallButtons) ? CMD_BUTTON_WIDTH_SMALL : @buttonBitmap.width / 2
      button.src_rect.height = BUTTON_HEIGHT
      if @smallButtons
        button.x    = self.x + 170 - [0, 82, 166][numButtons - 1]
      else
        button.x    = self.x + 138 - [0, 116][numButtons - 1]
      end
      button.x += (button.src_rect.width - 4) * inc
      button.y = self.y + 6
      button.y += (BUTTON_HEIGHT - 4) * ((i + 1) % 2)
      addSprite("button_#{i}", button)
      next button
    end
    # Create overlay (shows target names)
    @overlay = BitmapSprite.new(Graphics.width, Graphics.height - self.y, viewport)
    @overlay.x = self.x
    @overlay.y = self.y
    pbSetNarrowFont(@overlay.bitmap)
    addSprite("overlay", @overlay)
    self.z = z
    refresh
  end
end

class Battle::Scene::PokemonDataBox < Sprite
  def initializeDataBoxGraphic(sideSize)
    onPlayerSide = @battler.index.even?
    # Get the data box graphic and set whether the HP numbers/Exp bar are shown
    if sideSize == 1   # One Pokémon on side, use the regular dara box BG
      bgFilename = ["Graphics/UI/Battle/#{$game_variables[53]}/databox_normal",
                    "Graphics/UI/Battle/#{$game_variables[53]}/databox_normal_foe"][@battler.index % 2]
      # HP numbers now show for every side, not just the player's; the Exp bar
      # stays player-only since the foe has no visible Exp progress to show.
      @show_hp_numbers = true
      @show_exp_bar    = onPlayerSide
    else   # Multiple Pokémon on side, use the thin dara box BG
      bgFilename = ["Graphics/UI/Battle/#{$game_variables[53]}/databox_thin",
                    "Graphics/UI/Battle/#{$game_variables[53]}/databox_thin_foe"][@battler.index % 2]
      @show_hp_numbers = true
      @show_exp_bar    = onPlayerSide
    end
    @databoxBitmap&.dispose
    @databoxBitmap = AnimatedBitmap.new(bgFilename)
    # Determine the co-ordinates of the data box and the left edge padding width
    if onPlayerSide
      @spriteX = Graphics.width - 244
      @spriteY = Graphics.height - 192
      @spriteBaseX = 34
    else
      @spriteX = -16
      @spriteY = 36
      @spriteBaseX = 16
    end
    case sideSize
    when 2
      @spriteX += [-12,  12,  0,  0][@battler.index]
      # Chronoria-Fix: Die KP-Zahlen stehen 50-66 px unter der Oberkante der Box. Mit dem
      # alten Abstand von 54 px lagen sie unter dem Namen der zweiten Box, und die untere
      # Spielerbox ragte hinter das Befehlsmenue. Jetzt 68 px Abstand auf beiden Seiten.
      @spriteY += [-42, -34, 26, 34][@battler.index]
    when 3
      @spriteX += [-12,  12, -6,  6,  0,  0][@battler.index]
      @spriteY += [-42, -46,  4,  0, 50, 46][@battler.index]
      # Chronoria-Fix: Fuer drei Boxen mit KP-Zahlen reicht die Bildhoehe nicht.
      @show_hp_numbers = false
    end
  end
end

class Battle::Scene::AbilitySplashBar < Sprite
  def initialize(side, viewport = nil)
    super(viewport)
    @side    = side
    @battler = nil
    # Create sprite wrapper that displays background graphic
    @bgBitmap = AnimatedBitmap.new("Graphics/UI/Battle/#{$game_variables[53]}/ability_bar")
    @bgSprite = Sprite.new(viewport)
    @bgSprite.bitmap = @bgBitmap.bitmap
    @bgSprite.src_rect.y      = (side == 0) ? 0 : @bgBitmap.height / 2
    @bgSprite.src_rect.height = @bgBitmap.height / 2
    # Create bitmap that displays the text
    @contents = Bitmap.new(@bgBitmap.width, @bgBitmap.height / 2)
    self.bitmap = @contents
    pbSetSystemFont(self.bitmap)
    # Position the bar
    self.x       = (side == 0) ? -Graphics.width / 2 : Graphics.width
    self.y       = (side == 0) ? 180 : 80
    self.z       = 120
    self.visible = false
  end
end