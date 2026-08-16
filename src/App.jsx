import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AlignLeft, Bold, CheckSquare, ChevronDown, ChevronLeft, Cloud, FileText, Folder,
  FolderPlus, Grid2X2, Italic, Link, List, ListOrdered, Menu, Moon, MoreHorizontal,
  PanelLeftClose, PanelLeftOpen, Pin, Plus, Search, Share2, Sun, Trash2,
  Underline, X, CircleUserRound, CloudOff, RefreshCw, Pencil, AlertTriangle,
} from 'lucide-react'
import { starterFolders, starterNotes } from './data'
import { AuthDialog } from './AuthDialog'
import { useCloudSync } from './useCloudSync'

const STORAGE_KEY = 'noest-state-v2'

function IconButton({ label, children, active = false, onClick, className = '' }) {
  return <button className={`noest-icon-button ${active ? 'active' : ''} ${className}`} aria-label={label} title={label} onClick={onClick}>{children}</button>
}

function FolderIcon({ type, size = 18 }) {
  if (type === 'cloud') return <Cloud size={size} />
  if (type === 'file') return <FileText size={size} />
  if (type === 'trash') return <Trash2 size={size} />
  return <Folder size={size} />
}

function FolderActionDialog({ action, onClose, onCreate, onRename, onDelete }) {
  const [name, setName] = useState(action?.folder.name || '')
  if (!action) return null
  const isDelete = action.type === 'delete'
  const isCreate = action.type === 'create'
  const submit = event => {
    event.preventDefault()
    if (isDelete) onDelete(action.folder.id)
    else if (isCreate && name.trim()) onCreate(name.trim())
    else if (name.trim()) onRename(action.folder.id, name.trim())
    onClose()
  }
  return (
    <div className="folder-dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <form className="folder-dialog" role="dialog" aria-modal="true" aria-labelledby="folder-dialog-title" onSubmit={submit}>
        {isDelete && <div className="folder-dialog-icon"><AlertTriangle size={21}/></div>}
        <h2 id="folder-dialog-title">{isDelete ? `Delete “${action.folder.name}”?` : isCreate ? 'New Folder' : 'Rename Folder'}</h2>
        {isDelete ? <p>Notes in this folder will be moved to <strong>Notes</strong>. They won’t be deleted.</p> : <label>Folder name<input autoFocus value={name} onChange={event => setName(event.target.value)} onFocus={event => event.target.select()} /></label>}
        <div className="folder-dialog-actions"><button type="button" onClick={onClose}>Cancel</button><button className={isDelete ? 'danger' : 'primary'} disabled={!isDelete && !name.trim()}>{isDelete ? 'Delete Folder' : isCreate ? 'Create' : 'Rename'}</button></div>
      </form>
    </div>
  )
}

function SignOutDialog({ open, email, onClose, onConfirm }) {
  if (!open) return null
  return (
    <div className="folder-dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()} onKeyDown={event => event.key === 'Escape' && onClose()}>
      <section className="folder-dialog" role="dialog" aria-modal="true" aria-labelledby="signout-dialog-title">
        <div className="folder-dialog-icon"><AlertTriangle size={21}/></div>
        <h2 id="signout-dialog-title">Sign out of Noest?</h2>
        <p>You’re signed in as <strong>{email}</strong>. This device will stop syncing until you sign in again.</p>
        <div className="folder-dialog-actions">
          <button type="button" autoFocus onClick={onClose}>Stay Signed In</button>
          <button type="button" className="danger" onClick={onConfirm}>Sign Out</button>
        </div>
      </section>
    </div>
  )
}

