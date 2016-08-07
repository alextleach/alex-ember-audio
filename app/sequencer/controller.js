import Ember from 'ember';

export default Ember.Controller.extend({
    audio: Ember.inject.service(),
    beatTracks: null,
    isLoading: true,
    bpm: 120,

    initBeats: Ember.on('init', function() {
      Ember.RSVP.all([
        this._loadBeatTrackFor('kick'),
        this._loadBeatTrackFor('snare'),
        this._loadBeatTrackFor('hihat')
      ])
      .then((beatTracks) => {
        beatTracks.map((beatTrack) => {
          const name = beatTrack.get('name');

          // default is 4 beats, but we're going to use 16
          beatTrack.set('numBeats', 16);

          // snare and hihat are a little louder than kick, so we'll turn down the gain
          if (name === 'snare' || name === 'hihat') {
            beatTrack.set('gain', 0.5);
          }

          // and let's pan the hihat a little to the left
          if (name === 'hihat') {
            beatTrack.set('pan', -0.4);
          }
        });

        this.set('isLoading', false);
        this.set('beatTracks', beatTracks);
      });
    }),

    _loadBeatTrackFor(name) {
      // 'snare1.wav', 'kick2.wav', etc..., from this project's public folder
      const sounds = [`${name}1.wav`, `${name}2.wav`, `${name}3.wav`];

      // If name === 'kick', this creates a BeatTrack instance called
      // 'kick' that contains the sounds 'kick1', 'kick2', and 'kick3'
      return this.get('audio').load(sounds).asBeatTrack(name);
    },

    actions: {
      play() {
        this.get('beatTracks').map((beatTrack) => {
          // playActiveBeats() optionally accepts "noteType" which defaults to "1/4"
          // notes, but we want to use eighth notes
          beatTrack.playActiveBeats(this.get('bpm'), 1/8);

          // /* playActiveBeats() is a convenience method. For more control, you could do:
          // http://bradthemad.org/guitar/tempo_explanation.php */
          // const eighthNoteDuration = (240 * 1/8) / this.get('bpm');
          // beatTrack.get('beats').map((beat, beatIndex) => {
          //   /* whatever else you need to do */
          //   beat.ifActivePlayIn(beatIndex * eighthNoteDuration);
          // });
        });
      },

      toggleActive(beat) {
        if (beat.get('active')) {
          beat.set('active', false);
        } else {
          beat.play();
          beat.set('active', true);
        }
      }
    }
  });
