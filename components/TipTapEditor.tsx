'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

interface Props {
  value: string
  onChange: (html: string) => void
  onUploadImage?: (file: File) => Promise<string>
  onAction?: (label: string) => void
  placeholder?: string
}

const Icon = {
  Bold: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>,
  Italic: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
  Strike: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" /></svg>,
  Code: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  H2: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 12h8M4 18V6M12 18V6" /><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" /></svg>,
  H3: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 12h8M4 18V6M12 18V6" /><path d="M17.5 10.5c1.7-1 4 0 4 2 0 2-2 2.5-3.5 2.5 1.5 0 4 .5 4 2.5s-2.3 3-4 2" /></svg>,
  Bullet: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>,
  Ordered: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>,
  Quote: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3" /></svg>,
  CodeBlock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M10 9l-2 3 2 3M14 9l2 3-2 3" /></svg>,
  Divider: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12" /><line x1="5" y1="6" x2="9" y2="6" opacity="0.4" /><line x1="15" y1="18" x2="19" y2="18" opacity="0.4" /></svg>,
  Link: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  Image: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  Undo: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" /></svg>,
  Redo: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 15-6.7L21 13" /></svg>,
}

interface ToolBtnProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

const ToolBtn = ({ onClick, active, disabled, title, children }: ToolBtnProps) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150 ${
      disabled
        ? 'text-muted-2 cursor-not-allowed'
        : active
          ? 'bg-accent-2/15 text-accent-2'
          : 'text-muted hover:bg-bg hover:text-fg'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-5 bg-line mx-1 self-center" />

export default function TipTapEditor({ value, onChange, onUploadImage, onAction, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)
  const [linkModal, setLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [linkExisting, setLinkExisting] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing…' }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none min-h-[520px] px-14 py-12',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (!initialized.current && value) {
      editor.commands.setContent(value)
      initialized.current = true
    }
  }, [editor, value])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openLinkModal()
      }
      if (e.key === 'Escape' && linkModal) setLinkModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, linkModal])

  async function handleImageFile(file: File) {
    if (!onUploadImage || !editor) return
    try {
      const url = await onUploadImage(file)
      editor.chain().focus().setImage({ src: url }).run()
      onAction?.('Image inserted')
    } catch {
      onAction?.('Upload failed')
    }
  }

  function openLinkModal() {
    if (!editor) return
    const prev = editor.getAttributes('link').href || ''
    const { from, to, empty } = editor.state.selection
    const selectedText = empty ? '' : editor.state.doc.textBetween(from, to, ' ')
    setLinkUrl(prev)
    setLinkText(selectedText)
    setLinkExisting(!!prev)
    setLinkModal(true)
  }

  function applyLink() {
    if (!editor) return
    if (!linkUrl.trim()) { setLinkModal(false); return }
    let url = linkUrl.trim()
    if (!/^https?:\/\//i.test(url) && !url.startsWith('mailto:') && !url.startsWith('/')) {
      url = `https://${url}`
    }
    const { empty } = editor.state.selection
    if (empty && linkText.trim() && !linkExisting) {
      editor.chain().focus().insertContent(`<a href="${url}">${linkText.trim()}</a>`).run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    setLinkModal(false)
    onAction?.(linkExisting ? 'Link updated' : 'Link added')
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkModal(false)
    onAction?.('Link removed')
  }

  if (!editor) return null

  const words = editor.storage.characterCount?.words() ?? 0
  const chars = editor.storage.characterCount?.characters() ?? 0

  return (
    <div className="border border-line rounded-card overflow-hidden bg-bg-soft">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-2 border-b border-line bg-bg sticky top-0 z-10 overflow-x-auto">
        <ToolBtn title="Undo (⌘Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Icon.Undo /></ToolBtn>
        <ToolBtn title="Redo (⇧⌘Z)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Icon.Redo /></ToolBtn>
        <Divider />
        <ToolBtn title="Bold (⌘B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Icon.Bold /></ToolBtn>
        <ToolBtn title="Italic (⌘I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Icon.Italic /></ToolBtn>
        <ToolBtn title="Strike" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Icon.Strike /></ToolBtn>
        <ToolBtn title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}><Icon.Code /></ToolBtn>
        <Divider />
        <ToolBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Icon.H2 /></ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Icon.H3 /></ToolBtn>
        <Divider />
        <ToolBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><Icon.Bullet /></ToolBtn>
        <ToolBtn title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><Icon.Ordered /></ToolBtn>
        <ToolBtn title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Icon.Quote /></ToolBtn>
        <ToolBtn title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}><Icon.CodeBlock /></ToolBtn>
        <ToolBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Icon.Divider /></ToolBtn>
        <Divider />
        <ToolBtn title="Link (⌘K)" onClick={openLinkModal} active={editor.isActive('link')}><Icon.Link /></ToolBtn>
        <label title="Insert image" aria-label="Insert image"
          className="relative inline-flex items-center justify-center w-8 h-8 rounded-md text-muted hover:bg-bg-soft hover:text-fg cursor-pointer transition-all">
          <Icon.Image />
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleImageFile(f)
            e.target.value = ''
          }} />
        </label>
      </div>

      {/* Canvas */}
      <div
        className="bg-[#f0eeec] dark:bg-[#0f0f12] py-8 px-4 min-h-[600px]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f?.type.startsWith('image/')) handleImageFile(f)
        }}
        onPaste={(e) => {
          const items = e.clipboardData?.items || []
          for (const item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (file) { e.preventDefault(); handleImageFile(file) }
              return
            }
          }
        }}
      >
        <div className="max-w-[780px] mx-auto bg-white dark:bg-[#23232a] shadow-[0_2px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.6)] rounded-sm">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-line bg-bg text-[11px] text-muted">
        <span>{words} words · {Math.max(1, Math.round(words / 200))} min read</span>
        <span className="text-muted-2">{chars.toLocaleString()} chars</span>
      </div>

      {/* Link modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setLinkModal(false)}>
          <div className="w-full max-w-md bg-bg border border-line rounded-card-lg shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
              <h3 className="font-semibold text-fg text-sm flex items-center gap-2">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-accent-2/15 text-accent-2"><Icon.Link /></span>
                {linkExisting ? 'Edit link' : 'Insert link'}
              </h3>
              <button onClick={() => setLinkModal(false)} className="p-1 text-muted hover:text-fg rounded transition-colors" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">URL</label>
                <input
                  autoFocus
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } }}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-[14px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/15 transition-all"
                />
              </div>
              {!linkExisting && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Display text {linkText ? '' : '(optional — uses selection)'}</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } }}
                    placeholder="Link text"
                    className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-[14px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/15 transition-all"
                  />
                </div>
              )}
              <p className="text-[11px] text-muted-2">Tip: <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-soft border border-line rounded">⌘K</kbd> to open · <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-soft border border-line rounded">Esc</kbd> to cancel</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 border-t border-line bg-bg-soft">
              {linkExisting && (
                <button onClick={removeLink}
                  className="px-3.5 py-1.5 text-xs font-medium text-danger border border-line-strong rounded-full hover:bg-danger hover:text-white hover:border-danger transition-all mr-auto">
                  Remove link
                </button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => setLinkModal(false)}
                  className="px-4 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg transition-all">
                  Cancel
                </button>
                <button onClick={applyLink} disabled={!linkUrl.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-40 transition-opacity">
                  {linkExisting ? 'Update' : 'Add link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