function Sidebar({ folders, activeFolder, setActiveFolder, createFolder, renameFolder, deleteFolder, sidebarOpen, closeMobile }) {
  const [folderMenu, setFolderMenu] = useState(null)
  const [folderAction, setFolderAction] = useState(null)
  const system = folders.filter(folder => !folder.custom)
  const custom = folders.filter(folder => folder.custom)
  const choose = id => { setFolderMenu(null); setActiveFolder(id); closeMobile?.() }
  const openMenu = (event, folder) => { event.preventDefault(); event.stopPropagation(); setFolderMenu(folderMenu === folder.id ? null : folder.id) }
  return (
    <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
      <div className="brand-row"><span>Noest</span><button className="mobile-close" onClick={closeMobile} aria-label="Close menu"><X size={20}/></button></div>
      <nav aria-label="Folders">
        <div className="folder-group">
          {system.map(folder => <button key={folder.id} className={`folder-row ${activeFolder === folder.id ? 'selected' : ''}`} onClick={() => choose(folder.id)}><span className="folder-name"><FolderIcon type={folder.icon}/>{folder.name}</span><span className="folder-count">{folder.count}</span></button>)}
        </div>
        <div className="section-heading"><span>Folders</span><ChevronDown size={15}/></div>
        <div className="folder-group custom-folders">
          {custom.map(folder => <div key={folder.id} className={`folder-row-wrap ${activeFolder === folder.id ? 'selected' : ''}`} onContextMenu={event => openMenu(event, folder)}>
            <button className={`folder-row ${folder.child ? 'child-folder' : ''}`} onClick={() => choose(folder.id)}><span className="folder-name"><FolderIcon type={folder.icon}/>{folder.name}</span><span className="folder-count">{folder.count}</span></button>
            <button className="folder-more" aria-label={`More actions for ${folder.name}`} onClick={event => openMenu(event, folder)}><MoreHorizontal size={16}/></button>
            {folderMenu === folder.id && <div className="folder-context-menu" role="menu">
              <button role="menuitem" onClick={() => { setFolderAction({ type: 'rename', folder }); setFolderMenu(null) }}><Pencil size={15}/>Rename</button>
              <button role="menuitem" className="danger" onClick={() => { setFolderAction({ type: 'delete', folder }); setFolderMenu(null) }}><Trash2 size={15}/>Delete Folder</button>
            </div>}
          </div>)}
        </div>
      </nav>
      <button className="new-folder" onClick={() => setFolderAction({ type: 'create', folder: { id: '', name: '' } })}><FolderPlus size={18}/>New Folder</button>
      {folderMenu && <button className="folder-menu-scrim" aria-label="Close folder menu" onClick={() => setFolderMenu(null)}/>} 
      <FolderActionDialog key={folderAction ? `${folderAction.type}-${folderAction.folder.id}-${folderAction.folder.name}` : 'closed'} action={folderAction} onClose={() => setFolderAction(null)} onCreate={createFolder} onRename={renameFolder} onDelete={deleteFolder}/>
    </aside>
  )
}

function NoteRow({ note, selected, onSelect, onPin, folderName }) {
  return (
    <article className={`note-row ${selected ? 'selected' : ''}`} onClick={onSelect} tabIndex="0" onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect()}>
      <div className="note-row-top"><h3>{note.title || 'New Note'}</h3><button className="pin-button" aria-label={note.pinned ? 'Unpin note' : 'Pin note'} onClick={e => { e.stopPropagation(); onPin() }}><Pin size={14} fill={note.pinned ? 'currentColor' : 'none'}/></button></div>
      <p className="note-meta"><span>{note.date}</span><span>{note.preview || 'No additional text'}</span></p>
      <span className="note-folder"><Folder size={13}/>{folderName}</span>
    </article>
  )
}

function NotesList({ notes, folders, selectedNote, setSelectedNote, query, setQuery, togglePin, sortMode, setSortMode, listMode, setListMode, activeFolder, mobileView, backToFolders }) {
  const heading = activeFolder === 'all' ? 'All Notes' : activeFolder === 'travel' ? 'Travel Plans' : activeFolder === 'japan-october' ? 'Japan in October' : activeFolder === 'kyoto' ? 'Kyoto' : activeFolder === 'tokyo' ? 'Tokyo' : activeFolder === 'packing' ? 'Packing list' : 'Notes'
  return (
    <section className={`notes-panel ${mobileView === 'list' ? 'mobile-current' : ''}`}>
      <header className="mobile-panel-header"><IconButton label="Folders" onClick={backToFolders}><ChevronLeft size={21}/></IconButton><strong>{heading}</strong><span /></header>
      <div className="list-controls">
        <div className="search-wrap"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" aria-label="Search notes"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}</div>
        <IconButton label={listMode === 'list' ? 'Grid view' : 'List view'} onClick={() => setListMode(listMode === 'list' ? 'grid' : 'list')}>{listMode === 'list' ? <Grid2X2 size={17}/> : <List size={18}/>}</IconButton>
      </div>
      <button className="sort-control" onClick={() => setSortMode(sortMode === 'edited' ? 'title' : 'edited')}>Sorted by {sortMode === 'edited' ? 'Date Edited' : 'Title'}<ChevronDown size={14}/></button>
      <div className={`note-list ${listMode}`}>
        {notes.length ? notes.map(note => <NoteRow key={note.id} note={note} folderName={folders.find(folder => folder.id === note.folder)?.name || 'Notes'} selected={selectedNote === note.id} onSelect={() => setSelectedNote(note.id)} onPin={() => togglePin(note.id)}/>) : <div className="empty-list"><Search size={26}/><strong>No notes found</strong><span>Try another search.</span></div>}
      </div>
      <footer className="list-footer">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</footer>
    </section>
  )
}

