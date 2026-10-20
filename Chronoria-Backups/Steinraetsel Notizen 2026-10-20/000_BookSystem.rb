#===============================================================================
# BOOK SYSTEM
#===============================================================================
# 
# HOW TO USE THIS BOOK SYSTEM:
# 
# 1. CREATING A BOOK:
#    Add a new entry to the BookConfig::BOOKS hash with a unique ID.
#    Each book has a title and an array of pages (strings).
#
# 2. CALLING A BOOK IN EVENTS:
#    Use: pbCallBook(book_id, "label_name")
#    - book_id: The ID of the book (integer, e.g., 1, 2, 3)
#    - label_name: (Optional) Name of a label to jump to after closing the book
#                  Pass nil or omit this parameter if you don't need label jumping
#
# 3. LABEL JUMPING:
#    After the player closes the book, the script will automatically jump to 
#    the event label you specified. This allows you to continue the event flow
#    at a specific point (useful for branching dialogue).
#
# EXAMPLES:
#    pbCallBook(1)                 # Open book 1, no label jump
#    pbCallBook(1, "after_reading") # Open book 1, jump to "after_reading" label when closed
#
#===============================================================================

module BookConfig
  
  #=============================================================================
  # Define all your books here in this hash.
  # Format: ID => { :title => "Book Title", :pages => ["Page 1 text", "Page 2 text", ...] }
  #=============================================================================
  BOOKS = {
    # Example Book 1: Multi-page book
    1 => {
      :title => "Nasty note from Professor Oak",
      :pages => [
        "You little rat, you still haven't completed the Pokédex??!",
        "If I see you, I'll smash you to pieces",
        "And then throw yourself to the Magikarp!"
      ]
    },
    # Example Book 2: Two-page book
    2 => {
      :title => "Two pages - notes",
      :pages => [
        "I still have to go shopping for some delicious Magikarp meat",
        "But of course, I throw the Magikarp back into the water so it can swim away"
      ]
    },
    # Example Book 3: Single-page book
    3 => {
      :title => "One-page report",
      :pages => [
        "The Pidgeys have become very dangerous lately; Bob died because of them."
      ]
    },
    4 => {
      :title => "Feldnotizen - Titanenbruch-Caverne",
      :pages => [
        "Tag 14 der Grabung: Die Gesteinsschichten hier sind älter, als es die Karten vermuten lassen. Was wir für gewöhnlichen Fels hielten, entpuppt sich als versteinerter Knochen – in einem Ausmaß, das ich noch nie gesehen habe.",
        "Die Ausmaße der Rippen übersteigen alles, was in unseren Aufzeichnungen über heimische Pokémon verzeichnet ist. Falls dieses Wesen einst durch den Titanenbruch wanderte, muss der gesamte Taleinschnitt durch seinen Körper entstanden sein.",
        "Heute Nacht hörten wir ein tiefes Grollen aus dem unteren Stollen, tiefer als jedes Erdbeben. Wir graben morgen nicht weiter. Manche Dinge sollten dort bleiben, wo die Zeit sie begraben hat."
      ]
    },
    5 => {
      :title => "Warnschild am Rand von Faulmoor",
      :pages => [
        "WARNUNG: Betreten auf eigene Gefahr. Der Boden von Faulmoor trägt kein Gewicht, das ihm nicht gehört.",
        "In den letzten drei Jahren sind sieben Reisende im Moor verschwunden. Ihre Ausrüstung wurde gefunden. Sie nicht.",
        "Wer dennoch hindurch muss: Bleib auf den markierten Pfählen und wende dich niemals dem Ruf zu, der aus dem Nebel kommt."
      ]
    },
    6 => {
      :title => "Brief eines Leuchtturmwärters - Solhaven",
      :pages => [
        "Liebe Mira, das Licht brennt noch immer jede Nacht, auch wenn kaum noch Schiffe kommen, seit die neue Route über Ariduna eröffnet wurde.",
        "Manchmal, wenn der Nebel über die Bucht zieht, glaube ich, Flossen im Leuchtkegel zu sehen – größer, als es ein gewöhnliches Wasser-Pokémon sein dürfte. Ich schreibe es dem Alter zu, aber ich schreibe es trotzdem auf.",
        "Komm mich besuchen, wenn die Ernte in Bruchhain eingefahren ist. Der Turm wird kälter, je länger ich allein hier oben bin."
      ]
    },
    7 => {
      :title => "Zerknittertes Blatt - Höhle des Schwarzen Donners",
      :pages => [
        "Niemand, der hier eindringt, um Macht zu suchen, sollte ohne Respekt vor dem Donner sein.",
        "Das Grollen, das man von außen für ein Gewitter hält, hat in dieser Höhle noch nie etwas mit Wolken zu tun gehabt.",
        "Ich habe die Zeichnungen an der Wand kopiert, so gut ich konnte, bevor mich das Licht meiner Fackel verließ. Sie zeigen ein Wesen, das den Blitz nicht fürchtet, sondern ihm folgt."
      ]
    },
    8 => {
      :title => "Notizbuch eines Archäologen - Eldorin-Höhle",
      :pages => [
        "Die Kristallformationen hier wachsen nicht wie gewöhnliches Gestein – sie folgen einem Muster, das sich mit jedem Vollmond leicht verschiebt.",
        "Die Einheimischen aus Mistral erzählen, die Höhle sei vor der Gründung ihres Dorfes bereits alt gewesen. Nach dem, was ich hier sehe, würde ich das nicht anzweifeln.",
        "Ich nehme einen der kleineren Splitter mit zur Untersuchung. Sollte ich in den nächsten Tagen nicht zurückkehren, schickt niemanden allein hinterher."
      ]
    },
    9 => {
      :title => "Tagebuchseite - Rin-Spalte",
      :pages => [
        "Die Erschütterungen werden stärker. Erst dachten wir, es läge an unseren eigenen Sprengungen im Schacht, aber sie halten auch an, wenn die Arbeit ruht.",
        "Kartek meint, es käme aus der Tiefe der Spalte, dort, wo unsere Laternen kein Licht mehr werfen. Ich glaube ihm inzwischen.",
        "Wir haben den unteren Zugang mit Brettern vernagelt. Was auch immer dort unten wohnt, soll bleiben, bis jemand Klügeres als wir sich darum kümmert."
      ]
    },
    10 => {
      :title => "Inschrift in den Ruinen von Morastia",
      :pages => [
        "So spricht der Stein: Ehe Chronoria seinen Namen trug, war dieses Land nur Wasser, Nebel und Warten.",
        "Vier Wächter teilten sich das Land unter sich auf – einer für den Stein, einer für die Flut, einer für den Sturm, einer für das Schweigen.",
        "Wo ihre Namen einst standen, ist der Stein zu glatt geschliffen, um sie noch zu lesen. Vielleicht mit Absicht."
      ]
    },
    11 => {
      :title => "Zettel im Rätselhaus",
      :pages => [
        "Wer diese Zeilen liest, hat bereits den ersten Fehler gemacht: Er hat die Tür hinter sich geschlossen.",
        "Im Rätselhaus verändert sich nichts – außer demjenigen, der glaubt, es verstanden zu haben.",
        "Wenn du einen Ausweg suchst, zähle die Bilder an der Wand noch einmal. Es waren beim letzten Mal nicht dieselbe Anzahl."
      ]
    }
    # To add more books, use this format:
    # 12 => {
    #   :title => "Your Book Title",
    #   :pages => [
    #     "Page 1 content here",
    #     "Page 2 content here",
    #     "Page 3 content here"
    #   ]
    # }
  }
