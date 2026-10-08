import { mhRepository, supabase } from './supabase-repository.js';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your M&H CRM session expired. Sign in again.');
  return { Authorization: `Bearer ${session.access_token}` };
}

async function calendarRequest(method, params = {}, body) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  const headers = await authHeaders();
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`/api/calendar-events${query.size ? `?${query}` : ''}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store'
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Shared Justin calendar request failed.');
  return payload;
}

export function installMayerJustinCalendar() {
  if (mhRepository.__mayerJustinCalendarInstalled) return;
  mhRepository.__mayerJustinCalendarInstalled = true;

  mhRepository.listEvents = async function({ start, end, includeToday = false, includeReschedule = false }) {
    const payload = await calendarRequest('GET', {
      start,
      end,
      includeToday: includeToday ? '1' : '',
      includeReschedule: includeReschedule ? '1' : ''
    });
    const events = Array.isArray(payload.events) ? payload.events : [];
    const eventIds = events.map(event => event.id).filter(Boolean);
    if (!eventIds.length) return events;
    const { data: links, error } = await supabase
      .from('calendar_event_client_links')
      .select('event_id,client_id')
      .in('event_id', eventIds);
    if (error) throw error;
    const byEvent = new Map((links || []).map(link => [link.event_id, link.client_id]));
    return events.map(event => ({
      ...event,
      client_id: event.client_id || byEvent.get(event.id) || null
    }));
  };

  mhRepository.saveEvent = async function(value) {
    const payload = {
      client_id: value.client_id || null,
      assigned_agent_id: value.assigned_agent_id || this.user?.id || null,
      title: String(value.title || '').trim() || `Appointment: ${value.person_name || 'Client'}`,
      event_type: value.event_type || 'appointment',
      event_date: value.event_date,
      start_time: value.start_time || null,
      end_time: value.end_time || null,
      notes: value.notes || null,
      status: value.status || 'scheduled'
    };
    const eventId = value.event_id || value.id || '';
    const result = eventId
      ? await calendarRequest('PATCH', { id: eventId }, payload)
      : await calendarRequest('POST', {}, payload);
    const saved = result.event;
    if (!saved?.id) return saved;

    if (payload.client_id) {
      const { error } = await supabase
        .from('calendar_event_client_links')
        .upsert({
          event_id: saved.id,
          client_id: payload.client_id,
          updated_by: this.user?.id || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'event_id' });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('calendar_event_client_links')
        .delete()
        .eq('event_id', saved.id);
      if (error) throw error;
    }

    return { ...saved, client_id: payload.client_id || saved.client_id || null };
  };

  mhRepository.deleteEvent = async function(eventId) {
    if (!eventId) throw new Error('Missing calendar event ID.');
    const result = await calendarRequest('DELETE', { id: eventId });
    await supabase.from('calendar_event_client_links').delete().eq('event_id', eventId);
    return result;
  };

  mhRepository.completeEvent = async function(eventId) {
    const result = await calendarRequest('PATCH', { id: eventId }, { action: 'complete' });
    return result.event;
  };

  mhRepository.rescheduleEvent = async function(eventId, note) {
    const result = await calendarRequest('PATCH', { id: eventId }, { action: 'reschedule', note });
    return result.event;
  };

  window.MHCalendarSync = {
    source: 'Mayer CRM · Justin calendar',
    refresh() {
      if (location.hash.startsWith('#/dashboard') || location.hash.startsWith('#/appointments')) {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }
  };

  window.addEventListener('focus', () => {
    if (document.querySelector('dialog[open]')) return;
    window.MHCalendarSync.refresh();
  });
}