function EditorToolbar({ command }) {
  const [blockStyle, setBlockStyle] = useState('p')
  const [fontSize, setFontSize] = useState('16')
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('https://')
  const changeBlockStyle = event => {
    const value = event.target.value
    setBlockStyle(value)
    command('formatBlock', value)
  }
  const changeFontSize = event => {
    const value = event.target.value
    setFontSize(value)
    command('fontSize', value)
  }
  const applyLink = event => {
    event.preventDefault()
    const url = linkUrl.trim()
    if (!url || url === 'https://') return
    command('createLink', url)
    setLinkOpen(false)
    setLinkUrl('https://')
  }
  return (
    <div className="editor-toolbar" aria-label="Formatting toolbar">
      <label className="select-control"><span className="sr-only">Text style</span><select aria-label="Text style" value={blockStyle} onChange={changeBlockStyle}><option value="p">Body</option><option value="h1">Title</option><option value="h2">Heading</option><option value="h3">Subheading</option><option value="blockquote">Quote</option></select><ChevronDown size={13}/></label><span className="toolbar-separator"/>
      <label className="select-control size-menu"><span className="sr-only">Text size</span><select aria-label="Text size" value={fontSize} onChange={changeFontSize}><option value="14">14</option><option value="16">16</option><option value="18">18</option><option value="20">20</option><option value="24">24</option><option value="32">32</option></select><ChevronDown size={13}/></label><span className="toolbar-separator"/>
      <IconButton label="Bold" onClick={() => command('bold')}><Bold size={17}/></IconButton>
      <IconButton label="Italic" onClick={() => command('italic')}><Italic size={17}/></IconButton>
      <IconButton label="Underline" onClick={() => command('underline')}><Underline size={17}/></IconButton>
      <span className="toolbar-separator"/>
      <IconButton label="Checklist" onClick={() => command('checklist')}><CheckSquare size={17}/></IconButton>
      <IconButton label="Bulleted list" onClick={() => command('unorderedList')}><List size={18}/></IconButton>
      <IconButton label="Numbered list" onClick={() => command('orderedList')}><ListOrdered size={18}/></IconButton>
      <IconButton label="Align left" onClick={() => command('justifyLeft')}><AlignLeft size={18}/></IconButton>
      <div className="link-control"><IconButton label="Insert link" active={linkOpen} onClick={() => setLinkOpen(open => !open)}><Link size={17}/></IconButton>{linkOpen && <form className="link-popover" onSubmit={applyLink}><label><span>Link URL</span><input autoFocus type="url" value={linkUrl} onChange={event => setLinkUrl(event.target.value)} onFocus={event => event.target.select()} placeholder="https://example.com" required/></label><div><button type="button" onClick={() => { command('unlink'); setLinkOpen(false) }}>Remove link</button><button type="button" onClick={() => setLinkOpen(false)}>Cancel</button><button className="link-apply" disabled={!linkUrl.trim() || linkUrl.trim() === 'https://'}>Apply</button></div></form>}</div>
    </div>
  )
}

function setChecklist(list, enabled) {
  if (!list) return
  list.classList.toggle('checklist', enabled)
  list.querySelectorAll(':scope > li').forEach(item => {
    const existing = item.querySelector(':scope > input[type="checkbox"]')
    if (!enabled) { existing?.remove(); return }
    if (existing) return
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.contentEditable = 'false'
    checkbox.checked = item.classList.contains('checked')
    item.prepend(checkbox)
  })
}