end

#===============================================================================
# SYSTEM CORE
#===============================================================================

# PBook Class: Represents a single book object
# This class stores book data (ID, title, and pages) for use by the BookOverlay
class PBook
  attr_accessor :id, :name, :pages
  
  # Initialize a new book object
  # Parameters:
  #   id: Unique identifier for the book
  #   name: Title of the book (displayed at the top)
  #   pages: Array of strings, each string is one page of text
  def initialize(id, name, pages)
    @id = id
    @name = name
    @pages = pages
  end
  
  # Returns the total number of pages in this book
  def page_count
    @pages.length
  end
end

# Opens a book and displays it to the player
# This is the main function you call from event commands
# Parameters:
#   book_id: The ID of the book to display (must exist in BookConfig::BOOKS)
#   label_name: (Optional) Name of an event label to jump to after closing the book
#              This allows you to continue an event at a specific point
# 
# USAGE EXAMPLES:
#   pbCallBook(1)                    # Open book with ID 1
#   pbCallBook(2, "continue_here")   # Open book with ID 2, jump to label "continue_here" when closed
def pbCallBook(book_id, label_name = nil)
  # Retrieve book data from the configuration
  book_data = BookConfig::BOOKS[book_id]
  if !book_data
    p "Error: Book with ID #{book_id} not found in BookConfig!"
    return
  end
  # Create a book object from the configuration data
  book = PBook.new(book_id, book_data[:title], book_data[:pages])
  # Create the visual overlay and display the book to the player
  BookOverlay.new(book, label_name)
