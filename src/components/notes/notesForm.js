// Notes with new voice recordings can't go as JSON: the audio goes as files.
// Returns the body for updateLead / updateCall: { ...fields, notes } when no
// note has a new recording, else { ...ids, form } with the notes as JSON and
// each recording as `voice_<i>` (gian uploads them and puts the S3 link in the
// note). `ids` are the fields that build the url ({ hid, leadId } ...).
export const buildNotesBody = (ids, fields, notes) => {
  const files = [];
  const cleanNotes = notes.map((note, i) => {
    if (!note?.audio?.blob) return note;
    // the local blob and its preview url stay here
    const { blob, ...meta } = note.audio;
    delete meta.url;
    const field = `voice_${i}`;
    files.push({ field, blob });
    return { ...note, audio: { ...meta, field } };
  });

  if (!files.length) return { ...ids, ...fields, notes: cleanNotes };

  const form = new FormData();
  Object.entries({ ...ids, ...fields }).forEach(([key, value]) => {
    if (key === "hid" || value === undefined) return; // hid goes in the query
    form.append(key, value === null ? "null" : value);
  });
  form.append("notes", JSON.stringify(cleanNotes));
  files.forEach(({ field, blob }) => {
    const type = (blob.type || "audio/webm").split(";")[0];
    const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
    form.append(field, new File([blob], `${field}.${ext}`, { type }));
  });
  return { ...ids, form };
};

// the saved notes (with the S3 links) from an update's answer, if it sent them
export const savedNotesOf = (response) => {
  const notes = response?.result?.notes ?? response?.data?.notes;
  return Array.isArray(notes) ? notes : null;
};
