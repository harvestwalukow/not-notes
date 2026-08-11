export const starterFolders = [
  { id: 'all', name: 'All Notes', icon: 'cloud', count: 9 },
  { id: 'notes', name: 'Notes', icon: 'file', count: 4 },
  { id: 'recently-deleted', name: 'Recently Deleted', icon: 'trash', count: 1 },
  { id: 'travel', name: 'Travel Plans', icon: 'folder', count: 5, custom: true },
  { id: 'japan-october', name: 'Japan in October', icon: 'folder', count: 5, custom: true, child: true },
  { id: 'kyoto', name: 'Kyoto', icon: 'folder', count: 1, custom: true, child: true },
  { id: 'tokyo', name: 'Tokyo', icon: 'folder', count: 1, custom: true, child: true },
  { id: 'packing', name: 'Packing list', icon: 'folder', count: 1, custom: true, child: true },
]

export const starterNotes = [
  {
    id: 'japan-october', folder: 'travel', title: 'Japan in October', date: 'Today', time: '10:24 AM', pinned: true,
    preview: 'Itinerary overview and ideas for our trip to Japan this October.',
    body: `<h1>Japan in October</h1><p class="lead">Itinerary overview and ideas for our trip to Japan this October.</p><h2>Overview</h2><p>Two weeks to explore Kyoto, Tokyo, and a few day trips along the way.<br>Focus on culture, food, and seasonal scenery.</p><h2>Itinerary</h2><ul><li>Oct 10 — Arrive in Tokyo</li><li>Oct 11 — Explore Shinjuku and Shibuya</li><li>Oct 12 — Day trip to Nikko</li><li>Oct 13 — Train to Kyoto</li><li>Oct 13–17 — Kyoto: temples, gardens, and neighborhoods</li><li>Oct 18 — Day trip to Nara</li><li>Oct 19 — Return to Tokyo</li><li>Oct 20 — Explore Tokyo</li><li>Oct 21 — Depart</li></ul><hr><h2>Notes</h2><ul class="checklist"><li class="checked">Book flights</li><li>Reserve ryokan in Kyoto</li><li>Suica card for Tokyo</li><li>Check fall foliage forecast</li></ul>`,
  },
  { id: 'kyoto', folder: 'travel', title: 'Kyoto', date: 'Yesterday', time: '6:12 PM', pinned: false, preview: 'Temples, gardens, and things to see', body: '<h1>Kyoto</h1><p class="lead">Temples, gardens, and things to see.</p><h2>Must visit</h2><ul><li>Kiyomizu-dera at opening</li><li>Philosopher’s Path</li><li>Fushimi Inari before sunrise</li></ul><h2>Food</h2><p>Nishiki Market, yudofu, matcha and a quiet kaiseki dinner.</p>' },
  { id: 'tokyo', folder: 'travel', title: 'Tokyo', date: 'Yesterday', time: '2:40 PM', pinned: false, preview: 'Neighborhoods, food spots, and day trips', body: '<h1>Tokyo</h1><p class="lead">Neighborhoods, food spots, and day trips.</p><h2>Neighborhoods</h2><p>Daikanyama, Kichijoji, Yanaka, and Shimokitazawa.</p><h2>Bookmarks</h2><ul><li>TeamLab Borderless</li><li>Tsutaya Books</li><li>Nezu Museum</li></ul>' },
  { id: 'packing', folder: 'travel', title: 'Packing list', date: 'Aug 9, 2026', time: '8:03 AM', pinned: false, preview: 'Clothing, gear, and essentials', body: '<h1>Packing list</h1><p class="lead">Clothing, gear, and essentials.</p><ul class="checklist"><li class="checked">Passport</li><li>Light rain jacket</li><li>Walking shoes</li><li>Travel adapter</li><li>Camera</li></ul>' },
  { id: 'budget', folder: 'travel', title: 'Budget', date: 'Aug 6, 2026', time: '4:19 PM', pinned: false, preview: 'Estimated costs and daily budget', body: '<h1>Budget</h1><p class="lead">Estimated costs and daily budget.</p><h2>Plan</h2><p>Keep a shared daily envelope for trains, meals, and tickets.</p>' },
  { id: 'books', folder: 'personal', title: 'Books to read', date: 'Aug 5, 2026', time: '9:15 PM', pinned: true, preview: 'The stack beside the bed is growing again', body: '<h1>Books to read</h1><p class="lead">The stack beside the bed is growing again.</p><ul class="checklist"><li>Orbital — Samantha Harvey</li><li>Small Things Like These — Claire Keegan</li><li>The Creative Act — Rick Rubin</li></ul>' },
  { id: 'recipe', folder: 'personal', title: 'Sunday pasta', date: 'Aug 3, 2026', time: '12:18 PM', pinned: false, preview: 'Tomatoes, anchovy, lemon, plenty of herbs', body: '<h1>Sunday pasta</h1><p class="lead">Tomatoes, anchovy, lemon, plenty of herbs.</p><p>Start the sauce slowly. Save more pasta water than you think you need.</p>' },
  { id: 'studio', folder: 'ideas', title: 'Studio ideas', date: 'Jul 29, 2026', time: '11:40 AM', pinned: false, preview: 'A quieter desk, better light, fewer cables', body: '<h1>Studio ideas</h1><p class="lead">A quieter desk, better light, fewer cables.</p><ul><li>Move desk toward the window</li><li>One warm task lamp</li><li>Hide charging station inside drawer</li></ul>' },
  { id: 'words', folder: 'ideas', title: 'Words worth keeping', date: 'Jul 22, 2026', time: '7:09 PM', pinned: false, preview: 'Fragments, titles, and sentences', body: '<h1>Words worth keeping</h1><p class="lead">Fragments, titles, and sentences.</p><blockquote>Attention is the beginning of devotion.</blockquote>' },
]