const CHECKED_MARKER = /^\s*(?:☑|☒|✅|✓|✔|\[[xX]\])\s*/
const UNCHECKED_MARKER = /^\s*(?:☐|□|○|◯|\[\s\])\s*/

function escapeHtml(value) {
  const element = document.createElement('div')
  element.textContent = value
  return element.innerHTML
}

function stripChecklistMarker(item) {
  const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const match = node.data.match(CHECKED_MARKER) || node.data.match(UNCHECKED_MARKER)
    if (match) {
      node.data = node.data.slice(match[0].length)
      item.querySelectorAll('span:empty').forEach(span => span.remove())
      return true
    }
    if (node.data.trim()) return false
    node = walker.nextNode()
  }
  return false
}

function appleTextMetadata(element) {
  const nodes = [element, ...element.querySelectorAll('[data-tt]')]
  for (const node of nodes) {
    const value = node.getAttribute?.('data-tt')
    if (!value) continue
    try {
      return JSON.parse(value)
    } catch {
      // Ignore clipboard metadata we do not understand.
    }
  }
  return null
}

function appleTodoState(item) {
  const todo = appleTextMetadata(item)?.paragraphStyle?.todo
  return todo && typeof todo === 'object' ? { found: true, checked: Boolean(todo.done) } : { found: false, checked: false }
}

function normalizeAppleTextStyles(container) {
  const firstBlock = container.firstElementChild
  const style = firstBlock ? appleTextMetadata(firstBlock)?.paragraphStyle?.style : null
  if (firstBlock?.tagName !== 'P' || style !== 0) return
  const title = document.createElement('h1')
  while (firstBlock.firstChild) title.appendChild(firstBlock.firstChild)
  firstBlock.replaceWith(title)
}

function checklistState(item) {
  const appleTodo = appleTodoState(item)
  if (appleTodo.found) return appleTodo.checked
  const input = item.querySelector('input[type="checkbox"]')
  const stateNode = item.querySelector('[aria-checked], [data-checked], [data-state]')
  const state = `${item.getAttribute('aria-checked') || ''} ${item.getAttribute('data-checked') || ''} ${item.getAttribute('data-state') || ''} ${stateNode?.getAttribute('aria-checked') || ''} ${stateNode?.getAttribute('data-checked') || ''} ${stateNode?.getAttribute('data-state') || ''}`.toLowerCase()
  return Boolean(input?.checked || input?.hasAttribute('checked') || item.classList.contains('checked') || /(?:^|\s)(?:true|checked|complete|completed|done)(?:\s|$)/.test(state) || CHECKED_MARKER.test(item.textContent || ''))
}

function hasChecklistHint(list) {
  const items = [...list.querySelectorAll(':scope > li')]
  const signature = `${list.className || ''} ${list.getAttribute('style') || ''} ${list.getAttribute('data-list-type') || ''} ${list.getAttribute('data-type') || ''} ${items.map(item => `${item.className || ''} ${item.getAttribute('style') || ''} ${item.getAttribute('data-list-type') || ''} ${item.getAttribute('data-type') || ''}`).join(' ')}`
  const everyItemHasMarker = items.length > 0 && items.every(item => CHECKED_MARKER.test(item.textContent || '') || UNCHECKED_MARKER.test(item.textContent || ''))
  const everyItemIsAppleTodo = items.length > 0 && items.every(item => appleTodoState(item).found)
  return Boolean(list.querySelector('input[type="checkbox"], [role="checkbox"], [aria-checked], [data-checked], [data-task], [data-list-type*="check"], [data-type*="check"]') || /(?:checklist|check-list|task-list|tasklist|todo|to-do|apple-todo|apple-checklist)/i.test(signature) || everyItemHasMarker || everyItemIsAppleTodo)
}