end

# Jumps to a specific event label
# This function is automatically called by the BookOverlay when the book is closed
# if a label_name was provided to pbCallBook()
# 
# How label jumping works:
#   1. Player opens a book with: pbCallBook(1, "my_label")
#   2. Player closes the book
#   3. BookOverlay automatically calls pbCallLabel("my_label")
#   4. This function finds the label in the event and jumps to it
#   5. Event execution continues from that label
#
# In the event editor, create a label with the label command.
# The label name must match exactly (case-sensitive).
#
# Parameters:
#   label_name: The name of the label to jump to
def pbCallLabel(label_name)
  return if !label_name
  # Get the current event interpreter
  interp = pbMapInterpreter rescue nil
  return if !interp
  # Search through all event commands to find the label
  interp.instance_eval do
    return if !@list
    @list.size.times do |i|
      # Code 118 is the label command in RPG Maker XP
      # parameters[0] contains the label name
      if @list[i].code == 118 && @list[i].parameters[0] == label_name
        # Jump to this line index
        @index = i
        return
      end
    end
    p "Error: Label '#{label_name}' was not found in this event!"
  end
end

class BookOverlay
  # Initialize and display the book overlay
  # This creates the visual book interface and handles all user input
  # Parameters:
  #   book: The PBook object to display
  #   label_name: (Optional) Label to jump to when the book is closed
  def initialize(book, label_name = nil)
    @book = book
    @current_page = 1  # Start on page 1
    @label_name = label_name
    
    # Create a viewport for drawing the book UI (z = 99999 puts it on top)
    @viewport = Viewport.new(0, 0, Graphics.width, Graphics.height)
    @viewport.z = 99999
    
    # Create a dark background veil (semi-transparent black overlay)
    @bg_veil = Sprite.new(@viewport)
    @bg_veil.bitmap = Bitmap.new(Graphics.width, Graphics.height)
    @bg_veil.bitmap.fill_rect(0, 0, Graphics.width, Graphics.height, Color.new(4, 8, 18, 190))
    @bg_veil.opacity = 0
    
    # Calculate book UI dimensions and position (centered on screen)
    @ui_width = Graphics.width - 40
    @ui_height = Graphics.height - 60
    @ui_x = (Graphics.width - @ui_width) / 2
    @ui_y = (Graphics.height - @ui_height) / 2
    
    # Create the book background/border
    @base_sprite = Sprite.new(@viewport)
    @base_sprite.bitmap = Bitmap.new(@ui_width + 8, @ui_height + 8)
    @base_sprite.x = @ui_x
    @base_sprite.y = @ui_y + 40
    @base_sprite.opacity = 0
    
    # Create the text/content layer
    @text_sprite = Sprite.new(@viewport)
    @text_sprite.bitmap = Bitmap.new(@ui_width, @ui_height)
    @text_sprite.x = @ui_x
    @text_sprite.y = @ui_y + 40
    @text_sprite.opacity = 0
    
    # Set the font for text rendering
    pbSetSystemFont(@text_sprite.bitmap) rescue nil
    
    # Draw and display the book
    draw_base
    draw_content
    animate_in
    main_loop
  end
  
  # Draw the book background with borders and decorative elements
  def draw_base
    bmp = @base_sprite.bitmap
    bmp.clear
    # Draw drop shadow effect (soft cyan glow)
    bmp.fill_rect(6, 6, @ui_width, @ui_height, Color.new(20, 120, 255, 60))
    # Draw glowing cyan outer border
    bmp.fill_rect(0, 0, @ui_width, @ui_height, Color.new(70, 170, 255))
    # Draw inner navy border
    bmp.fill_rect(2, 2, @ui_width - 4, @ui_height - 4, Color.new(12, 26, 45))
    # Draw main book page background (deep navy)
    bmp.fill_rect(4, 4, @ui_width - 8, @ui_height - 8, Color.new(8, 16, 28))
    # Draw title bar background
    bmp.fill_rect(4, 4, @ui_width - 8, 48, Color.new(12, 26, 45))
    # Draw separator line below title
    bmp.fill_rect(4, 40, @ui_width - 8, 3, Color.new(70, 170, 255))
    # Draw separator line above footer
    bmp.fill_rect(4, @ui_height - 48, @ui_width - 8, 2, Color.new(50, 120, 190))
  end
  
  # Draw all book content (title, page text, and footer)
  def draw_content
    bmp = @text_sprite.bitmap
    bmp.clear
    # Draw the book title with shadow effect
    draw_text_with_shadow(bmp, 0, 10, @ui_width, 36, @book.name, Color.new(220, 240, 255), Color.new(5, 12, 24), 1)
    # Get the current page text
    text = @book.pages[@current_page - 1]
    # Draw the page text with word wrapping
    draw_page_text(bmp, text)
    # Draw page navigation footer
    draw_footer(bmp)
  end
  
  # Draw page text with automatic word wrapping
  # Draw page text with automatic word wrapping
  def draw_page_text(bmp, text)
    # Set margins for text
    margin_x = 32
    text_w = @ui_width - (margin_x * 2)
    
    # Split text into words and wrap them
    words = text.split(" ")
    lines = []
    current_line = ""
    words.each do |word|
      test_line = current_line.empty? ? word : current_line + " " + word
      # If the line is too wide, start a new line
      if bmp.text_size(test_line).width > text_w
        lines << current_line
        current_line = word
      else
        current_line = test_line
      end
    end
    lines << current_line unless current_line.empty?
    
    # Calculate vertical centering for the text block
    line_height = 32
    total_height = lines.size * line_height
    available_height = @ui_height - 55 - 48
    start_y = 55 + ((available_height - total_height) / 2)
    
    # Set text colors (text and shadow)
    col_text = Color.new(190, 220, 245)   # Light cyan text
    col_shadow = Color.new(5, 12, 24)     # Dark navy shadow
    
    # Draw each line of text
    lines.each_with_index do |line, index|
      y = start_y + (index * line_height)
      draw_text_with_shadow(bmp, margin_x, y, text_w, line_height, line, col_text, col_shadow, 1)
    end
  end
  
  # Draw the footer section with page number and navigation arrows
  def draw_footer(bmp)
    footer_y = @ui_height - 34
    page_str = "Seite #{@current_page} / #{@book.page_count}"
    
    # Draw page counter in the center
    draw_text_with_shadow(bmp, 0, footer_y, @ui_width, 32, page_str, Color.new(190, 220, 245), Color.new(5, 12, 24), 1)

    # Draw left arrow (◀) if not on the first page
    if @current_page > 1
      draw_text_with_shadow(bmp, 30, footer_y, 100, 32, "◀", Color.new(90, 190, 255), Color.new(5, 12, 24), 0)
    end

    # Draw right arrow (▶) if not on the last page
    if @current_page < @book.page_count
      draw_text_with_shadow(bmp, @ui_width - 130, footer_y, 100, 32, "▶", Color.new(90, 190, 255), Color.new(5, 12, 24), 2)
    end
  end
  
  # Draw text with shadow effect for better readability
  # Parameters:
  #   bmp: Bitmap to draw on
  #   x, y, w, h: Position and dimensions
  #   text: The text to draw
  #   color: Main text color
  #   shadow_color: Shadow color
  #   align: Text alignment (0 = left, 1 = center, 2 = right)
  def draw_text_with_shadow(bmp, x, y, w, h, text, color, shadow_color, align)
    # Draw shadow (offset by 1-2 pixels)
    bmp.font.color = shadow_color
    bmp.draw_text(x + 1, y + 1, w, h, text, align)
    bmp.draw_text(x + 2, y + 2, w, h, text, align)
    # Draw main text on top
    bmp.font.color = color
    bmp.draw_text(x, y, w, h, text, align)
  end
  
  # Animate page transition with sliding effect
  # Direction: positive for sliding left, negative for sliding right
  def transition_page(direction)
    # Fade out current page while sliding it
    10.times do
      @text_sprite.opacity -= 26
      @text_sprite.x += direction * 3
      Graphics.update
    end
    # Draw the new page
    draw_content
    # Position new page off-screen and fade it in while sliding
    @text_sprite.x = @ui_x - (direction * 30)
    10.times do
      @text_sprite.opacity += 26
      @text_sprite.x += direction * 3
      Graphics.update
    end
    # Reset to final position
    @text_sprite.x = @ui_x
    @text_sprite.opacity = 255
  end
  
  # Animate book opening with fade-in effect
  def animate_in
    15.times do
      @bg_veil.opacity += 13
      @base_sprite.opacity += 17
      @text_sprite.opacity += 17
      @base_sprite.y -= 2.66
      @text_sprite.y -= 2.66
      Graphics.update
    end
    # Ensure final position is exact
    @base_sprite.y = @ui_y
    @text_sprite.y = @ui_y
  end
  
  # Animate book closing with fade-out effect
  def animate_out
    15.times do
      @bg_veil.opacity -= 13
      @base_sprite.opacity -= 17
      @text_sprite.opacity -= 17
      @base_sprite.y += 2.66
      @text_sprite.y += 2.66
      Graphics.update
    end
  end
  
  # Main input handling loop
  # Handles page navigation and closing the book
  def main_loop
    loop do
      Graphics.update
      Input.update
      
      # Handle left page button (A key or L button)
      if Input.trigger?(Input::LEFT) || Input.trigger?(Input::L)
        if @current_page > 1
          pbPlayCursorSE rescue nil
          @current_page -= 1
          transition_page(1)  # Slide page from right to left
        end
      
      # Handle right page button (D key or R button)
      elsif Input.trigger?(Input::RIGHT) || Input.trigger?(Input::R)
        if @current_page < @book.page_count
          pbPlayCursorSE rescue nil
          @current_page += 1
          transition_page(-1)  # Slide page from left to right
        end
      
      # Handle cancel button (B key) to close the book
      elsif Input.trigger?(Input::B)
        pbPlayCancelSE rescue nil
        break
      end
    end
    
    # Close the book with animation
    animate_out
    dispose
    
    # Jump to label if one was specified
    pbCallLabel(@label_name) if @label_name
  end
  
  # Clean up all sprites and viewports
  def dispose
    @bg_veil.bitmap.dispose
    @bg_veil.dispose
    @base_sprite.bitmap.dispose
    @base_sprite.dispose
    @text_sprite.bitmap.dispose
    @text_sprite.dispose
    @viewport.dispose
  end
end