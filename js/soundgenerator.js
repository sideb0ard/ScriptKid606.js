'use strict';

let context;

export class SoundGenerator {
  constructor() {
    console.log("YOITME!");
    if (!context) {
      context = new AudioContext;
    }

    this.playing = false;
    this.notes = [];

    this.dca = context.createGain();
    this.dca.connect(context.destination);

    this.lfo_speed = 4;
    this.lfo = context.createOscillator();
    this.lfo.frequency.value = this.lfo_speed;
    this.lfo.start(0);
    this.lfo.connect(this.dca.gain);
    this.subs = {};

    this.subscribe("lfo_freq", (freq) => { this.lfo.frequency.value = freq; console.log("YO"); });
  }

  subscribe (channel, sub) {
    this.subs[channel] = this.subs[channel] || [];
    this.subs[channel].push(sub);
  };
  publish (channel) {
    var args = [].slice.call(arguments, 1);
    this.subs[channel].forEach(function(sub) {
      sub.apply(void 0, args);
    });

  };

  toggle() {
    if (this.playing) {
      this.noteOff();
      this.playing = false;
    } else {
      this.noteOn();
      this.playing = true;
    }
  }

  noteOn(freq) {

    if (freq === undefined) {
      freq = 261.;
    }
    var osc = context.createOscillator();

    osc.frequency.value = freq;
    osc.connect(this.dca);
    osc.start(0);
    this.notes.push(osc);
  }

  noteOff() {
    this.notes.forEach( osc => { osc.stop(); })
    this.notes = [];
  }

}