function plainChecklistHtml(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  if (!lines.some(line => CHECKED_MARKER.test(line) || UNCHECKED_MARKER.test(line))) return null
  let html = ''
  let listOpen = false
  for (const line of lines) {
    const checked = CHECKED_MARKER.test(line)
    const unchecked = UNCHECKED_MARKER.test(line)
    if (checked || unchecked) {
      if (!listOpen) { html += '<ul class="checklist">'; listOpen = true }
      const content = line.replace(checked ? CHECKED_MARKER : UNCHECKED_MARKER, '')
      html += `<li${checked ? ' class="checked"' : ''}>${escapeHtml(content)}</li>`
    } else {
      if (listOpen) { html += '</ul>'; listOpen = false }
      html += line ? `<p>${escapeHtml(line)}</p>` : '<p><br></p>'
    }
  }
  if (listOpen) html += '</ul>'
  return html
}

function normalizedChecklistPaste(html, text) {
  if (!html) {
    const plainHtml = plainChecklistHtml(text)
    return plainHtml ? { html: plainHtml, converted: true } : { html: '', converted: false }
  }
  const container = document.createElement('div')
  container.innerHTML = html
  container.querySelectorAll('script, style, meta, link').forEach(element => element.remove())
  container.querySelectorAll('*').forEach(element => {
    for (const attribute of [...element.attributes]) {
      if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name)
    }
  })
  normalizeAppleTextStyles(container)
  let converted = false
  for (const originalList of [...container.querySelectorAll('ul, ol')]) {
    if (!hasChecklistHint(originalList)) continue
    let list = originalList
    if (list.tagName === 'OL') {
      const replacement = document.createElement('ul')
      for (const attribute of [...list.attributes]) replacement.setAttribute(attribute.name, attribute.value)
      while (list.firstChild) replacement.appendChild(list.firstChild)
      list.replaceWith(replacement)
      list = replacement
    }
    list.classList.add('checklist')
    list.querySelectorAll(':scope > li').forEach(item => {
      const checked = checklistState(item)
      stripChecklistMarker(item)
      item.querySelectorAll('input[type="checkbox"], [role="checkbox"]').forEach(control => control.remove())
      item.classList.toggle('checked', checked)
    })
    converted = true
  }
  if (converted) return { html: container.innerHTML, converted: true }
  const plainHtml = plainChecklistHtml(text)
  return plainHtml ? { html: plainHtml, converted: true } : { html: container.innerHTML, converted: false }
}

function repairPastedBlocks(editor) {
  for (const parent of [...editor.querySelectorAll('h1, h2, h3, p')]) {
    const nestedBlocks = [...parent.children].filter(child => /^(?:UL|OL|H1|H2|H3|P|BLOCKQUOTE)$/.test(child.tagName))
    if (!nestedBlocks.length || !parent.parentNode) continue
    const reference = parent.nextSibling
    nestedBlocks.forEach(block => parent.parentNode.insertBefore(block, reference))
    if (!parent.textContent.trim()) parent.remove()
  }
}

