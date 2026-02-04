---
# This file has YAML front matter so {{ site.baseurl }} gets replaced in its body.
---

function fillEventList(eventList, events, speakers) {
  // Sort events by date (ascending)
  events.sort(function(a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  events.forEach(function(event) {
    var dt = document.createElement('dt');
    dt.textContent = event.date;

    var dd = document.createElement('dd');

    var titleStrong = document.createElement('strong');
    titleStrong.textContent = event.title || '';
    dd.appendChild(titleStrong);

    dd.appendChild(document.createTextNode(' at '));

    var linkStrong = document.createElement('strong');
    var a = document.createElement('a');
    a.href = event.link || '#';
    a.textContent = event.event || '';
    linkStrong.appendChild(a);
    dd.appendChild(linkStrong);

    dd.appendChild(document.createTextNode(' \u2014 ' + (event.location || '')));
    dd.appendChild(document.createElement('br'));

    var em = document.createElement('em');
    var speakerText = '';
    if (Array.isArray(event.speakers)) {
      speakerText = event.speakers.map(function(speakerId) {
        if (speakers && speakers[speakerId]) {
          return speakers[speakerId].name;
        }
        return speakerId;
      }).join(', ');
    }
    em.textContent = speakerText;
    dd.appendChild(em);

    eventList.appendChild(dt);
    eventList.appendChild(dd);
  });
};

document.addEventListener('DOMContentLoaded', function() {
  var eventsDiv = document.getElementById('events');
  if (!eventsDiv) return;

  var baseurl = '{{ site.baseurl }}';
  var eventsUrl = baseurl + '/data/events.json';
  var speakersUrl = baseurl + '/data/speakers.json';

  Promise.all([
    fetch(eventsUrl).then(function(res) {
      if (!res.ok) throw new Error('Failed to load events.json: ' + res.status);
      return res.json();
    }),
    fetch(speakersUrl).then(function(res) {
      if (!res.ok) throw new Error('Failed to load speakers.json: ' + res.status);
      return res.json();
    })
  ]).then(function(results) {
    var events = results[0] || [];
    var speakers = results[1] || {};

    // Filter out events that are not after "yesterday at the same time"
    var cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!Array.isArray(events)) events = [];
    events = events.filter(function(event) {
      var d = new Date(event.date);
      return !isNaN(d) && d > cutoff;
    });

    if (events.length === 0) {
      var p = document.createElement('p');
      p.textContent = 'There are no upcoming events at the moment.';
      eventsDiv.appendChild(p);
    } else {
      var dl = document.createElement('dl');
      eventsDiv.appendChild(dl);
      fillEventList(dl, events, speakers);
    }
  }).catch(function(err) {
    // Fail silently in UI but log error for debugging
    console.error('Error loading events or speakers JSON:', err);
  });
});
