// Pure logic for computing available time slots on a given date.
// Inputs: shop hours, blocks, existing appointments, service duration
// Output: array of { time: "HH:MM", label: "9:00 AM", available: boolean }

// Convert "HH:MM" → minutes since midnight
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

// Convert minutes → "HH:MM"
function toTimeStr(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Format "HH:MM" → "9:00 AM"
function formatLabel(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const mer = h < 12 ? 'AM' : 'PM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:${String(m).padStart(2, '0')} ${mer}`
}

// Check if two time ranges overlap
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

export function computeTimeSlots(weeklyRow, blocks, appts, serviceDuration, now, dateStr) {
  if (!weeklyRow || !weeklyRow.is_open) return []

  const openMin = toMinutes(weeklyRow.open_time)
  const closeMin = toMinutes(weeklyRow.close_time)
  const SLOT_INTERVAL = 30

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const isToday = dateStr === todayStr
  const nowMin = isToday ? now.getHours() * 60 + now.getMinutes() : -1

  const busyRanges = [
    ...blocks.map((b) => [toMinutes(b.start_time), toMinutes(b.end_time)]),
    ...appts.map((a) => [toMinutes(a.start_time), toMinutes(a.end_time)]),
  ]

  const slots = []
  for (let start = openMin; start + serviceDuration <= closeMin; start += SLOT_INTERVAL) {
    const end = start + serviceDuration
    const timeStr = toTimeStr(start)

    let available = true

    if (start <= nowMin) available = false

    for (const [bStart, bEnd] of busyRanges) {
      if (overlaps(start, end, bStart, bEnd)) {
        available = false
        break
      }
    }

    slots.push({ time: timeStr, label: formatLabel(timeStr), available })
  }

  return slots
}