function NoteEditor({ note, updateNoteBody, deleteNote, onBack, mobileView, saveLabel }) {
  const editorRef = useRef(null)
  const selectionRef = useRef(null)
  useLayoutEffect(() => {
    const editor = editorRef.current
    if (!editor || !note) return
    if (editor.innerHTML !== note.body) editor.innerHTML = note.body
    editor.querySelectorAll('ul.checklist').forEach(list => setChecklist(list, true))
    editor.scrollTop = editor.scrollHeight
  }, [note?.id, note?.body])
  const save = () => editorRef.current && note && updateNoteBody(note.id, editorRef.current.innerHTML)
  const rememberSelection = () => {
    const selection = window.getSelection()
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) selectionRef.current = selection.getRangeAt(0).cloneRange()
  }
  const restoreSelection = () => {
    editorRef.current?.focus()
    if (!selectionRef.current) return
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(selectionRef.current)
  }
  const selectedList = () => {
    const selection = window.getSelection()
    const anchor = selection?.anchorNode
    const element = anchor?.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor
    return element?.closest?.('ul, ol') || null
  }
  const command = (name, value = null) => {
    restoreSelection()
    if (name === 'fontSize') {
      document.execCommand('styleWithCSS', false, false)
      document.execCommand('fontSize', false, '7')
      editorRef.current?.querySelectorAll('font[size="7"]').forEach(element => {
        element.removeAttribute('size')
        element.style.fontSize = `${value}px`
      })
    } else if (name === 'checklist') {
      const list = selectedList()
      if (list?.matches('ul.checklist')) setChecklist(list, false)
      else if (list?.matches('ul')) setChecklist(list, true)
      else {
        document.execCommand('insertUnorderedList')
        setChecklist(selectedList(), true)
      }
    } else if (name === 'unorderedList') {
      const list = selectedList()
      if (list?.matches('ul.checklist')) setChecklist(list, false)
      else document.execCommand('insertUnorderedList')
    } else if (name === 'orderedList') {
      const list = selectedList()
      if (list?.matches('ul.checklist')) setChecklist(list, false)
      document.execCommand('insertOrderedList')
    } else if (name === 'justifyLeft') {
      document.execCommand(name, false, value)
      const selection = window.getSelection()
      const anchor = selection?.anchorNode
      const element = anchor?.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor
      const block = element?.closest?.('h1, h2, h3, p, blockquote, li, div')
      if (block && editorRef.current?.contains(block)) block.style.textAlign = 'left'
      else editorRef.current?.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > p, :scope > blockquote, :scope > ul, :scope > ol, :scope > div').forEach(item => { item.style.textAlign = 'left' })
    } else document.execCommand(name, false, value)
    save()
    rememberSelection()
  }
  const handleChecklistClick = event => {
    if (!event.target.matches?.('.checklist input[type="checkbox"]')) return
    const item = event.target.closest('li')
    item?.classList.toggle('checked', event.target.checked)
    if (event.target.checked) event.target.setAttribute('checked', '')
    else event.target.removeAttribute('checked')
    save()
  }
  const handlePaste = event => {
    const html = event.clipboardData.getData('text/html')
    const text = event.clipboardData.getData('text/plain')
    const paste = normalizedChecklistPaste(html, text)
    if (!paste.converted && !html) return
    event.preventDefault()
    restoreSelection()
    const selection = window.getSelection()
    const normalizedText = value => value.replace(/\s+/g, ' ').trim()
    const replacesWholeNote = Boolean(selection && !selection.isCollapsed && normalizedText(selection.toString()) === normalizedText(editorRef.current?.innerText || ''))
    if (replacesWholeNote) editorRef.current.innerHTML = paste.html
    else document.execCommand('insertHTML', false, paste.html)
    repairPastedBlocks(editorRef.current)
    editorRef.current?.querySelectorAll('ul.checklist').forEach(list => setChecklist(list, true))
    save()
    rememberSelection()
  }
  if (!note) return <section className="editor-panel empty-editor"><FileText size={34}/><h2>Select a note</h2><p>Choose a note from the list or create a new one.</p></section>
  return (
    <main className={`editor-panel ${mobileView === 'editor' ? 'mobile-current' : ''}`}>
      <header className="editor-mobile-header"><IconButton label="Back to notes" onClick={onBack}><ChevronLeft size={22}/></IconButton><span>Notes</span><span /></header>
      <EditorToolbar command={command}/>
      <div className="note-date">{note.date === 'Today' ? 'August 11, 2026' : note.date} at {note.time}</div>
      <div ref={editorRef} className="note-canvas" contentEditable suppressContentEditableWarning onInput={() => { save(); rememberSelection() }} onMouseUp={rememberSelection} onKeyUp={rememberSelection} onBlur={rememberSelection} onClick={handleChecklistClick} onPaste={handlePaste} aria-label={`Editing ${note.title}`}/>
      <div className="editor-status"><span>{saveLabel}</span><button onClick={() => deleteNote(note.id)}><Trash2 size={15}/>Delete</button></div>
    </main>
  )
}

