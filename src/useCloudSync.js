import { useEffect, useRef, useState } from 'react'
import { cloudConfigured, supabase } from './supabase'
import { starterFolders, starterNotes } from './data'

function noteVersion(note) {
  return Number(note?.updatedAt || 0)
}

function mergeNotes(localNotes = [], incomingNotes = []) {
  const localById = new Map(localNotes.map(note => [note.id, note]))
  let localWins = false

  for (const incoming of incomingNotes) {
    const local = localById.get(incoming.id)
    if (!local || noteVersion(incoming) >= noteVersion(local)) localById.set(incoming.id, incoming)
    else localWins = true
  }

  return { notes: [...localById.values()], localWins }
}

export function useCloudSync({ folders, notes, dark, setFolders, setNotes, setDark }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(cloudConfigured ? 'signed-out' : 'local')
  const hydratedFor = useRef(null)
  const skipNextSave = useRef(false)
  const latestPayload = useRef({ folders, notes, dark })
  latestPayload.current = { folders, notes, dark }

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null)
    })
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        hydratedFor.current = null
        setStatus('signed-out')
        if (event === 'SIGNED_OUT') {
          setFolders(starterFolders)
          setNotes(starterNotes)
          setDark(false)
        }
      }
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !user) return undefined
    let active = true
    let channel
    const hydrate = async () => {
      setStatus('loading')
      const { data, error } = await supabase
        .from('noest_documents')
        .select('payload, updated_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!active) return
      if (error) {
        setStatus('error')
        return
      }

      if (data?.payload) {
        const merged = mergeNotes(latestPayload.current.notes, data.payload.notes || [])
        skipNextSave.current = !merged.localWins
        setFolders(data.payload.folders || [])
        setNotes(merged.notes)
        setDark(Boolean(data.payload.dark))
      } else {
        const { error: insertError } = await supabase.from('noest_documents').upsert({
          user_id: user.id,
          payload: latestPayload.current,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        if (insertError) {
          setStatus('error')
          return
        }
      }

      hydratedFor.current = user.id
      setStatus('synced')
      channel = supabase
        .channel(`noest-document-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'noest_documents', filter: `user_id=eq.${user.id}`,
        }, event => {
          const incoming = event.new?.payload
          if (!incoming || JSON.stringify(incoming) === JSON.stringify(latestPayload.current)) return
          const merged = mergeNotes(latestPayload.current.notes, incoming.notes || [])
          skipNextSave.current = !merged.localWins
          setFolders(incoming.folders || [])
          setNotes(merged.notes)
          setDark(Boolean(incoming.dark))
          setStatus('synced')
        })
        .subscribe()
    }
    hydrate()
    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [user?.id, setDark, setFolders, setNotes])

  useEffect(() => {
    if (!supabase || !user || hydratedFor.current !== user.id) return undefined
    if (skipNextSave.current) {
      skipNextSave.current = false
      return undefined
    }
    setStatus('saving')
    const timer = window.setTimeout(async () => {
      const { error } = await supabase.from('noest_documents').upsert({
        user_id: user.id,
        payload: { folders, notes, dark },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      setStatus(error ? 'error' : 'synced')
    }, 350)
    return () => window.clearTimeout(timer)
  }, [dark, folders, notes, user?.id])

  return {
    configured: cloudConfigured,
    user,
    status,
    signOut: () => supabase?.auth.signOut(),
  }
}