function App() {
  const [saved] = useState(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null } })
  const [folders, setFolders] = useState(saved?.folders || starterFolders)
  const [notes, setNotes] = useState(saved?.notes || starterNotes)
  const [activeFolder, setActiveFolder] = useState(saved?.activeFolder || 'travel')
  const [selectedNote, setSelectedNote] = useState(saved?.selectedNote || 'japan-october')
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState('edited')
  const [listMode, setListMode] = useState('list')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [mobileView, setMobileView] = useState(saved?.mobileView || 'list')
  const [dark, setDark] = useState(saved?.dark || false)
  const [showMenu, setShowMenu] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders, notes, dark, activeFolder, selectedNote, mobileView })), [folders, notes, dark, activeFolder, selectedNote, mobileView])

  useEffect(() => {
    const selected = notes.find(note => note.id === selectedNote)
    const selectedIsVisible = selected && (activeFolder === 'all' || selected.id === activeFolder || (activeFolder === 'notes' ? selected.folder !== 'travel' : selected.folder === activeFolder))
    if (selectedIsVisible) return
    if (selected) {
      setActiveFolder(selected.folder || 'notes')
      return
    }
    const firstInFolder = notes.find(note => activeFolder === 'all' || note.id === activeFolder || (activeFolder === 'notes' ? note.folder !== 'travel' : note.folder === activeFolder))
    setSelectedNote(firstInFolder?.id || notes[0]?.id || null)
  }, [activeFolder, notes, selectedNote])

  const cloud = useCloudSync({ folders, notes, dark, setFolders, setNotes, setDark })
  const saveLabel = cloud.status === 'synced' ? 'Live sync on' : cloud.status === 'saving' ? 'Syncing…' : cloud.status === 'loading' ? 'Loading cloud notes…' : cloud.status === 'error' ? 'Sync needs attention' : 'Saved locally'

  const visibleNotes = useMemo(() => {
    let result = activeFolder === 'all' ? notes : activeFolder === 'notes' ? notes.filter(n => n.folder !== 'travel') : ['japan-october', 'kyoto', 'tokyo', 'packing'].includes(activeFolder) ? notes.filter(n => n.id === activeFolder) : notes.filter(n => n.folder === activeFolder)
    if (query.trim()) { const q = query.toLowerCase(); result = result.filter(n => `${n.title} ${n.preview} ${n.body}`.toLowerCase().includes(q)) }
    return [...result].sort((a, b) => b.pinned - a.pinned || (sortMode === 'title' ? a.title.localeCompare(b.title) : 0))
  }, [activeFolder, notes, query, sortMode])

  const displayFolders = useMemo(() => folders.map(folder => {
    if (folder.id === 'all') return { ...folder, name: 'All Notes', count: notes.length }
    if (folder.id === 'notes') return { ...folder, count: notes.filter(note => note.folder !== 'travel').length }
    if (folder.id === 'recently-deleted') return folder
    if (folder.child) return { ...folder, count: notes.filter(note => note.id === folder.id).length }
    return { ...folder, count: notes.filter(note => note.folder === folder.id).length }
  }), [folders, notes])

  const currentNote = notes.find(n => n.id === selectedNote)
  const chooseFolder = id => { setActiveFolder(id); const first = notes.find(n => id === 'all' || n.id === id || (id === 'notes' ? n.folder !== 'travel' : n.folder === id)); if (first) setSelectedNote(first.id); setMobileView('list') }
  const chooseNote = id => { setSelectedNote(id); setMobileView('editor') }
  const newNote = () => { const activeFolderData = folders.find(folder => folder.id === activeFolder); const folder = activeFolderData?.custom && !activeFolderData.child ? activeFolder : 'notes'; const id = `note-${Date.now()}`; const fresh = { id, folder, title: 'New Note', date: 'Today', time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), pinned: false, preview: 'Start writing…', body: '<h1>New Note</h1><p class="lead">Start writing…</p>', updatedAt: Date.now() }; setNotes(prev => [fresh, ...prev]); setActiveFolder(folder); setSelectedNote(id); setMobileView('editor') }
  const updateNoteBody = (id, body) => setNotes(prev => prev.map(n => { if (n.id !== id) return n; const tmp = document.createElement('div'); tmp.innerHTML = body; const title = tmp.querySelector('h1')?.textContent?.trim() || 'New Note'; const preview = [...tmp.querySelectorAll('p, li')].map(el => el.textContent.trim()).find(Boolean) || 'No additional text'; return { ...n, body, title, preview, date: 'Today', updatedAt: Date.now() } }))
  const deleteNote = id => { setNotes(prev => prev.filter(n => n.id !== id)); const next = notes.find(n => n.id !== id); setSelectedNote(next?.id || null); setMobileView('list') }
  const confirmSignOut = async () => {
    await cloud.signOut()
    setSignOutOpen(false)
  }
  const togglePin = id => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  const createFolder = name => { const baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'folder'; const id = folders.some(folder => folder.id === baseId) ? `${baseId}-${Date.now()}` : baseId; setFolders(prev => [...prev, { id, name, icon: 'folder', count: 0, custom: true }]); setActiveFolder(id) }
  const renameFolder = (id, name) => setFolders(prev => prev.map(folder => folder.id === id ? { ...folder, name } : folder))
  const deleteFolder = id => {
    const folder = folders.find(item => item.id === id)
    if (!folder?.custom) return
    const removedIds = new Set(id === 'travel' ? [id, ...folders.filter(item => item.child).map(item => item.id)] : [id])
    setFolders(prev => prev.filter(item => !removedIds.has(item.id)))
    setNotes(prev => prev.map(note => removedIds.has(note.folder) || removedIds.has(note.id) ? { ...note, folder: 'notes' } : note))
    setActiveFolder('notes')
    setMobileView('list')
  }

  return (
    <div className={`app ${dark ? 'dark' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="titlebar">
        <div className="traffic-lights" aria-hidden="true"><i/><i/><i/></div>
        <div className="titlebar-brand">Noest</div>
        <IconButton label="Open folders" className="mobile-menu" onClick={() => setMobileSidebar(true)}><Menu size={20}/></IconButton>
        <IconButton label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'} className="collapse-button" onClick={() => setSidebarCollapsed(v => !v)}>{sidebarCollapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}</IconButton>
        <div className="titlebar-actions">
          <button className={`sync-control ${cloud.status === 'error' ? 'error' : ''}`} onClick={() => cloud.user ? setSignOutOpen(true) : setAuthOpen(true)} title={cloud.user ? `Signed in as ${cloud.user.email}.` : 'Sign in to sync'}>
            {cloud.status === 'saving' || cloud.status === 'loading' ? <RefreshCw size={16} className="spinning"/> : cloud.user ? <CircleUserRound size={17}/> : <CloudOff size={17}/>}<span>{cloud.user ? 'Synced' : 'Sync'}</span>
          </button>
          <IconButton label={dark ? 'Use light mode' : 'Use dark mode'} onClick={() => setDark(v => !v)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</IconButton>
          <IconButton label="Share note" onClick={() => navigator.clipboard?.writeText(currentNote?.title || 'Noest')}><Share2 size={18}/></IconButton>
          <IconButton label="New note" onClick={newNote}><Plus size={20}/></IconButton>
          <div className="more-wrap"><IconButton label="More" onClick={() => setShowMenu(v => !v)}><MoreHorizontal size={20}/></IconButton>{showMenu && <div className="more-menu"><button onClick={() => { togglePin(selectedNote); setShowMenu(false) }}><Pin size={15}/>{currentNote?.pinned ? 'Unpin Note' : 'Pin Note'}</button><button onClick={() => { deleteNote(selectedNote); setShowMenu(false) }}><Trash2 size={15}/>Delete Note</button></div>}</div>
        </div>
      </header>
      <div className="app-body">
        <Sidebar folders={displayFolders} activeFolder={activeFolder} setActiveFolder={chooseFolder} createFolder={createFolder} renameFolder={renameFolder} deleteFolder={deleteFolder} sidebarOpen={mobileSidebar} closeMobile={() => setMobileSidebar(false)}/>
        {mobileSidebar && <div className="mobile-scrim" onClick={() => setMobileSidebar(false)}/>} 
        <NotesList notes={visibleNotes} folders={displayFolders} selectedNote={selectedNote} setSelectedNote={chooseNote} query={query} setQuery={setQuery} togglePin={togglePin} sortMode={sortMode} setSortMode={setSortMode} listMode={listMode} setListMode={setListMode} activeFolder={activeFolder} mobileView={mobileView} backToFolders={() => setMobileSidebar(true)}/>
        <NoteEditor note={currentNote} updateNoteBody={updateNoteBody} deleteNote={deleteNote} onBack={() => setMobileView('list')} mobileView={mobileView} saveLabel={saveLabel}/>
      </div>
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)}/>
      <SignOutDialog open={signOutOpen} email={cloud.user?.email} onClose={() => setSignOutOpen(false)} onConfirm={confirmSignOut}/>
    </div>
  )
}

export default App
